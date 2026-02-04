import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient, ScheduleType } from "@prisma/client";
import cron from "node-cron";
import { selectNextCard, RECENT_LIMIT } from "./utils/cardSelection";
import { simplifyCardFields } from "./utils/simplify";
import OpenAI from "openai";
import crypto from "crypto";

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 4000);
const adminKey = process.env.ADMIN_KEY || "local-admin-key";
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

app.use(cors());
app.use(express.json());

const getUserId = (req: express.Request) => {
  return (req.headers["x-user-id"] as string) || crypto.randomUUID();
};

const ensureUser = async (userId: string) => {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId }
  });
};

const ensureRotation = async () => {
  const rotation = await prisma.rotation.findFirst({ include: { activeCard: true } });
  if (rotation) return rotation;
  const firstCard = await prisma.card.findFirst({ orderBy: { createdAt: "asc" } });
  if (!firstCard) throw new Error("No cards available");
  return prisma.rotation.create({
    data: {
      activeCardId: firstCard.id,
      schedule: ScheduleType.MWF,
      lastRotatedAt: new Date()
    },
    include: { activeCard: true }
  });
};

const rotateActiveCard = async () => {
  const cards = await prisma.card.findMany();
  if (cards.length === 0) throw new Error("No cards available");
  const next = selectNextCard(cards, []);
  const existing = await prisma.rotation.findFirst();
  if (existing) {
    return prisma.rotation.update({
      where: { id: existing.id },
      data: { activeCardId: next.id, lastRotatedAt: new Date() },
      include: { activeCard: true }
    });
  }
  return prisma.rotation.create({
    data: {
      activeCardId: next.id,
      schedule: ScheduleType.MWF,
      lastRotatedAt: new Date()
    },
    include: { activeCard: true }
  });
};

const scheduleRotation = async () => {
  const rotation = await ensureRotation();
  const cronExpression = rotation.schedule === ScheduleType.DAILY ? "0 8 * * *" : "0 8 * * 1,3,5";
  cron.schedule(cronExpression, async () => {
    await rotateActiveCard();
  });
};

app.get("/api/card/active", async (req, res) => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const rotation = await ensureRotation();
  await prisma.userCardState.upsert({
    where: { userId_cardId: { userId, cardId: rotation.activeCardId } },
    update: { lastSeenAt: new Date() },
    create: { userId, cardId: rotation.activeCardId, lastSeenAt: new Date() }
  });
  res.json({ card: rotation.activeCard });
});

app.post("/api/card/next", async (req, res) => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const cards = await prisma.card.findMany();
  const recentStates = await prisma.userCardState.findMany({
    where: { userId, lastSeenAt: { not: null } },
    orderBy: { lastSeenAt: "desc" },
    take: RECENT_LIMIT
  });
  const next = selectNextCard(cards, recentStates.map((state) => state.cardId));
  await prisma.userCardState.upsert({
    where: { userId_cardId: { userId, cardId: next.id } },
    update: { lastSeenAt: new Date() },
    create: { userId, cardId: next.id, lastSeenAt: new Date() }
  });
  res.json({ card: next });
});

app.post("/api/card/:id/save", async (req, res) => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const cardId = req.params.id;
  const state = await prisma.userCardState.upsert({
    where: { userId_cardId: { userId, cardId } },
    update: {},
    create: { userId, cardId }
  });
  const updated = await prisma.userCardState.update({
    where: { id: state.id },
    data: { saved: !state.saved }
  });
  const saved = await prisma.userCardState.findMany({ where: { userId, saved: true } });
  res.json({ saved: saved.map((item) => item.cardId), savedState: updated.saved });
});

app.post("/api/card/:id/understood", async (req, res) => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const cardId = req.params.id;
  const state = await prisma.userCardState.upsert({
    where: { userId_cardId: { userId, cardId } },
    update: {},
    create: { userId, cardId }
  });
  const updated = await prisma.userCardState.update({
    where: { id: state.id },
    data: { understood: !state.understood }
  });
  const understood = await prisma.userCardState.findMany({ where: { userId, understood: true } });
  res.json({ understood: understood.map((item) => item.cardId), understoodState: updated.understood });
});

app.post("/api/card/:id/simplify", async (req, res) => {
  const cardId = req.params.id;
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return res.status(404).json({ error: "Card not found" });

  if (openaiClient) {
    try {
      const response = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "Simplify the AI flashcard fields for a beginner. Return JSON with concept, whyItMatters, example, actionStep. Keep it shorter and simpler, no extra keys."
          },
          {
            role: "user",
            content: JSON.stringify({
              concept: card.concept,
              whyItMatters: card.whyItMatters,
              example: card.example,
              actionStep: card.actionStep
            })
          }
        ],
        response_format: { type: "json_object" }
      });
      const output = response.output_text;
      if (output) {
        const parsed = JSON.parse(output);
        return res.json({ card: parsed });
      }
    } catch (error) {
      console.error("OpenAI simplify failed", error);
    }
  }

  const simplified = simplifyCardFields({
    concept: card.concept,
    whyItMatters: card.whyItMatters,
    example: card.example,
    actionStep: card.actionStep
  });
  res.json({ card: simplified });
});

app.get("/api/user/state", async (req, res) => {
  const userId = getUserId(req);
  await ensureUser(userId);
  const saved = await prisma.userCardState.findMany({ where: { userId, saved: true } });
  const understood = await prisma.userCardState.findMany({ where: { userId, understood: true } });
  res.json({
    saved: saved.map((item) => item.cardId),
    understood: understood.map((item) => item.cardId)
  });
});

app.post("/api/admin/rotate", async (req, res) => {
  const providedKey = req.headers["x-admin-key"];
  if (providedKey !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const rotation = await rotateActiveCard();
  res.json({ card: rotation.activeCard });
});

app.listen(port, async () => {
  await scheduleRotation();
  console.log(`AICards server running on http://localhost:${port}`);
});

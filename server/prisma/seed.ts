import { PrismaClient, Level, ScheduleType } from "@prisma/client";

const prisma = new PrismaClient();

const cards = [
  {
    slug: "prompt-role-hat",
    title: "Give the AI a role",
    level: Level.BEGINNER,
    concept: "Tell the AI who it is (e.g., editor, tutor) to shape tone and expertise.",
    whyItMatters: "Roles reduce vague replies and keep outputs consistent.",
    example: "You are a friendly editor. Tighten this email to 80 words.",
    actionStep: "Start prompts with a clear role and audience.",
    tags: ["prompting", "clarity"]
  },
  {
    slug: "prompt-constraints",
    title: "Add constraints",
    level: Level.BEGINNER,
    concept: "Constraints are limits on length, format, or tone.",
    whyItMatters: "They prevent overlong or off-style answers.",
    example: "Summarize in 3 bullets, max 12 words each.",
    actionStep: "Specify length and format before asking.",
    tags: ["prompting", "formatting"]
  },
  {
    slug: "prompt-examples",
    title: "Show an example",
    level: Level.BEGINNER,
    concept: "Provide a sample output so the AI imitates your style.",
    whyItMatters: "Examples anchor the response to what you want.",
    example: "Format like: Title — 1 sentence. Now summarize this doc.",
    actionStep: "Paste one good example output.",
    tags: ["prompting", "examples"]
  },
  {
    slug: "prompt-verification",
    title: "Ask for verification",
    level: Level.BEGINNER,
    concept: "Request sources or uncertainty notes for factual claims.",
    whyItMatters: "It reduces confident mistakes.",
    example: "List claims that need checking.",
    actionStep: "Add a line: Flag anything you are unsure about.",
    tags: ["accuracy", "prompting"]
  },
  {
    slug: "hallucinations",
    title: "Know hallucinations",
    level: Level.BEGINNER,
    concept: "AI can make up facts when data is missing.",
    whyItMatters: "Mistakes look convincing and spread quickly.",
    example: "If a date looks odd, ask for a source.",
    actionStep: "Double-check facts before sharing.",
    tags: ["accuracy", "risk"]
  },
  {
    slug: "fact-checking",
    title: "Build a fact check step",
    level: Level.BEGINNER,
    concept: "Separate drafting from verification.",
    whyItMatters: "It keeps speed without sacrificing trust.",
    example: "Draft now, then list 3 items to verify.",
    actionStep: "Add a review step to every AI output.",
    tags: ["accuracy", "workflow"]
  },
  {
    slug: "summarize-long-docs",
    title: "Summaries save time",
    level: Level.BEGINNER,
    concept: "Ask for key points instead of full rewrites.",
    whyItMatters: "Summaries help you scan faster.",
    example: "Summarize this report in 5 bullets and 1 risk.",
    actionStep: "Use summaries before deep reading.",
    tags: ["productivity", "summarizing"]
  },
  {
    slug: "email-drafts",
    title: "Draft better emails",
    level: Level.BEGINNER,
    concept: "AI can draft email options with different tones.",
    whyItMatters: "You respond faster without sounding rushed.",
    example: "Write a polite follow-up in 3 sentences.",
    actionStep: "Request two tones and pick the best.",
    tags: ["writing", "email"]
  },
  {
    slug: "meeting-agenda",
    title: "Plan a meeting",
    level: Level.BEGINNER,
    concept: "AI can create agendas and time boxes.",
    whyItMatters: "Structured meetings end on time.",
    example: "Create a 30-min agenda for product review.",
    actionStep: "Ask for a timed agenda before meetings.",
    tags: ["planning", "productivity"]
  },
  {
    slug: "brainstorming",
    title: "Use brainstorming safely",
    level: Level.BEGINNER,
    concept: "AI is strong for generating options, not final answers.",
    whyItMatters: "You get variety without committing.",
    example: "Give 10 headline ideas for a webinar.",
    actionStep: "Ask for many options, then refine.",
    tags: ["ideation", "writing"]
  },
  {
    slug: "privacy-basics",
    title: "Protect sensitive data",
    level: Level.BEGINNER,
    concept: "Avoid sharing secrets or personal data in prompts.",
    whyItMatters: "You stay compliant and reduce risk.",
    example: "Replace names with roles before pasting.",
    actionStep: "Redact sensitive info before using AI.",
    tags: ["privacy", "security"]
  },
  {
    slug: "prompt-structure",
    title: "Use a simple structure",
    level: Level.BEGINNER,
    concept: "Structure prompts as Goal + Context + Constraints.",
    whyItMatters: "The AI can follow a clear checklist.",
    example: "Goal: summarize. Context: sales call notes. Constraints: 5 bullets.",
    actionStep: "Start prompts with Goal, Context, Constraints.",
    tags: ["prompting", "structure"]
  },
  {
    slug: "tone-control",
    title: "Control the tone",
    level: Level.BEGINNER,
    concept: "Specify tone like friendly, formal, or concise.",
    whyItMatters: "Tone mismatches reduce trust.",
    example: "Rewrite this to sound confident but warm.",
    actionStep: "Add a tone word to every prompt.",
    tags: ["writing", "prompting"]
  },
  {
    slug: "chunking",
    title: "Chunk big tasks",
    level: Level.BEGINNER,
    concept: "Split large tasks into smaller steps for better results.",
    whyItMatters: "Smaller tasks are easier to evaluate.",
    example: "First outline, then expand each section.",
    actionStep: "Break long requests into steps.",
    tags: ["workflow", "prompting"]
  },
  {
    slug: "constraints-formatting",
    title: "Use formats",
    level: Level.BEGINNER,
    concept: "Ask for tables, bullets, or JSON when you need structure.",
    whyItMatters: "Structured output is easier to reuse.",
    example: "Return a table with columns: task, owner, date.",
    actionStep: "Name a specific format each time.",
    tags: ["formatting", "prompting"]
  },
  {
    slug: "critique-mode",
    title: "Ask for critique",
    level: Level.BEGINNER,
    concept: "Have the AI review your draft for issues.",
    whyItMatters: "It catches gaps you missed.",
    example: "Review this proposal and list 3 risks.",
    actionStep: "Request a short critique before sending.",
    tags: ["review", "writing"]
  },
  {
    slug: "evaluation-basics",
    title: "Evaluate with a rubric",
    level: Level.BEGINNER,
    concept: "Use criteria like clarity, accuracy, and tone.",
    whyItMatters: "Consistent checks improve quality.",
    example: "Score this summary 1-5 for clarity.",
    actionStep: "Create a quick rubric for AI outputs.",
    tags: ["evaluation", "quality"]
  },
  {
    slug: "workflow-reuse",
    title: "Save good prompts",
    level: Level.BEGINNER,
    concept: "Reuse prompts that work to save time.",
    whyItMatters: "Consistency builds better results.",
    example: "Store your best email prompt as a template.",
    actionStep: "Keep a prompt library for common tasks.",
    tags: ["workflow", "prompting"]
  },
  {
    slug: "data-privacy-work",
    title: "Work data caution",
    level: Level.BEGINNER,
    concept: "Follow company policies for AI use.",
    whyItMatters: "It protects clients and your team.",
    example: "Ask your manager which tools are approved.",
    actionStep: "Check policy before using AI at work.",
    tags: ["privacy", "compliance"]
  },
  {
    slug: "planning-trip",
    title: "Plan with constraints",
    level: Level.BEGINNER,
    concept: "Give location, budget, and time limits.",
    whyItMatters: "It yields practical, usable plans.",
    example: "Plan a 2-day NYC trip under $500.",
    actionStep: "List budget and time before planning.",
    tags: ["planning", "personal"]
  },
  {
    slug: "summarize-meeting",
    title: "Summarize meetings",
    level: Level.BEGINNER,
    concept: "Ask for decisions, action items, and owners.",
    whyItMatters: "It makes follow-ups clear.",
    example: "Summarize notes into decisions and actions.",
    actionStep: "Request decisions and action items.",
    tags: ["summarizing", "meetings"]
  },
  {
    slug: "prompt-clarify",
    title: "Invite questions",
    level: Level.BEGINNER,
    concept: "Ask the AI to clarify missing info.",
    whyItMatters: "Clarifying questions prevent wrong guesses.",
    example: "Ask 3 questions before drafting.",
    actionStep: "Add: Ask me questions if needed.",
    tags: ["prompting", "clarity"]
  },
  {
    slug: "avoid-chain-of-thought",
    title: "Avoid chain-of-thought",
    level: Level.BEGINNER,
    concept: "Ask for answers, not hidden reasoning steps.",
    whyItMatters: "Keeps responses concise and safe.",
    example: "Give the final answer and a short rationale.",
    actionStep: "Request a brief rationale only.",
    tags: ["prompting", "safety"]
  },
  {
    slug: "checklists",
    title: "Use checklists",
    level: Level.BEGINNER,
    concept: "Ask for checklists to avoid missing steps.",
    whyItMatters: "Checklists reduce mistakes.",
    example: "Create a checklist for launching a newsletter.",
    actionStep: "Ask for a checklist before executing tasks.",
    tags: ["planning", "workflow"]
  },
  {
    slug: "decision-support",
    title: "Decision support",
    level: Level.BEGINNER,
    concept: "AI can list pros and cons but you decide.",
    whyItMatters: "It improves thinking without outsourcing judgment.",
    example: "Compare option A vs B in a table.",
    actionStep: "Use AI for options, not final decisions.",
    tags: ["decision", "analysis"]
  },
  {
    slug: "summarize-with-action",
    title: "Add next steps",
    level: Level.BEGINNER,
    concept: "Ask for a summary plus recommended next actions.",
    whyItMatters: "You move from info to action faster.",
    example: "Summarize and list 3 next steps.",
    actionStep: "Always request actionable next steps.",
    tags: ["productivity", "summarizing"]
  },
  {
    slug: "prompt-tone-brevity",
    title: "Ask for brevity",
    level: Level.BEGINNER,
    concept: "Shorter prompts can still produce focused output with constraints.",
    whyItMatters: "Brevity keeps attention and clarity.",
    example: "Rewrite in one sentence, no jargon.",
    actionStep: "Keep outputs short with a max sentence count.",
    tags: ["writing", "clarity"]
  },
  {
    slug: "docs-to-bullets",
    title: "Turn docs into bullets",
    level: Level.BEGINNER,
    concept: "Bullets highlight key points quickly.",
    whyItMatters: "You can scan without rereading.",
    example: "Convert this policy into 5 bullets.",
    actionStep: "Ask for bullets when reading long docs.",
    tags: ["summarizing", "productivity"]
  },
  {
    slug: "translation",
    title: "Translate with tone",
    level: Level.BEGINNER,
    concept: "AI can translate while keeping tone and audience.",
    whyItMatters: "You avoid awkward translations.",
    example: "Translate to Spanish, keep it friendly.",
    actionStep: "Mention audience and tone when translating.",
    tags: ["writing", "translation"]
  },
  {
    slug: "prompt-iterative",
    title: "Iterate in rounds",
    level: Level.BEGINNER,
    concept: "Refine outputs with short follow-up prompts.",
    whyItMatters: "Iteration improves quality fast.",
    example: "Make it shorter. Now add one example.",
    actionStep: "Give one edit at a time.",
    tags: ["prompting", "workflow"]
  },
  {
    slug: "bias-awareness",
    title: "Watch for bias",
    level: Level.BEGINNER,
    concept: "AI can reflect biased data patterns.",
    whyItMatters: "Bias can harm trust and fairness.",
    example: "Check if any assumptions feel unfair.",
    actionStep: "Review outputs for biased language.",
    tags: ["ethics", "risk"]
  },
  {
    slug: "privacy-personal",
    title: "Avoid personal data",
    level: Level.BEGINNER,
    concept: "Don’t paste personal identifiers into AI tools.",
    whyItMatters: "It protects people’s privacy.",
    example: "Replace phone numbers with placeholders.",
    actionStep: "Remove personal details before prompting.",
    tags: ["privacy", "security"]
  },
  {
    slug: "prompt-ask-for-sources",
    title: "Ask for sources",
    level: Level.BEGINNER,
    concept: "Request citations or links for factual claims.",
    whyItMatters: "You can verify quickly.",
    example: "Include links for any stats you mention.",
    actionStep: "Ask for sources on factual output.",
    tags: ["accuracy", "verification"]
  }
];

async function main() {
  await prisma.userCardState.deleteMany();
  await prisma.rotation.deleteMany();
  await prisma.card.deleteMany();

  await prisma.card.createMany({
    data: cards.map((card) => ({
      ...card,
      tags: card.tags
    }))
  });

  const firstCard = await prisma.card.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstCard) {
    await prisma.rotation.create({
      data: {
        activeCardId: firstCard.id,
        schedule: ScheduleType.MWF,
        lastRotatedAt: new Date()
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

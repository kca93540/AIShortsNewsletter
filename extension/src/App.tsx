import { useEffect, useMemo, useState } from "react";

type Card = {
  id: string;
  slug: string;
  title: string;
  level: "BEGINNER" | "INTERMEDIATE";
  concept: string;
  whyItMatters: string;
  example: string;
  actionStep: string;
  tags: string[];
  sourceUrl?: string | null;
};

type UserState = {
  saved: string[];
  understood: string[];
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get(key);
      return (result[key] as T) ?? null;
    }
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async set<T>(key: string, value: T) {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [card, setCard] = useState<Card | null>(null);
  const [userState, setUserState] = useState<UserState>({ saved: [], understood: [] });
  const [showExample, setShowExample] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [hiddenToday, setHiddenToday] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const userId = useMemo(() => {
    const existing = localStorage.getItem("aicards_user_id");
    if (existing) return existing;
    const generated = crypto.randomUUID();
    localStorage.setItem("aicards_user_id", generated);
    return generated;
  }, []);

  useEffect(() => {
    storage.get<string>("aicards_hide").then((value) => {
      setHiddenToday(value === todayKey());
    });
  }, []);

  useEffect(() => {
    if (hiddenToday) return;
    fetch(`${API_BASE}/api/card/active`, {
      headers: { "x-user-id": userId }
    })
      .then((res) => res.json())
      .then((data) => setCard(data.card));

    fetch(`${API_BASE}/api/user/state`, {
      headers: { "x-user-id": userId }
    })
      .then((res) => res.json())
      .then((data) => setUserState(data));
  }, [hiddenToday, userId]);

  const toggleSave = async () => {
    if (!card) return;
    const res = await fetch(`${API_BASE}/api/card/${card.id}/save`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    const data = await res.json();
    setUserState((prev) => ({ ...prev, saved: data.saved }));
  };

  const toggleUnderstood = async () => {
    if (!card) return;
    const res = await fetch(`${API_BASE}/api/card/${card.id}/understood`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    const data = await res.json();
    setUserState((prev) => ({ ...prev, understood: data.understood }));
  };

  const nextCard = async () => {
    const res = await fetch(`${API_BASE}/api/card/next`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    const data = await res.json();
    setCard(data.card);
    setShowExample(false);
  };

  const simplify = async () => {
    if (!card) return;
    setSimplifying(true);
    const res = await fetch(`${API_BASE}/api/card/${card.id}/simplify`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    const data = await res.json();
    setCard({ ...card, ...data.card });
    setSimplifying(false);
  };

  const hideForToday = async () => {
    await storage.set("aicards_hide", todayKey());
    setHiddenToday(true);
  };

  const refreshNow = async () => {
    const res = await fetch(`${API_BASE}/api/admin/rotate`, {
      method: "POST",
      headers: { "x-admin-key": "local-admin-key" }
    });
    if (res.ok) {
      const data = await res.json();
      setCard(data.card);
    }
  };

  const onMouseDown = (event: React.MouseEvent) => {
    setDragging(true);
    setDragOffset({ x: event.clientX - position.x, y: event.clientY - position.y });
  };

  const onMouseMove = (event: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: event.clientX - dragOffset.x, y: event.clientY - dragOffset.y });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  if (hiddenToday) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="text-center space-y-3">
          <p className="text-lg">AICards is hidden for today.</p>
          <button
            className="px-4 py-2 rounded bg-slate-800 text-white"
            onClick={async () => {
              await storage.set("aicards_hide", "");
              setHiddenToday(false);
            }}
          >
            Show again
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const saved = userState.saved.includes(card.id);
  const understood = userState.understood.includes(card.id);

  return (
    <div
      className="min-h-screen flex items-start justify-start p-6"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        className="w-[360px] bg-yellow-100 shadow-xl rounded-2xl p-5 border border-yellow-200 cursor-grab"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">AI Flashcard</p>
            <h1 className="text-xl font-semibold text-slate-900">{card.title}</h1>
          </div>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="text-slate-500 hover:text-slate-900"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
        <div className="mt-4 space-y-3 text-slate-800">
          <p className="text-sm leading-snug">
            <span className="font-semibold">Concept:</span> {card.concept}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Why it matters:</span> {card.whyItMatters}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Action:</span> {card.actionStep}
          </p>
          <button
            className="text-sm text-slate-700 underline"
            onClick={() => setShowExample((prev) => !prev)}
          >
            {showExample ? "Hide example" : "Show example"}
          </button>
          {showExample && <p className="text-sm italic">{card.example}</p>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
            onClick={nextCard}
          >
            Next
          </button>
          <button
            className={`px-3 py-2 rounded text-sm ${saved ? "bg-green-600 text-white" : "bg-white border"}`}
            onClick={toggleSave}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <button
            className={`px-3 py-2 rounded text-sm ${understood ? "bg-blue-600 text-white" : "bg-white border"}`}
            onClick={toggleUnderstood}
          >
            {understood ? "Understood" : "Mark understood"}
          </button>
          <button
            className="px-3 py-2 rounded bg-white border text-sm"
            onClick={simplify}
            disabled={simplifying}
          >
            {simplifying ? "Simplifying..." : "Explain simpler"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <button className="underline" onClick={hideForToday}>
            Hide for today
          </button>
          <button onMouseDown={onMouseDown} className="text-slate-400">
            Drag
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p className="font-semibold">Settings</p>
            <p className="mt-1 text-xs text-slate-500">Rotation: Mon/Wed/Fri at 8:00 AM.</p>
            <button
              className="mt-2 rounded bg-slate-800 px-3 py-2 text-xs text-white"
              onClick={refreshNow}
            >
              Refresh now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

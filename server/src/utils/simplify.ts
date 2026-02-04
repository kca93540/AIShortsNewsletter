const replacements: Record<string, string> = {
  utilize: "use",
  leverage: "use",
  approximately: "about",
  evaluate: "check",
  facilitate: "help",
  optimize: "improve",
  mitigation: "reduction",
  hallucination: "made-up answer",
  constraints: "limits",
  summarize: "sum up"
};

const simplifySentence = (sentence: string) => {
  let text = sentence.trim();
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    text = text.replace(regex, value);
  });
  return text;
};

const shorten = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + "…";
};

export type SimplifiedCard = {
  concept: string;
  whyItMatters: string;
  example: string;
  actionStep: string;
};

export function simplifyCardFields(fields: SimplifiedCard): SimplifiedCard {
  const simplify = (value: string, maxLength: number) => {
    const sentences = value.split(/(?<=[.!?])\s+/);
    const simplified = sentences
      .slice(0, 2)
      .map((sentence) => simplifySentence(sentence))
      .join(" ");
    return shorten(simplified, maxLength);
  };

  return {
    concept: simplify(fields.concept, 140),
    whyItMatters: simplify(fields.whyItMatters, 120),
    example: simplify(fields.example, 160),
    actionStep: simplify(fields.actionStep, 90)
  };
}

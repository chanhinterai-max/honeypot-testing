import type { Relation } from "../types";

const toneClass: Record<Relation, string> = {
  above: "text-up",
  below: "text-down",
  flat: "text-muted",
};

export function Tone({ relation, children }: { relation: Relation; children: string }) {
  return <span className={toneClass[relation]}>{children}</span>;
}

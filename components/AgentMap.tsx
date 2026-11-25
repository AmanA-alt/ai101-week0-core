import { AGENT_MAP, KIND_LABEL, type StageKind } from "@/lib/venture-data";

/**
 * The agent map, drawn from typed data rather than an image, so it stays true
 * when the code changes. Each stage says what kind of step it is. The human
 * stage carries the cochineal accent, because the whole product rests on it.
 */

const KIND_STYLE: Record<StageKind, string> = {
  code: "border-[var(--line)] text-[var(--muted)]",
  model: "border-[var(--indigo)] text-[var(--indigo)]",
  database: "border-[var(--caution)] text-[var(--caution)]",
  human: "border-[var(--cochineal)] text-[var(--cochineal)]",
};

export default function AgentMap() {
  return (
    <div>
      <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4" aria-label="Stages from customer message to confirmed order">
        {AGENT_MAP.map((s, i) => (
          <li
            key={s.id}
            className={`agent-stage relative rounded-[14px] border bg-[var(--surface)] p-4 ${
              s.kind === "human" ? "border-[var(--cochineal)] shadow-[0_0_0_3px_var(--cochineal-soft)]" : "border-[var(--line)]"
            }`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-[11px] text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</span>
              <span className={`mono rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${KIND_STYLE[s.kind]}`}>
                {KIND_LABEL[s.kind]}
              </span>
            </div>
            <h3 className="m-0 mt-3 text-[0.95rem] font-medium">{s.title}</h3>
            <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{s.detail}</p>
            {i < AGENT_MAP.length - 1 && (
              <span aria-hidden="true" className="agent-arrow mono absolute text-[var(--muted)]">→</span>
            )}
          </li>
        ))}
      </ol>
      <ul className="m-0 mt-4 flex list-none flex-wrap gap-4 p-0 text-[12px] text-[var(--muted)]">
        {(Object.keys(KIND_LABEL) as StageKind[]).map((k) => (
          <li key={k} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full border-2 ${KIND_STYLE[k]}`} aria-hidden="true" />
            {k === "code" && "Deterministic code, tested"}
            {k === "model" && "Language model, wording only"}
            {k === "database" && "Stored in Supabase"}
            {k === "human" && "A person decides"}
          </li>
        ))}
      </ul>
    </div>
  );
}

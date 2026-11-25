import { FLOW, FLOW_CAPTION, t, type Lang, type FlowStep } from "@/lib/marketing-data";

/**
 * How the agent runs, as a thin line drawing.
 *
 * The reference uses a large animated diagram here. This is the same idea drawn
 * as static SVG, for the reason set out in the Module 4 packet: the animated
 * version drives its motion from scroll position, which drops frames on the
 * kind of phone this product's customer actually owns. A drawing that explains
 * the product does not need to move to do its job.
 *
 * It is a server component on purpose. There is no state and no handler here,
 * so shipping it as one keeps it out of the client bundle entirely.
 *
 * Two orientations rather than one scaled drawing. A five-step horizontal flow
 * squeezed into 375px renders its labels at about five pixels, which is not a
 * diagram, it is a texture. The geometry is computed from the same array in
 * both, so the two can never drift apart.
 */

/** Greedy wrap. SVG has no line box, so the breaks have to be decided here. */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out.slice(0, 2);
}

const STROKE = "var(--indigo)";
const ACCENT = "var(--cochineal)";

function Box({
  step,
  lang,
  x,
  y,
  w,
  h,
  align,
}: {
  step: FlowStep;
  lang: Lang;
  x: number;
  y: number;
  w: number;
  h: number;
  align: "center" | "start";
}) {
  const colour = step.human ? ACCENT : STROKE;
  const tx = align === "center" ? x + w / 2 : x + 14;
  const anchor = align === "center" ? "middle" : "start";
  const noteLines = wrap(t(step.note, lang), align === "center" ? 30 : 36);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={3}
        fill="none"
        stroke={colour}
        strokeWidth={step.human ? 1.6 : 1}
      />
      <text
        x={tx}
        y={y + 24}
        textAnchor={anchor}
        fill={colour}
        fontSize={13}
        fontWeight={step.human ? 500 : 400}
      >
        {t(step.label, lang)}
      </text>
      {noteLines.map((line, i) => (
        <text
          key={line}
          x={tx}
          y={y + 43 + i * 11}
          textAnchor={anchor}
          fill="var(--muted)"
          fontSize={9.5}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/** The crossed-out shortcut: the path the product refuses to have. */
function Blocked({ d, cx, cy }: { d: string; cx: number; cy: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={ACCENT} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
      <circle cx={cx} cy={cy} r={7} fill="var(--bone)" />
      <path
        d={`M ${cx - 4} ${cy - 4} L ${cx + 4} ${cy + 4} M ${cx + 4} ${cy - 4} L ${cx - 4} ${cy + 4}`}
        stroke={ACCENT}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={STROKE} strokeWidth={1} markerEnd="url(#flow-tip)" />;
}

function Defs() {
  return (
    <defs>
      <marker id="flow-tip" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M 0 1 L 7 4 L 0 7" fill="none" stroke={STROKE} strokeWidth={1} strokeLinecap="round" />
      </marker>
    </defs>
  );
}

export default function FlowDiagram({ lang }: { lang: Lang }) {
  const BW = 176;
  const BH = 66;
  const PITCH = 204;

  const VW = 274;
  const VH = 66;
  const VPITCH = 96;

  return (
    <figure className="m-0">
      {/* Horizontal, from the medium breakpoint up. */}
      <svg
        viewBox="0 0 992 116"
        className="hidden h-auto w-full md:block"
        role="img"
        aria-label={t(FLOW_CAPTION, lang)}
      >
        <Defs />
        {FLOW.map((step, i) => (
          <Box key={step.id} step={step} lang={lang} x={i * PITCH} y={8} w={BW} h={BH} align="center" />
        ))}
        {FLOW.slice(0, -1).map((step, i) => (
          <Arrow key={step.id} d={`M ${i * PITCH + BW} 41 H ${(i + 1) * PITCH - 2}`} />
        ))}
        <Blocked d="M 496 74 V 98 H 904 V 74" cx={700} cy={98} />
      </svg>

      {/* Vertical, below it. */}
      <svg
        viewBox="0 0 300 460"
        className="mx-auto block h-auto w-full max-w-[300px] md:hidden"
        role="img"
        aria-label={t(FLOW_CAPTION, lang)}
      >
        <Defs />
        {FLOW.map((step, i) => (
          <Box key={step.id} step={step} lang={lang} x={26} y={i * VPITCH} w={VW} h={VH} align="start" />
        ))}
        {FLOW.slice(0, -1).map((step, i) => (
          <Arrow key={step.id} d={`M 90 ${i * VPITCH + VH} V ${(i + 1) * VPITCH - 2}`} />
        ))}
        <Blocked d="M 26 250 H 10 V 392 H 26" cx={10} cy={321} />
      </svg>

      <figcaption className="mono mt-5 text-[11px] text-[var(--muted)]">
        {t(FLOW_CAPTION, lang)}
      </figcaption>
    </figure>
  );
}

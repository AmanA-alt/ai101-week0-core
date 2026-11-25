/**
 * The mascot: a sheet ghost cut from fabric.
 *
 * The body is cloth with a pinked hem and a stitched line, a size tag hangs
 * from one side, and a headset says it is live and on duty. It is drawn with
 * the brand's four colours, held in --g-* variables that do not change with
 * the appearance: the ghost is the logo, so it looks the same in light and dark.
 *
 * Motion is transform and opacity only, so the browser never has to recalculate
 * layout and it stays smooth on an ordinary phone. Every animation stops for
 * visitors who ask their system to reduce motion (see globals.css).
 *
 *   motion="loop"  floats continuously. Only for the agent screen, where the
 *                  ghost is on duty.
 *   motion="once"  rises in once, settles, and afterwards only blinks.
 *   motion="none"  still. Used for the logo.
 */

export type GhostState = "idle" | "talking" | "checking" | "handoff";
export type GhostMotion = "loop" | "once" | "none";

type Props = {
  size?: number;
  state?: GhostState;
  motion?: GhostMotion;
  label?: string;
  className?: string;
};

const HEM =
  "M40 104 C40 56 68 30 100 30 C132 30 160 56 160 104 L160 196 L150 186 L140 196 L130 186 L120 196 L110 186 L100 196 L90 186 L80 196 L70 186 L60 196 L50 186 L40 196 Z";

export default function Ghost({
  size = 120,
  state = "idle",
  motion = "loop",
  label,
  className = "",
}: Props) {
  // Below this size the stitching, tag lettering and headset mic only add noise.
  const detailed = size >= 56;
  const height = Math.round(size * 1.15);
  const ariaLabel = label ?? `Mascot, ${STATE_LABEL[state].toLowerCase()}`;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 200 230"
      width={size}
      height={height}
      className={`ghost ghost--${motion} ghost--${state} ${className}`}
      style={{ overflow: "visible" }}
    >
      <ellipse className="ghost-shadow" cx="100" cy="222" rx="46" ry="5" fill="#000" />

      <g className="ghost-body">
        <path
          d={HEM}
          fill="var(--g-bone)"
          stroke="var(--g-indigo)"
          strokeWidth={detailed ? 2 : 1.5}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />

        {detailed && (
          <path
            d="M50 174 L150 174"
            stroke="var(--g-cochineal)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Headset band and ear cups */}
        <path
          d="M54 100 C50 16 150 16 146 100"
          fill="none"
          stroke="var(--g-deep)"
          strokeWidth="5"
          strokeLinecap="butt"
        />
        <rect x="44" y="86" width="15" height="28" rx="3" fill="var(--g-deep)" />
        <rect x="141" y="86" width="15" height="28" rx="3" fill="var(--g-deep)" />
        {detailed && (
          <>
            <path
              d="M52 114 Q58 138 82 136"
              fill="none"
              stroke="var(--g-deep)"
              strokeWidth="3"
              strokeLinecap="butt"
            />
            <rect x="81" y="132" width="8" height="8" fill="var(--g-deep)" />
          </>
        )}

        {/* Eyes: the inner group scans, each eye blinks on its own box */}
        <g className="ghost-gaze">
          <rect className="ghost-eye" x="78" y="88" width="12" height="20" rx="6" fill="var(--g-indigo)" />
          <rect className="ghost-eye" x="110" y="88" width="12" height="20" rx="6" fill="var(--g-indigo)" />
        </g>

        {state === "talking" ? (
          <rect
            className="ghost-mouth"
            x="91"
            y="119"
            width="18"
            height="9"
            rx="4.5"
            fill="var(--g-cochineal)"
          />
        ) : (
          <path
            d="M92 121 Q100 128 108 121"
            fill="none"
            stroke="var(--g-indigo)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Size tag */}
        <g className="ghost-tag">
          <path
            d="M158 138 L165 149"
            stroke="var(--g-indigo)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <rect x="152" y="148" width="40" height="22" rx="2" fill="var(--g-cochineal)" />
          {detailed && (
            <text
              x="172"
              y="163"
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="9"
              letterSpacing="0.5"
              fill="var(--g-bone)"
            >
              {state === "handoff" ? "→ YOU" : "S M L"}
            </text>
          )}
        </g>
      </g>
    </svg>
  );
}

export const STATE_LABEL: Record<GhostState, string> = {
  idle: "Waiting",
  talking: "Replying",
  checking: "Checking stock",
  handoff: "Handed to you",
};

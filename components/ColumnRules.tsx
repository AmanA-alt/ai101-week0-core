/**
 * The column grid, left visible.
 *
 * A fixed overlay so the rules run unbroken down the whole page instead of
 * restarting inside each container. Opt-in rather than global: it belongs on
 * the narrative surfaces, and on /pricing it would sit behind a table of
 * figures where hairlines read as part of the data.
 *
 * aria-hidden and pointer-events: none — it is texture, not content.
 */
export default function ColumnRules() {
  return <div className="colrules" aria-hidden="true" />;
}

#!/usr/bin/env node
/**
 * Full-site regression test against a deployed copy of Bastilla.
 *
 *   node scripts/regression.mjs https://ai101-week0-core.vercel.app
 *
 * Requests every page and read route, checks each answers successfully and
 * contains a phrase it must contain, and checks that the orders route never
 * returns a transcript or a customer label. No dependencies: Node's own fetch.
 * Exits non-zero if anything fails, so it can gate a release.
 */

const base = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const PAGES = [
  ["/", "Bastilla"],
  ["/chat", "Bastilla"],
  ["/core", "Sales agent"],
  ["/core/prompts", "Bastilla"],
  ["/inventory", "Saved only on this device"],
  ["/dashboard", "Dashboard"],
  ["/demo", "Agent map"],
  ["/research", "Bastilla"],
  ["/product", "Bastilla"],
  ["/pricing", "Recommended"],
  ["/marketing", "Bastilla"],
  ["/docs", "Prompt library"],
];

const ROUTES = ["/api/orders", "/api/research", "/api/scenarios", "/api/assets", "/api/ab"];

let failed = 0;
const line = (ok, path, note) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${path.padEnd(16)} ${note}`);
};

async function get(path) {
  const t0 = Date.now();
  const res = await fetch(base + path, { redirect: "follow", headers: { "user-agent": "bastilla-regression" } });
  const body = await res.text();
  return { res, body, ms: Date.now() - t0 };
}

console.log(`Regression against ${base}\n`);

for (const [path, phrase] of PAGES) {
  try {
    const { res, body, ms } = await get(path);
    const ok = res.ok && body.includes(phrase);
    line(ok, path, `${res.status} in ${ms} ms${res.ok && !body.includes(phrase) ? `, missing "${phrase}"` : ""}`);
  } catch (e) {
    line(false, path, String(e.message || e));
  }
}

for (const path of ROUTES) {
  try {
    const { res, body, ms } = await get(path);
    let json = null;
    try { json = JSON.parse(body); } catch {}
    line(res.ok && json !== null, path, `${res.status} in ${ms} ms${json === null ? ", not JSON" : ""}`);
    if (path === "/api/orders" && json) {
      const leak = /"transcript"|"customer_label"/.test(body);
      line(!leak, "orders privacy", leak ? "transcript or customer label returned" : "no transcript, no customer label");
    }
  } catch (e) {
    line(false, path, String(e.message || e));
  }
}

console.log(`\n${failed === 0 ? "All checks passed." : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);

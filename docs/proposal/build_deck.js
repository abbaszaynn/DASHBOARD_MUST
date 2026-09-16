const pptxgen = require("pptxgenjs");

// ---- palette (matches deck.html / Sentinel_GB_Proposal.docx) ----
const NAVY = "24384F", NAVY_SOFT = "E3E9EF";
const BRASS = "8C6A2B", BRASS_SOFT = "F1E8D7";
const INK = "14181D", INK2 = "4A525C", INK3 = "818A94";
const GROUND = "F5F5F2", SURFACE = "FFFFFF", SURFACE2 = "ECECE6";
const RULE = "D8D8D0", RULE_STRONG = "B9B9AF";
const CRIT = "9B3226", CAUT = "A8762A", OK = "3A6551";

const SERIF = "Cambria";
const SANS = "Calibri";
const MONO = "Courier New";

const PW = 13.333, PH = 7.5;
const MX = 0.55; // side margin
const CW = PW - MX * 2;

function fresh(base) { return Object.assign({}, base); }

function newPptx() {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE";
  return p;
}

function bgSlide(slide) {
  slide.background = { color: GROUND };
}

function eyebrow(slide, text, y) {
  slide.addText(text.toUpperCase(), {
    x: MX, y: y, w: CW, h: 0.32,
    fontFace: MONO, fontSize: 10.5, color: BRASS, charSpacing: 2,
    isTextBox: true, margin: 0,
  });
}

function title(slide, text, y, size) {
  slide.addText(text, {
    x: MX, y: y, w: CW, h: size >= 34 ? 1.5 : 0.85,
    fontFace: SERIF, fontSize: size || 30, color: INK,
    isTextBox: true, margin: 0, valign: "top",
  });
}

function lead(slide, text, y, w) {
  slide.addText(text, {
    x: MX, y: y, w: w || CW * 0.72, h: 0.9,
    fontFace: SANS, fontSize: 14.5, color: INK, italic: false,
    isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
  });
}

function pillColor(kind) {
  if (kind === "ok") return OK;
  if (kind === "warn") return CAUT;
  return CRIT;
}

// Header bar used on every content slide (eyebrow + title), returns next-free y
function header(slide, eyebrowText, titleText, titleSize) {
  eyebrow(slide, eyebrowText, 0.42);
  title(slide, titleText, 0.78, titleSize || 30);
  return 0.78 + (titleSize >= 34 ? 1.35 : 0.95);
}

function footerPageNum(slide, n) {
  slide.addText(String(n).padStart(2, "0") + " / 13", {
    x: PW - 1.3, y: PH - 0.42, w: 1.0, h: 0.3,
    fontFace: MONO, fontSize: 9, color: INK3, align: "right",
    isTextBox: true, margin: 0,
  });
  slide.addText("SENTINEL — RESTRICTED, FOR OFFICIAL USE ONLY", {
    x: MX, y: PH - 0.42, w: 6, h: 0.3,
    fontFace: MONO, fontSize: 9, color: INK3, charSpacing: 1,
    isTextBox: true, margin: 0,
  });
}

function card(slide, x, y, w, h, label, body, opts) {
  opts = opts || {};
  slide.addShape("rect", {
    x, y, w, h, fill: { color: opts.fill || SURFACE },
    line: { color: opts.line || RULE, width: 1 },
  });
  if (label) {
    slide.addText(label.toUpperCase(), {
      x: x + 0.22, y: y + 0.16, w: w - 0.44, h: 0.28,
      fontFace: MONO, fontSize: 9, color: BRASS, charSpacing: 1.5,
      isTextBox: true, margin: 0,
    });
  }
  slide.addText(body, {
    x: x + 0.22, y: y + (label ? 0.48 : 0.2), w: w - 0.44, h: h - (label ? 0.68 : 0.4),
    fontFace: SANS, fontSize: opts.fontSize || 11.5, color: opts.bodyColor || INK2,
    isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
}

function callout(slide, x, y, w, h, richText) {
  slide.addShape("rect", {
    x, y, w, h, fill: { color: SURFACE },
    line: { color: RULE, width: 0.75 },
  });
  slide.addShape("rect", { x, y, w: 0.05, h, fill: { color: BRASS }, line: { type: "none" } });
  slide.addText(richText, {
    x: x + 0.28, y: y + 0.12, w: w - 0.5, h: h - 0.24,
    fontFace: SANS, fontSize: 12, color: INK,
    isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.25,
  });
}

function pill(text, kind) {
  return { text: text, options: { color: pillColor(kind), bold: false, fontFace: MONO, fontSize: 9.5 } };
}

// ---------------------------------------------------------------
const pptx = newPptx();
pptx.author = "Zircon Logics";
pptx.title = "Hate Speech Early-Warning & Legal Triage System";
pptx.subject = "Technical & Financial Proposal — Government of Gilgit-Baltistan";

// ================= SLIDE 1 — COVER =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  s.addShape("rect", { x: 0, y: 0, w: PW, h: PH, fill: { color: GROUND }, line: { type: "none" } });

  s.addText("TECHNICAL & FINANCIAL PROPOSAL", {
    x: MX, y: 1.55, w: CW, h: 0.32,
    fontFace: MONO, fontSize: 11, color: BRASS, charSpacing: 2,
    isTextBox: true, margin: 0,
  });
  s.addText("Hate Speech Early-Warning\n& Legal Triage System", {
    x: MX, y: 1.9, w: CW * 0.85, h: 1.7,
    fontFace: SERIF, fontSize: 42, color: INK,
    isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.02,
  });
  s.addText(
    "A decision-support system for Gilgit-Baltistan that identifies potentially unlawful online content, maps it to the applicable law, and places every case before a human officer.",
    {
      x: MX, y: 3.55, w: CW * 0.72, h: 0.75,
      fontFace: SANS, fontSize: 14.5, color: INK,
      isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.25,
    }
  );

  // meta rule line
  s.addShape("line", { x: MX, y: 4.55, w: CW, h: 0, line: { color: RULE_STRONG, width: 1 } });

  const metaCols = [
    { dt: "Submitted to", dd: "The Home Secretary\nHome & Prison Department\nGovernment of Gilgit-Baltistan" },
    { dt: "Submitted by", dd: "Zain Abbas\nZircon Logics" },
    { dt: "Contact", dd: "abbaszayn08@gmail.com\n0316-9244827 · 0355-5653738" },
    { dt: "Date", dd: "16 Sep 2026" },
    { dt: "Reference", dd: "NA" },
    { dt: "Year 1 program", dd: "PKR 29,894,666" },
  ];
  const mcw = CW / metaCols.length;
  metaCols.forEach((m, i) => {
    const x = MX + i * mcw;
    s.addText(m.dt.toUpperCase(), {
      x, y: 4.72, w: mcw - 0.15, h: 0.24,
      fontFace: MONO, fontSize: 8, color: INK3, charSpacing: 1.2,
      isTextBox: true, margin: 0,
    });
    s.addText(m.dd, {
      x, y: 4.98, w: mcw - 0.15, h: 1.4,
      fontFace: i === 3 || i === 4 || i === 5 ? MONO : SANS,
      fontSize: i === 5 ? 12.5 : 10.5,
      color: i === 5 ? BRASS : INK,
      isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.15,
    });
  });
}

// ================= SLIDE 2 — THREE GAPS =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "01 — The Problem", "Three gaps in current capability");
  y += 0.15;
  const gap = 0.28;
  const cw3 = (CW - gap * 2) / 3;
  const rows = [
    { n: "Latency", body: "Content that incites sectarian hostility circulates widely before it is noticed. By the time a complaint arrives, the administration's options have narrowed." },
    { n: "Language", body: "Much local discourse is Roman Urdu or regional — Shina, Balti, Burushaski. General-purpose commercial moderation tools handle these poorly or not at all." },
    { n: "Evidence", body: "When a case is escalated, its legal basis is assembled manually and inconsistently. Officers need the applicable provision identified alongside the content." },
  ];
  rows.forEach((r, i) => {
    card(s, MX + i * (cw3 + gap), y, cw3, 1.55, r.n, r.body, { fontSize: 11.5 });
  });
  callout(s, MX, y + 1.85, CW, 1.05, [
    { text: "A fourth consideration governs the design. In a region with real sectarian sensitivity, ", options: { color: INK } },
    { text: "a system that produces false accusations is worse than no system at all.", options: { color: INK, bold: true } },
  ]);
  footerPageNum(s, 2);
}

// ================= SLIDE 3 — PIPELINE =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "02 — How It Works", "Six agents. One terminus.");
  s.addText(
    "Each component performs one task and passes an enriched case record onward. Processing ends, in every case, at human review.",
    { x: MX, y: y - 0.05, w: CW, h: 0.5, fontFace: SANS, fontSize: 12.5, color: INK2, isTextBox: true, margin: 0, valign: "top" }
  );
  y += 0.65;

  const nodes = [
    { c: "01", t: "Ingestion", d: "Licensed provider. Public content only.", cond: false },
    { c: "02", t: "Classification", d: "XLM-RoBERTa. EN / UR / Roman UR.", cond: false },
    { c: "03 · conditional", t: "Sarcasm", d: "Fires only at 0.40–0.70 confidence.", cond: true },
    { c: "04 · conditional", t: "Clustering", d: "3+ near-identical posts ⇒ campaign.", cond: true },
    { c: "05 · conditional", t: "Legal Mapping", d: "Attaches statutory citation.", cond: true },
    { c: "06 · always", t: "Human Review", d: "Officer confirms, dismisses or escalates.", cond: false, term: true },
  ];
  const gap = 0.16, arrowW = 0.28;
  const nodeW = (CW - arrowW * (nodes.length - 1) - gap * (nodes.length - 1)) / nodes.length;
  let x = MX;
  const nodeH = 1.55;
  nodes.forEach((n, i) => {
    s.addShape("rect", {
      x, y, w: nodeW, h: nodeH,
      fill: { color: n.term ? BRASS_SOFT : SURFACE },
      line: { color: n.term ? BRASS : RULE, width: n.term ? 1.25 : 1, dashType: n.cond ? "dash" : "solid" },
    });
    s.addText(n.c.toUpperCase(), {
      x: x + 0.12, y: y + 0.12, w: nodeW - 0.24, h: 0.5,
      fontFace: MONO, fontSize: 7.5, color: BRASS, charSpacing: 0.5,
      isTextBox: true, margin: 0, valign: "top",
    });
    s.addText(n.t, {
      x: x + 0.12, y: y + 0.55, w: nodeW - 0.24, h: 0.32,
      fontFace: SANS, fontSize: 11.5, bold: true, color: INK,
      isTextBox: true, margin: 0,
    });
    s.addText(n.d, {
      x: x + 0.12, y: y + 0.88, w: nodeW - 0.24, h: nodeH - 0.95,
      fontFace: SANS, fontSize: 8.5, color: INK3,
      isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.15,
    });
    x += nodeW;
    if (i < nodes.length - 1) {
      s.addText("→", {
        x, y: y, w: arrowW, h: nodeH, align: "center", valign: "middle",
        fontFace: SANS, fontSize: 16, color: RULE_STRONG, isTextBox: true, margin: 0,
      });
      x += arrowW;
    }
  });
  s.addText("Dashed nodes fire conditionally on confidence and risk tier. The terminus does not.", {
    x: MX, y: y + nodeH + 0.18, w: CW, h: 0.3,
    fontFace: MONO, fontSize: 9.5, color: INK3, isTextBox: true, margin: 0,
  });
  footerPageNum(s, 3);
}

// ================= SLIDE 4 — SAFEGUARD =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "03 — The Governing Constraint", "The system cannot act on its own");
  lead(s, "This is not a policy commitment that could be relaxed later. It is enforced in the data layer.", y - 0.05, CW * 0.8);
  y += 0.75;

  const leftW = CW * 0.56, rightW = CW - leftW - 0.3;
  const items = [
    { h: "Enforced at the database", b: "A constraint rejects any case record that attempts to bypass human review. There is no code path and no configuration setting that can disable it." },
    { h: "Advisory legal output", b: "Statutory mapping is a drafting aid for a legally trained reviewer to confirm — never a determination. The interface states this on every case." },
    { h: "No fabricated citations", b: "Where a provision cannot be verified, the system records “not yet mapped” rather than proposing one." },
    { h: "Full audit trail", b: "Every decision records the officer, timestamp, decision and written reasoning — available for departmental or judicial scrutiny." },
  ];
  let iy = y;
  const rowH = 0.85;
  items.forEach((it) => {
    s.addShape("rect", { x: MX, y: iy + 0.06, w: 0.16, h: 0.02, fill: { color: BRASS }, line: { type: "none" } });
    s.addText([
      { text: it.h + "\n", options: { bold: true, color: INK, fontSize: 12 } },
      { text: it.b, options: { color: INK2, fontSize: 11 } },
    ], {
      x: MX + 0.28, y: iy, w: leftW - 0.28, h: rowH,
      fontFace: SANS, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.15,
    });
    iy += rowH;
  });

  const rx = MX + leftW + 0.3;
  s.addShape("rect", { x: rx, y, w: rightW, h: 3.4, fill: { color: SURFACE }, line: { color: RULE, width: 1 } });
  s.addText("ACCOUNTABILITY BOUNDARY", {
    x: rx + 0.22, y: y + 0.16, w: rightW - 0.44, h: 0.28,
    fontFace: MONO, fontSize: 9, color: BRASS, charSpacing: 1.5,
    isTextBox: true, margin: 0,
  });
  s.addText([
    { text: "requires_human_review\nINTEGER NOT NULL\nDEFAULT 1\n", options: { fontFace: MONO, fontSize: 11, color: INK } },
    { text: "CHECK (requires_human_review = 1)", options: { fontFace: MONO, fontSize: 11, color: BRASS } },
  ], {
    x: rx + 0.22, y: y + 0.5, w: rightW - 0.44, h: 1.3,
    isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.5,
  });
  s.addText("Every case file carries this constraint. A record that tried to skip review would be rejected by the database itself.", {
    x: rx + 0.22, y: y + 1.95, w: rightW - 0.44, h: 1.3,
    fontFace: SANS, fontSize: 11, color: INK2, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
  footerPageNum(s, 4);
}

// ================= SLIDE 5 — LEGAL GROUNDING =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "04 — Legal Grounding", "Flagged content, matched to statute");
  y += 0.1;

  const tableRows = [
    [
      { text: "Instrument", options: { bold: false, color: INK3, fontFace: MONO, fontSize: 9, fill: SURFACE2 } },
      { text: "Provision", options: { bold: false, color: INK3, fontFace: MONO, fontSize: 9, fill: SURFACE2 } },
      { text: "Subject", options: { bold: false, color: INK3, fontFace: MONO, fontSize: 9, fill: SURFACE2 } },
    ],
    ["Pakistan Penal Code", "153-A", "Promoting enmity between groups"],
    ["Pakistan Penal Code", "295-A", "Deliberate acts to outrage religious feelings"],
    ["PECA 2016", "Cyber-offence sections", "Offences via electronic communication"],
    ["Constitution of Pakistan", "Article 20", "Freedom of religion — recorded as the competing right to be weighed"],
    ["Gilgit-Baltistan local law", "Not yet mapped", "Stated explicitly rather than guessed"],
  ].map((row, ri) => {
    if (ri === 0) return row;
    return row.map((c, ci) => ({
      text: c,
      options: {
        color: ci === 0 ? INK : ci === 1 ? (ri === 5 ? CAUT : INK2) : INK2,
        fontFace: ci === 1 ? MONO : SANS,
        fontSize: 11,
      },
    }));
  });

  s.addTable(tableRows, {
    x: MX, y, w: CW, h: 2.9,
    colW: [CW * 0.28, CW * 0.28, CW * 0.44],
    border: { type: "solid", color: RULE, pt: 0.75 },
    autoPage: false, valign: "middle",
    rowH: 0.42,
  });

  callout(s, MX, y + 3.15, CW, 0.85,
    "Article 20 is carried deliberately. A system that only ever cites the offence, and never the right being weighed against it, is an enforcement tool rather than a legal one."
  );
  footerPageNum(s, 5);
}

// ================= SLIDE 6 — MATURITY =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "05 — Present Status", "What exists today, stated plainly", 28);
  s.addText("A working prototype is built and running. Presenting it as a finished system would be a disservice — and in a security context, a dangerous one.", {
    x: MX, y: y - 0.08, w: CW, h: 0.45, fontFace: SANS, fontSize: 11.5, color: INK2, isTextBox: true, margin: 0, valign: "top",
  });
  y += 0.5;

  const statusRows = [
    ["Classification model", pill("Operational", "ok"), "Not yet validated on GB content"],
    ["Agent orchestration", pill("Operational", "ok"), "Tested end-to-end"],
    ["Human review queue", pill("Operational", "ok"), "Constraint enforced at database level"],
    ["Legal mapping", pill("Needs validation", "warn"), "Requires advocate sign-off"],
    ["Campaign clustering", pill("Simplified", "warn"), "Embeddings + cosine, not full ULTRA"],
    ["Sarcasm detection", pill("Placeholder", "crit"), "Rule-based; not a trained model"],
    ["District geo-tagging", pill("Unavailable", "crit"), "No reliable location source"],
    ["Authentication & RBAC", pill("Not built", "crit"), "Required before production"],
  ];
  const header_ = ["Component", "Status", "Note"].map((t) => ({
    text: t, options: { color: INK3, fontFace: MONO, fontSize: 8.5, fill: SURFACE2 },
  }));
  const rows = [header_].concat(statusRows.map((r) => [
    { text: r[0], options: { color: INK, fontFace: SANS, fontSize: 10 } },
    r[1],
    { text: r[2], options: { color: INK2, fontFace: SANS, fontSize: 10 } },
  ]));
  s.addTable(rows, {
    x: MX, y, w: CW, h: 3.15,
    colW: [CW * 0.32, CW * 0.24, CW * 0.44],
    border: { type: "solid", color: RULE, pt: 0.75 },
    autoPage: false, valign: "middle", rowH: 0.35,
  });

  callout(s, MX, y + 3.35, CW, 0.85, [
    { text: "The published ", options: { color: INK } },
    { text: "95.7%", options: { color: INK, bold: true } },
    { text: " accuracy figure was obtained on the model's original academic test set. It has ", options: { color: INK } },
    { text: "not", options: { color: INK, bold: true } },
    { text: " been validated on Gilgit-Baltistan content, and real-world accuracy on local dialects should be expected to be lower until retraining is complete.", options: { color: INK } },
  ]);
  footerPageNum(s, 6);
}

// ================= SLIDE 7 — APPROACH =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "06 — Approach", "One year. One approved figure.");
  lead(s, "A single twelve-month engagement covering all development, hardware and twelve months of subscriptions — with an early review point at Month 4, before the greater part of the money is committed.", y - 0.05, CW * 0.85);
  y += 1.0;

  const gap = 0.28, cw3 = (CW - gap * 2) / 3;
  const cards = [
    { n: "Stage 1 · Months 1–3", h: "Validation", b: "Gilgit & Skardu. Delivers a measured accuracy report on the Department's own content. PKR 6.93M." },
    { n: "Stage 2 · Months 4–12", h: "Build & rollout", b: "Model retraining, security hardening, authentication, remaining districts, officer training. PKR 22.96M." },
    { n: "Year 2 onward", h: "Not sought here", b: "Recurring charges shown for transparency only, to be submitted separately when lower-cost options may exist." },
  ];
  cards.forEach((c, i) => {
    const x = MX + i * (cw3 + gap);
    s.addShape("rect", { x, y, w: cw3, h: 1.9, fill: { color: SURFACE }, line: { color: RULE, width: 1 } });
    s.addText(c.n.toUpperCase(), { x: x + 0.2, y: y + 0.15, w: cw3 - 0.4, h: 0.26, fontFace: MONO, fontSize: 8.5, color: BRASS, isTextBox: true, margin: 0 });
    s.addText(c.h, { x: x + 0.2, y: y + 0.45, w: cw3 - 0.4, h: 0.3, fontFace: SANS, fontSize: 13, bold: true, color: INK, isTextBox: true, margin: 0 });
    s.addText(c.b, { x: x + 0.2, y: y + 0.78, w: cw3 - 0.4, h: 1.05, fontFace: SANS, fontSize: 10.5, color: INK2, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
  });

  callout(s, MX, y + 2.2, CW, 0.85, [
    { text: "The two stages are ", options: { color: INK } },
    { text: "one approved figure of PKR 29,894,666", options: { color: INK, bold: true } },
    { text: ", not two purchases. Stage 1 is the first three months of it.", options: { color: INK } },
  ]);
  footerPageNum(s, 7);
}

// helpers for the cost slides
function costTable(s, x, y, w, rows, totalLabel) {
  const body = rows.map((r) => [
    { text: r[0], options: { color: INK, fontFace: SANS, fontSize: 10.5 } },
    { text: r[1], options: { color: INK2, fontFace: MONO, fontSize: 10.5, align: "right" } },
  ]);
  const head = [
    { text: "Cost head", options: { color: INK3, fontFace: MONO, fontSize: 8.5, fill: SURFACE2 } },
    { text: "PKR", options: { color: INK3, fontFace: MONO, fontSize: 8.5, fill: SURFACE2, align: "right" } },
  ];
  const totalRowIdx = body.length - 1;
  body[totalRowIdx] = body[totalRowIdx].map((c) => ({
    text: c.text, options: Object.assign({}, c.options, { fill: NAVY_SOFT, bold: true, color: INK }),
  }));
  const allRows = [head].concat(body);
  s.addTable(allRows, {
    x, y, w, h: 0.36 * allRows.length,
    colW: [w * 0.72, w * 0.28],
    border: { type: "solid", color: RULE, pt: 0.75 },
    autoPage: false, valign: "middle", rowH: 0.335,
  });
}

function figRow(s, x, y, w, figs) {
  const gap = 0.3, fw = (w - gap * (figs.length - 1)) / figs.length;
  figs.forEach((f, i) => {
    const fx = x + i * (fw + gap);
    s.addShape("rect", { x: fx, y, w: 0.04, h: 1.05, fill: { color: BRASS }, line: { type: "none" } });
    s.addText(f.v, { x: fx + 0.18, y, w: fw - 0.18, h: 0.5, fontFace: MONO, fontSize: 24, bold: true, color: INK, isTextBox: true, margin: 0, valign: "top" });
    s.addText(f.k, { x: fx + 0.18, y: y + 0.5, w: fw - 0.18, h: 0.3, fontFace: SANS, fontSize: 10, color: INK3, isTextBox: true, margin: 0 });
    s.addText(f.sub, { x: fx + 0.18, y: y + 0.78, w: fw - 0.18, h: 0.25, fontFace: MONO, fontSize: 9, color: INK3, isTextBox: true, margin: 0 });
  });
}

// ================= SLIDE 8 — PILOT COST =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "07 — Cost Plan A", "Stage 1 — Validation Pilot");
  y += 0.1;
  costTable(s, MX, y, CW, [
    ["Human resources — 7 roles, part-time over 3 months", "3,497,500"],
    ["Hardware — GPU workstation, UPS, 2 review stations", "1,580,000"],
    ["Software & subscriptions (3 months)", "227,160"],
    ["Data & annotation — initial GB sample set", "350,000"],
    ["Training — single session, 2 districts", "150,000"],
    ["Travel & field", "250,000"],
    ["Administrative overhead (6%)", "363,280"],
    ["Contingency (8%)", "513,435"],
    ["Total — Stage 1", "6,931,375"],
  ]);
  figRow(s, MX, y + 3.55, CW, [
    { v: "6.93M", k: "PKR — within the Year 1 total", sub: "≈ USD 24,755" },
    { v: "3", k: "Months to a measured result", sub: "Gilgit & Skardu" },
    { v: "23%", k: "Of the Year 1 program", sub: "Review point at Month 4" },
  ]);
  footerPageNum(s, 8);
}

// ================= SLIDE 9 — FULL COST =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "08 — Cost Plan B", "Year 1 Complete Program");
  y += 0.1;
  costTable(s, MX, y, CW, [
    ["Human resources — 11 roles, part-time over 12 months", "18,290,000"],
    ["Hardware (CapEx) — single server, UPS, 4 workstations", "3,210,000"],
    ["Software & subscriptions — 12 months included", "1,313,440"],
    ["Data & annotation — ~25,000 GB samples", "1,200,000"],
    ["Training & capacity building", "800,000"],
    ["Legal & governance", "600,000"],
    ["Travel & field", "700,000"],
    ["Administrative overhead (6%)", "1,566,806"],
    ["Contingency & risk reserve (8%)", "2,214,420"],
    ["Total — Year 1 (all-inclusive)", "29,894,666"],
  ]);
  figRow(s, MX, y + 3.85, CW, [
    { v: "29.89M", k: "PKR — under the approved ceiling", sub: "≈ USD 106,767" },
    { v: "12", k: "Months of subscriptions included", sub: "No further Year 1 cost" },
    { v: "~100K", k: "Posts / month capacity", sub: "Scale tier, single server" },
  ]);
  footerPageNum(s, 9);
}

// ================= SLIDE 10 — OPEX =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "09 — After Year 1", "Recurring charges — not sought here", 27);
  s.addText("Shown for planning transparency only. Per the Department's direction these form a separate submission nearer the time, when lower-cost technical options may be available.", {
    x: MX, y: y - 0.1, w: CW, h: 0.5, fontFace: SANS, fontSize: 11, color: INK2, isTextBox: true, margin: 0, valign: "top",
  });
  y += 0.5;
  const leftW = CW * 0.58, rightW = CW - leftW - 0.3;
  costTable(s, MX, y, leftW, [
    ["Skeleton operations team", "6,330,000"],
    ["Apify subscription & overage", "1,004,640"],
    ["Monitoring & off-site backup", "268,800"],
    ["Hardware maintenance (8%)", "256,800"],
    ["Power & connectivity", "600,000"],
    ["Annual security review", "400,000"],
    ["Model retraining, twice yearly", "800,000"],
    ["Contingency (10%)", "966,024"],
    ["Indicative annual total", "10,626,264"],
  ]);
  const rx = MX + leftW + 0.3;
  s.addShape("rect", { x: rx, y, w: 0.04, h: 1.0, fill: { color: BRASS }, line: { type: "none" } });
  s.addText("72.40M", { x: rx + 0.18, y, w: rightW - 0.18, h: 0.5, fontFace: MONO, fontSize: 26, bold: true, color: INK, isTextBox: true, margin: 0 });
  s.addText("PKR — indicative five-year total", { x: rx + 0.18, y: y + 0.5, w: rightW - 0.18, h: 0.3, fontFace: SANS, fontSize: 10.5, color: INK3, isTextBox: true, margin: 0 });
  s.addText("≈ USD 258,570 · if later years approved", { x: rx + 0.18, y: y + 0.78, w: rightW - 0.18, h: 0.3, fontFace: MONO, fontSize: 9, color: INK3, isTextBox: true, margin: 0 });
  callout(s, rx, y + 1.25, rightW, 2.2,
    "Retraining is not discretionary maintenance. Without it the model grows progressively less reliable while continuing to appear authoritative — the most dangerous failure mode for a system of this kind."
  );
  footerPageNum(s, 10);
}

// ================= SLIDE 11 — SCOPE OPTIONS =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "10 — Scope Calibration", "What the envelope buys — and what it does not", 25);
  s.addText("Delivering within the approved ceiling required real reductions in scope, not a discount on the same scope. Stating them plainly matters: an approval granted on an unstated assumption of wider scope fails during delivery.", {
    x: MX, y: y - 0.15, w: CW, h: 0.55, fontFace: SANS, fontSize: 10.5, color: INK2, isTextBox: true, margin: 0, valign: "top",
  });
  y += 0.55;

  const optRows = [
    ["Core pipeline & officer dashboard", pill("Full", "ok"), "—"],
    ["Human review, audit trail, accountability constraint", pill("Full", "ok"), "—"],
    ["Legal mapping with advocate validation", pill("Full", "ok"), "—"],
    ["Server infrastructure", pill("Single server", "warn"), "High-availability pair"],
    ["Disaster recovery site", pill("Not included", "crit"), "Off-site backup only"],
    ["Ingestion capacity", pill("~100K / month", "warn"), "300–500K (Business tier)"],
    ["GB annotation corpus", pill("~25,000 samples", "warn"), "100,000 samples"],
    ["Security assurance", pill("One pen test", "warn"), "ISO 27001, bias audit"],
    ["Officer workstations", pill("4", "warn"), "15"],
  ];
  const head = ["Capability", "Year 1", "Deferred"].map((t) => ({
    text: t, options: { color: INK3, fontFace: MONO, fontSize: 8.5, fill: SURFACE2 },
  }));
  const rows = [head].concat(optRows.map((r) => [
    { text: r[0], options: { color: INK, fontFace: SANS, fontSize: 9.8 } },
    r[1],
    { text: r[2], options: { color: INK2, fontFace: SANS, fontSize: 9.8 } },
  ]));
  s.addTable(rows, {
    x: MX, y, w: CW, h: 3.35,
    colW: [CW * 0.42, CW * 0.28, CW * 0.30],
    border: { type: "solid", color: RULE, pt: 0.75 },
    autoPage: false, valign: "middle", rowH: 0.34,
  });

  callout(s, MX, y + 3.55, CW, 0.7, [
    { text: "None of these reductions touch the safeguards.", options: { color: INK, bold: true } },
    { text: " Human review, the audit trail, the accountability constraint and legal validation are funded in full — they are what make the system defensible if a decision taken with its assistance is challenged.", options: { color: INK } },
  ]);
  footerPageNum(s, 11);
}

// ================= SLIDE 12 — RISK =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "11 — Risk", "Principal risks & mitigation");
  y += 0.1;

  const riskRows = [
    ["False positive leads to wrongful action against a citizen", pill("High", "crit"), "Mandatory human review; no autonomous path exists; legal officer sign-off"],
    ["Under-performance on Shina / Balti / Burushaski", pill("High", "crit"), "GB corpus collection and retraining funded; per-language accuracy reported"],
    ["Perceived as mass surveillance", pill("High", "crit"), "Published transparency policy, grievance mechanism, independent oversight"],
    ["Single-server failure causes outage", pill("Med-High", "warn"), "Accepted consequence of the budget envelope — mitigated by spares, nightly off-site backup and a documented rebuild procedure, not automatic failover"],
    ["Volume exceeds Scale-tier capacity", pill("Medium", "warn"), "Volume monitoring with alerting; tier upgrade costed and presented before any breach"],
    ["Platform or provider terms change", pill("Medium", "warn"), "Pluggable ingestion; licensed provider only; no direct scraping"],
    ["Foreign-exchange exposure", pill("Medium", "warn"), "FX contingency in reserve; annual re-basing of USD items"],
    ["Key-person dependency", pill("Medium", "warn"), "Documentation, train-the-trainer, departmental capability transfer"],
  ];
  const head = ["Risk", "Severity", "Mitigation"].map((t) => ({
    text: t, options: { color: INK3, fontFace: MONO, fontSize: 8.5, fill: SURFACE2 },
  }));
  const rows = [head].concat(riskRows.map((r) => [
    { text: r[0], options: { color: INK, fontFace: SANS, fontSize: 9.6 } },
    r[1],
    { text: r[2], options: { color: INK2, fontFace: SANS, fontSize: 9.2 } },
  ]));
  s.addTable(rows, {
    x: MX, y, w: CW, h: 4.55,
    colW: [CW * 0.32, CW * 0.13, CW * 0.55],
    border: { type: "solid", color: RULE, pt: 0.75 },
    autoPage: false, valign: "middle", rowH: 0.5,
  });
  footerPageNum(s, 12);
}

// ================= SLIDE 13 — RECOMMENDATION =================
{
  const s = pptx.addSlide();
  bgSlide(s);
  let y = header(s, "12 — Recommendation", "Approve PKR 29,894,666", 34);
  lead(s, "The Year 1 Complete Program — all development, hardware and twelve months of subscription charges, within the ceiling already approved by the Home Secretary.", y - 0.05, CW * 0.85);
  y += 1.05;
  s.addShape("line", { x: MX, y, w: CW, h: 0, line: { color: RULE, width: 1 } });
  y += 0.25;

  const gap = 0.3, cw3 = (CW - gap * 2) / 3;
  const cols = [
    { h: "Costed to the envelope, honestly", b: "Scope was reduced in infrastructure resilience, assurance depth and capacity — and stated plainly, so nothing fails by surprise during delivery." },
    { h: "Safeguards funded in full", b: "Human review, audit trail, the accountability constraint and legal validation are untouched. They are what make the system defensible." },
    { h: "A review point at Month 4", b: "Stage 1 delivers measured accuracy on GB content before the greater part of the expenditure is committed — with a documented basis to continue, adjust or halt." },
  ];
  cols.forEach((c, i) => {
    const x = MX + i * (cw3 + gap);
    s.addText(c.h, { x, y, w: cw3, h: 0.55, fontFace: SANS, fontSize: 12.5, bold: true, color: INK, isTextBox: true, margin: 0, valign: "top" });
    s.addText(c.b, { x, y: y + 0.55, w: cw3, h: 1.3, fontFace: SANS, fontSize: 10, color: INK2, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
  });

  const sy = y + 2.2;
  s.addShape("line", { x: MX, y: sy, w: 3.0, h: 0, line: { color: RULE_STRONG, width: 1 } });
  s.addText("SIGNATURE", { x: MX, y: sy + 0.08, w: 3.0, h: 0.24, fontFace: MONO, fontSize: 8.5, color: INK3, charSpacing: 1, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Zain Abbas\n", options: { color: INK, fontSize: 12 } },
    { text: "Technical Lead, Zircon Logics", options: { color: INK3, fontSize: 10 } },
  ], { x: MX, y: sy + 0.35, w: 3.0, h: 0.6, fontFace: SANS, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });

  s.addShape("line", { x: MX + 3.4, y: sy, w: 3.0, h: 0, line: { color: RULE_STRONG, width: 1 } });
  s.addText("DATE", { x: MX + 3.4, y: sy + 0.08, w: 3.0, h: 0.24, fontFace: MONO, fontSize: 8.5, color: INK3, charSpacing: 1, isTextBox: true, margin: 0 });

  footerPageNum(s, 13);
}

pptx.writeFile({ fileName: "Sentinel_GB_Deck.pptx" }).then(() => {
  console.log("WROTE Sentinel_GB_Deck.pptx");
});

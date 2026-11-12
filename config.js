/* The Valuation Desk: FINAN IV Unit 9 (stocks). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py --course "FINAN IV"): Bramble Street Research, Ilse Ostrander, Copperline Burgers,
   Tidewell Tacos, Ferro Pizza, Halyard Chicken, Basswood Subs, all clean.
   Version 3 (2026-11-12), the out-of-sample check on the Unit 4 teach-the-minimum pilot (process/standards/interactive-assignments.md
   rules 25 to 32; u09/TEACHING-MAP.md; design/scope-2026-11-11.md):
   - The reading teaches; the desk has no walkthrough of its own (rule 32).
   - Every task states the problem first, then shows a worked example drawn as the SAME table the student fills, read-only, with a
     different company and numbers (h.ladder, rule 29). A faded step gives every line but one; the next step leaves every line blank.
   - Cut from the desk: next year's dividend from this year's, the growth-range step, median and outlier handling (three steps and
     a check), the walkthrough.
   The previous version is in v2-archive/. seedVersion 3 and version 3: progress and receipts from v2 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick check: the guardrail',
      q: 'Halyard Chicken raised its dividend 12% last year. A colleague uses 12% as growth forever in the constant-growth model, with a 9% required return, and gets a negative value. What went wrong?',
      options: ['Growth forever has to stay below the required return, so 12% cannot be the long-run rate', 'The dividend is too small for the model', 'The required return should be lower than the growth rate', 'Nothing; the stock is worth less than zero'],
      answer: 0,
      why: ['Right. No business can outgrow its owners’ required return forever. Use a modest long-run rate well below it.',
        'The size of the dividend does not matter. Growth is above the required return, which makes r − g negative.',
        'Lowering the required return below growth makes the problem worse. Growth forever must stay below the required return.',
        'A share cannot be worth less than zero. The formula breaks when growth is at or above the required return.'] },
    { title: 'Exam-style question',
      q: 'A restaurant stock trades at $50.00. Next year’s dividend is $2.00, and its owners require a 9% return. What yearly growth in dividends, forever, does today’s price imply?',
      options: ['5%', '4%', '13%', '8.96%'],
      answer: 0,
      why: ['Right. The dividend yield is $2.00 ÷ $50.00 = 4%, and implied growth = 9% − 4% = 5%. Exam questions look like this one.',
        '4% is the dividend yield, $2.00 ÷ $50.00. Subtract it from the 9% required return to get the growth.',
        '13% adds the yield to the required return. Implied growth = 9% − 4%.',
        '8.96% subtracts 0.04 from 9. Put both in the same units first: 9% − 4% = 5%.'] },
  ];

  const STEPS = [
    { id: 'perp', label: 'No growth', kind: 'task' },
    { id: 'cg1', label: 'Let it grow', kind: 'task' },
    { id: 'cg2', label: 'Cheap or expensive', kind: 'task' },
    { id: 'q1', label: 'Quick check', kind: 'check', quiz: 0 },
    { id: 'pe1', label: 'A similar chain', kind: 'task' },
    { id: 'pe2', label: 'Your own P/E', kind: 'task' },
    { id: 'ig1', label: 'Run it backward', kind: 'task' },
    { id: 'ig2', label: 'Faster or slower', kind: 'task' },
    { id: 'q2', label: 'Exam-style question', kind: 'check', quiz: 1 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  // [required return, growth forever]: whole percents, r − g from 4 to 6 points, so every value divides cleanly.
  const RG = [[0.08, 0.03], [0.08, 0.04], [0.09, 0.03], [0.09, 0.04], [0.09, 0.05], [0.10, 0.04], [0.10, 0.05], [0.10, 0.06]];

  function buildTasks(rng, h) {
    const T = [], near = (a, b) => Math.abs(a - b) < 0.005;
    // perp: Copperline if its dividend never grew
    // No answer may equal its worked example's answer (the example sits right above the student's table).
    { let r, D; do { r = h.pick(rng, [0.08, 0.09, 0.10]); D = h.pick(rng, [2, 2.5, 3, 3.5, 4, 4.5, 5]); } while (near(D / r, 20));
      T.push({ id: 'perp', r, D, answer: D / r }); }
    // cg1: Copperline with Ilse's growth forecast. ig2 comes back to this forecast.
    let r, g, D1; do { [r, g] = h.pick(rng, RG); D1 = h.pick(rng, [2, 2.4, 3, 3.6, 4]); } while (near(D1 / (r - g), 2 / 0.06));
    T.push({ id: 'cg1', r, g, D1, answer: D1 / (r - g) });
    // cg2: Ferro Pizza against its share price, at least 10% away from the value either way
    { let r2, g2, D; do { [r2, g2] = h.pick(rng, RG.filter((x) => x[0] !== r || x[1] !== g)); D = h.pick(rng, [1.5, 2, 2.5, 3]); } while (near(D / (r2 - g2), 25));
      const V = D / (r2 - g2);
      const cheap = rng() < 0.5, P = Math.round(V * (cheap ? 0.78 + 0.08 * rng() : 1.12 + 0.1 * rng()));
      T.push({ id: 'cg2', r: r2, g: g2, D1: D, P, answer: V, decision: P < V ? 'cheap' : 'dear' }); }
    // pe1 and pe2: a similar chain's P/E (whole number) times the company's own earnings per share
    { let pe, e, E; do { pe = h.between(rng, 12, 24, 1); e = h.pick(rng, [2, 2.5, 3, 4]); E = h.pick(rng, [3, 3.5, 4, 4.5, 5, 5.5]); } while (near(pe * E, 30) || pe === 15);
      T.push({ id: 'pe1', pe, peerEps: e, peerPrice: pe * e, E, answer: pe * E }); }
    { let pe, e, E; do { pe = h.between(rng, 12, 24, 1); e = h.pick(rng, [1.5, 2, 2.5, 3, 4, 5]); E = h.pick(rng, [2, 2.5, 3, 3.5, 4, 4.5]); } while (e === E || near(pe * E, 24) || pe === 16);
      T.push({ id: 'pe2', pe, peerEps: e, peerPrice: pe * e, E, answer: pe * E }); }
    // ig1: Halyard Chicken. Yield on a half-percent grid, price a multiple of $10, so the dividend comes out to the cent.
    { let rr, y; do { rr = h.pick(rng, [0.08, 0.09, 0.10]); y = h.pick(rng, [0.025, 0.03, 0.035, 0.04]); } while (near(rr - y, 0.07)); const P = h.between(rng, 40, 90, 10);
      T.push({ id: 'ig1', r: rr, y, P, D1: Math.round(P * y * 100) / 100, answer: rr - y }); }
    // ig2: Copperline's price, set so the growth it implies is 1 to 2 points away from Ilse's forecast g
    { const gi = h.pick(rng, [g - 0.02, g - 0.015, g - 0.01, g + 0.01, g + 0.015].filter((x) => x >= 0.02 && r - x >= 0.025));
      const y = r - gi, P = Math.round(D1 / y);
      const yy = D1 / P;
      T.push({ id: 'ig2', r, g, D1, P, y: yy, answer: r - yy, decision: r - yy > g ? 'faster' : 'slower' }); }
    return T;
  }

  const m = (x) => root.DeskEngine.h.money(x, 2);
  const m0 = (x) => root.DeskEngine.h.money(x);
  const mm = (x) => (Number.isInteger(x) ? m0(x) : m(x));
  const pc = (x) => (Math.round(x * 1000) / 10) + '%';
  const p2 = (x) => String(+(x * 100).toFixed(2)) + '%';
  const dec = (x) => String(+x.toFixed(4));
  // A percent typed as 4.5%, 4.5 or 0.045 all mean 4.5%. Every percent answer on this desk is at least 1%.
  const pctIn = (h, s) => { const v = h.parseMoney(s); if (!isFinite(v)) return v; return (!/%/.test(String(s)) && Math.abs(v) >= 1) ? v / 100 : v; };

  // Lines for each task; the worked example uses the same function on other numbers, so the two tables always match.
  const LINES = {
    perp: (D, r) => [
      { label: 'Required return as a decimal', calc: `${pc(r)} = ${dec(r)}`, value: dec(r), fmt: 'text' },
      { label: 'Value per share', calc: `${m(D)} ÷ ${dec(r)}`, value: D / r, dp: 2, input: true }],
    cg: (D1, r, g, faded) => [
      { label: 'r − g', calc: `${pc(r)} − ${pc(g)}`, value: r - g, fmt: 'pct', input: !faded },
      { label: 'Value per share', calc: `${m(D1)} ÷ ${faded ? dec(r - g) : '(r − g)'}`, value: D1 / (r - g), dp: 2, input: true }],
    pe: (peerPrice, peerEps, E, pe, faded) => [
      { label: 'Similar chain’s P/E', calc: `${mm(peerPrice)} ÷ ${mm(peerEps)}`, value: pe, fmt: 'num', input: !faded },
      { label: 'Value per share', calc: `${mm(E)} × ${faded ? pe : 'the P/E'}`, value: E * pe, dp: 2, input: true }],
    ig: (D1, P, r, y, faded) => [
      { label: 'Dividend yield', calc: `${m(D1)} ÷ ${mm(P)}`, value: y, fmt: 'pct', input: !faded },
      { label: 'Implied growth', calc: `${pc(r)} − ${faded ? p2(y) : 'the dividend yield'}`, value: r - y, fmt: 'pct', input: true }],
  };
  // Built on first use: config.js loads before the engine, so money() is not available at load time.
  const EXAMPLES = () => ({
    perp: { cap: 'A diner chain pays $2.00 a year forever, and its owners require 10%', lines: LINES.perp(2, 0.10) },
    cg1: { cap: 'A diner chain pays $2.00 next year, growing 4% a year forever, and its owners require 10%', lines: LINES.cg(2, 0.10, 0.04, true) },
    cg2: { cap: 'A sandwich chain pays $1.50 next year, growing 3% a year forever, at a 9% required return. Its shares sell for $30.', lines: LINES.cg(1.5, 0.09, 0.03, false),
      after: 'The price, $30, is above the value, $25.00, so the shares look expensive.' },
    pe1: { cap: 'A pizza chain earned $2.00 a share. A similar chain sells for $45 and earned $3.00 a share.', lines: LINES.pe(45, 3, 2, 15, true) },
    pe2: { cap: 'A coffee chain earned $1.50 a share. A similar chain sells for $64 and earned $4.00 a share.', lines: LINES.pe(64, 4, 1.5, 16, false) },
    ig1: { cap: 'A diner chain’s shares sell for $40 and will pay $1.20 next year. Its owners require 10%.', lines: LINES.ig(1.2, 40, 0.10, 0.03, true) },
    ig2: { cap: 'A sandwich chain sells for $50 and will pay $2.00 next year, at a 9% required return. Its analyst forecasts 4% growth.', lines: LINES.ig(2, 50, 0.09, 0.04, false),
      after: 'The price assumes 5% growth, faster than the analyst’s 4%. If the analyst is right, the shares look expensive.' },
  });

  function linesFor(t) {
    if (t.id === 'perp') return LINES.perp(t.D, t.r);
    if (t.id === 'cg1') return LINES.cg(t.D1, t.r, t.g, true);
    if (t.id === 'cg2') return LINES.cg(t.D1, t.r, t.g, false);
    if (t.id === 'pe1') return LINES.pe(t.peerPrice, t.peerEps, t.E, t.pe, true);
    if (t.id === 'pe2') return LINES.pe(t.peerPrice, t.peerEps, t.E, t.pe, false);
    if (t.id === 'ig1') return LINES.ig(t.D1, t.P, t.r, t.y, true);
    if (t.id === 'ig2') return LINES.ig(t.D1, t.P, t.r, t.y, false);
  }

  const PROBLEM = {
    perp: (t) => ({ title: 'A dividend that never grows', place: 'Ilse starts with the simplest case.',
      body: `<p>Suppose Copperline Burgers paid <b>${m(t.D)}</b> a share every year, forever, and never raised it. Its owners require <b>${pc(t.r)}</b>. What is one share worth? The first line is done for you.</p>` }),
    cg1: (t) => ({ title: 'Let the dividend grow', place: 'Copperline raises its dividend every year.',
      body: `<p>Copperline will pay <b>${m(t.D1)}</b> a share next year. Ilse expects the dividend to grow <b>${pc(t.g)}</b> a year forever, and owners require <b>${pc(t.r)}</b>. What is one share worth? The first line is done for you.</p>` }),
    cg2: (t) => ({ title: 'Cheap or expensive?', place: 'A client asks about Ferro Pizza.',
      body: `<p>Ferro Pizza will pay <b>${m(t.D1)}</b> a share next year, growing <b>${pc(t.g)}</b> a year forever, and owners require <b>${pc(t.r)}</b>. Its shares sell for <b>${m0(t.P)}</b>. Are they cheap or expensive?</p>`,
      choice: { legend: `At ${m0(t.P)}, Ferro’s shares look`, options: [['cheap', 'Cheap: the price is below the value'], ['dear', 'Expensive: the price is above the value']] } }),
    pe1: (t) => ({ title: 'Value from a similar chain', place: 'Ilse wants a second value that does not depend on a growth forecast.',
      body: `<p>Copperline earned <b>${m(t.E)}</b> a share last year. Tidewell Tacos, a similar chain, sells for <b>${mm(t.peerPrice)}</b> and earned <b>${mm(t.peerEps)}</b> a share. What does Tidewell’s P/E say Copperline is worth? The P/E is done for you.</p>` }),
    pe2: (t) => ({ title: 'Your own P/E', place: 'Ilse hands you a second company to price.',
      body: `<p>Basswood Subs earned <b>${m(t.E)}</b> a share last year. Halyard Chicken, a similar chain, sells for <b>${mm(t.peerPrice)}</b> and earned <b>${mm(t.peerEps)}</b> a share. What does Halyard’s P/E say Basswood is worth?</p>` }),
    ig1: (t) => ({ title: 'Run the model backward', place: 'Now start from the price instead.',
      body: `<p>Halyard Chicken’s shares sell for <b>${m0(t.P)}</b>, and it will pay <b>${m(t.D1)}</b> a share next year. Owners require <b>${pc(t.r)}</b>. What growth forever does the price assume? The dividend yield is done for you.</p>` }),
    ig2: (t) => ({ title: 'Faster or slower than Ilse?', place: 'Back to Copperline.',
      body: `<p>Copperline’s shares sell for <b>${m0(t.P)}</b>, and it will pay <b>${m(t.D1)}</b> next year. Owners require <b>${pc(t.r)}</b>, and Ilse forecast <b>${pc(t.g)}</b> growth. What growth does the price assume?</p>`,
      choice: { legend: `Does today’s price assume faster or slower growth than Ilse’s ${pc(t.g)}?`, options: [['faster', `Faster than ${pc(t.g)}`], ['slower', `Slower than ${pc(t.g)}`]] } }),
  };

  function taskView(t, L, h) {
    const P = PROBLEM[t.id](t), E = EXAMPLES()[t.id];
    const example = h.ladder(E.lines, { filled: true, caption: E.cap }) + (E.after ? `<p>${E.after}</p>` : '');
    const table = h.ladder(linesFor(t), { rows: L.rows, caption: 'Your turn' })
      + (linesFor(t).some((l) => l.input && l.fmt === 'pct') ? '<p class="small">Type a percentage like 4.5%.</p>' : '');
    const parts = [{ html: '', field: 'table' }];
    if (P.choice) parts.push({ html: '', field: 'choice' });
    return { title: P.title, place: P.place, body: P.body, example, table, parts, choice: P.choice,
      helpLabels: ['Show me the first blank', 'Show me every line'] };
  }

  // Common slips, per line, phrased with the student's own numbers.
  function diagFor(t, line) {
    const D = [];
    if (t.id === 'perp') D.push([t.D, 'payment', `That is one year’s payment. Divide it by ${dec(t.r)}.`], [t.D * t.r, 'times', `That multiplies. Divide the payment by the required return: ${m(t.D)} ÷ ${dec(t.r)}.`],
      [t.D / (t.r * 100), 'whole', `Divide by ${dec(t.r)}, not by ${Math.round(t.r * 100)}.`]);
    if (line.label === 'r − g') D.push([t.r + t.g, 'plus', 'Subtract growth from the required return, don’t add it.'], [t.g - t.r, 'flip', 'Take the required return minus growth, so the answer is positive.']);
    if (/^cg/.test(t.id) && line.label === 'Value per share') { const rg = t.r - t.g;
      D.push([t.D1 / t.r, 'nog', `That treats the dividend as if it never grows. Divide by r − g, ${dec(rg)}, instead of ${dec(t.r)}.`], [t.D1 / (t.r + t.g), 'plus', 'Divide by r − g, not r + g.'],
        [t.D1 / (rg * 100), 'whole', `Divide by ${dec(rg)}, not by ${Math.round(rg * 100)}.`], [t.D1 * rg, 'times', `That multiplies. Divide: ${m(t.D1)} ÷ ${dec(rg)}.`]); }
    if (line.label === 'Similar chain’s P/E') D.push([t.peerEps / t.peerPrice, 'flip', `Divide the price by the earnings: ${mm(t.peerPrice)} ÷ ${mm(t.peerEps)}.`]);
    if (/^pe/.test(t.id) && line.label === 'Value per share') D.push([t.E / t.pe, 'div', `Multiply the earnings per share by the P/E, ${mm(t.E)} × ${t.pe}.`],
      [t.peerPrice, 'peer', 'That is the similar chain’s price. Use its P/E with this company’s own earnings.']);
    if (line.label === 'Dividend yield') D.push([t.P / t.D1 / 100, 'flip', `Divide the dividend by the price: ${m(t.D1)} ÷ ${mm(t.P)}.`]);
    if (line.label === 'Implied growth') D.push([t.r + t.y, 'plus', 'Subtract the dividend yield from the required return, don’t add it.'], [t.y, 'yield', 'That is the dividend yield. Implied growth = r − dividend yield.'],
      [t.r - t.y / 100, 'units', `Put both in the same units: ${pc(t.r)} − ${p2(t.y)}.`], [t.y - t.r, 'flip', 'Take the required return minus the yield.']);
    return D;
  }

  const plain = (s) => String(s).replace(/<[^>]+>/g, '');
  function judgeTask(t, e, h) {
    const lines = linesFor(t), rows = e.rows || [], rowRes = [];
    lines.forEach((l, i) => {
      if (!l.input) return;
      const opts = l.fmt === 'pct' ? { tol: 0.0006, scale: Math.abs(l.value), unreadable: 'Type a percentage, like 4.5%.', closeMsg: 'Close. Keep two decimal places in the percentage.', otherMsg: `${plain(l.calc)}.` }
        : l.fmt === 'num' ? { tol: 0.06, scale: l.value, unreadable: 'Type the P/E as a number, like 18.', otherMsg: `${plain(l.calc)}.` }
          : { tol: Math.max(0.02, 0.003 * Math.abs(l.value)), scale: Math.abs(l.value), otherMsg: `${plain(l.calc)}.` };
      const v = l.fmt === 'pct' ? pctIn(h, rows[i]) : h.parseMoney(rows[i]);
      rowRes[i] = h.judgeNumber(v, l.value, diagFor(t, l), opts);
    });
    const bad = rowRes.findIndex((x) => x && !x.ok);
    if (bad >= 0) return { ok: false, rowRes, msg: `${plain(lines[bad].label)}: ${rowRes[bad].msg}` };
    if (t.decision && e.choice !== t.decision) {
      if (!e.choice) return { ok: false, rowRes, msg: 'Now answer the question under the table.' };
      return { ok: false, rowRes, msg: t.id === 'cg2' ? `Compare the price, ${m0(t.P)}, with your value, ${m(t.answer)}. Which is bigger?`
        : `Compare your implied growth, ${p2(t.answer)}, with Ilse’s ${pc(t.g)}. Which is bigger?` };
    }
    return { ok: true, rowRes };
  }

  const showVal = (l) => (l.fmt === 'pct' ? p2(l.value) : l.fmt === 'num' ? String(l.value) : l.fmt === 'text' ? l.value : m(l.value));
  function helpText(t, lvl) {
    const lines = linesFor(t), blanks = lines.filter((l) => l.input);
    const say = (l) => `${l.label}: ${l.calc} = ${showVal(l)}`;
    return lvl === 1 ? say(blanks[0]) : lines.map(say).join('<br>');
  }
  function praise(t) {
    if (t.id === 'perp') return `${m(t.answer)} invested at ${pc(t.r)} earns ${m(t.D)} a year, forever. That is why the share is worth ${m(t.answer)}.`;
    if (t.id === 'cg1') return `With ${pc(t.g)} growth, Copperline is worth ${m(t.answer)} a share, far more than a dividend that never grows.`;
    if (t.id === 'cg2') return `Ferro is worth about ${m(t.answer)} on these assumptions, so at ${m0(t.P)} its shares look ${t.decision === 'cheap' ? 'cheap' : 'expensive'}.`;
    if (t.id === 'pe1') return `Investors pay ${t.pe} times earnings for Tidewell. At the same multiple, Copperline is worth ${m(t.answer)} a share.`;
    if (t.id === 'pe2') return `At Halyard’s P/E of ${t.pe}, Basswood is worth ${m(t.answer)} a share.`;
    if (t.id === 'ig1') return `At ${m0(t.P)}, investors expect Halyard’s dividend to grow about ${pc(t.answer)} a year forever.`;
    if (t.id === 'ig2') return `The price assumes about ${p2(t.answer)} growth, ${t.decision} than Ilse’s ${pc(t.g)}. ${t.decision === 'faster' ? 'If Ilse is right, the shares look expensive.' : 'If Ilse is right, the shares look cheap.'}`;
  }
  function selfAnswer(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = l.fmt === 'pct' ? p2(l.value) : String(Math.round(l.value * 100) / 100); });
    return { rows, choice: t.decision || null };
  }
  function selfWrong(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = l.fmt === 'pct' ? p2(l.value * 1.3) : String(Math.round(l.value * 1.3 * 100) / 100); });
    return { rows, choice: t.decision || null };
  }

  root.DESK = {
    app: 'finan4-u9-valuation-desk', version: 3, seedVersion: 3, salt: 'rize-finan4-u9-valuation:4c81d3', points: 20,
    storageKey: 'rize-finan4-u9-valuation-v3', filePrefix: 'ValuationDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-valuation-desk/verify.html',
    calcPlaceholder: '2/(0.10-0.04)',
    calcHint: 'Use / to divide and parentheses to group: 2/(0.10-0.04) is a $2.00 dividend growing 4% a year at a 10% required return.',
    story: { title: 'The Valuation Desk', kicker: 'Corporate Finance, Unit 9', company: 'Bramble Street Research', team: 'Restaurant Research Team',
      from: 'Ilse Ostrander', fromTitle: 'senior analyst, Bramble Street Research',
      dek: 'You have joined Bramble Street Research, which writes reports on restaurant stocks. Ilse Ostrander, a senior analyst, is valuing Copperline Burgers, a chain that raises its dividend every year.',
      whatBox: '',
      stepsLine: 'Ten short steps. Each shows a worked example in the same table you fill in, then you do the same calculation with your own numbers.' },
    steps: STEPS, quiz: QUIZ, walk: null, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the report', label: 'Your note to Ilse', minWords: 30, receiptHeading: 'Note to the senior analyst',
      prompt: 'Give Ilse your two values for Copperline, from its dividends and from Tidewell’s P/E, and the growth today’s price assumes. Which number would you trust most, and why?' },
  };
})(typeof window !== 'undefined' ? window : globalThis);

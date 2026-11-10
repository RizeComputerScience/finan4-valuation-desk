/* The Valuation Desk: FINAN IV Unit 9 (stocks: the constant-growth model, P/E comps with one outlier, the growth a price implies). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py --course "FINAN IV"): Bramble Street Research, Bramble Street, Ilse Ostrander, Ilse, Ostrander, Copperline Burgers,
   Copperline, Tidewell Tacos, Ferro Pizza, Halyard Chicken, Basswood Subs, Orchard Lane Bakery, Redfern Noodle Bar, all clean.
   Rework 2026-11-06 (Samuel's 11/05 desk rules, design/course-principles.md): a worked example on every task (the outlier step shows a
   different kind of outlier from the student's own), `parts` on the three two-question steps, round seeds (whole-dollar dividends,
   whole-percent r and g, whole-number P/Es, whole-dollar prices whose implied growth sits on a half-percent grid), tolerance sentences
   removed, wrong-answer feedback in the student's own numbers. Every step has a right answer and the desk is fictional, so it uses
   neither `autosave` nor `sources`. seedVersion and version moved to 2, so saved progress and receipts from v1 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick win: what a share is worth',
      q: 'Ilse says a share of Copperline is worth what it will pay its owners. Which of these is closest to what she means?',
      options: ['The value today of all the dividends the share will pay, now and in the future', 'The company’s book value (assets minus liabilities) divided by its shares', 'Last year’s earnings per share', 'The price the owner paid for the share'],
      answer: 0,
      why: ['Right. An owner collects dividends, and a buyer later pays for the dividends still to come. So a share is worth the value today of the cash it pays its owners.',
        'Book value records what the company paid for its assets in the past. Investors pay for the cash the company will pay out in the future, which is why most prices sit far above book value.',
        'Earnings are what the company made last year. Owners are paid from future cash, and some of each year’s earnings stays in the business.',
        'What someone paid is history. The share is worth what it will pay from now on, whatever it cost.'] },
    { title: 'Quick win: the guardrail',
      q: 'Halyard Chicken raised its dividend 12% last year. A colleague plugs that 12% into the constant-growth model as growth forever, with a 9% required return, and the formula gives a negative value. What went wrong?',
      options: ['Growth forever has to stay below the required return, so 12% cannot be the long-run rate', 'The dividend is too small for the model', 'The required return should be lower than the growth rate', 'Nothing; the stock is worth less than zero'],
      answer: 0,
      why: ['Right. The model assumes the dividend grows at the same rate forever. No business can outgrow its owners’ required return forever, so use a modest long-run rate well below it.',
        'The size of the dividend does not matter. The problem is that growth is above the required return, which makes r − g negative.',
        'Lowering the required return below growth makes the problem worse. Growth forever must stay below the required return.',
        'A share cannot be worth less than zero, because its owners are never forced to pay in. The formula breaks when growth is at or above the required return.'] },
    { title: 'Quick win: median or average?',
      q: 'Five of Ilse’s six comparable chains have P/Es between 14 and 24. One has a P/E far from the rest. Why does Ilse use the median P/E of the five, rather than the average of all six?',
      options: ['One extreme P/E can pull an average far off, but it barely moves a median', 'The median is always higher than the average', 'Averages only work for prices, not for ratios', 'The median includes the outlier, and the average leaves it out'],
      answer: 0,
      why: ['Right. The median is the middle value, so one extreme number cannot drag it far. Ilse also leaves the outlier out, because its P/E reflects something the others do not share.',
        'The median can be higher or lower than the average. What matters is that one extreme value hardly moves it.',
        'You can average ratios. The problem is that one extreme value pulls the average toward itself.',
        'Ilse leaves the outlier out of the median. She uses the five chains that look like Copperline.'] },
    { title: 'Exam-style question',
      q: 'A restaurant stock trades at $50.00. Next year’s dividend is $2.00, and its owners require a 9% return. What yearly growth in dividends, forever, does today’s price imply?',
      options: ['5%', '4%', '13%', '8.96%'],
      answer: 0,
      why: ['Right. The dividend yield is $2.00 ÷ $50.00 = 4%, and growth = required return − dividend yield = 9% − 4% = 5%. Questions on the exams look like this one.',
        '4% is the dividend yield, $2.00 ÷ $50.00. Subtract it from the 9% required return to get the growth.',
        '13% adds the yield to the required return. Owners earn the yield plus the growth, so growth = 9% − 4%.',
        '8.96% subtracts 0.04 from 9. Put both in the same units first: 9% − 4% = 5%.'] },
  ];

  const STEPS = [
    { id: 'walk', label: 'Worked example', kind: 'walk' },
    { id: 'q1', label: 'Check 1', kind: 'check', quiz: 0 },
    { id: 't1', label: 'Dividend value', kind: 'task' },
    { id: 't2', label: 'Growth range', kind: 'task' },
    { id: 'q2', label: 'Check 2', kind: 'check', quiz: 1 },
    { id: 't3', label: 'Comps table', kind: 'task' },
    { id: 't4', label: 'The outlier', kind: 'task' },
    { id: 'q3', label: 'Check 3', kind: 'check', quiz: 2 },
    { id: 't5', label: 'Value from comps', kind: 'task' },
    { id: 't6', label: 'Implied growth', kind: 'task' },
    { id: 'q4', label: 'Exam-style question', kind: 'check', quiz: 3 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];
  const NAMES = ['Tidewell Tacos', 'Ferro Pizza', 'Halyard Chicken', 'Basswood Subs', 'Orchard Lane Bakery', 'Redfern Noodle Bar'];
  const WHY = { fast: 'Investors expect its earnings to grow much faster than its peers’ earnings',
    shrink: 'Investors expect its earnings to shrink',
    oneoff: 'Last year’s earnings were cut by a one-time charge, so its P/E looks higher than its business deserves',
    mistake: 'The market has made a mistake, so it is a bargain to buy or a stock to sell' };
  // [required return, growth forever]: whole percents with r − g at least 4 points. Growth stays 3% to 5%, so one point lower is still at least 2%.
  const RG = [[0.08, 0.03], [0.08, 0.04], [0.09, 0.03], [0.09, 0.04], [0.09, 0.05], [0.10, 0.03], [0.10, 0.04], [0.10, 0.05]];
  const r2 = (x) => Math.round(x * 100) / 100;
  const r1 = (x) => Math.round(x * 10) / 10;
  const dec = (x) => String(+x.toFixed(4));   // 0.05, not 0.050000000000000003
  // A percent typed as 4.2%, 4.2 or 0.042 all mean 4.2%. Every percent answer in this desk is at least 1%.
  const pctIn = (h, s) => { const v = h.parseMoney(s); if (!isFinite(v)) return v; return (!/%/.test(String(s)) && Math.abs(v) >= 1) ? v / 100 : v; };
  const median = (a) => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

  function buildTasks(rng, h) {
    const T = [];
    // Copperline Burgers: a steady payer. Round seeds (v2): a whole-dollar dividend, whole-percent r and g, so r − g is a whole percent.
    const [r, g] = h.pick(rng, RG);
    const D0 = h.pick(rng, [3, 4, 5]);
    const D1 = r2(D0 * (1 + g)); const V = D1 / (r - g);
    const base = { r, g, D0, D1, V };
    T.push(Object.assign({ id: 't1', answer: V }, base));
    // Today's price, placed against the low-growth and high-growth values. The growth it implies sits on a half-percent grid,
    // and the price is that dividend ÷ yield rounded to the whole dollar, so the yield and the implied growth come out nearly round.
    const glo = g - 0.01, ghi = g + 0.01, Vlo = D1 / (r - glo), Vhi = D1 / (r - ghi);
    const half = (a, b) => { const out = []; for (let k = Math.round(a * 200); k <= Math.round(b * 200) + 1e-9; k++) out.push(k / 200); return out; };
    const zone = h.pick(rng, ['cheap', 'depends', 'dear']);
    const giGrid = h.pick(rng, zone === 'cheap' ? half(0.015, glo - 0.005) : zone === 'dear' ? half(ghi + 0.005, r - 0.015) : [g - 0.005, g + 0.005]);
    const P = Math.round(D1 / (r - giGrid)); const gi = r - D1 / P;
    T.push(Object.assign({ id: 't2', glo, ghi, Vlo, Vhi, P, zone, decision: zone }, base));
    // the comps: five peers and one outlier, every P/E a whole number and every earnings per share a round amount
    let pes, peers, med5, ok = false, outIdx, kind, rows;
    for (let tries = 0; tries < 400 && !ok; tries++) {
      pes = []; while (pes.length < 5) { const x = h.between(rng, 14, 24, 1); if (!pes.includes(x)) pes.push(x); }
      outIdx = Math.floor(rng() * 6); kind = h.pick(rng, ['fast', 'shrink', 'oneoff']);
      const outPE = kind === 'fast' ? h.between(rng, 42, 58, 1) : kind === 'shrink' ? h.pick(rng, [5, 6, 7]) : h.between(rng, 45, 65, 1);
      rows = []; let k = 0;
      for (let i = 0; i < 6; i++) {
        const pe = i === outIdx ? outPE : pes[k++]; const eps = h.pick(rng, [1.5, 2, 2.5, 3, 4, 5]); const price = r2(pe * eps);
        const grow = i === outIdx ? (kind === 'fast' ? h.between(rng, 22, 30, 1) : kind === 'shrink' ? -h.between(rng, 4, 8, 1) : h.between(rng, 3, 6, 1)) : h.between(rng, 2, 7, 1);
        rows.push({ name: NAMES[i], eps, price, pe, grow }); }
      peers = rows.filter((_, i) => i !== outIdx).map((x) => x.pe); med5 = median(peers);
      const all6 = rows.map((x) => x.pe);
      ok = Math.abs(mean(peers) - med5) > 0.3 && Math.abs(median(all6) - med5) > 0.3 && Math.abs(mean(all6) - med5) > 0.3; }
    const blanks = []; while (blanks.length < 2) { const i = Math.floor(rng() * 6); if (!blanks.includes(i)) blanks.push(i); } blanks.sort();
    const out = rows[outIdx];
    const facts = { fast: { opened: h.between(rng, 40, 70, 1) }, shrink: { cut: h.pick(rng, [30, 40, 50]), closing: h.between(rng, 40, 90, 5) },
      oneoff: { epsAdj: r2(out.price / (med5 + h.pick(rng, [-1, 0, 1]))) } };
    const comps = { rows, outIdx, kind, blanks, med5, facts: facts[kind] };
    T.push(Object.assign({ id: 't3', comps, decision: String(outIdx) }, base));
    T.push(Object.assign({ id: 't4', comps, decision: kind }, base));
    // Copperline's own earnings: a multiple of 50 cents that pays out between half and three quarters as dividends
    const EPS = h.pick(rng, [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].filter((x) => D0 / x >= 0.5 - 1e-9 && D0 / x <= 0.75 + 1e-9));
    T.push(Object.assign({ id: 't5', comps, EPS, Vc: med5 * EPS, answer: med5 * EPS }, base));
    // the growth today's price implies
    const y = D1 / P;
    T.push(Object.assign({ id: 't6', P, y, gi, answer: gi, decision: gi > g ? 'faster' : 'slower' }, base));
    return T;
  }

  const m = (x) => root.DeskEngine.h.money(x, 2);
  const m0 = (x) => root.DeskEngine.h.money(x);
  const mm = (x) => (Number.isInteger(x) ? m0(x) : m(x));   // $42 and $10.50: the comps table stays narrow on a phone
  const pc = (x) => (Math.round(x * 1000) / 10) + '%';
  const p2 = (x) => (x * 100).toFixed(2) + '%';
  const cell = (L, y, label) => `<label class="sr-only" for="r${y}">${label}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off" value="${(L.rows || [])[y] ? String(L.rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span>`;
  const kv = (cap, rows) => `<div class="tw"><table class="cf"><caption>${cap}</caption><tbody>${rows.map((x) => `<tr><td class="lbl">${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></div>`;
  const pctHelp = 'Type a percentage like 4.25%.';
  const formula = (a, b) => `<div class="formula"><span>${a} =<br>${b}</span></div>`;
  // The outlier step's worked example shows a kind of outlier other than the student's own, so it teaches the reading without giving the answer away.
  const OUT_EX = {
    fast: `<p>A shoe chain trades at 45 times earnings. Its peers sit near 15.</p>
      <p>Its annual report: it opened 90 stores last year, and sales grew 35%.</p>
      <p>Investors pay more for each dollar of earnings they expect to grow fast, so the high P/E comes from fast growth.</p>`,
    shrink: `<p>A bookstore chain trades at 5 times earnings. Its peers sit near 15.</p>
      <p>Its annual report: sales fell 8%, it will close 40 stores, and it cut its dividend in half.</p>
      <p>Investors expect its earnings to shrink, so they pay less for each dollar of them.</p>`,
    oneoff: `<p>A shoe chain trades at 45 times earnings. Its peers sit near 15.</p>
      <p>Its annual report: a one-time charge cut last year’s earnings per share to $1.00, from a normal $3.00.</p>
      <p>On normal earnings, its P/E is $45.00 ÷ $3.00 = 15, the same as its peers. One bad year made the P/E look high.</p>` };
  const otherKind = (k) => ({ fast: 'oneoff', shrink: 'fast', oneoff: 'shrink' })[k];
  const compsTable = (t, L, opts) => {
    const c = t.comps; const full = !!opts.fill;   // the fill-in table shows price and EPS; the later tables show sales growth and P/E
    const head = full ? ['Chain', 'Share price', 'Earnings per share', 'P/E'] : ['Chain', 'Sales growth last year', 'P/E'];
    const body = c.rows.map((x, i) => {
      const blank = full && c.blanks.includes(i);
      const pe = blank ? cell(L, c.blanks.indexOf(i) + 1, 'P/E of ' + x.name) : x.pe;
      const mid = full ? `<td>${mm(x.price)}</td><td>${mm(x.eps)}</td>` : `<td>${x.grow > 0 ? '+' : x.grow < 0 ? '−' : ''}${Math.abs(x.grow)}%</td>`;
      return `<tr${opts.mark === i ? ' class="hl"' : ''}><td class="lbl">${x.name}</td>${mid}<td>${pe}</td></tr>`; }).join('');
    return `<div class="tw"><table class="cf"><caption>${opts.caption}</caption><thead><tr>${head.map((x, j) => `<th scope="col"${j === 0 ? ' style="text-align:left"' : ''}>${x}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
  };
  const outFacts = (t) => {
    const c = t.comps, o = c.rows[c.outIdx], f = c.facts;
    if (c.kind === 'fast') return `${o.name} opened ${f.opened} restaurants last year, and its sales grew ${o.grow}%. It plans to keep opening restaurants at about that pace for several years.`;
    if (c.kind === 'shrink') return `Sales at ${o.name}’s restaurants that were open a full year fell ${Math.abs(o.grow)}% last year. It cut its quarterly dividend by ${f.cut}% and plans to close ${f.closing} restaurants.`;
    return `${o.name} closed its delivery business last year and took a one-time charge for it. Without the charge, its earnings per share would have been ${m(f.epsAdj)} instead of ${m(o.eps)}. Its sales grew ${o.grow}%, in line with the other chains.`;
  };

  function taskView(t, L, h) {
    if (t.id === 't1') return { title: 'Value a steady payer', place: 'Copperline Burgers has paid a dividend every year for decades and raised it every year.',
      body: `<p>Ilse’s forecast is that Copperline’s dividend keeps growing at a steady rate forever. That makes the dividends a perpetuity that grows (Unit 4), so the value of one share is</p>
        ${formula('value per share', 'next year’s dividend ÷ (r − g)')}
        ${kv('Copperline Burgers', [['This year’s dividend per share', m(t.D0)], ['Growth in the dividend each year, forever (g)', pc(t.g)], ['Return Copperline’s owners require (r)', pc(t.r)]])}`,
      example: `<p>A dividend of $1.00 this year, growing 6% a year, with owners who require 10%:</p>
        <p>Next year’s dividend = $1.00 × 1.06 = $1.06.</p>
        <p>r − g = 10% − 6% = 4%.</p>
        <p>Value per share = $1.06 ÷ 0.04 = $26.50.</p>`,
      table: `<div class="tw"><table class="cf"><caption>Copperline’s value from its dividends</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Next year’s dividend per share (this year’s dividend × (1 + g))</td><td>${cell(L, 1, 'Next year’s dividend per share')}</td></tr>
        <tr><td class="lbl">r − g, as a percentage</td><td>${cell(L, 2, 'r minus g as a percentage')}</td></tr>
        <tr class="total hl"><td class="lbl"><b>Value per share</b> (next year’s dividend ÷ (r − g))</td><td>${cell(L, 3, 'Value per share')}</td></tr></tbody></table></div>
        <p class="small">Type dollars to the cent, and r − g as a percentage like 5%.</p>`,
      helpLabels: ['Show me next year’s dividend', 'Show me every row'] };
    if (t.id === 't2') return { title: 'How much does growth matter?', place: 'A client asks Ilse how sure she is about the growth rate.',
      body: `<p>Ilse is sure of next year’s dividend, <b>${m(t.D1)}</b>, and of the <b>${pc(t.r)}</b> required return. She is less sure about growth.</p>`,
      example: `<p>Next year’s dividend $1.00, required return 10%.</p>
        <p>At 5% growth: $1.00 ÷ (0.10 − 0.05) = $1.00 ÷ 0.05 = $20.00.</p>
        <p>At 7% growth: $1.00 ÷ (0.10 − 0.07) = $1.00 ÷ 0.03 = $33.33.</p>
        <p>A price of $25.00 sits between the two values.</p>`,
      parts: [
        { html: `${formula('value per share', `${m(t.D1)} ÷ (${pc(t.r)} − growth)`)}<p>1. Work out the value per share if growth is one point lower than Ilse’s ${pc(t.g)}, at <b>${pc(t.glo)}</b>, and one point higher, at <b>${pc(t.ghi)}</b>.</p>`, field: 'table' },
        { html: `<p>Copperline’s shares trade today at <b>${m0(t.P)}</b>.</p>`, field: 'choice' }],
      table: `<div class="tw"><table class="cf"><caption>Copperline’s value at two growth rates</caption><thead><tr><th scope="col" style="text-align:left">Growth forever</th><th scope="col">Value per share</th></tr></thead><tbody>
        <tr><td class="lbl">${pc(t.glo)} (lower)</td><td>${cell(L, 1, 'Value per share at the lower growth rate')}</td></tr>
        <tr><td class="lbl">${pc(t.ghi)} (higher)</td><td>${cell(L, 2, 'Value per share at the higher growth rate')}</td></tr></tbody></table></div>`,
      choice: { legend: `2. At today’s price of ${m0(t.P)}, Copperline’s shares are`, options: [['cheap', 'Cheap at either growth rate (the price is below both values)'], ['depends', 'Cheap only if the higher growth rate is right (the price is between the two values)'], ['dear', 'Expensive at either growth rate (the price is above both values)']] },
      helpLabels: ['Show me the lower value', 'Show me both values'] };
    if (t.id === 't3') return { title: 'Build the comps table', place: 'Ilse prices Copperline against six restaurant chains whose shares also trade on the stock market.',
      body: `<p>Comparable companies, or <b>comps</b>, are similar businesses whose share prices you can see. The <b>P/E ratio</b> is what investors pay today for each dollar the company earned last year:</p>
        ${formula('P/E', 'share price ÷ earnings per share')}`,
      example: `<p>A chain’s shares trade at $36.00, and it earned $3.00 a share last year.</p>
        <p>P/E = $36.00 ÷ $3.00 = 12.</p>
        <p>Among P/Es of 12, 13, 15, 16 and 40, the outlier is 40: the others sit close together.</p>`,
      parts: [
        { html: '<p>1. Fill in the two missing P/Es.</p>', field: 'table' },
        { html: '', field: 'choice' }],
      table: compsTable(t, L, { fill: true, caption: 'Six restaurant chains' }),
      choice: { legend: '2. Which chain is the <b>outlier</b>, with a P/E far from the others?', options: NAMES.map((x, i) => [String(i), x]) },
      helpLabels: ['Show me the first P/E', 'Show me both P/Es'] };
    if (t.id === 't4') { const o = t.comps.rows[t.comps.outIdx];
      return { title: 'Explain the outlier', place: `${o.name}’s P/E of ${o.pe} sits far from the others. Before using the table, Ilse wants to know why.`,
        body: `${compsTable(t, L, { fill: false, mark: t.comps.outIdx, caption: 'The six chains, with the outlier highlighted' })}
          <p class="place" style="font-style:normal"><b>From ${o.name}’s annual report:</b> ${outFacts(t)}</p>`, noCalc: true,
        example: OUT_EX[otherKind(t.comps.kind)],
        choice: { legend: `What best explains ${o.name}’s P/E?`, options: ['fast', 'shrink', 'oneoff', 'mistake'].map((k) => [k, WHY[k]]) },
        helpLabels: ['Give me a hint', 'Show me the answer'] }; }
    if (t.id === 't5') return { title: 'Value Copperline from the comps', place: 'Ilse wants a second value for Copperline that does not depend on a growth forecast.',
      body: `<p>Leave out the outlier. Find the <b>median</b> P/E of the other five chains: put the five P/Es in order and take the middle one. Then multiply it by Copperline’s earnings per share of <b>${m(t.EPS)}</b>.</p>
        ${compsTable(t, L, { fill: false, mark: t.comps.outIdx, caption: 'The six chains (the outlier is highlighted)' })}`,
      example: `<p>Five P/Es: 12, 20, 14, 17 and 13.</p>
        <p>In order: 12, 13, <b>14</b>, 17, 20. The median is the middle one, 14.</p>
        <p>With earnings per share of $2.50: value per share = 14 × $2.50 = $35.00.</p>`,
      table: `<div class="tw"><table class="cf"><caption>Copperline’s value from the comps</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Median P/E of the five chains, leaving out the outlier</td><td>${cell(L, 1, 'Median P/E of the five chains')}</td></tr>
        <tr class="total hl"><td class="lbl"><b>Value per share</b> (median P/E × ${m(t.EPS)})</td><td>${cell(L, 2, 'Value per share from the comps')}</td></tr></tbody></table></div>
        <p class="small">Type the value to the cent.</p>`,
      helpLabels: ['Show me the median', 'Show me both rows'] };
    if (t.id === 't6') return { title: 'The growth today’s price implies', place: 'Ilse turns the model around: if the price is right, what growth is the market expecting?',
      body: `<p>Owners of a share earn the <b>dividend yield</b> (next year’s dividend ÷ price) plus the growth in the dividend. So if today’s price is right,</p>
        ${formula('implied growth', 'r − dividend yield')}
        ${kv('Copperline Burgers today', [['Share price today', m0(t.P)], ['Next year’s dividend per share', m(t.D1)], ['Return owners require (r)', pc(t.r)], ['Ilse’s growth forecast', pc(t.g)]])}`,
      example: `<p>A share at $40.00, next year’s dividend $1.20, owners who require 10%:</p>
        <p>Dividend yield = $1.20 ÷ $40.00 = 3%.</p>
        <p>Implied growth = 10% − 3% = 7%.</p>`,
      parts: [
        { html: '<p>1. Fill in both rows.</p>', field: 'table' },
        { html: '', field: 'choice' }],
      table: `<div class="tw"><table class="cf"><caption>The growth in today’s price</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Percent</th></tr></thead><tbody>
        <tr><td class="lbl">Dividend yield (next year’s dividend ÷ price)</td><td>${cell(L, 1, 'Dividend yield')}</td></tr>
        <tr class="total hl"><td class="lbl"><b>Implied growth</b> (r − dividend yield)</td><td>${cell(L, 2, 'Implied growth')}</td></tr></tbody></table></div>
        <p class="small">${pctHelp}</p>`,
      choice: { legend: `2. Does today’s price assume the dividend grows faster or slower than Ilse’s forecast of ${pc(t.g)}?`, options: [['faster', `Faster than ${pc(t.g)}`], ['slower', `Slower than ${pc(t.g)}`]] },
      helpLabels: ['Show me the dividend yield', 'Show me both rows'] };
  }

  function judgeTask(t, e, h) {
    const pmTol = (x) => ({ tol: Math.max(0.01, 0.005 * Math.abs(x)), scale: Math.abs(x) });
    if (t.id === 't1') {
      const rows = e.rows || []; const rr = []; const rg = t.r - t.g;
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.D1, [[t.D0, 'd0', `That is this year’s dividend. Grow it one year: ${m(t.D0)} × (1 + ${t.g}).`], [t.D0 * t.g, 'gonly', `That is only the increase. Next year’s dividend = ${m(t.D0)} × (1 + ${t.g}).`]],
        { tol: 0.006, otherMsg: `${m(t.D0)} × (1 + ${t.g}), rounded to the cent.` });
      rr[2] = h.judgeNumber(pctIn(h, rows[2]), rg, [[t.r + t.g, 'plus', 'Subtract growth from the required return, don’t add it.'], [t.g - t.r, 'flip', 'Take the required return minus growth, so the answer is positive.']],
        { tol: 0.0002, unreadable: 'Type a percent, like 5%.', otherMsg: `${pc(t.r)} − ${pc(t.g)}.` });
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.V, [[t.D0 / rg, 'd0', `Use next year’s dividend, ${m(t.D1)}, not this year’s.`], [t.D1 / (t.r + t.g), 'plus', 'Divide by r − g, not r + g.'],
        [t.D1 / t.r, 'nog', 'That treats the dividend as if it never grows. Divide by r − g instead of r.'], [t.D1 / (rg * 100), 'whole', `Type r − g as a decimal in the division: ${m(t.D1)} ÷ ${dec(rg)}, not ÷ ${r1(rg * 100)}.`]],
        Object.assign(pmTol(t.V), { otherMsg: `Next year’s dividend ÷ (r − g) = ${m(t.D1)} ÷ ${dec(rg)}.` }));
      const bad = [1, 2, 3].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Next year’s dividend', 'r − g', 'Value per share'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't2') {
      const rows = e.rows || []; const rr = [];
      const one = (y, gg, want) => h.judgeNumber(h.parseMoney(rows[y]), want, [[t.V, 'base', `That is the value at Ilse’s base growth of ${pc(t.g)}. Use ${pc(gg)}.`],
        [t.D0 * (1 + gg) / (t.r - gg), 'd1moved', `Keep next year’s dividend at ${m(t.D1)} and change only the growth rate.`], [t.D1 / (t.r + gg), 'plus', 'Divide by r − g, not r + g.'],
        [want === t.Vlo ? t.Vhi : t.Vlo, 'swap', `That is the value at the other growth rate. This row uses ${pc(gg)}: ${m(t.D1)} ÷ (${pc(t.r)} − ${pc(gg)}).`]],
        Object.assign(pmTol(want), { otherMsg: `${m(t.D1)} ÷ (${pc(t.r)} − ${pc(gg)}).` }));
      rr[1] = one(1, t.glo, t.Vlo); rr[2] = one(2, t.ghi, t.Vhi);
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Lower growth' : 'Higher growth'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Compare the price with your two values as well.' : `Line up the three numbers: ${m(t.Vlo)}, ${m0(t.P)} and ${m(t.Vhi)}. Is the price below both values, between them or above both?` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't3') {
      const c = t.comps, rows = e.rows || []; const rr = [];
      c.blanks.forEach((i, k) => { const x = c.rows[i];
        rr[k + 1] = h.judgeNumber(h.parseMoney(rows[k + 1]), x.price / x.eps, [[x.eps / x.price, 'flip', `Divide the price by the earnings per share: ${mm(x.price)} ÷ ${mm(x.eps)}.`]],
          { tol: 0.06, unreadable: 'Type the P/E as a number, like 18.', otherMsg: `${mm(x.price)} ÷ ${mm(x.eps)}.` }); });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${c.rows[c.blanks[bad - 1]].name}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Pick the outlier as well.' : `${c.rows[Number(e.choice)] ? c.rows[Number(e.choice)].name + '’s P/E of ' + c.rows[Number(e.choice)].pe + ' sits among the others. ' : ''}Look down the P/E column for the one far above or far below the rest.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') {
      if (e.choice === t.decision) return { ok: true };
      if (!e.choice) return { ok: false, code: 'none', msg: 'Pick the explanation that fits the facts.' };
      if (e.choice === 'mistake') return { ok: false, code: 'mistake', msg: 'Thousands of investors see the same annual report. Before calling a price a mistake, look for a reason in the facts.' };
      const msg = { fast: 'A P/E this far from the rest needs a reason in the facts. Fast growth would show up as many new restaurants and sales growing much faster than the other chains’.',
        shrink: 'Shrinking earnings would show up as falling sales, closures or a dividend cut. Read the annual report line again.',
        oneoff: 'A one-time charge would show up as earnings that were unusually low last year for a reason that will not repeat. Read the annual report line again.' };
      return { ok: false, code: 'why', msg: msg[e.choice] };
    }
    if (t.id === 't5') {
      const c = t.comps, rows = e.rows || []; const rr = []; const peers = c.rows.filter((_, i) => i !== c.outIdx).map((x) => x.pe), all6 = c.rows.map((x) => x.pe);
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), c.med5, [[median(all6), 'with', `That median, ${median(all6)}, includes the outlier’s ${c.rows[c.outIdx].pe}. Leave it out and take the middle of the other five.`],
        [mean(peers), 'mean', `That is the average of the five, ${r1(mean(peers))}. Put the five P/Es in order and take the middle one.`], [mean(all6), 'mean6', 'That is the average of all six. Leave out the outlier and take the middle of the other five.']],
        { tol: 0.051, unreadable: 'Type the P/E as a number, like 18.', otherMsg: 'Put the five P/Es (without the outlier) in order from lowest to highest. The median is the third one.' });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.Vc, [[median(all6) * t.EPS, 'with', 'Use the median without the outlier.'], [mean(peers) * t.EPS, 'mean', 'Use the median, not the average.'], [c.med5 / t.EPS, 'div', `Multiply the P/E by the earnings per share, ${m(t.EPS)}.`]],
        Object.assign(pmTol(t.Vc), { otherMsg: `Median P/E × ${m(t.EPS)}.` }));
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Median P/E' : 'Value per share'}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't6') {
      const rows = e.rows || []; const rr = [];
      rr[1] = h.judgeNumber(pctIn(h, rows[1]), t.y, [[t.P / t.D1 / 100, 'flip', `Divide the dividend by the price: ${m(t.D1)} ÷ ${m0(t.P)}.`], [t.D0 / t.P, 'd0', `Use next year’s dividend, ${m(t.D1)}.`]],
        { tol: 0.0006, unreadable: 'Type a percent, like 3.2%.', otherMsg: `${m(t.D1)} ÷ ${m0(t.P)}.` });
      rr[2] = h.judgeNumber(pctIn(h, rows[2]), t.gi, [[t.r + t.y, 'plus', 'Subtract the dividend yield from the required return, don’t add it.'], [t.y, 'yield', 'That is the dividend yield. Implied growth = r − dividend yield.'],
        [t.r - t.y / 100, 'units', `Put both numbers in the same units: ${pc(t.r)} − ${p2(t.y)}.`], [t.y - t.r, 'flip', 'Take the required return minus the yield.']],
        { tol: 0.0008, unreadable: 'Type a percent, like 3.2%.', otherMsg: `${pc(t.r)} − your dividend yield.` });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Dividend yield' : 'Implied growth'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Compare the implied growth with Ilse’s forecast as well.' : `Your implied growth is ${p2(t.gi)}, and Ilse forecast ${pc(t.g)}. Which is bigger?` };
      return { ok: true, rowRes: rr };
    }
  }

  function helpText(t, lvl) {
    const rg = t.r - t.g;
    if (t.id === 't1') return lvl === 1 ? `Next year’s dividend = ${m(t.D0)} × (1 + ${t.g}) = ${m(t.D1)}.`
      : `Next year’s dividend: ${m(t.D1)}. r − g: ${pc(t.r)} − ${pc(t.g)} = ${pc(rg)}. Value: ${m(t.D1)} ÷ ${dec(rg)} = ${m(t.V)}. In Desmos: <code>${t.D1}/(${t.r}-${t.g})</code>.`;
    if (t.id === 't2') return lvl === 1 ? `Lower growth: ${m(t.D1)} ÷ (${t.r} − ${dec(t.glo)}) = ${m(t.D1)} ÷ ${dec((t.r - t.glo))} = ${m(t.Vlo)}.`
      : `Lower growth: ${m(t.Vlo)}. Higher growth: ${m(t.D1)} ÷ ${dec((t.r - t.ghi))} = ${m(t.Vhi)}. The price of ${m0(t.P)} is ${t.zone === 'cheap' ? 'below both' : t.zone === 'dear' ? 'above both' : 'between them'}.`;
    if (t.id === 't3') { const c = t.comps, a = c.rows[c.blanks[0]], b = c.rows[c.blanks[1]];
      return lvl === 1 ? `${a.name}: ${mm(a.price)} ÷ ${mm(a.eps)} = ${a.pe}.`
        : `${a.name}: ${a.pe}. ${b.name}: ${mm(b.price)} ÷ ${mm(b.eps)} = ${b.pe}. The outlier is ${c.rows[c.outIdx].name}, at ${c.rows[c.outIdx].pe}.`; }
    if (t.id === 't4') return lvl === 1 ? 'Ask what the annual report line says about the future. Will earnings grow fast, shrink, or bounce back from a bad year?'
      : `The answer is: ${WHY[t.comps.kind].toLowerCase()}.`;
    if (t.id === 't5') { const c = t.comps; const s = c.rows.filter((_, i) => i !== c.outIdx).map((x) => x.pe).sort((a, b) => a - b);
      return lvl === 1 ? `In order, the five P/Es are ${s.join(', ')}. The middle one is ${c.med5}.`
        : `Median P/E: ${c.med5}. Value: ${c.med5} × ${m(t.EPS)} = ${m(t.Vc)}.`; }
    if (t.id === 't6') return lvl === 1 ? `Dividend yield = ${m(t.D1)} ÷ ${m0(t.P)} = ${p2(t.y)}.`
      : `Dividend yield: ${p2(t.y)}. Implied growth: ${pc(t.r)} − ${p2(t.y)} = ${p2(t.gi)}, which is ${t.decision} than Ilse’s ${pc(t.g)}. In Desmos: <code>${t.r}-${t.D1}/${t.P}</code>.`;
  }
  function praise(t) {
    if (t.id === 't1') return `Copperline is worth about ${m(t.V)} a share on Ilse’s forecast: ${m(t.D1)} of dividends next year, growing ${pc(t.g)} a year forever, at a ${pc(t.r)} required return.`;
    if (t.id === 't2') return `One point of growth either way moves the value from ${m(t.Vlo)} to ${m(t.Vhi)}. The growth forecast matters more than any other input, so it deserves the most checking.`;
    if (t.id === 't3') { const o = t.comps.rows[t.comps.outIdx]; return `${o.name}’s P/E of ${o.pe} is far from the other five, so it needs explaining before Ilse uses the table.`; }
    if (t.id === 't4') return { fast: 'Investors pay more for each dollar of earnings when they expect those earnings to grow fast. This chain is growing in a way Copperline is not, so it is a poor guide to Copperline’s value.',
      shrink: 'A low P/E means investors expect earnings to fall. The chain may be no bargain at all, and it is a poor guide to Copperline’s value.',
      oneoff: 'Last year’s earnings were unusually low, which pushed the P/E up. On normal earnings the P/E would look like the others, but the table should still leave it out.' }[t.comps.kind];
    if (t.id === 't5') return `The comps say about ${m(t.Vc)} a share; the dividend model said ${m(t.V)}. Two methods rarely agree exactly. When they are far apart, check the growth forecast and whether the comps really resemble Copperline.`;
    if (t.id === 't6') return `At ${m0(t.P)}, the market expects Copperline’s dividend to grow about ${p2(t.gi)} a year forever, ${t.decision} than Ilse’s ${pc(t.g)}. ${t.decision === 'faster' ? 'If Ilse is right, the price is too high.' : 'If Ilse is right, the price is too low.'}`;
  }
  const pctOut = (x) => (x * 100).toFixed(2) + '%';
  function selfAnswer(t) {
    if (t.id === 't1') return { rows: [null, t.D1.toFixed(2), pctOut(t.r - t.g), t.V.toFixed(2)] };
    if (t.id === 't2') return { rows: [null, t.Vlo.toFixed(2), t.Vhi.toFixed(2)], choice: t.decision };
    if (t.id === 't3') return { rows: [null].concat(t.comps.blanks.map((i) => String(t.comps.rows[i].pe))), choice: t.decision };
    if (t.id === 't4') return { choice: t.decision };
    if (t.id === 't5') return { rows: [null, String(t.comps.med5), t.Vc.toFixed(2)] };
    if (t.id === 't6') return { rows: [null, pctOut(t.y), pctOut(t.gi)], choice: t.decision };
  }
  function selfWrong(t) {
    if (t.id === 't1') return { rows: [null, t.D1.toFixed(2), pctOut(t.r - t.g), (t.D1 / t.r).toFixed(2)] };
    if (t.id === 't2') return { rows: [null, t.Vlo.toFixed(2), t.Vhi.toFixed(2)], choice: t.decision === 'cheap' ? 'dear' : 'cheap' };
    if (t.id === 't3') return { rows: [null].concat(t.comps.blanks.map((i) => (t.comps.rows[i].eps / t.comps.rows[i].price).toFixed(3))), choice: t.decision };
    if (t.id === 't4') return { choice: 'mistake' };
    if (t.id === 't5') { const all6 = t.comps.rows.map((x) => x.pe); return { rows: [null, median(all6).toFixed(2), (median(all6) * t.EPS).toFixed(2)] }; }
    if (t.id === 't6') return { rows: [null, pctOut(t.y), pctOut(t.r + t.y)], choice: t.decision };
  }

  const WALK = {
    title: 'How Ilse values a small diner chain',
    intro: '<p>Last year Ilse valued a small diner chain. This year it paid a dividend of <b>$2.00</b> a share, and its owners require an <b>8%</b> return. She worked out its value from its dividends, from similar chains and from its share price.</p>',
    render(stage) {
      const tbl = (cap, head, rows, hl) => `<div class="tw"><table class="cf"><caption>${cap}</caption><thead><tr>${head.map((x, i) => `<th scope="col"${i === 0 ? ' style="text-align:left"' : ''}>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === hl ? 'hl' : ''}">${r.map((x, j) => `<td${j === 0 ? ' class="lbl"' : ''}>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      if (stage === 0) return tbl('A dividend that never grows', ['Line', 'Working', 'Result'], [['Value of $2.00 a year forever (Unit 4)', '$2.00 ÷ 0.08', '$25.00']], 0);
      if (stage === 1) return tbl('A dividend that grows 3% a year forever', ['Line', 'Working', 'Result'], [['Next year’s dividend', '$2.00 × 1.03', '$2.06'], ['r − g', '8% − 3%', '5%'], ['Value per share', '$2.06 ÷ 0.05', '$41.20']], 2);
      if (stage === 2) return tbl('The same dividend at other growth rates', ['Growth forever', 'Working', 'Value per share'], [['2%', '$2.06 ÷ 0.06', '$34.33'], ['3%', '$2.06 ÷ 0.05', '$41.20'], ['4%', '$2.06 ÷ 0.04', '$51.50'], ['7%', '$2.06 ÷ 0.01', '$206.00']], 3);
      if (stage === 3) return tbl('Comps: the P/Es of six similar chains', ['Chain', 'P/E', 'Used?'], [['A', '15', 'Yes'], ['B', '17', 'Yes'], ['C', '18', 'Yes, the median'], ['D', '20', 'Yes'], ['E', '22', 'Yes'], ['F (opening a restaurant a week)', '48', 'No, the outlier']], 2)
        + tbl('Value from the comps', ['Line', 'Working', 'Result'], [['Value per share', '18 × $3.00 of earnings per share', '$54.00']], 0);
      return tbl('The growth in today’s price of $51.50', ['Line', 'Working', 'Result'], [['Dividend yield', '$2.06 ÷ $51.50', '4.0%'], ['Implied growth', '8% − 4.0%', '4.0%']], 1);
    },
    stages: [
      { t: 'A share is the cash it pays', p: 'An owner collects dividends, so a share is worth the value today of those dividends. If the chain paid $2.00 a year forever and never raised it, that would be a perpetuity worth $2.00 ÷ 0.08 = $25.00.' },
      { t: 'Let the dividend grow', p: 'The chain raises its dividend about 3% a year. Next year’s dividend is $2.00 × 1.03 = $2.06. A perpetuity that grows is worth next year’s payment ÷ (r − g), so each share is worth $2.06 ÷ (0.08 − 0.03) = $41.20. This is the <b>constant-growth model</b>.' },
      { t: 'Respect the guardrail', p: 'Growth matters a lot. At 4% instead of 3%, the value rises by a quarter, to $51.50. At 7% it is $206. Growth forever must stay well below the 8% required return; at 8% or more the formula breaks.' },
      { t: 'Check against similar companies', p: 'Five similar chains have P/Es (price ÷ earnings per share) from 15 to 22. A sixth, opening a restaurant a week, sits at 48. Ilse leaves that outlier out and takes the <b>median</b> of the other five, 18. The diner chain earned $3.00 a share, so the comps say 18 × $3.00 = $54.00.' },
      { t: 'Run the model backward', p: 'The shares traded at $51.50. The dividend yield is $2.06 ÷ $51.50 = 4.0%, so the price implies growth of 8% − 4.0% = 4.0% a year forever. Ilse forecast 3%, so the market was more hopeful than she was.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u9-valuation-desk', version: 2, seedVersion: 2, salt: 'rize-finan4-u9-valuation:4c81d3', points: 20,
    storageKey: 'rize-finan4-u9-valuation-v1', filePrefix: 'ValuationDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-valuation-desk/verify.html',
    calcPlaceholder: '2.06/(0.08-0.03)',
    calcHint: 'Type or tap. Use / to divide and parentheses to group, so 2.06/(0.08-0.03) is the value of a share that pays $2.06 next year, growing 3% a year, at an 8% required return.',
    story: { title: 'The Valuation Desk', kicker: 'Corporate Finance, Unit 9', company: 'Bramble Street Research', team: 'Restaurant Research Team',
      from: 'Ilse Ostrander', fromTitle: 'senior analyst, Bramble Street Research',
      dek: 'You have joined Bramble Street Research, which writes reports on restaurant stocks for investors. Ilse Ostrander, a senior analyst, is valuing Copperline Burgers, a chain that has raised its dividend every year for decades. She wants three numbers: what its dividends are worth, what similar chains say it is worth, and what growth today’s share price assumes.',
      whatBox: '<b>A share is worth the cash it pays its owners.</b> The constant-growth model values a dividend that grows forever, comparable companies give a second opinion, and running the model backward shows what growth today’s price assumes.',
      stepsLine: 'There are twelve steps: a worked example, six problems with three one-question checks between them, one exam-style question, and a short note to Ilse.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the report', label: 'Your note to Ilse', minWords: 30, receiptHeading: 'Note to the senior analyst',
      prompt: 'Ilse is writing up Copperline for clients. Give your value per share from the dividend model and from the comps, say what growth today’s price implies and whether that growth seems believable, and name one thing you would check before telling clients to buy or sell.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);

// Paycheck budget calculator. To change a split, edit the data-pct numbers in budget.html (they must add up to 100).
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('paycheck');
  const form = document.getElementById('budgetForm');
  const totalEl = document.getElementById('budgetTotal');
  const bar = document.getElementById('budgetBar');
  const buckets = [...document.querySelectorAll('.bucket')];
  if (!input || !buckets.length) return;

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const pcts = buckets.map((b) => Number(b.dataset.pct) || 0);

  buckets.forEach((b, i) => {
    b.querySelector('.bucket__pct').textContent = pcts[i] + '%';
    const seg = document.createElement('span');
    seg.className = 'budget__seg';
    seg.style.width = pcts[i] + '%';
    seg.style.background = b.style.getPropertyValue('--c');
    bar.appendChild(seg);
  });

  const parse = (v) => {
    const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? Math.min(n, 10000000) : 0;
  };

  const update = () => {
    const cents = Math.round(parse(input.value) * 100);
    if (!cents) {
      buckets.forEach((b) => { b.querySelector('.bucket__amt').textContent = '$0.00'; });
      totalEl.textContent = 'Enter an amount to see your buckets.';
      return;
    }
    const parts = pcts.map((p) => Math.floor((cents * p) / 100));
    parts[0] += cents - parts.reduce((a, c) => a + c, 0);
    buckets.forEach((b, i) => { b.querySelector('.bucket__amt').textContent = money.format(parts[i] / 100); });
    totalEl.textContent = 'Your ' + money.format(cents / 100) + ' splits into these five buckets:';
  };

  input.addEventListener('input', update);
  form.addEventListener('submit', (e) => { e.preventDefault(); update(); });
  update();
});

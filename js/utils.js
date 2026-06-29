const Utils = (() => {
  const normalize = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').trim();
  const cleanText = v => String(v ?? '').replace(/\s+/g,' ').trim();
  const number = v => {
    if (typeof v === 'number') return v;
    const s = String(v ?? '').replace(/\s/g,'').replace(/[$,%]/g,'').replace(/,/g,'');
    const n = parseFloat(s); return Number.isFinite(n) ? n : 0;
  };
  const percent = v => Math.max(0, Math.min(100, number(v)));
  const unique = arr => [...new Set(arr.filter(Boolean).map(cleanText))].sort((a,b)=>a.localeCompare(b,'es'));
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const fmt = n => new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(n);
  const fmtPct = n => `${new Intl.NumberFormat('es-MX',{maximumFractionDigits:1}).format(n)}%`;
  const groupBy = (rows, keyFn) => rows.reduce((acc,row)=>{const k=keyFn(row)||'Sin dato';(acc[k] ||= []).push(row);return acc;},{});
  return { normalize, cleanText, number, percent, unique, avg, fmt, fmtPct, groupBy };
})();

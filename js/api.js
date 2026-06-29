const Api = (() => {
  const aliases = {
    program: ['programa'], year: ['ejerciciofiscal','anio','ano','year','añofiscal','anofiscal','ejercicio'],
    activity: ['actividad','actividades'], department: ['departamento'], area: ['area'],
    goal: ['meta','mes','periodo'], progress: ['avanceenporcentaje','avanceporcentaje','avance','porcentaje'],
    status: ['estatus','estado','situacion'], comments: ['comentarios','comentario','observaciones']
  };
  function mapColumns(headers){
    const normalized = headers.map(Utils.normalize); const out = {};
    Object.entries(aliases).forEach(([field, list]) => { const idx = normalized.findIndex(h => list.includes(h)); out[field] = idx; });
    return out;
  }
  function rowsFromMatrix(matrix){
    const headers = matrix[0] || []; const map = mapColumns(headers);
    return matrix.slice(1).map(r => ({
      program: Utils.cleanText(r[map.program]), year: Utils.cleanText(r[map.year]), activity: Utils.cleanText(r[map.activity]),
      department: Utils.cleanText(r[map.department]), area: Utils.cleanText(r[map.area]), goal: Utils.cleanText(r[map.goal]),
      progress: Utils.percent(r[map.progress]), status: Utils.cleanText(r[map.status]).toUpperCase(), comments: Utils.cleanText(r[map.comments])
    })).filter(r => Object.values(r).some(Boolean));
  }
  async function fromAppsScript(){
    const res = await fetch(window.DASHBOARD_CONFIG.APPS_SCRIPT_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error(`Apps Script ${res.status}`);
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json.data || json.rows || []);
    if (!data.length) return [];
    if (Array.isArray(data[0])) return rowsFromMatrix(data);
    const headers = Object.keys(data[0]); const matrix = [headers, ...data.map(o => headers.map(h => o[h]))];
    return rowsFromMatrix(matrix);
  }
  async function fromGviz(){
    const { GOOGLE_SHEET_ID, SHEET_NAME } = window.DASHBOARD_CONFIG;
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const txt = await (await fetch(url)).text();
    const json = JSON.parse(txt.substring(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
    const headers = json.table.cols.map(c => c.label || c.id);
    const matrix = [headers, ...json.table.rows.map(row => row.c.map(c => c ? (c.f || c.v) : ''))];
    return rowsFromMatrix(matrix);
  }
  async function load(){ try { return await fromAppsScript(); } catch(e) { console.warn('Apps Script no disponible, usando Google Sheet público:', e); return await fromGviz(); } }
  return { load };
})();

const Tables = (() => {
  const progressValue = r => Kpis.progressValue(r);
  const badgeClass = r => Utils.normalize(r.status).includes('fueradetiempo') ? 'bad' : Utils.normalize(r.status).includes('porvencer') ? 'warn' : (progressValue(r)===0 ? 'low' : 'ok');
  function renderTable(rows, elId){
    const el=document.getElementById(elId); if(!el) return;
    const html = `<div class="table-wrap"><table><thead><tr><th>Programa</th><th>Ejercicio</th><th>Actividad</th><th>Departamento</th><th>Área</th><th>Meta</th><th>Avance</th><th>Estatus</th><th>Comentarios</th></tr></thead><tbody>${rows.map(r=>{ const p=progressValue(r); return `<tr><td>${r.program}</td><td>${r.year}</td><td>${r.activity}</td><td>${r.department}</td><td>${r.area}</td><td>${r.goal}</td><td><div class="progress"><div class="bar" style="width:${Math.max(0,Math.min(100,p))}%"></div></div><b>${Utils.fmtPct(p)}</b></td><td><span class="badge ${badgeClass(r)}">${r.status||'SIN ESTATUS'}</span></td><td>${r.comments}</td></tr>`; }).join('')}</tbody></table></div>`;
    el.innerHTML = rows.length ? html : '<p>No hay registros con los filtros seleccionados.</p>';
  }
  function critical(rows){ return rows.filter(r => Utils.normalize(r.status).includes('porvencer') || Utils.normalize(r.status).includes('fueradetiempo') || progressValue(r)===0); }
  function render(rows){ renderTable(critical(rows),'criticalTable'); }
  return { render, renderTable, critical };
})();

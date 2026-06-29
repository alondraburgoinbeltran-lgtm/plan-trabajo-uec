const Kpis = (() => {
  function progressValue(r){
    const p = Number(r?.progress || 0);
    return p > 0 && p <= 1 ? p * 100 : p;
  }
  function isCompleted(r){ return progressValue(r) >= 100 || Utils.normalize(r.status).includes('completadoentiempo'); }
  function isRiskLow(r){ return progressValue(r) === 0 && Utils.normalize(r.status).includes('entiempo'); }
  function calc(rows){
    const total=rows.length, completed=rows.filter(isCompleted).length, onTime=rows.filter(r=>Utils.normalize(r.status).includes('entiempo')).length;
    const due=rows.filter(r=>Utils.normalize(r.status).includes('porvencer')).length, late=rows.filter(r=>Utils.normalize(r.status).includes('fueradetiempo')).length;
    const zero=rows.filter(r=>progressValue(r)===0).length, progress=Utils.avg(rows.map(progressValue));
    const compliance = total ? completed/total*100 : 0;
    const byProgram=Utils.groupBy(rows,r=>r.program); let worst='Sin datos', worstVal=101;
    Object.entries(byProgram).forEach(([k,v])=>{const a=Utils.avg(v.map(progressValue)); if(a<worstVal){worst=k; worstVal=a;}});
    const byDept=Utils.groupBy(rows,r=>r.department); let load='Sin datos', max=0; Object.entries(byDept).forEach(([k,v])=>{if(v.length>max){load=k;max=v.length;}});
    return { total, completed, onTime, due, late, zero, progress, compliance, worst, worstVal, load, riskLow: rows.filter(isRiskLow).length };
  }
  function renderTraffic(rows){
    const green=rows.filter(r=>progressValue(r)>=80).length;
    const amber=rows.filter(r=>progressValue(r)>=40&&progressValue(r)<80).length;
    const red=rows.filter(r=>progressValue(r)<40).length;
    const el=document.getElementById('trafficSummary');
    if(!el) return;
    el.innerHTML=[['green','Verde 80-100',green],['amber','Ámbar 40-79',amber],['red','Rojo 0-39',red]].map(x=>`<article class="traffic-item"><div class="traffic-left"><span class="dot ${x[0]}"></span><p>${x[1]}</p></div><strong>${Utils.fmt(x[2])}</strong></article>`).join('');
  }
  function render(rows){ const k=calc(rows); const cards=[
    ['Completadas', Utils.fmt(k.completed), '100% o completado en tiempo', ''],
    ['Por vencer', Utils.fmt(k.due), 'Atención preventiva', ''],
    ['Fuera de tiempo', Utils.fmt(k.late), 'Riesgo alto', ''],
    ['Sin avance reportado', Utils.fmt(k.zero), 'Actividades con avance 0%', 'amber']
  ]; const grid=document.getElementById('kpiGrid'); if(grid) grid.innerHTML=cards.map(c=>`<article class="kpi-card ${c[3]}"><p>${c[0]}</p><strong>${c[1]}</strong><small>${c[2]}</small></article>`).join(''); renderTraffic(rows); }
  return { render, calc, isCompleted, isRiskLow, progressValue };
})();

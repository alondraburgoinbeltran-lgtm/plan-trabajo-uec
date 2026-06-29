const Charts = (() => {
  const charts={};
  const colors=['#00584b','#d8c79f','#10342f','#177245','#b7791f','#b42318','#6b7f79','#c7b37d'];
  function destroy(id){ if(charts[id]) charts[id].destroy(); }
  function make(id,type,labels,data,opts={}){
    const canvas=document.getElementById(id); if(!canvas) return;
    destroy(id);
    charts[id]=new Chart(canvas,{type,data:{labels,datasets:[{data,label:opts.label||'',backgroundColor:opts.backgroundColor||colors,borderColor:opts.borderColor||'#fff',borderWidth:opts.borderWidth ?? 2,circumference:opts.circumference,rotation:opts.rotation,cutout:opts.cutout}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:opts.legendDisplay ?? true,position:opts.legend||'bottom'},tooltip:{enabled:opts.tooltip ?? true}},scales:opts.scales||{}}});
  }
  function countBy(rows,key){ const g=Utils.groupBy(rows,key); return Object.entries(g).map(([label,items])=>({label,value:items.length})).sort((a,b)=>b.value-a.value); }
  function renderGauge(rows){
    const progress=Math.max(0,Math.min(100,Kpis.calc(rows).progress));
    const value=document.getElementById('gaugeValue'); if(value) value.textContent=Utils.fmtPct(progress);
    make('gaugeChart','doughnut',['Avance','Pendiente'],[progress,100-progress],{backgroundColor:['#00584b','#e8e1d2'],borderColor:['#fff','#fff'],borderWidth:3,circumference:180,rotation:270,cutout:'74%',legendDisplay:false,tooltip:false});
  }
  function renderDepartmentGauge(id, value){
    const progress=Math.max(0,Math.min(100,value || 0));
    make(id,'doughnut',['Avance','Pendiente'],[progress,100-progress],{backgroundColor:['#00584b','#e8e1d2'],borderColor:['#fff','#fff'],borderWidth:3,circumference:180,rotation:270,cutout:'72%',legendDisplay:false,tooltip:false});
  }
  function renderDepartmentStatus(rows){
    const status=countBy(rows,r=>r.status || 'Sin estatus');
    make('deptStatusChart','doughnut',status.map(x=>x.label),status.map(x=>x.value),{cutout:'62%'});
  }
  function render(rows){ renderGauge(rows); }
  return { render, renderDepartmentStatus, renderDepartmentGauge };
})();

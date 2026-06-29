let ALL_ROWS=[];
let ACTIVE_DEPARTMENT='';
let GOAL_GROUPS={};

function escapeHtml(v){
  return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function avgBy(rows,keyFn){
  const grouped=Utils.groupBy(rows,keyFn);
  return Object.entries(grouped).map(([label,items])=>({label,items,value:Utils.avg(items.map(Kpis.progressValue))})).sort((a,b)=>b.value-a.value);
}

function renderGoalCalendar(rows){
  const el=document.getElementById('goalCalendar');
  if(!el) return;
  const monthOrder=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE','PERMANENTE'];
  const normalizeGoal=(v)=>{
    const n=Utils.normalize(v);
    const found=monthOrder.find(m=>Utils.normalize(m)===n || n.includes(Utils.normalize(m)));
    return found || (v || 'SIN META');
  };
  const grouped=Utils.groupBy(rows,r=>normalizeGoal(r.goal));
  const keys=Object.keys(grouped).sort((a,b)=>{
    const ia=monthOrder.indexOf(String(a).toUpperCase()), ib=monthOrder.indexOf(String(b).toUpperCase());
    return (ia<0?99:ia)-(ib<0?99:ib) || String(a).localeCompare(String(b),'es');
  });
  GOAL_GROUPS=grouped;

  if(!keys.length){
    el.innerHTML='<div class="goal-calendar-head"><h2>Vencimientos por meta</h2></div><div class="empty-state">No hay vencimientos con los filtros seleccionados.</div>';
    return;
  }

  el.innerHTML=`
    <div class="goal-calendar-head">
      <h2>Vencimientos por meta</h2>
    </div>
    <div class="goal-months">
      ${keys.map(k=>`<button class="goal-month" type="button" data-goal="${escapeHtml(k)}" aria-label="Ver actividades de ${escapeHtml(k)}"><span>${escapeHtml(k)}</span><strong>${Utils.fmt(grouped[k].length)}</strong><small>actividades</small></button>`).join('')}
    </div>`;

  el.querySelectorAll('.goal-month').forEach(btn=>{
    btn.addEventListener('click',()=>openGoalModal(btn.dataset.goal));
  });
}

function openGoalModal(goal){
  const rows=GOAL_GROUPS[goal] || [];
  const modal=document.getElementById('kpiModal');
  const title=document.getElementById('kpiModalTitle');
  const eyebrow=document.getElementById('kpiModalEyebrow');
  if(eyebrow) eyebrow.textContent='Vencimientos por meta';
  if(title) title.textContent=`Actividades con meta: ${goal}`;
  if(modal) modal.classList.remove('hidden');
  Tables.renderTable(rows,'kpiModalBody');
}

function getKpiRows(type, rows){
  if(type==='completed') return rows.filter(Kpis.isCompleted);
  if(type==='due') return rows.filter(r=>Utils.normalize(r.status).includes('porvencer'));
  if(type==='late') return rows.filter(r=>Utils.normalize(r.status).includes('fueradetiempo'));
  if(type==='zero') return rows.filter(r=>Kpis.progressValue(r)===0);
  return [];
}

function openKpiModal(type){
  const rows=Filters.apply(ALL_ROWS);
  const filtered=getKpiRows(type, rows);
  const titles={
    completed:'Actividades completadas',
    due:'Actividades por vencer',
    late:'Actividades fuera de tiempo',
    zero:'Actividades sin avance reportado'
  };

  const eyebrow=document.getElementById('kpiModalEyebrow');
  if(eyebrow) eyebrow.textContent='Detalle de actividades';
  document.getElementById('kpiModalTitle').textContent=titles[type] || 'Actividades';
  document.getElementById('kpiModal').classList.remove('hidden');
  Tables.renderTable(filtered,'kpiModalBody');
}

function bindKpiCards(){
  document.querySelectorAll('.kpi-card[data-kpi]').forEach(card=>{
    card.onclick=()=>openKpiModal(card.dataset.kpi);
  });
}

function renderDepartmentCards(rows){
  const el=document.getElementById('departmentCards');
  if(!el) return;
  const data=avgBy(rows,r=>r.department || 'Sin departamento');
  const order=['TITULAR','JURÍDICO','AUDITORÍA'];
  const departments=order.map(name=>data.find(d=>Utils.normalize(d.label)===Utils.normalize(name)) || {label:name,items:[],value:0});
  if(!rows.length){ el.innerHTML='<div class="empty-state">No hay departamentos con los filtros seleccionados.</div>'; return; }
  el.innerHTML=departments.map((d,i)=>`<article class="department-card gauge-dept ${ACTIVE_DEPARTMENT===d.label?'active':''}" data-department="${escapeHtml(d.label)}" tabindex="0" role="button" aria-label="Ver detalle de ${escapeHtml(d.label)}"><h3>${escapeHtml(d.label)}</h3><div class="dept-gauge-wrap"><canvas id="deptGauge${i}"></canvas><div class="dept-gauge-number"><strong>${Utils.fmtPct(d.value)}</strong><span>avance</span></div></div><div class="department-meta"><span>${Utils.fmt(d.items.length)} actividades</span><strong>${Utils.fmtPct(d.value)}</strong></div></article>`).join('');
  departments.forEach((d,i)=>Charts.renderDepartmentGauge(`deptGauge${i}`, d.value));
  el.querySelectorAll('.department-card').forEach(card=>{
    const open=()=>showDepartmentDetail(card.dataset.department, rows);
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  });
}

function renderAreaMiniBars(rows){
  const el=document.getElementById('areaMiniBars');
  if(!el) return;
  const areas=avgBy(rows,r=>r.area || 'Sin área');
  el.innerHTML=areas.length ? areas.map(a=>`<div class="mini-row"><span title="${escapeHtml(a.label)}">${escapeHtml(a.label)}</span><div class="mini-track"><div class="mini-fill" style="width:${Math.max(0,Math.min(100,a.value))}%"></div></div><span class="mini-pct">${Utils.fmtPct(a.value)}</span></div>`).join('') : '<p>No hay áreas para este departamento.</p>';
}

function showDepartmentDetail(department, baseRows){
  ACTIVE_DEPARTMENT=department;
  const rows=baseRows.filter(r=>(r.department || 'Sin departamento')===department);
  document.getElementById('departmentDetail').classList.remove('hidden');
  document.getElementById('breadcrumb').textContent=`General > ${department}`;
  document.getElementById('detailTitle').textContent=`Detalle de ${department}`;
  renderAreaMiniBars(rows);
  Charts.renderDepartmentStatus(rows);
  Tables.renderTable(Tables.critical(rows),'criticalTable');
  renderDepartmentCards(baseRows);
  document.getElementById('departmentDetail').scrollIntoView({behavior:'smooth',block:'start'});
}

function hideDepartmentDetail(){
  ACTIVE_DEPARTMENT='';
  const detail=document.getElementById('departmentDetail');
  if(detail) detail.classList.add('hidden');
  renderDepartmentCards(Filters.apply(ALL_ROWS));
  document.getElementById('vistaGeneral')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function render(){
  const rows=Filters.apply(ALL_ROWS);
  Kpis.render(rows);
  bindKpiCards();
  Charts.render(rows);
  renderGoalCalendar(rows);
  renderDepartmentCards(rows);
  if(ACTIVE_DEPARTMENT){
    const exists=rows.some(r=>(r.department || 'Sin departamento')===ACTIVE_DEPARTMENT);
    exists ? showDepartmentDetail(ACTIVE_DEPARTMENT, rows) : hideDepartmentDetail();
  }
}

async function boot(){
  Sections.init();
  const back=document.getElementById('backToGeneral');
  if(back) back.onclick=hideDepartmentDetail;
  const closeModal=document.getElementById('closeKpiModal');
if(closeModal) closeModal.onclick=()=>document.getElementById('kpiModal').classList.add('hidden');

const modal=document.getElementById('kpiModal');
if(modal) modal.addEventListener('click',e=>{
  if(e.target.id==='kpiModal') modal.classList.add('hidden');
});
  const isLogged=sessionStorage.getItem('uec_auth')==='true';
  if(isLogged){ document.getElementById('login').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); await loadDashboard(); }
  document.getElementById('loginBtn').onclick=async()=>{
    const ok=document.getElementById('passwordInput').value===window.DASHBOARD_CONFIG.PASSWORD;
    if(!ok){document.getElementById('loginError').textContent='Contraseña incorrecta';return;}
    sessionStorage.setItem('uec_auth','true'); document.getElementById('login').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); await loadDashboard();
  };
  document.getElementById('passwordInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginBtn').click();});
}
async function loadDashboard(){
  try { ALL_ROWS = await Api.load(); Filters.init(ALL_ROWS, render); render(); }
  catch(e){ console.error(e); document.querySelector('.main').insertAdjacentHTML('afterbegin',`<div class="table-card"><b>No se pudieron cargar los datos.</b><br>Verifica permisos del Apps Script o que la hoja esté publicada.</div>`); }
}
document.addEventListener('DOMContentLoaded', boot);
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{})); }

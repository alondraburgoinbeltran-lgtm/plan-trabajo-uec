const Filters = (() => {
  const state = { years: new Set(), program:'', department:'', area:'', status:'', goal:'' };
  const ids = ['programFilter','departmentFilter','areaFilter','statusFilter','goalFilter'];
  function fillSelect(id, values){ const el=document.getElementById(id); const first=el.options[0].textContent; el.innerHTML=`<option value="">${first}</option>` + values.map(v=>`<option>${v}</option>`).join(''); }
  function init(rows, onChange){
    fillSelect('programFilter', Utils.unique(rows.map(r=>r.program))); fillSelect('departmentFilter', Utils.unique(rows.map(r=>r.department)));
    fillSelect('areaFilter', Utils.unique(rows.map(r=>r.area))); fillSelect('statusFilter', Utils.unique(rows.map(r=>r.status))); fillSelect('goalFilter', Utils.unique(rows.map(r=>r.goal)));
    const years = Utils.unique(rows.map(r=>r.year)); const menu=document.getElementById('yearMenu');
    menu.innerHTML = `<label><input type="checkbox" data-all> Todos</label>` + years.map(y=>`<label><input type="checkbox" value="${y}"> ${y}</label>`).join('');
    document.getElementById('yearBtn').onclick=()=>menu.classList.toggle('show');
    menu.onchange=e=>{ if(e.target.dataset.all!==undefined){ state.years.clear(); menu.querySelectorAll('input:not([data-all])').forEach(i=>i.checked=false); } else { e.target.checked ? state.years.add(e.target.value) : state.years.delete(e.target.value); menu.querySelector('[data-all]').checked = state.years.size===0; } updateYearBtn(); onChange(); };
    ids.forEach(id=>document.getElementById(id).onchange=e=>{ const key=id.replace('Filter','').replace('program','program').replace('department','department').replace('area','area').replace('status','status').replace('goal','goal'); state[key]=e.target.value; onChange(); });
    document.getElementById('clearFilters').onclick=()=>{ state.years.clear(); ids.forEach(id=>{document.getElementById(id).value='';}); menu.querySelectorAll('input').forEach(i=>i.checked=false); menu.querySelector('[data-all]').checked=true; Object.assign(state,{program:'',department:'',area:'',status:'',goal:''}); updateYearBtn(); onChange(); };
    menu.querySelector('[data-all]').checked=true; updateYearBtn();
  }
  function updateYearBtn(){ const arr=[...state.years]; document.getElementById('yearBtn').textContent = arr.length ? `${arr.join(', ')} ▾` : 'Todos ▾'; }
  function apply(rows){ return rows.filter(r => (!state.years.size || state.years.has(r.year)) && (!state.program || r.program===state.program) && (!state.department || r.department===state.department) && (!state.area || r.area===state.area) && (!state.status || r.status===state.status) && (!state.goal || r.goal===state.goal)); }
  return { init, apply, state };
})();

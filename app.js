/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
const MAP_ASPECT = 16/9;   // ancho/alto de tu mapa.png (ej: 1920x1080 = 16/9)
const ZOOM       = 2.2;    // zoom al seleccionar una propiedad
const UMBRAL     = 60;     // aptitud mínima (%) para considerar "apto" en la búsqueda
const PANEL_W    = 410;

/* ============================================================
   CATÁLOGOS
   ============================================================ */
const RIESGOS = {
  sismo:     {label:'Sismos',               color:'#8a4b2a'},
  tsunami:   {label:'Tsunami',              color:'#1f6fb5'},
  inundacion:{label:'Inundación',           color:'#3a9bc9'},
  incendio:  {label:'Incendio forestal',    color:'#d1561f'},
  remocion:  {label:'Aluvión / deslizamiento', color:'#7a6a3a'},
  volcanico: {label:'Actividad volcánica',  color:'#a23b72'},
  sequia:    {label:'Sequía',               color:'#c49a1a'}
};
const ACT = {
  residencial:{label:'Vivienda',   para:'vivir'},
  agricultura:{label:'Agricultura',para:'cultivar'},
  pesca:      {label:'Pesca y acuicultura', para:'pesca y acuicultura'},
  industrial: {label:'Industria',  para:'industria'},
  turismo:    {label:'Turismo',    para:'turismo'},
  forestal:   {label:'Forestal',   para:'uso forestal'}
};
const TAMANOS = {'':[0,Infinity], xs:[0,500], sm:[500,5000], md:[5000,50000], lg:[50000,Infinity]};

const byId = id => DB.find(d => d.id === id);

/* ============================================================
   UTILIDADES
   ============================================================ */
const $ = s => document.querySelector(s);
const nf = new Intl.NumberFormat('es-CL');
const fmtUF = v => nf.format(v) + ' UF';
const fmtM2 = v => v >= 10000 ? nf.format(Math.round(v/100)/100) + ' ha' : nf.format(v) + ' m²';

const riesgoProm = it => Math.round(Object.values(it.riesgos).reduce((a,b)=>a+b,0) / Object.keys(it.riesgos).length);
const seguridad  = it => 100 - riesgoProm(it);
const baseM2     = it => it.tipo === 'casa' ? it.construida : it.superficie;
const precioM2   = it => it.precio / baseM2(it);
const peligroTop = it => Object.entries(it.riesgos).sort((a,b)=>b[1]-a[1])[0];
const mejorAct   = it => Object.entries(it.aptitudes).sort((a,b)=>b[1]-a[1])[0];
const riskColor  = v => v >= 67 ? 'var(--bad)' : v >= 34 ? 'var(--mid)' : 'var(--good)';
const riskLevel  = v => v >= 67 ? 'alto' : v >= 34 ? 'medio' : 'bajo';
const secColor   = v => v >= 67 ? 'var(--good)' : v >= 40 ? 'var(--mid)' : 'var(--bad)';
const emoji      = it => it.tipo === 'casa' ? '🏠' : '🌾';

/* si el PNG no existe, muestra un ícono */
function imgFail(img){
  const d = document.createElement('div');
  d.className = 'img-fallback';
  d.textContent = img.dataset.emoji;
  img.replaceWith(d);
}
const imgTag = it => `<img src="${it.img}" alt="${it.nombre}" data-emoji="${emoji(it)}" onerror="imgFail(this)">`;

/* ============================================================
   ESTADO
   ============================================================ */
const state = {
  selected:null,      // propiedad con ficha abierta
  focus:null,         // propiedad enfocada en el mapa (zoom)
  mode:null,          // null | 'pick' (eligiendo segunda propiedad)
  first:null,         // primera propiedad a comparar
  pair:null,          // [a, b] en pantalla de comparación
  histFrom:null,
  filter:{tipo:'', act:'', tam:''}
};

/* ============================================================
   MAPA: tamaño, zoom y marcadores
   ============================================================ */
const vp = $('#viewport'), stage = $('#stage');

function layoutMap(){
  const W = vp.clientWidth, H = vp.clientHeight;
  const SW = Math.max(W, H * MAP_ASPECT), SH = SW / MAP_ASPECT;
  stage.style.width = SW + 'px';
  stage.style.height = SH + 'px';

  let s = 1, tx = (W - SW) / 2, ty = (H - SH) / 2;
  const it = state.focus;
  if(it){
    s = ZOOM;
    const desktop = W > 900;
    const cx = desktop ? (W - PANEL_W) / 2 : W / 2;
    const cy = desktop ? H / 2 + 30 : H * 0.28;
    tx = cx - (it.pos.x / 100) * SW * s;
    ty = cy - (it.pos.y / 100) * SH * s;
    tx = Math.min(0, Math.max(W - SW * s, tx));
    ty = Math.min(0, Math.max(H - SH * s, ty));
  }
  stage.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  stage.style.setProperty('--inv', 1 / s);
}
window.addEventListener('resize', layoutMap);

function buildMarkers(){
  DB.forEach(it => {
    const b = document.createElement('button');
    b.className = 'marker';
    b.id = 'm-' + it.id;
    b.style.left = it.pos.x + '%';
    b.style.top  = it.pos.y + '%';
    b.setAttribute('aria-label', `${it.tipo}: ${it.nombre}, ${it.comuna}`);
    b.innerHTML = `<span class="pin">${imgTag(it)}<span class="badge"></span></span><span class="base"></span><span class="tag">${it.nombre}</span>`;
    b.addEventListener('click', () => onMarkerClick(it));
    stage.appendChild(b);
  });
}

function matches(it){
  const f = state.filter;
  if(f.tipo && it.tipo !== f.tipo) return false;
  if(f.act && it.aptitudes[f.act] < UMBRAL) return false;
  const [min, max] = TAMANOS[f.tam];
  return it.superficie >= min && it.superficie < max;
}
const filterActive = () => Object.values(state.filter).some(Boolean);

function refreshMarkers(){
  DB.forEach(it => {
    const m = $('#m-' + it.id);
    m.className = 'marker';
    if(state.mode === 'pick'){
      if(it.id === state.first.id) m.classList.add('selected');
      else if(it.tipo === state.first.tipo) m.classList.add('candidate');
      else m.classList.add('off');
    } else {
      if(state.selected && state.selected.id === it.id) m.classList.add('selected');
      if(filterActive() && !matches(it)) m.classList.add('dim');
    }
    const badge = m.querySelector('.badge');
    if(state.filter.act && state.mode !== 'pick'){
      badge.textContent = it.aptitudes[state.filter.act] + '%';
      m.classList.add('has-badge');
    }
  });
}

/* ============================================================
   BÚSQUEDA
   ============================================================ */
function initSearch(){
  $('#fAct').innerHTML = '<option value="">cualquier actividad</option>' +
    Object.entries(ACT).map(([k,v]) => `<option value="${k}">${v.label.toLowerCase()}</option>`).join('');
  [['fTipo','tipo'],['fAct','act'],['fTam','tam']].forEach(([id,key]) =>
    $('#'+id).addEventListener('change', e => { state.filter[key] = e.target.value; onFilter(); }));
}

function onFilter(){
  const box = $('#results');
  if(!filterActive()){ box.hidden = true; refreshMarkers(); return; }
  const list = DB.filter(matches);
  if(state.filter.act) list.sort((a,b) => b.aptitudes[state.filter.act] - a.aptitudes[state.filter.act]);
  box.hidden = false;
  box.innerHTML = list.length
    ? `<b>${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}:</b>` +
      list.map(it => `<button class="chip" data-id="${it.id}">${it.nombre}${state.filter.act ? ' · ' + it.aptitudes[state.filter.act] + '%' : ''}</button>`).join('')
    : 'Ninguna propiedad cumple estos filtros. Prueba con otra actividad o tamaño.';
  box.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => selectItem(byId(c.dataset.id))));
  refreshMarkers();
}

/* ============================================================
   FICHA (compartida entre panel y comparación)
   ============================================================ */
const barRow = (label, v, color) =>
  `<div class="bar"><span>${label}</span><div class="track"><div class="fill" style="width:${v}%;background:${color}"></div></div><b>${v}</b></div>`;

function infoHTML(it){
  const seg = seguridad(it), [actK, actV] = mejorAct(it);
  const facts = it.tipo === 'casa'
    ? [['Precio', fmtUF(it.precio)], ['Precio por m² construido', nf.format(Math.round(precioM2(it)*100)/100) + ' UF'],
       ['Terreno', fmtM2(it.superficie)], ['Construido', fmtM2(it.construida)],
       ['Dormitorios / baños', `${it.dormitorios} / ${it.banos}`], ['Tipo de suelo', it.suelo]]
    : [['Precio', fmtUF(it.precio)], ['Precio por m²', nf.format(Math.round(precioM2(it)*1000)/1000) + ' UF'],
       ['Superficie', fmtM2(it.superficie)], ['Tipo de suelo', it.suelo]];
  return `
    <div class="hero">${imgTag(it)}</div>
    <div class="info">
      <h2>${it.nombre}</h2>
      <p class="loc">${it.comuna}, ${it.region}</p>
      <div class="facts">${facts.map(([k,v]) => `<div class="fact"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <div class="score">
        <div class="big" style="color:${secColor(seg)}">${seg}<small>de 100</small></div>
        <div><b>Índice de seguridad</b>
          <small>Riesgo promedio ${riesgoProm(it)}/100 · ${it.historial.length} desastres registrados</small>
          <small>Mejor uso: <b>${ACT[actK].label}</b> (${actV}%)</small></div>
      </div>
      ${it.alerta ? `<div class="alert ${it.alerta.nivel === 'bad' ? 'bad' : ''}">${it.alerta.texto}</div>` : ''}
      <p class="resumen">${it.resumen}</p>
      <h3>Intensidad de riesgo por amenaza</h3>
      ${Object.entries(it.riesgos).map(([k,v]) => barRow(RIESGOS[k].label, v, riskColor(v))).join('')}
      <h3>Aptitud según actividad</h3>
      ${Object.entries(it.aptitudes).map(([k,v]) => barRow(ACT[k].label, v, 'var(--accent)')).join('')}
    </div>`;
}

/* ============================================================
   FLUJO: seleccionar, comparar, historial
   ============================================================ */
function onMarkerClick(it){
  if(state.mode === 'pick'){
    if(it.id === state.first.id) return;
    if(it.tipo !== state.first.tipo){ shakeBanner(); return; }
    openCompare(state.first, it);
  } else selectItem(it);
}

function selectItem(it){
  state.selected = it;
  state.focus = it;
  $('#panelBody').innerHTML = infoHTML(it);
  $('#panelBody').scrollTop = 0;
  $('#btnCmp').textContent = it.tipo === 'casa' ? 'Comparar con otra casa' : 'Comparar con otro terreno';
  $('#panel').classList.add('open');
  document.body.classList.add('panel-open');
  layoutMap(); refreshMarkers();
}

function closePanel(){
  state.selected = null; state.focus = null;
  $('#panel').classList.remove('open');
  document.body.classList.remove('panel-open');
  layoutMap(); refreshMarkers();
}

function startPick(){
  state.first = state.selected;
  state.mode = 'pick';
  closePanel();
  state.selected = null;
  const t = state.first.tipo === 'casa' ? 'otra casa' : 'otro terreno';
  $('#bannerText').innerHTML = `Elige ${t} para comparar con <b>${state.first.nombre}</b>`;
  $('#banner').classList.add('show');
  refreshMarkers();
}

function cancelPick(){
  state.mode = null; state.first = null;
  $('#banner').classList.remove('show');
  refreshMarkers();
}
function shakeBanner(){
  const b = $('#banner'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  $('#bannerText').innerHTML = `Solo puedes comparar ${state.first.tipo === 'casa' ? 'casas con casas' : 'terrenos con terrenos'}.`;
}

/* ---------- pantalla de comparación ---------- */
function buildRows(a, b){
  const rows = [];
  const add = (q, va, vb, fmt, better) => {
    const w = va === vb ? null : ((better === 'low') === (va < vb) ? a : b);
    rows.push({q, w, ta:fmt(va), tb:fmt(vb)});
  };
  add('Menor historial de desastres', a.historial.length, b.historial.length, v => `${v} ${v === 1 ? 'evento' : 'eventos'}`, 'low');
  add('Menor intensidad de riesgo', riesgoProm(a), riesgoProm(b), v => `${v} / 100`, 'low');
  add('Menor precio', a.precio, b.precio, fmtUF, 'low');
  add(a.tipo === 'casa' ? 'Mejor precio por m² construido' : 'Mejor precio por m²', precioM2(a), precioM2(b),
      v => (Math.round(v*100)/100).toString().replace('.',',') + ' UF/m²', 'low');
  add('Mayor superficie', a.superficie, b.superficie, fmtM2, 'high');
  Object.entries(ACT).forEach(([k, v]) => add(`Mejor para ${v.para}`, a.aptitudes[k], b.aptitudes[k], x => x + '%', 'high'));
  return rows;
}

function openCompare(a, b){
  state.pair = [a, b];
  state.mode = null; state.first = null;
  $('#banner').classList.remove('show');
  const rows = buildRows(a, b);
  const winsA = rows.filter(r => r.w === a).length, winsB = rows.filter(r => r.w === b).length;
  $('#cmpTitle').textContent = `Comparando ${a.tipo === 'casa' ? 'casas' : 'terrenos'}`;
  $('#cmpGrid').innerHTML = `
    <article class="card A">${infoHTML(a)}</article>
    <div class="cmpcol">
      <h2>Comparativa</h2>
      <p><span class="name-tag" style="background:var(--A)"></span>${a.nombre} gana ${winsA} categorías ·
         <span class="name-tag" style="background:var(--B)"></span>${b.nombre} gana ${winsB}</p>
      ${rows.map(r => `
        <div class="row">
          <div class="q">${r.q}</div>
          <div class="w ${r.w ? (r.w === a ? 'A' : 'B') : 'tie'}">${r.w ? r.w.nombre : 'Empate'}</div>
          <div class="nums">
            <span class="A ${r.w === a ? 'win' : ''}">${a.corto}: ${r.ta}</span>
            <span class="B ${r.w === b ? 'win' : ''}">${b.corto}: ${r.tb}</span>
          </div>
        </div>`).join('')}
    </div>
    <article class="card B">${infoHTML(b)}</article>`;
  $('#compare').classList.add('open');
  $('#compare .body').scrollTop = 0;
  closePanel();
  refreshMarkers();
}
function closeCompare(){
  $('#compare').classList.remove('open');
  state.pair = null;
}

/* ---------- pantalla de historial ---------- */
function histCard(it, cls){
  const evs = [...it.historial].sort((a,b) => b.anio - a.anio);
  const [pk, pv] = peligroTop(it);
  const peor = [...it.historial].sort((a,b) => b.gravedad - a.gravedad)[0];
  const porTipo = {};
  it.historial.forEach(e => porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1);
  const desde = Math.min(...it.historial.map(e => e.anio));
  const cuenta = pk in porTipo ? porTipo[pk] : 0;
  return `
  <article class="hcard ${cls}">
    <h2>${it.nombre}</h2>
    <p class="loc">${it.comuna}, ${it.region}</p>
    <div class="hstats">
      <div class="fact"><span>Eventos desde ${desde}</span><b>${it.historial.length}</b></div>
      <div class="fact"><span>Riesgo promedio</span><b style="color:${riskColor(riesgoProm(it))}">${riesgoProm(it)}/100</b></div>
      <div class="fact"><span>Índice de seguridad</span><b style="color:${secColor(seguridad(it))}">${seguridad(it)}/100</b></div>
    </div>
    <div class="why"><b>Por qué se califica así:</b> la amenaza principal es ${RIESGOS[pk].label.toLowerCase()}
      (${pv}/100, nivel ${riskLevel(pv)}), con ${cuenta} ${cuenta === 1 ? 'evento registrado' : 'eventos registrados'} de ese tipo.
      El episodio más grave fue «${peor.titulo}» en ${peor.anio} (gravedad ${peor.gravedad} de 5).</div>
    <h3 style="font-size:15px;margin-bottom:8px">Desastres por tipo</h3>
    ${Object.entries(porTipo).map(([k,n]) => barRow(RIESGOS[k].label, n * 20, RIESGOS[k].color).replace(/<b>\d+<\/b>/, `<b>${n}</b>`)).join('')}
    <h3 style="font-size:15px;margin:18px 0 6px">Línea de tiempo</h3>
    <ul class="timeline">
      ${evs.map(e => `
        <li style="--c:${RIESGOS[e.tipo].color}">
          <div><span class="yr">${e.anio}</span> <span class="ev">${e.titulo}</span><span class="sev">Gravedad ${e.gravedad}/5</span></div>
          <p>${RIESGOS[e.tipo].label}. ${e.detalle}</p>
        </li>`).join('')}
    </ul>
  </article>`;
}

function openHistory(items, from){
  state.histFrom = from;
  const body = $('#histBody');
  if(items.length === 1){
    body.className = 'hist';
    $('#histTitle').textContent = 'Historial de desastres';
    body.innerHTML = histCard(items[0], 'S');
  } else {
    const [a, b] = items;
    body.className = 'hist two';
    $('#histTitle').textContent = 'Comparación de historiales';
    const menos = a.historial.length === b.historial.length ? null : (a.historial.length < b.historial.length ? a : b);
    const gr = it => Math.max(...it.historial.map(e => e.gravedad));
    const peorA = gr(a), peorB = gr(b);
    body.innerHTML = `
      <div class="hsummary" style="grid-column:1/-1">
        <h2>${menos ? `${menos.nombre} tiene menos desastres registrados` : 'Ambas tienen el mismo número de desastres'}</h2>
        ${a.nombre}: ${a.historial.length} eventos, el más grave de nivel ${peorA}/5 ·
        ${b.nombre}: ${b.historial.length} eventos, el más grave de nivel ${peorB}/5.
      </div>
      ${histCard(a, 'A')}${histCard(b, 'B')}`;
  }
  $('#history').classList.add('open');
  $('#history .body').scrollTop = 0;
}
function closeHistory(){ $('#history').classList.remove('open'); }

/* ============================================================
   EVENTOS
   ============================================================ */
$('#panelClose').addEventListener('click', closePanel);
$('#btnCmp').addEventListener('click', startPick);
$('#bannerCancel').addEventListener('click', cancelPick);
$('#btnHist').addEventListener('click', () => openHistory([state.selected], 'map'));
$('#cmpBack').addEventListener('click', closeCompare);
$('#btnCmpHist').addEventListener('click', () => openHistory(state.pair, 'compare'));
$('#histBack').addEventListener('click', closeHistory);

document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  if($('#history').classList.contains('open')) closeHistory();
  else if($('#compare').classList.contains('open')) closeCompare();
  else if(state.mode === 'pick') cancelPick();
  else if(state.selected) closePanel();
});

/* ============================================================
   INICIO
   ============================================================ */
buildMarkers();
initSearch();
layoutMap();
refreshMarkers();

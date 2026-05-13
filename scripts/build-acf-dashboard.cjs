#!/usr/bin/env node
// Build the ACF Backlog Dashboard HTML with embedded data
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'acf-dashboard-data.json');
const outFile = path.join(__dirname, '..', 'docs', 'acf-backlog.html');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const dataStr = JSON.stringify(data);

const today = new Date().toISOString().split('T')[0];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ACF Backlog Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f5f6fa;--bg2:#ffffff;--bg3:#e8eaf0;--bg4:#ffffff;
  --fg:#1a1a2e;--fg2:#5a5a7a;--accent:#2563eb;--accent2:#7b2ff7;
  --red:#dc2626;--orange:#ea580c;--yellow:#ca8a04;--green:#16a34a;--purple:#7c3aed;--blue:#2563eb;
  --row-hover:#f0f4ff;--modified:#fef9c3;--border:#e0e0e0;
  --tile-bg:#ffffff;--tile-hover:#f0f4ff;
  --transition:0.2s ease;
}
html{font-size:13px}
body{background:var(--bg);color:var(--fg);font-family:'Segoe UI',system-ui,-apple-system,sans-serif;line-height:1.5;min-height:100vh;display:flex;flex-direction:column}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}

.header{background:var(--bg2);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.header-left h1{font-size:1.4rem;font-weight:600;color:var(--fg)}
.header-left .subtitle{font-size:0.85rem;color:var(--fg2)}
.query-link{font-size:0.8rem;color:var(--accent);opacity:0.8}

.tiles{display:flex;gap:12px;padding:16px 24px;flex-wrap:wrap}
.tile{background:var(--tile-bg);border:1px solid var(--border);border-radius:10px;padding:14px 20px;min-width:110px;cursor:pointer;transition:var(--transition);user-select:none;flex:1;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.tile:hover{background:var(--tile-hover);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.tile.active{border-color:var(--accent);box-shadow:0 0 12px rgba(37,99,235,0.2)}
.tile .count{font-size:1.8rem;font-weight:700;line-height:1}
.tile .label{font-size:0.75rem;color:var(--fg2);margin-top:4px;white-space:nowrap}
.tile.total .count{color:var(--accent)}
.tile.green .count{color:var(--green)}
.tile.orange .count{color:var(--orange)}
.tile.red .count{color:var(--red)}
.tile.gray .count{color:#999}
.tile.blocked .count{color:var(--red)}
.tile.stale .count{color:var(--orange)}
.tile.overdue .count{color:var(--red)}
.tile.notarget .count{color:var(--yellow)}

.filters{display:flex;gap:12px;padding:8px 24px 12px;align-items:center;flex-wrap:wrap}
.search-box{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--fg);font-size:0.85rem;width:280px;outline:none;transition:var(--transition)}
.search-box:focus{border-color:var(--accent)}
.area-select{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--fg);font-size:0.85rem;outline:none;cursor:pointer;min-width:220px}
.filter-label{font-size:0.8rem;color:var(--fg2)}
.btn-small{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 14px;color:var(--fg);font-size:0.8rem;cursor:pointer;transition:var(--transition)}
.btn-small:hover{border-color:var(--accent);color:var(--accent)}

.table-wrap{flex:1;overflow-x:auto;padding:0 24px 24px}
table{width:100%;border-collapse:collapse;table-layout:auto}
thead{position:sticky;top:0;z-index:10}
thead th{background:var(--bg3);color:var(--fg2);font-weight:600;font-size:0.76rem;text-transform:uppercase;letter-spacing:0.5px;padding:10px 8px;text-align:left;border-bottom:2px solid var(--border);cursor:pointer;user-select:none;white-space:nowrap;transition:var(--transition)}
thead th:hover{color:var(--accent)}
thead th .sa{margin-left:4px;font-size:0.65rem;opacity:0.4}
thead th.sorted .sa{opacity:1;color:var(--accent)}
tbody tr{border-bottom:1px solid var(--border);transition:background var(--transition)}
tbody tr:hover{background:var(--row-hover)}
tbody tr.hid{display:none}
td{padding:7px 8px;font-size:0.82rem;vertical-align:middle;white-space:nowrap}
td.tc{white-space:normal;max-width:420px;min-width:220px;font-weight:500}
td.tw{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:help;position:relative}
td.tw .tw-full{display:none;position:absolute;left:0;top:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;z-index:20;white-space:normal;max-width:400px;min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,0.12);font-weight:400;color:var(--fg)}
td.tw:hover .tw-full{display:block}

.sb{padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:600;display:inline-block}
.sb.Active{background:rgba(37,99,235,0.1);color:var(--blue)}
.sb.Proposed{background:rgba(234,88,12,0.1);color:var(--orange)}
.sb.Blocked{background:rgba(220,38,38,0.1);color:var(--red)}
.sb.RollingOut{background:rgba(22,163,74,0.1);color:var(--green)}
.sb.Resolved{background:rgba(124,58,237,0.1);color:var(--purple)}
.sb.Closed{background:rgba(90,90,122,0.1);color:var(--fg2)}
.pb{font-weight:700;font-size:0.78rem}.pb.p1{color:var(--red)}.pb.p2{color:var(--orange)}.pb.p3{color:var(--fg2)}
.cb{padding:2px 7px;border-radius:4px;font-size:0.7rem;font-weight:600;display:inline-block}
.cb.Committed{background:rgba(22,163,74,0.1);color:var(--green)}
.cb.Targeted{background:rgba(202,138,4,0.15);color:var(--yellow)}
.cb.Cut{background:rgba(220,38,38,0.1);color:var(--red)}
.sd{width:12px;height:12px;border-radius:50%;display:inline-block;vertical-align:middle}
.sd.Green{background:var(--green)}.sd.Orange{background:var(--orange)}.sd.Red{background:var(--red)}.sd.Gray{background:#999}
.db{font-weight:600;font-size:0.78rem}.db.crit{color:var(--red)}.db.warn{color:var(--orange)}.db.ok{color:var(--fg2)}
.rt{padding:1px 6px;border-radius:3px;font-size:0.65rem;margin:1px 2px;display:inline-block;white-space:nowrap}
.rt.blocked{background:rgba(220,38,38,0.1);color:var(--red)}
.rt.stale{background:rgba(234,88,12,0.1);color:var(--orange)}
.rt.proposed{background:rgba(234,88,12,0.08);color:var(--orange)}
.rt.uncommitted{background:rgba(202,138,4,0.12);color:var(--yellow)}
.rt.shiproom{background:rgba(234,88,12,0.1);color:var(--orange)}
.rt.overdue{background:rgba(220,38,38,0.12);color:var(--red)}
.rt.no-target{background:rgba(202,138,4,0.12);color:var(--yellow)}
.dc{font-size:0.78rem}.dc.overdue{color:var(--red);font-weight:600}.dc.missing{color:var(--yellow);font-style:italic}

.uber-row{background:linear-gradient(to right,#eef1f8,#f5f6fa);font-weight:600;border-bottom:2px solid var(--border)}
.uber-row td{font-size:0.88rem;padding:10px 8px}
.uber-row:hover{background:linear-gradient(to right,#e4e8f4,#eef1f8)!important}
.child-row td{padding-top:5px;padding-bottom:5px}
.grandchild-row td{padding-top:4px;padding-bottom:4px;font-size:0.78rem;opacity:0.85}
.tree-indent{color:var(--fg2);margin-right:6px;font-family:'Cascadia Code','Consolas',monospace;font-size:0.8rem;opacity:0.5}
.toggle-btn{cursor:pointer;user-select:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;min-width:28px;border-radius:6px;background:#e3f2fd;border:1px solid #90caf9;font-size:20px;color:#1565c0;transition:var(--transition);line-height:1}
.toggle-btn:hover{background:#bbdefb;color:#0d47a1;border-color:#64b5f6}
.toggle-col{width:44px;min-width:44px;max-width:44px;text-align:center;padding:4px 8px!important}
.child-badge{background:rgba(37,99,235,0.1);color:var(--accent);padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:600;margin-left:8px;white-space:nowrap}
.type-badge{padding:1px 6px;border-radius:3px;font-size:0.68rem;font-weight:600;display:inline-block}
.type-badge.Feature{background:rgba(37,99,235,0.08);color:var(--blue)}
.type-badge.Epic{background:rgba(124,58,237,0.08);color:var(--purple)}
.type-badge.Task{background:rgba(90,90,122,0.08);color:var(--fg2)}

.footer{background:var(--bg2);border-top:1px solid var(--border);padding:12px 24px;text-align:center;font-size:0.75rem;color:var(--fg2)}
.ld{display:flex;align-items:center;justify-content:center;height:300px;font-size:1.1rem;color:var(--fg2)}
.ld .sp{width:24px;height:24px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin-right:12px}
@keyframes spin{to{transform:rotate(360deg)}}
.nr{text-align:center;padding:60px 20px;color:var(--fg2);font-size:1rem}

@media(max-width:1200px){.tiles{gap:8px}.tile{min-width:90px;padding:10px 12px}.tile .count{font-size:1.4rem}}
@media(max-width:768px){.tiles{flex-wrap:wrap}.tile{flex:0 0 calc(25% - 8px)}.filters{flex-direction:column;align-items:stretch}.search-box,.area-select{width:100%}}
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>ACF Backlog Dashboard</h1>
    <div class="subtitle">${today} &mdash; <a class="query-link" href="https://dev.azure.com/domoreexp/MSTeams/_queries/query/239121d6-6aa5-4221-9a30-fac1f6ea5d75" target="_blank">Open ADO Query &#8599;</a></div>
  </div>
</div>

<div class="tiles" id="tiles"></div>

<div class="filters">
  <span class="filter-label">&#128269;</span>
  <input type="text" class="search-box" id="searchBox" placeholder="Search title, owner, ID, tweet&#8230;" oninput="applyFilters()">
  <span class="filter-label">Area:</span>
  <select class="area-select" id="areaSelect" onchange="applyFilters()"><option value="">All Area Paths</option></select>
  <span class="filter-label">State:</span>
  <select class="area-select" id="stateSelect" onchange="applyFilters()"><option value="">All States</option></select>
  <button class="btn-small" onclick="clearAllFilters()">Clear Filters</button>
  <button class="btn-small" id="expandBtn" onclick="toggleAll()">Expand All</button>
</div>

<div class="table-wrap">
  <table id="tbl">
    <thead><tr id="hdr"></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  <div class="nr" id="nr" style="display:none">No items match current filters.</div>
</div>

<div class="footer"><span id="rowCount"></span> | Last updated: ${today} | Data from ADO query <a href="https://dev.azure.com/domoreexp/MSTeams/_queries/query/239121d6-6aa5-4221-9a30-fac1f6ea5d75" target="_blank">239121d6</a></div>

<script>
var DATA = ${dataStr};

var ADO = 'https://dev.azure.com/domoreexp/MSTeams/_workitems/edit/';

var COLS = [
  {k:'id',       l:'ID',           sort:1},
  {k:'type',     l:'Type',         sort:1},
  {k:'priority', l:'Pri',          sort:1},
  {k:'title',    l:'Title',        sort:1},
  {k:'state',    l:'State',        sort:1},
  {k:'shiproom', l:'Ship',         sort:1},
  {k:'committed',l:'Commit',       sort:1},
  {k:'statusTweet',l:'Status Tweet',sort:0},
  {k:'targetDate',l:'Target Date', sort:1},
  {k:'r4Date',   l:'R4 Date',      sort:1},
  {k:'assignedTo',l:'Owner',       sort:1},
  {k:'daysSinceUpdate',l:'Days',   sort:1},
  {k:'risks',    l:'Signals',      sort:1},
];

var itemMap = {};
var uberIds = [];
var childMap = {};
var expanded = {};
var activeTile = null;
var sortK = null, sortD = 1;

function buildTree() {
  itemMap = {};
  DATA.items.forEach(function(item) { itemMap[item.id] = item; });
  uberIds = [];
  childMap = {};
  var seenRoots = {}, seenChildren = {};
  DATA.relations.forEach(function(rel) {
    if (rel.source === 0 && !seenRoots[rel.target]) {
      seenRoots[rel.target] = true;
      uberIds.push(rel.target);
      if (!childMap[rel.target]) childMap[rel.target] = [];
    }
  });
  DATA.relations.forEach(function(rel) {
    if (rel.source !== 0) {
      if (!childMap[rel.source]) childMap[rel.source] = [];
      var key = rel.source + '-' + rel.target;
      if (!seenChildren[key]) {
        seenChildren[key] = true;
        childMap[rel.source].push(rel.target);
      }
    }
  });
  uberIds.forEach(function(id) { if (expanded[id] === undefined) expanded[id] = true; });
}

buildTree();

(function() {
  renderTiles();
  fillAreas();
  fillStates();
  renderHdr();
  renderRows();
})();

function gv(item, k) { return item[k]; }
function shipColor(item) { return gv(item, 'shiproom') || null; }
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function toggleUber(id) { expanded[id] = !expanded[id]; renderRows(); }
function toggleAll() {
  var allExp = uberIds.every(function(id) { return expanded[id]; });
  uberIds.forEach(function(id) { expanded[id] = !allExp; });
  // also toggle children
  Object.keys(childMap).forEach(function(k) { expanded[+k] = !allExp; });
  renderRows();
}
function updateToggleBtn() {
  var btn = document.getElementById('expandBtn');
  if (!btn) return;
  var allExp = uberIds.every(function(id) { return expanded[id]; });
  btn.textContent = allExp ? 'Collapse All' : 'Expand All';
}

function renderTiles() {
  var all = DATA.items;
  var feat = all.filter(function(x) { return x.type === 'Feature' || x.type === 'Epic'; });
  var defs = [
    {c:'total',   l:'Total',        n:all.length,                                                  f:'total'},
    {c:'green',   l:'\\u{1F7E2} Green',  n:feat.filter(function(x){return shipColor(x)==='Green'}).length, f:'green'},
    {c:'orange',  l:'\\u{1F7E0} Orange', n:feat.filter(function(x){return shipColor(x)==='Orange'}).length,f:'orange'},
    {c:'red',     l:'\\u{1F534} Red',    n:feat.filter(function(x){return shipColor(x)==='Red'}).length,   f:'red'},
    {c:'gray',    l:'\\u26AA No Ship',   n:feat.filter(function(x){return !shipColor(x)}).length,          f:'gray'},
    {c:'blocked', l:'Blocked',       n:all.filter(function(x){return gv(x,'state')==='Blocked'}).length,   f:'blocked'},
    {c:'stale',   l:'Stale (14d+)',  n:all.filter(function(x){return (gv(x,'risks')||'').includes('stale')}).length,  f:'stale'},
    {c:'notarget',l:'No Target',     n:feat.filter(function(x){return (gv(x,'risks')||'').includes('no-target')}).length, f:'notarget'},
    {c:'overdue', l:'Overdue',       n:all.filter(function(x){return (gv(x,'risks')||'').includes('overdue')}).length,    f:'overdue'},
  ];
  document.getElementById('tiles').innerHTML = defs.map(function(t) {
    return '<div class="tile ' + t.c + (activeTile === t.f ? ' active' : '') + '" onclick="tileClick(\\'' + t.f + '\\')">'
      + '<div class="count">' + t.n + '</div><div class="label">' + t.l + '</div></div>';
  }).join('');
}

function tileClick(f) { activeTile = activeTile === f ? null : f; renderTiles(); applyFilters(); }

function fillAreas() {
  var seen = {}, as = [];
  DATA.items.forEach(function(i) { if (i.areaPath && !seen[i.areaPath]) { seen[i.areaPath] = true; as.push(i.areaPath); } });
  as.sort();
  var sel = document.getElementById('areaSelect');
  as.forEach(function(a) { var o = document.createElement('option'); o.value = a; o.textContent = a.split('\\\\').pop(); sel.appendChild(o); });
}

function fillStates() {
  var seen = {}, ss = [];
  DATA.items.forEach(function(i) { if (i.state && !seen[i.state]) { seen[i.state] = true; ss.push(i.state); } });
  ss.sort();
  var sel = document.getElementById('stateSelect');
  ss.forEach(function(s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
}

function itemMatchesFilter(item) {
  var srch = document.getElementById('searchBox').value.toLowerCase();
  var area = document.getElementById('areaSelect').value;
  var st = document.getElementById('stateSelect').value;
  var ok = true;
  if (ok && activeTile) ok = passTile(item);
  if (ok && area) ok = (gv(item, 'areaPath') || '') === area;
  if (ok && st) ok = (gv(item, 'state') || '') === st;
  if (ok && srch) {
    var h = [gv(item,'title'), gv(item,'assignedTo'), String(item.id), gv(item,'statusTweet'), gv(item,'type'), gv(item,'tags')].join(' ').toLowerCase();
    ok = h.includes(srch);
  }
  return ok;
}

function applyFilters() {
  var vis = 0;
  var hasFilter = activeTile !== null || document.getElementById('searchBox').value.trim() !== '' || document.getElementById('areaSelect').value !== '' || document.getElementById('stateSelect').value !== '';
  uberIds.forEach(function(uberId) {
    var uberItem = itemMap[uberId];
    var allDescendants = getAllDescendants(uberId);
    var uberMatch = uberItem ? itemMatchesFilter(uberItem) : false;
    var anyDescMatch = allDescendants.some(function(did) { var di = itemMap[did]; return di && itemMatchesFilter(di); });
    var showUber = !hasFilter || (uberMatch || anyDescMatch);
    var uberRow = document.querySelector('tr[data-uber="' + uberId + '"]');
    if (uberRow) { uberRow.classList.toggle('hid', !showUber); if (showUber) vis++; }
    allDescendants.forEach(function(did) {
      var rows = document.querySelectorAll('tr[data-id="' + did + '"]');
      rows.forEach(function(row) {
        var parentId = +row.dataset.parent;
        var childVisible = false;
        if (showUber && expanded[parentId]) {
          if (!hasFilter || uberMatch) childVisible = true;
          else childVisible = itemMatchesFilter(itemMap[did]);
        }
        row.classList.toggle('hid', !childVisible);
        if (childVisible) vis++;
      });
    });
  });
  document.getElementById('nr').style.display = vis ? 'none' : '';
}

function getAllDescendants(id) {
  var result = [];
  var children = childMap[id] || [];
  children.forEach(function(cid) {
    result.push(cid);
    result = result.concat(getAllDescendants(cid));
  });
  return result;
}

function passTile(item) {
  if (!activeTile) return true;
  var feat = item.type === 'Feature' || item.type === 'Epic';
  switch(activeTile) {
    case 'total': return true;
    case 'green': return feat && shipColor(item) === 'Green';
    case 'orange': return feat && shipColor(item) === 'Orange';
    case 'red': return feat && shipColor(item) === 'Red';
    case 'gray': return feat && !shipColor(item);
    case 'blocked': return gv(item, 'state') === 'Blocked';
    case 'stale': return (gv(item, 'risks') || '').includes('stale');
    case 'notarget': return feat && (gv(item, 'risks') || '').includes('no-target');
    case 'overdue': return (gv(item, 'risks') || '').includes('overdue');
  }
  return true;
}

function clearAllFilters() {
  activeTile = null;
  document.getElementById('searchBox').value = '';
  document.getElementById('areaSelect').value = '';
  document.getElementById('stateSelect').value = '';
  renderTiles(); applyFilters();
}

function renderHdr() {
  var toggleTh = '<th class="toggle-col"></th>';
  document.getElementById('hdr').innerHTML = toggleTh + COLS.map(function(c) {
    var cls = sortK === c.k ? ' sorted' : '';
    var arrow = c.sort ? '<span class="sa">' + (sortK === c.k ? (sortD === 1 ? '\\u25B2' : '\\u25BC') : '\\u21C5') + '</span>' : '';
    return '<th class="' + cls + '"' + (c.sort ? ' onclick="doSort(\\'' + c.k + '\\')"' : '') + '>' + c.l + arrow + '</th>';
  }).join('');
}

function doSort(k) {
  if (sortK === k) sortD *= -1; else { sortK = k; sortD = 1; }
  renderHdr();
  uberIds.sort(function(a, b) { return cmpItems(itemMap[a], itemMap[b], k); });
  Object.keys(childMap).forEach(function(uid) {
    childMap[uid].sort(function(a, b) { return cmpItems(itemMap[a], itemMap[b], k); });
  });
  renderRows();
}

function cmpItems(a, b, k) {
  if (!a || !b) return 0;
  var va = gv(a, k), vb = gv(b, k);
  if (va == null) va = ''; if (vb == null) vb = '';
  if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sortD;
  return String(va).localeCompare(String(vb), undefined, {numeric: true}) * sortD;
}

function renderRows() {
  var tb = document.getElementById('tbody');
  tb.innerHTML = '';
  uberIds.forEach(function(uberId) {
    var uber = itemMap[uberId];
    if (!uber) return;
    var children = (childMap[uberId] || []).map(function(cid) { return itemMap[cid]; }).filter(Boolean);
    var totalDesc = getAllDescendants(uberId).length;
    tb.appendChild(mkUberRow(uber, totalDesc));
    if (expanded[uberId]) {
      children.forEach(function(child, idx) {
        var grandchildren = (childMap[child.id] || []).map(function(gcid) { return itemMap[gcid]; }).filter(Boolean);
        tb.appendChild(mkChildRow(child, uberId, idx === children.length - 1 && grandchildren.length === 0, grandchildren.length));
        if (expanded[child.id]) {
          grandchildren.forEach(function(gc, gidx) {
            tb.appendChild(mkGrandchildRow(gc, child.id, gidx === grandchildren.length - 1));
          });
        }
      });
    }
  });
  applyFilters();
  updateToggleBtn();
  var rc = document.getElementById('rowCount');
  if (rc) rc.textContent = DATA.items.length + ' items';
}

function mkUberRow(item, childCount) {
  var tr = document.createElement('tr');
  tr.dataset.uber = item.id;
  tr.dataset.id = item.id;
  tr.className = 'uber-row';
  var isExp = expanded[item.id];
  var toggleTd = document.createElement('td');
  toggleTd.className = 'toggle-col';
  if (childCount > 0) {
    toggleTd.innerHTML = '<span class="toggle-btn" onclick="event.stopPropagation();toggleUber(' + item.id + ')">' + (isExp ? '\\u25BC' : '\\u25B6') + '</span>';
  }
  tr.appendChild(toggleTd);
  COLS.forEach(function(col) {
    var td = document.createElement('td');
    if (col.k === 'title') {
      td.classList.add('tc');
      var badge = childCount > 0 ? '<span class="child-badge">' + childCount + ' item' + (childCount !== 1 ? 's' : '') + '</span>' : '';
      td.innerHTML = cell(item, col) + badge;
    } else {
      td.innerHTML = cell(item, col);
      if (col.k === 'statusTweet') td.classList.add('tw');
    }
    tr.appendChild(td);
  });
  if (childCount > 0) {
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', function(e) {
      if (!e.target.closest('.toggle-btn') && !e.target.closest('a')) toggleUber(item.id);
    });
  }
  return tr;
}

function mkChildRow(item, parentId, isLast, grandchildCount) {
  var tr = document.createElement('tr');
  tr.dataset.id = item.id;
  tr.dataset.parent = parentId;
  tr.className = 'child-row';
  var toggleTd = document.createElement('td');
  toggleTd.className = 'toggle-col';
  if (grandchildCount > 0) {
    if (expanded[item.id] === undefined) expanded[item.id] = false;
    toggleTd.innerHTML = '<span class="toggle-btn" style="width:22px;height:22px;font-size:14px" onclick="event.stopPropagation();toggleUber(' + item.id + ')">' + (expanded[item.id] ? '\\u25BC' : '\\u25B6') + '</span>';
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', function(e) {
      if (!e.target.closest('.toggle-btn') && !e.target.closest('a')) toggleUber(item.id);
    });
  }
  tr.appendChild(toggleTd);
  COLS.forEach(function(col) {
    var td = document.createElement('td');
    if (col.k === 'title') {
      td.classList.add('tc');
      var connector = isLast ? '\\u2514\\u2500' : '\\u251C\\u2500';
      var badge = grandchildCount > 0 ? '<span class="child-badge">' + grandchildCount + '</span>' : '';
      td.innerHTML = '<span class="tree-indent">' + connector + '</span>' + cell(item, col) + badge;
    } else {
      td.innerHTML = cell(item, col);
      if (col.k === 'statusTweet') td.classList.add('tw');
    }
    tr.appendChild(td);
  });
  return tr;
}

function mkGrandchildRow(item, parentId, isLast) {
  var tr = document.createElement('tr');
  tr.dataset.id = item.id;
  tr.dataset.parent = parentId;
  tr.className = 'grandchild-row';
  var emptyTd = document.createElement('td');
  emptyTd.className = 'toggle-col';
  tr.appendChild(emptyTd);
  COLS.forEach(function(col) {
    var td = document.createElement('td');
    if (col.k === 'title') {
      td.classList.add('tc');
      var connector = isLast ? '\\u2514\\u2500' : '\\u251C\\u2500';
      td.innerHTML = '<span class="tree-indent">&nbsp;&nbsp;&nbsp;' + connector + '</span>' + cell(item, col);
    } else {
      td.innerHTML = cell(item, col);
      if (col.k === 'statusTweet') td.classList.add('tw');
    }
    tr.appendChild(td);
  });
  return tr;
}

function cell(item, col) {
  var v = gv(item, col.k);
  switch(col.k) {
    case 'id': return '<a href="' + ADO + item.id + '" target="_blank" title="Open in ADO">' + item.id + '</a>';
    case 'title': return esc(v || '');
    case 'type': return '<span class="type-badge ' + (v || '') + '">' + esc(v || '') + '</span>';
    case 'state': return '<span class="sb ' + (v || '') + '">' + (v || '\\u2014') + '</span>';
    case 'priority': {
      var c = v == 1 ? 'p1' : v == 2 ? 'p2' : 'p3';
      return '<span class="pb ' + c + '">P' + (v || '?') + '</span>';
    }
    case 'committed': {
      var c2 = (v || '').replace(/\\s/g, '');
      return '<span class="cb ' + c2 + '">' + (v || '\\u2014') + '</span>';
    }
    case 'shiproom': return v ? '<span class="sd ' + v + '" title="' + v + '"></span>' : '\\u2014';
    case 'assignedTo': return esc(v || '\\u2014');
    case 'targetDate': case 'r4Date': {
      var cls = 'dc';
      if (!v) cls += ' missing';
      else if (new Date(v) < new Date()) cls += ' overdue';
      var txt = v || '\\u2014';
      return '<span class="' + cls + '">' + txt + '</span>';
    }
    case 'daysSinceUpdate': {
      var d = v || 0;
      var c3 = d >= 14 ? 'crit' : d >= 7 ? 'warn' : 'ok';
      return '<span class="db ' + c3 + '">' + d + 'd</span>';
    }
    case 'statusTweet': {
      var raw = v || '';
      var short = esc(raw.length > 60 ? raw.slice(0, 60) + '\\u2026' : raw) || '\\u2014';
      var full = raw ? '<div class="tw-full">' + esc(raw) + '</div>' : '';
      return short + full;
    }
    case 'risks': {
      var r = v || '';
      if (!r) return '<span style="opacity:.4">\\u2014</span>';
      return r.split(',').filter(Boolean).map(function(t) { return '<span class="rt ' + t + '">' + t + '</span>'; }).join(' ');
    }
  }
  return esc(String(v != null ? v : ''));
}
</script>
</body>
</html>`;

fs.writeFileSync(outFile, html);
console.log('Dashboard written to ' + outFile + ' (' + html.length + ' bytes)');

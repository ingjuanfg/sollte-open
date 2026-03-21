(function () {
  'use strict';

  var data = window.SOLLTE_DATA;
  if (!data) return;

  var workoutsList = document.getElementById('workouts-list');
  var workoutDetailArea = document.getElementById('workout-detail-area');
  var workoutDetailContent = document.getElementById('workout-detail-content');
  var backToList = document.getElementById('back-to-list');
  var leaderboardBody = document.getElementById('leaderboard-body');
  var tableWrap = document.querySelector('.leaderboard-table-wrap');

  var currentGenero = 'mujeres';
  var currentCategoria = 'scaled';
  var resultsBasePath26_1 = 'resultados/26.1';
  var resultsBasePath26_2 = 'resultados/26.2';
  var resultsBasePath26_3 = 'resultados/26.3';

  function normalizeName(n) {
    return (n || '').trim().toLowerCase();
  }

  function renderWorkoutsList() {
    workoutsList.innerHTML = '';
    data.workouts.forEach(function (w) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'workout-item';
      btn.textContent = w.name;
      btn.setAttribute('data-id', w.id);
      btn.addEventListener('click', function () { openWorkoutDetail(w.id); });
      li.appendChild(btn);
      workoutsList.appendChild(li);
    });
  }

  function openWorkoutDetail(id) {
    var w = data.workouts.find(function (x) { return x.id === id; });
    if (!w) return;
    workoutDetailContent.innerHTML =
      '<h3>' + escapeHtml(w.name) + '</h3>' +
      (w.description ? '<p class="description">' + escapeHtml(w.description) + '</p>' : '') +
      (w.standards ? '<p class="standards">' + escapeHtml(w.standards) + '</p>' : '');
    workoutDetailArea.classList.remove('hidden');
  }

  function closeWorkoutDetail() {
    workoutDetailArea.classList.add('hidden');
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function parseCSV26_1(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length < 2) continue;
      var nombre = parts[0].trim();
      if (!nombre) continue;
      var w261 = parts[1].trim();
      var w262 = parts[2] ? parts[2].trim() : '';
      var w263 = parts[3] ? parts[3].trim() : '';
      var reps261 = w261 === '' ? 0 : parseInt(w261, 10);
      if (isNaN(reps261)) reps261 = 0;
      rows.push({
        nombre: nombre,
        w261: w261,
        w262: w262,
        w263: w263,
        reps261: reps261
      });
    }
    return rows;
  }

  function parseCSV26_2(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var map = {};
    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length < 2) continue;
      var nombre = parts[0].trim();
      if (!nombre) continue;
      var w262Reps = parts[1] ? parts[1].trim() : '';
      var w262Tiempo = parts[2] ? parts[2].trim() : '';
      var w262Prog = parts[3] ? parts[3].trim() : '';
      var w263 = parts[4] ? parts[4].trim() : '';
      var puntos262 = parts[5] ? parts[5].trim() : '';
      var p = puntos262 === '' ? 0 : parseInt(puntos262, 10);
      if (isNaN(p)) p = 0;
      map[normalizeName(nombre)] = {
        nombre: nombre,
        w262Reps: w262Reps,
        w262Tiempo: w262Tiempo,
        w262Prog: w262Prog,
        w263: w263,
        puntos262: p
      };
    }
    return map;
  }

  function parseCSV26_3(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return {};
    var map = {};
    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length < 2) continue;
      var nombre = parts[0].trim();
      if (!nombre) continue;
      var reps = parts[1] ? parseInt(parts[1].trim(), 10) : 0;
      if (isNaN(reps)) reps = 0;
      map[normalizeName(nombre)] = { nombre: nombre, reps263: reps };
    }
    return map;
  }

  function assignPoints26_3(rows) {
    var withReps = rows.filter(function (r) { return (r.reps263 || 0) > 0; });
    var without = rows.filter(function (r) { return (r.reps263 || 0) === 0; });
    withReps.sort(function (a, b) { return b.reps263 - a.reps263; });
    withReps.forEach(function (r, i) { r.puntos263 = i + 1; });
    var lastRank = withReps.length + 1;
    without.forEach(function (r) { r.puntos263 = lastRank; });
  }

  function sortAndAssignPoints26_1(rows) {
    var withReps = rows.filter(function (r) { return (r.reps261 || 0) > 0; });
    var without = rows.filter(function (r) { return (r.reps261 || 0) === 0; });
    withReps.sort(function (a, b) { return b.reps261 - a.reps261; });
    withReps.forEach(function (r, i) { r.puntos261 = i + 1; });
    var lastRank = withReps.length + 1;
    without.forEach(function (r) { r.puntos261 = lastRank; });
    return withReps.concat(without);
  }

  function cell(val) {
    return (val === '' || val == null) ? '—' : escapeHtml(String(val));
  }

  /** Desempate manual solo Hombres RX (mismo puntaje total y mismo 26.3). */
  function hombresRxTiebreaker(a, b) {
    if (currentGenero !== 'hombres' || currentCategoria !== 'rx') return 0;
    var na = normalizeName(a.nombre);
    var nb = normalizeName(b.nombre);
    var pairs = [
      ['mauricio salazar', 'daniel mesa'],
      ['brian hincapie', 'stiben ledesma']
    ];
    for (var i = 0; i < pairs.length; i++) {
      var first = pairs[i][0];
      var second = pairs[i][1];
      if (na === first && nb === second) return -1;
      if (na === second && nb === first) return 1;
    }
    return 0;
  }

  function loadAndRenderLeaderboard() {
    var cacheBust = '?v=' + Date.now();
    var generoCap = currentGenero === 'hombres' ? 'Hombres' : 'Mujeres';
    var catCap = currentCategoria === 'rx' ? 'RX' : 'Scaled';
    var filename26_1 = currentGenero + '-' + currentCategoria + '-envigado.csv';
    var url26_1 = resultsBasePath26_1 + '/envigado/' + filename26_1 + cacheBust;
    var filename26_2 = '26.2-' + generoCap + '-' + catCap + '-Envigado.csv';
    var url26_2 = resultsBasePath26_2 + '/envigado/' + filename26_2 + cacheBust;
    var filename26_3 = '26.3-' + generoCap + '-' + catCap + '-Envigado.csv';
    var url26_3 = resultsBasePath26_3 + '/envigado/' + filename26_3 + cacheBust;

    leaderboardBody.innerHTML = '';
    tableWrap.classList.add('empty');

    Promise.all([
      fetch(url26_1).then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('26.1')); }),
      fetch(url26_2).then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('26.2')); }),
      fetch(url26_3).then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('26.3')); })
    ])
      .then(function (texts) {
        var rows = parseCSV26_1(texts[0]);
        rows = sortAndAssignPoints26_1(rows);
        var map26_2 = parseCSV26_2(texts[1]);
        var map26_3 = parseCSV26_3(texts[2]);

        var alias26_2 = { 'juan bernardo orozco': 'juan bernardo' };
        function find26_2(map, key) {
          return map[key] || (alias26_2[key] && map[alias26_2[key]]);
        }
        var byName = {};
        rows.forEach(function (r) {
          var key = normalizeName(r.nombre);
          byName[key] = r;
          r.w262Reps = '';
          r.w262Tiempo = '';
          r.w262Prog = '';
          r.puntos262 = 0;
          r.reps263 = 0;
          var d = find26_2(map26_2, key);
          if (d) {
            r.w262Reps = d.w262Reps;
            r.w262Tiempo = d.w262Tiempo;
            r.w262Prog = d.w262Prog;
            r.puntos262 = d.puntos262;
          }
          var d3 = map26_3[key];
          if (d3) {
            r.reps263 = d3.reps263;
          }
        });

        var maxP261 = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.puntos261 || 0; })) : 0;

        Object.keys(map26_2).forEach(function (key) {
          var alreadyMerged = Object.keys(alias26_2).some(function (k) { return alias26_2[k] === key && byName[k]; });
          if (!byName[key] && !alreadyMerged) {
            var d = map26_2[key];
            var d3 = map26_3[key];
            byName[key] = {
              nombre: d.nombre,
              w261: '',
              reps261: 0,
              puntos261: maxP261 + 1,
              w262Reps: d.w262Reps,
              w262Tiempo: d.w262Tiempo,
              w262Prog: d.w262Prog,
              puntos262: d.puntos262,
              reps263: d3 ? d3.reps263 : 0
            };
            rows.push(byName[key]);
          }
        });

        Object.keys(map26_3).forEach(function (key) {
          if (!byName[key]) {
            var d3 = map26_3[key];
            byName[key] = {
              nombre: d3.nombre,
              w261: '',
              reps261: 0,
              puntos261: maxP261 + 1,
              w262Reps: '',
              w262Tiempo: '',
              w262Prog: '',
              puntos262: 0,
              reps263: d3.reps263
            };
            rows.push(byName[key]);
          }
        });

        assignPoints26_3(rows);

        rows.forEach(function (r) {
          r.puntos = (r.puntos261 || 0) + (r.puntos262 || 0) + (r.puntos263 || 0);
        });
        rows.sort(function (a, b) {
          if (a.puntos !== b.puntos) return a.puntos - b.puntos;
          var manual = hombresRxTiebreaker(a, b);
          if (manual !== 0) return manual;
          return (a.puntos263 || 0) - (b.puntos263 || 0);
        });
        rows.forEach(function (r, i) {
          r.posicion = i + 1;
        });

        tableWrap.classList.remove('empty');
        rows.forEach(function (r) {
          var sum26_1 = r.puntos261 ? r.puntos261 + 'º' : '—';
          var sum26_2 = (r.puntos262 && r.puntos262 !== 0) ? r.puntos262 + 'º' : '—';
          var sum26_3 = r.puntos263 != null ? r.puntos263 + 'º' : '—';
          var det26_1 = 'Repeticiones: ' + (r.w261 ? r.w261 : '—');
          var det26_2 = 'Tiempo: ' + (r.w262Tiempo || '—') + ' · Reps: ' + (r.w262Reps || '—') + ' · Progresión: ' + (r.w262Prog || '—');
          var det26_3 = 'Repeticiones: ' + (r.reps263 > 0 ? r.reps263 : '—');
          var rankClass = r.posicion === 1 ? 'leaderboard-row rank-gold' : r.posicion === 2 ? 'leaderboard-row rank-silver' : r.posicion === 3 ? 'leaderboard-row rank-bronze' : 'leaderboard-row';
          var posDisplay = r.posicion === 1 ? '1 🥇' : r.posicion === 2 ? '2 🥈' : r.posicion === 3 ? '3 🥉' : String(r.posicion);
          var tr = document.createElement('tr');
          tr.className = rankClass;
          tr.setAttribute('role', 'button');
          tr.setAttribute('tabindex', '0');
          tr.setAttribute('aria-expanded', 'false');
          tr.innerHTML =
            '<td class="rank">' + escapeHtml(posDisplay) + '</td>' +
            '<td class="col-nombre"><span class="col-nombre-inner"><span class="nombre-text">' + escapeHtml(r.nombre) + '</span><span class="row-expand-icon" aria-hidden="true">▼</span></span></td>' +
            '<td class="col-puntos">' + escapeHtml(String(r.puntos)) + '</td>' +
            '<td class="col-wod">' + escapeHtml(sum26_1) + '</td>' +
            '<td class="col-wod">' + escapeHtml(sum26_2) + '</td>' +
            '<td class="col-wod">' + escapeHtml(sum26_3) + '</td>';
          leaderboardBody.appendChild(tr);
          var trDetail = document.createElement('tr');
          trDetail.className = 'leaderboard-detail';
          trDetail.innerHTML =
            '<td colspan="6" class="leaderboard-detail-cell">' +
            '<div class="leaderboard-detail-inner">' +
            '<div class="wod-detail"><strong>26.1</strong> — ' + escapeHtml(det26_1) + '</div>' +
            '<div class="wod-detail"><strong>26.2</strong> — ' + escapeHtml(det26_2) + '</div>' +
            '<div class="wod-detail"><strong>26.3</strong> — ' + escapeHtml(det26_3) + '</div>' +
            '</div></td>';
          leaderboardBody.appendChild(trDetail);
          tr.addEventListener('click', function () {
            var open = trDetail.classList.toggle('open');
            tr.classList.toggle('open', open);
            tr.setAttribute('aria-expanded', open ? 'true' : 'false');
          });
          tr.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tr.click();
            }
          });
        });
      })
      .catch(function () {
        tableWrap.classList.add('empty');
      });
  }

  function setActiveFilter(selector, value) {
    document.querySelectorAll(selector).forEach(function (btn) {
      var isActive = btn.getAttribute(btn.hasAttribute('data-genero') ? 'data-genero' : 'data-categoria') === value;
      btn.classList.toggle('active', isActive);
    });
  }

  document.querySelectorAll('.filter-btn[data-genero]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentGenero = btn.getAttribute('data-genero');
      setActiveFilter('.filter-btn[data-genero]', currentGenero);
      loadAndRenderLeaderboard();
    });
  });

  document.querySelectorAll('.filter-btn[data-categoria]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentCategoria = btn.getAttribute('data-categoria');
      setActiveFilter('.filter-btn[data-categoria]', currentCategoria);
      loadAndRenderLeaderboard();
    });
  });

  backToList.addEventListener('click', closeWorkoutDetail);

  renderWorkoutsList();
  loadAndRenderLeaderboard();
})();

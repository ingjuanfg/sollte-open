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
  var currentLocation = 'envigado';
  var resultsBasePath = 'resultados/26.1';

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

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(',');
      if (parts.length < 2) continue;
      var nombre = parts[0].trim();
      var w261 = parts[1].trim();
      var w262 = parts[2] ? parts[2].trim() : '';
      var w263 = parts[3] ? parts[3].trim() : '';
      var reps261 = w261 === '' ? 0 : parseInt(w261, 10);
      if (isNaN(reps261)) reps261 = 0;
      rows.push({
        nombre: nombre,
        puntos: 0,
        w261: w261,
        w262: w262,
        w263: w263,
        reps261: reps261
      });
    }
    return rows;
  }

  function sortAndAssignPoints(rows) {
    rows.sort(function (a, b) {
      return b.reps261 - a.reps261;
    });
    rows.forEach(function (r, i) {
      r.posicion = i + 1;
      r.puntos = i + 1;
    });
    return rows;
  }

  function loadAndRenderLeaderboard() {
    var filename = currentGenero + '-' + currentCategoria + '-' + currentLocation + '.csv';
    var url = resultsBasePath + '/' + filename;
    leaderboardBody.innerHTML = '';
    tableWrap.classList.add('empty');

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudo cargar');
        return res.text();
      })
      .then(function (text) {
        var rows = parseCSV(text);
        rows = sortAndAssignPoints(rows);
        tableWrap.classList.remove('empty');
        rows.forEach(function (r) {
          var tr = document.createElement('tr');
          var posDisplay = r.posicion === 1 ? '1 🥇' : r.posicion === 2 ? '2 🥈' : r.posicion === 3 ? '3 🥉' : String(r.posicion);
          var w261Display = r.w261 === '' ? '—' : r.w261 + ' Reps';
          var w262Display = r.w262 === '' ? '—' : r.w262;
          var w263Display = r.w263 === '' ? '—' : r.w263;
          tr.innerHTML =
            '<td class="rank">' + escapeHtml(posDisplay) + '</td>' +
            '<td>' + escapeHtml(r.nombre) + '</td>' +
            '<td>' + escapeHtml(String(r.puntos)) + '</td>' +
            '<td>' + escapeHtml(w261Display) + '</td>' +
            '<td>' + escapeHtml(w262Display) + '</td>' +
            '<td>' + escapeHtml(w263Display) + '</td>';
          leaderboardBody.appendChild(tr);
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

  document.querySelectorAll('.leaderboard-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      currentLocation = tab.getAttribute('data-location');
      document.querySelectorAll('.leaderboard-tabs .tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      loadAndRenderLeaderboard();
    });
  });

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

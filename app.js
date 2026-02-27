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
    div.textContent = text;
    return div.innerHTML;
  }

  function renderLeaderboard(location) {
    var rows = data.leaderboard[location] || [];
    leaderboardBody.innerHTML = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="rank">' + escapeHtml(String(r.posicion != null ? r.posicion : r.rank)) + '</td>' +
        '<td>' + escapeHtml(r.nombre || r.name || '') + '</td>' +
        '<td>' + escapeHtml(String(r.puntos != null ? r.puntos : r.points || '')) + '</td>';
      leaderboardBody.appendChild(tr);
    });
    tableWrap.classList.toggle('empty', rows.length === 0);
  }

  document.querySelectorAll('.leaderboard-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.leaderboard-tabs .tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderLeaderboard(tab.getAttribute('data-location'));
    });
  });

  backToList.addEventListener('click', closeWorkoutDetail);

  renderWorkoutsList();
  renderLeaderboard('belmonte');
})();

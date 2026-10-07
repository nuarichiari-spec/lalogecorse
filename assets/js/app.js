/* La Loge Corse — La Table des 13. Toutes les données sont dans /data (modifiables sans toucher au code). */
(function () {
  var MOIS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  var JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var CLUB = { pfc: 'Paris FC', sf: 'Stade Français' };
  var MAIL = 'jeromebrigato@lalogecorse.fr';
  var $ = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function pressed(btns, on) { btns.forEach(function (b) { b.setAttribute('aria-pressed', on(b) ? 'true' : 'false'); }); }

  /* ---------- Matchs : bandeau, compte à rebours, parcours d'inscription ---------- */
  function dateLabel(m) {
    var d = new Date(m.date + 'T12:00:00');
    return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + ' · ' + (m.heure || 'horaire à confirmer');
  }
  function compLabel(m) { return m.club === 'pfc' ? 'Ligue 1 · ' + m.comp : m.comp; }

  get('data/matchs.json').then(function (matchs) {
    if (!matchs || !matchs.length) {
      var l = $('#mlist');
      if (l) {
        l.innerHTML = '<div class="empty-state"><strong>Le calendrier est temporairement indisponible.</strong><span>Les prochaines dates seront affichées dès qu’elles seront confirmées.</span></div>';
      }
      return;
    }
    matchs.forEach(function (m, i) { m.id = i; });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var next = matchs.filter(function (m) { return new Date(m.date + 'T12:00:00') >= today; })[0] || matchs[matchs.length - 1];
    var diff = Math.round((new Date(next.date + 'T12:00:00') - today) / 864e5);
    var vals = { countdown: diff <= 0 ? 'Aujourd’hui' : 'J-' + diff, club: CLUB[next.club], opp: next.adversaire, date: dateLabel(next) };
    all('[data-next]').forEach(function (n) { n.textContent = vals[n.getAttribute('data-next')]; });

    var state = { club: 'all', pick: next.id, guests: 4 };
    var list = $('#mlist'), guestsBox = $('#guests');
    [1, 2, 3, 4, 5, 6].forEach(function (n) {
      var b = el('button', null, String(n)); b.type = 'button'; b.setAttribute('aria-label', n + (n > 1 ? ' invités' : ' invité'));
      b.addEventListener('click', function () { state.guests = n; ticket(); });
      guestsBox.appendChild(b);
    });
    function ticket() {
      var m = matchs[state.pick], g = state.guests;
      $('#t-comp').textContent = compLabel(m); $('#t-club').textContent = CLUB[m.club]; $('#t-opp').textContent = m.adversaire; $('#t-date').textContent = dateLabel(m);
      var gl = g + (g > 1 ? ' invités' : ' invité');
      $('#t-line').textContent = gl + ' · ' + CLUB[m.club] + ' vs ' + m.adversaire + ' · ' + dateLabel(m);
      var body = 'Bonjour,\n\nJe souhaite inscrire ' + gl + ' pour le match : ' + CLUB[m.club] + ' vs ' + m.adversaire + ', ' + dateLabel(m) + '.\n\nSociété :\nNom et prénom :\nE-mail :\nTéléphone :\n\nInvités (nom, prénom, e-mail, téléphone) :\n';
      $('#t-send').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Invités ' + CLUB[m.club] + ' vs ' + m.adversaire) + '&body=' + encodeURIComponent(body);
      pressed(all('#guests button'), function (b) { return b.textContent === String(g); });
      pressed(all('#mlist .match'), function (b) { return b.getAttribute('data-id') === String(m.id); });
    }
    function renderList() {
      list.textContent = '';
      matchs.filter(function (m) { return state.club === 'all' || m.club === state.club; }).forEach(function (m) {
        var d = new Date(m.date + 'T12:00:00');
        var b = el('button', 'match'); b.type = 'button'; b.setAttribute('data-id', m.id);
        var dt = el('span', 'dt'); dt.appendChild(el('b', null, String(d.getDate()))); dt.appendChild(el('span', null, MOIS[d.getMonth()]));
        var tt = el('span', 'tt'); tt.appendChild(el('span', null, CLUB[m.club] + ' vs ' + m.adversaire)); tt.appendChild(el('small', null, compLabel(m)));
        b.appendChild(dt); b.appendChild(tt); b.appendChild(el('span', 'dot ' + m.club));
        b.addEventListener('click', function () { state.pick = m.id; ticket(); });
        list.appendChild(b);
      });
      ticket();
    }
    all('#ctabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.club = b.getAttribute('data-f');
        pressed(all('#ctabs button'), function (x) { return x === b; });
        renderList();
      });
    });
    renderList();
  }).catch(function () { var l = $('#mlist'); if (l) l.textContent = 'Le calendrier est momentanément indisponible.'; });

  /* ---------- La table des 13 ---------- */
  get('data/partenaires.json').then(function (P) {
    if (!P || !P.length) {
      var role = $('#p-role'), name = $('#p-name'), desc = $('#p-desc'), who = $('#p-who');
      if (role) role.textContent = 'Table en construction';
      if (name) name.textContent = 'La table des 13';
      if (desc) desc.textContent = 'Les partenaires seront affichés dès que la liste sera disponible.';
      if (who) who.hidden = true;
      var round = $('#round');
      if (round) {
        var empty = document.createElement('div');
        empty.className = 'empty-state empty-state--table';
        empty.innerHTML = '<strong>La table est en cours de mise à jour.</strong><span>Nos partenaires réapparaîtront très vite.</span>';
        round.appendChild(empty);
      }
      return;
    }
    var round = $('#round'), cur = 0, seats = [];
    P.forEach(function (p, i) {
      var a = (-90 + i * (360 / P.length)) * Math.PI / 180;
      var b = el('button', 'seat'); b.type = 'button'; b.setAttribute('aria-label', 'Siège ' + (i + 1) + ' : ' + p.nom);
      b.style.left = (50 + 40.5 * Math.cos(a)).toFixed(2) + '%'; b.style.top = (50 + 40.5 * Math.sin(a)).toFixed(2) + '%';
      var disc = el('span', 'disc'); var img = el('img'); img.src = 'assets/img/logos/' + p.logo; img.alt = ''; disc.appendChild(img);
      b.appendChild(disc); b.appendChild(el('span', 'nm', p.nom));
      b.addEventListener('click', function () { show(i); });
      round.appendChild(b); seats.push(b);
    });
    function show(i) {
      cur = (i + P.length) % P.length; var p = P[cur];
      $('#p-role').textContent = p.role + ' · Siège ' + (cur + 1) + ' sur ' + P.length;
      $('#p-logo').src = 'assets/img/logos/' + p.logo; $('#p-logo').alt = 'Logo ' + p.nom;
      $('#p-name').textContent = p.nom; $('#p-desc').textContent = p.desc;
      var who = $('#p-who'); who.hidden = !p.personne; who.textContent = p.personne ? p.personne + ' · ' + p.fonction : '';
      $('#p-page').href = 'partenaires/' + p.slug + '.html';
      seats.forEach(function (s, k) { s.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
    }
    $('#p-prev').addEventListener('click', function () { show(cur - 1); });
    $('#p-next').addEventListener('click', function () { show(cur + 1); });
    show(0);
  }).catch(function () {});

  /* ---------- Vidéos (data/videos.json, mis à jour chaque jour par GitHub Actions) ---------- */
  get('data/videos.json').then(function (j) {
    var vids = j.videos || [], f = 'all', grid = $('#vgrid');
    function render() {
      grid.textContent = '';
      var l = vids.filter(function (v) { return f === 'all' || v.type === f; });
      if (!l.length) { grid.appendChild(el('p', 'small', 'Aucune vidéo pour le moment.')); return; }
      l.forEach(function (v) {
        var a = el('a', 'vcard'); a.href = v.url; a.target = '_blank'; a.rel = 'noopener';
        var top = el('span', 'top'); top.appendChild(el('span', 'tag', v.type === 'presse' ? 'Point presse' : 'Match'));
        var play = el('span', 'play'); play.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="#071F4B"/></svg>'; top.appendChild(play);
        var d = new Date(v.date + 'T12:00:00');
        a.appendChild(top); a.appendChild(el('span', 't', v.titre));
        a.appendChild(el('span', 'meta', v.source + ' · ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + ' · YouTube ↗'));
        grid.appendChild(a);
      });
    }
    all('#vtabs button').forEach(function (b) {
      b.addEventListener('click', function () { f = b.getAttribute('data-f'); pressed(all('#vtabs button'), function (x) { return x === b; }); render(); });
    });
    render();
  }).catch(function () { var g = $('#vgrid'); if (g) g.textContent = 'Les vidéos sont momentanément indisponibles.'; });
})();

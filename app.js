// ─── 상태 ──────────────────────────────────────────────────
let people = JSON.parse(localStorage.getItem('lunarPeople') || '[]');
let events = JSON.parse(localStorage.getItem('calEvents')   || '[]');
let currentView     = 'home';
let selectedPersonId = null;
let selectedEventId  = null;
let editingId        = null;
let calYear, calMonth;

// ─── 저장 ──────────────────────────────────────────────────
function save() {
  localStorage.setItem('lunarPeople', JSON.stringify(people));
  localStorage.setItem('calEvents',   JSON.stringify(events));
}

// ─── 화면 전환 ─────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  currentView = name;
  if (name === 'home')     renderHome();
  if (name === 'calendar') renderCalendar();
}

// ─── 바텀시트 ──────────────────────────────────────────────
function openAddSheet() {
  document.getElementById('add-sheet').classList.add('open');
  document.getElementById('sheet-overlay').classList.add('open');
}
function closeAddSheet(instant = false) {
  const sheet   = document.getElementById('add-sheet');
  const overlay = document.getElementById('sheet-overlay');
  if (instant) {
    sheet.style.transition   = 'none';
    overlay.style.transition = 'none';
    sheet.classList.remove('open');
    overlay.classList.remove('open');
    setTimeout(() => { sheet.style.transition = ''; overlay.style.transition = ''; }, 30);
  } else {
    sheet.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// ─── 홈 렌더링 ─────────────────────────────────────────────
function renderHome() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const items = [];

  // 생일
  people.forEach(p => {
    const dates = getBirthdayDates(p, today.getFullYear(), 3);
    const next  = dates.find(d => d.dday >= 0) || dates[dates.length - 1];
    items.push({ type: 'birthday', data: p, next, sortKey: next?.dday ?? 9999 });
  });

  // 일정
  events.forEach(e => {
    const d     = new Date(e.date + 'T00:00:00');
    const dday  = Math.ceil((d - today) / 86400000);
    items.push({ type: 'event', data: e, dday, sortKey: dday });
  });

  // 정렬: 오늘·미래 먼저(가까운순), 지난 항목은 뒤로
  items.sort((a, b) => {
    const ra = a.sortKey < 0 ? a.sortKey + 1e6 : a.sortKey;
    const rb = b.sortKey < 0 ? b.sortKey + 1e6 : b.sortKey;
    return ra - rb;
  });

  const list = document.getElementById('home-list');
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🌙</div>
      <p>등록된 항목이 없어요</p>
      <p class="sub">아래 + 버튼으로 추가해보세요</p>
    </div>`;
    return;
  }
  list.innerHTML = items.map(item =>
    item.type === 'birthday'
      ? renderBirthdayCard(item.data, item.next)
      : renderEventCard(item.data, item.dday)
  ).join('');
}

function renderBirthdayCard(p, next) {
  const dday    = next?.dday ?? null;
  const isToday = dday === 0;
  const ddayStr = dday !== null ? getDdayStr(dday) : '?';
  const ddayCls = dday === 0 ? 'dday today' : dday < 0 ? 'dday past' : 'dday';
  const badge   = `<span class="type-badge ${p.isLunar ? 'lunar' : 'solar'}">${p.isLunar ? '음력' : '양력'}</span>`;
  return `<div class="person-card${isToday ? ' birthday-today' : ''}" onclick="openBirthdayDetail('${p.id}')">
    <div class="person-avatar" style="background:${p.color}">${p.name[0]}</div>
    <div class="person-info">
      <div class="person-name">${p.name} ${badge}${isToday ? ' 🎉' : ''}</div>
      <div class="person-lunar">${p.isLunar ? '음력' : '양력'} ${p.month}월 ${p.day}일${p.isLeap ? ' (윤달)' : ''}</div>
      <div class="person-solar">${next?.solarStr || ''}</div>
    </div>
    <div class="${ddayCls}">${ddayStr}</div>
  </div>`;
}

function renderEventCard(e, dday) {
  const ddayStr = getDdayStr(dday);
  const ddayCls = dday === 0 ? 'dday today' : dday < 0 ? 'dday past' : 'dday';
  const d       = new Date(e.date + 'T00:00:00');
  const dateStr = formatDateShort(d);
  const timeStr = e.time ? ` · ${e.time}` : '';
  return `<div class="event-card" onclick="openEventDetail('${e.id}')">
    <div class="event-icon">📌</div>
    <div class="person-info">
      <div class="person-name">${e.title}</div>
      <div class="person-solar">${dateStr}${timeStr}</div>
      ${e.memo ? `<div class="event-memo">${e.memo}</div>` : ''}
    </div>
    <div class="${ddayCls}">${ddayStr}</div>
  </div>`;
}

// ─── 생일 추가 ─────────────────────────────────────────────
function openAddBirthday(id = null) {
  closeAddSheet(true);
  document.getElementById('add-birthday-form').reset();
  editingId = id;
  const titleEl = document.querySelector('#view-add-birthday .header h1');
  if (id) {
    const p = people.find(x => x.id === id);
    if (p) {
      document.getElementById('add-name').value  = p.name;
      document.getElementById('add-month').value = p.month;
      document.getElementById('add-day').value   = p.day;
      document.getElementById('add-leap').checked = !!p.isLeap;
      setCalType(p.isLunar ? 'lunar' : 'solar');
      titleEl.textContent = '🎂 생일 수정';
    }
  } else {
    document.getElementById('birthday-type-input').value = 'lunar';
    setCalType('lunar');
    titleEl.textContent = '🎂 생일 추가';
  }
  showView('add-birthday');
}

function editBirthday() {
  openAddBirthday(selectedPersonId);
}

function setCalType(type) {
  document.getElementById('birthday-type-input').value = type;
  document.getElementById('btn-lunar').classList.toggle('active', type === 'lunar');
  document.getElementById('btn-solar').classList.toggle('active', type === 'solar');
  document.getElementById('leap-group').style.display = type === 'lunar' ? 'flex' : 'none';
}

function submitBirthday(ev) {
  ev.preventDefault();
  const name    = document.getElementById('add-name').value.trim();
  const month   = parseInt(document.getElementById('add-month').value);
  const day     = parseInt(document.getElementById('add-day').value);
  const isLeap  = document.getElementById('add-leap').checked;
  const isLunar = document.getElementById('birthday-type-input').value !== 'solar';

  if (!name || !month || !day) return;
  if (month < 1 || month > 12 || day < 1 || day > 30) {
    alert('올바른 날짜를 입력해주세요');
    return;
  }
  if (editingId) {
    const idx = people.findIndex(p => p.id === editingId);
    if (idx >= 0) {
      people[idx] = { ...people[idx], name, month, day, isLeap: isLunar && isLeap, isLunar };
    }
    editingId = null;
  } else {
    const colors = ['#e94560','#0f3460','#533483','#057dcd','#43b97f','#e67e22','#9b59b6','#c0392b'];
    people.push({
      id: Date.now().toString(), name, month, day,
      isLeap: isLunar && isLeap, isLunar,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  save();
  showView('home');
}

// ─── 일정 추가 ─────────────────────────────────────────────
function openAddEvent(id = null) {
  closeAddSheet(true);
  document.getElementById('add-event-form').reset();
  editingId = id;
  const titleEl = document.querySelector('#view-add-event .header h1');
  if (id) {
    const e = events.find(x => x.id === id);
    if (e) {
      document.getElementById('event-title').value = e.title;
      document.getElementById('event-date').value  = e.date;
      document.getElementById('event-time').value  = e.time || '';
      document.getElementById('event-memo').value  = e.memo || '';
      titleEl.textContent = '📌 일정 수정';
    }
  } else {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    document.getElementById('event-date').value = iso;
    titleEl.textContent = '📌 일정 추가';
  }
  showView('add-event');
}

function editEvent() {
  openAddEvent(selectedEventId);
}

function submitEvent(ev) {
  ev.preventDefault();
  const title = document.getElementById('event-title').value.trim();
  const date  = document.getElementById('event-date').value;
  const time  = document.getElementById('event-time').value;
  const memo  = document.getElementById('event-memo').value.trim();
  if (!title || !date) return;
  if (editingId) {
    const idx = events.findIndex(e => e.id === editingId);
    if (idx >= 0) {
      events[idx] = { ...events[idx], title, date, time: time || '', memo: memo || '' };
    }
    editingId = null;
  } else {
    events.push({ id: Date.now().toString(), title, date, time: time || '', memo: memo || '' });
  }
  save();
  showView('home');
}

// ─── 생일 상세 ─────────────────────────────────────────────
function openBirthdayDetail(id) {
  selectedPersonId = id;
  const p = people.find(x => x.id === id);
  if (!p) return;

  const av = document.getElementById('detail-avatar');
  av.textContent   = p.name[0];
  av.style.background = p.color;
  document.getElementById('detail-name').textContent  = p.name;
  document.getElementById('detail-lunar').textContent =
    `${p.isLunar ? '음력' : '양력'} ${p.month}월 ${p.day}일${p.isLeap ? ' (윤달)' : ''}`;

  const today = new Date();
  const dates = getBirthdayDates(p, today.getFullYear() - 1, 12);
  const nextIdx = dates.findIndex(d => d.dday >= 0);

  document.getElementById('detail-table').innerHTML = dates.map((d, i) =>
    `<tr class="${i === nextIdx ? 'next-row' : ''}">
      <td>${d.lunarYear}년</td>
      <td>${d.solarStr}</td>
      <td class="${d.dday === 0 ? 'today-cell' : ''}">${getDdayStr(d.dday)}</td>
    </tr>`
  ).join('');

  showView('detail-birthday');
}

function deleteBirthday() {
  if (!confirm('정말 삭제할까요?')) return;
  people = people.filter(p => p.id !== selectedPersonId);
  save(); showView('home');
}

// ─── 일정 상세 ─────────────────────────────────────────────
function openEventDetail(id) {
  selectedEventId = id;
  const e = events.find(x => x.id === id);
  if (!e) return;

  const d    = new Date(e.date + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const dday  = Math.ceil((d - today) / 86400000);

  document.getElementById('ev-detail-title').textContent = e.title;
  document.getElementById('ev-detail-date').textContent  = formatDate(d);
  document.getElementById('ev-detail-time').textContent  = e.time ? `⏰  ${e.time}` : '';
  document.getElementById('ev-detail-memo').textContent  = e.memo || '';
  document.getElementById('ev-detail-dday').textContent  = getDdayStr(dday);
  document.getElementById('ev-detail-dday').className    =
    'ev-dday-badge ' + (dday === 0 ? 'today' : dday < 0 ? 'past' : '');

  showView('detail-event');
}

function deleteEvent() {
  if (!confirm('정말 삭제할까요?')) return;
  events = events.filter(e => e.id !== selectedEventId);
  save(); showView('home');
}

// ─── 달력 ──────────────────────────────────────────────────
function renderCalendar(yearOffset = 0, monthOffset = 0) {
  if (!calYear) {
    const t = new Date(); calYear = t.getFullYear(); calMonth = t.getMonth() + 1;
  }
  calMonth += monthOffset; calYear += yearOffset;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  if (calMonth <  1) { calMonth = 12; calYear--; }

  document.getElementById('cal-title').textContent = `${calYear}년 ${calMonth}월`;

  const marks = {};
  const addMark = (day, type, name, color) => {
    if (!marks[day]) marks[day] = [];
    marks[day].push({ type, name, color });
  };

  people.forEach(p => {
    getBirthdayDates(p, calYear - 1, 4).forEach(d => {
      if (d.solar.getFullYear() === calYear && d.solar.getMonth() + 1 === calMonth)
        addMark(d.solar.getDate(), 'birthday', p.name, p.color);
    });
  });
  events.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    if (d.getFullYear() === calYear && d.getMonth() + 1 === calMonth)
      addMark(d.getDate(), 'event', e.title, '#f39c12');
  });

  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const lastDate = new Date(calYear, calMonth, 0).getDate();
  const today    = new Date();
  let html = '';
  let day  = 1 - firstDay;

  for (let row = 0; row < 6; row++) {
    html += '<tr>';
    for (let col = 0; col < 7; col++, day++) {
      if (day < 1 || day > lastDate) { html += '<td></td>'; continue; }
      const isToday = today.getFullYear() === calYear &&
                      today.getMonth() + 1 === calMonth &&
                      today.getDate() === day;
      const dayMarks = marks[day] || [];
      const dots = dayMarks.map(m =>
        `<span class="cal-dot${m.type === 'event' ? ' event-dot' : ''}"
          style="background:${m.color}" title="${m.name}"></span>`
      ).join('');
      html += `<td class="${isToday ? 'today' : ''}" onclick="showCalDay(${calYear},${calMonth},${day})">
        <div class="cal-day-num">${day}</div>
        <div class="cal-dots">${dots}</div>
      </td>`;
    }
    html += '</tr>';
    if (day > lastDate) break;
  }
  document.getElementById('cal-body').innerHTML = html;

  // 범례
  const legend = document.getElementById('cal-legend');
  const rows = [
    ...people.map(p =>
      `<div class="legend-item">
        <span class="legend-dot" style="background:${p.color}"></span>
        <span class="legend-name">${p.name}</span>
        <span class="legend-lunar">${p.isLunar?'음력':'양력'} ${p.month}월 ${p.day}일</span>
      </div>`),
    ...events.map(e =>
      `<div class="legend-item">
        <span class="legend-dot" style="background:#f39c12;border-radius:3px"></span>
        <span class="legend-name">${e.title}</span>
        <span class="legend-lunar">${new Date(e.date+'T00:00:00').toLocaleDateString('ko-KR',{month:'long',day:'numeric'})}</span>
      </div>`)
  ];
  legend.innerHTML = rows.length
    ? '<div class="section-title">등록된 항목</div>' + rows.join('')
    : '';
}

function showCalDay(y, m, d) {
  const items = [];
  people.forEach(p => {
    getBirthdayDates(p, y - 1, 4).forEach(date => {
      if (date.solar.getFullYear()===y && date.solar.getMonth()+1===m && date.solar.getDate()===d)
        items.push(`🎂 ${p.name}\n${p.isLunar?'음력':'양력'} ${p.month}월 ${p.day}일 생일`);
    });
  });
  events.forEach(e => {
    const date = new Date(e.date + 'T00:00:00');
    if (date.getFullYear()===y && date.getMonth()+1===m && date.getDate()===d)
      items.push(`📌 ${e.title}${e.time ? '\n⏰ '+e.time:''}${e.memo?'\n'+e.memo:''}`);
  });
  if (items.length) alert(`${y}년 ${m}월 ${d}일\n\n${items.join('\n\n')}`);
}

// ─── 탭 전환 ───────────────────────────────────────────────
function switchTab(view) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === view);
  });
  showView(view);
}

// ─── 초기화 ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  const t = new Date();
  const dow = ['일','월','화','수','목','금','토'][t.getDay()];
  document.getElementById('today-str').textContent =
    `${t.getFullYear()}년 ${t.getMonth()+1}월 ${t.getDate()}일 (${dow})`;
  showView('home');
});

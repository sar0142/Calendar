// ─── 앱 상태 ───────────────────────────────────────────────
let people = JSON.parse(localStorage.getItem('lunarPeople') || '[]');
let currentView = 'home'; // home | add | detail | calendar
let selectedId = null;

// ─── 저장 ──────────────────────────────────────────────────
function save() {
  localStorage.setItem('lunarPeople', JSON.stringify(people));
}

// ─── 화면 전환 ─────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  currentView = name;

  if (name === 'home') renderHome();
  if (name === 'calendar') renderCalendar();
}

// ─── 홈 화면 ───────────────────────────────────────────────
function renderHome() {
  const list = document.getElementById('people-list');
  if (people.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🌙</div>
      <p>등록된 생일이 없어요</p>
      <p class="sub">아래 + 버튼으로 추가해보세요</p>
    </div>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 다음 생일 기준 정렬
  const sorted = people.map(p => {
    const dates = getLunarBirthdayDates(p.month, p.day, p.isLeap, today.getFullYear(), 3);
    const next = dates.find(d => d.dday >= 0) || dates[0];
    return { ...p, next };
  }).sort((a, b) => {
    const da = a.next?.dday ?? 9999;
    const db = b.next?.dday ?? 9999;
    return da - db;
  });

  list.innerHTML = sorted.map(p => {
    const dday = p.next?.dday ?? null;
    const ddayStr = dday !== null ? getDdayStr(dday) : '?';
    const ddayClass = dday === 0 ? 'dday today' : (dday < 0 ? 'dday past' : 'dday');
    const solarStr = p.next?.solarStr || '';
    const isToday = dday === 0;

    return `<div class="person-card ${isToday ? 'birthday-today' : ''}" onclick="openDetail('${p.id}')">
      <div class="person-avatar" style="background:${p.color}">${p.name[0]}</div>
      <div class="person-info">
        <div class="person-name">${p.name} ${isToday ? '🎉' : ''}</div>
        <div class="person-lunar">음력 ${p.month}월 ${p.day}일${p.isLeap ? ' (윤달)' : ''}</div>
        <div class="person-solar">${solarStr}</div>
      </div>
      <div class="${ddayClass}">${ddayStr}</div>
    </div>`;
  }).join('');
}

// ─── 상세 화면 ─────────────────────────────────────────────
function openDetail(id) {
  selectedId = id;
  const p = people.find(x => x.id === id);
  if (!p) return;

  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-lunar').textContent =
    `음력 ${p.month}월 ${p.day}일${p.isLeap ? ' (윤달)' : ''}`;

  const today = new Date();
  const dates = getLunarBirthdayDates(p.month, p.day, p.isLeap, today.getFullYear() - 1, 12);

  const tableEl = document.getElementById('detail-table');
  tableEl.innerHTML = dates.map(d => {
    const isThis = d.dday >= 0 && dates.filter(x => x.dday >= 0)[0]?.lunarYear === d.lunarYear;
    return `<tr class="${isThis ? 'next-row' : ''}">
      <td>${d.lunarYear}년</td>
      <td>${d.solarStr}</td>
      <td class="${d.dday === 0 ? 'today-cell' : ''}">${getDdayStr(d.dday)}</td>
    </tr>`;
  }).join('');

  showView('detail');
}

function deleteCurrentPerson() {
  if (!confirm('정말 삭제할까요?')) return;
  people = people.filter(p => p.id !== selectedId);
  save();
  showView('home');
}

// ─── 추가 화면 ─────────────────────────────────────────────
function openAdd() {
  document.getElementById('add-form').reset();
  document.getElementById('add-leap').checked = false;
  showView('add');
}

function submitAdd(e) {
  e.preventDefault();
  const name = document.getElementById('add-name').value.trim();
  const month = parseInt(document.getElementById('add-month').value);
  const day = parseInt(document.getElementById('add-day').value);
  const isLeap = document.getElementById('add-leap').checked;

  if (!name || !month || !day) return;
  if (month < 1 || month > 12 || day < 1 || day > 30) {
    alert('올바른 날짜를 입력해주세요');
    return;
  }

  const colors = ['#e94560','#0f3460','#533483','#057dcd','#43b97f','#e67e22','#9b59b6'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  people.push({
    id: Date.now().toString(),
    name,
    month,
    day,
    isLeap,
    color
  });
  save();
  showView('home');
}

// ─── 달력 화면 ─────────────────────────────────────────────
let calYear, calMonth;

function renderCalendar(yearOffset = 0, monthOffset = 0) {
  if (!calYear) {
    const today = new Date();
    calYear = today.getFullYear();
    calMonth = today.getMonth() + 1;
  }
  calMonth += monthOffset;
  calYear += yearOffset;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  if (calMonth < 1) { calMonth = 12; calYear--; }

  document.getElementById('cal-title').textContent = `${calYear}년 ${calMonth}월`;

  // 이달의 생일 계산
  const birthdays = {};
  people.forEach(p => {
    const dates = getLunarBirthdayDates(p.month, p.day, p.isLeap, calYear - 1, 4);
    dates.forEach(d => {
      if (d.solar.getFullYear() === calYear && d.solar.getMonth() + 1 === calMonth) {
        const day = d.solar.getDate();
        if (!birthdays[day]) birthdays[day] = [];
        birthdays[day].push(p);
      }
    });
  });

  // 달력 그리기
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const lastDate = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();

  let html = '';
  let day = 1 - firstDay;

  for (let row = 0; row < 6; row++) {
    html += '<tr>';
    for (let col = 0; col < 7; col++, day++) {
      if (day < 1 || day > lastDate) {
        html += '<td></td>';
      } else {
        const isToday = today.getFullYear() === calYear &&
                        today.getMonth() + 1 === calMonth &&
                        today.getDate() === day;
        const bdays = birthdays[day] || [];
        const dots = bdays.map(p =>
          `<span class="cal-dot" style="background:${p.color}" title="${p.name}"></span>`
        ).join('');

        html += `<td class="${isToday ? 'today' : ''}" onclick="showCalDay(${calYear},${calMonth},${day})">
          <div class="cal-day-num">${day}</div>
          <div class="cal-dots">${dots}</div>
        </td>`;
      }
    }
    html += '</tr>';
    if (day > lastDate) break;
  }

  document.getElementById('cal-body').innerHTML = html;
}

function showCalDay(y, m, d) {
  const birthdays = [];
  people.forEach(p => {
    const dates = getLunarBirthdayDates(p.month, p.day, p.isLeap, y - 1, 4);
    dates.forEach(date => {
      if (date.solar.getFullYear() === y &&
          date.solar.getMonth() + 1 === m &&
          date.solar.getDate() === d) {
        birthdays.push({ person: p, info: date });
      }
    });
  });

  if (birthdays.length === 0) return;

  const msg = birthdays.map(b =>
    `🎂 ${b.person.name}\n음력 ${b.person.month}월 ${b.person.day}일 생일`
  ).join('\n\n');

  alert(`${y}년 ${m}월 ${d}일\n\n${msg}`);
}

// ─── 초기화 ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  showView('home');
});

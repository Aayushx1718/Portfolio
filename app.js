const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
let savedTheme;
try { savedTheme = localStorage.getItem('portfolio-theme'); } catch {}
let dark = savedTheme ? savedTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme() {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.textContent = dark ? '☾' : '☼';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#111313' : '#ffffff';
}
applyTheme();
themeButton.addEventListener('click', () => {
  dark = !dark;
  applyTheme();
  try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch {}
});
function updateClock() {
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);
document.querySelector('#year').textContent = new Date().getFullYear();

const sections = [...document.querySelectorAll('main section[id]')].map(section => ({ id: section.id, name: section.querySelector('h2').textContent.replace(/01$/, '').trim() }));
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
let selected = 0;
function markSelected() {
  [...results.querySelectorAll('a')].forEach((link, index) => {
    link.toggleAttribute('data-selected', index === selected);
    if (index === selected) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
function renderResults() {
  const matches = sections.filter(section => section.name.toLowerCase().includes(input.value.toLowerCase().trim()));
  results.replaceChildren();
  selected = 0;
  for (const section of matches) {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = `${section.name} ↗`;
    link.addEventListener('click', () => dialog.close());
    results.append(link);
  }
  if (!matches.length) {
    const message = document.createElement('p');
    message.className = 'no-results';
    message.textContent = 'No sections found. Try “projects” or “about”.';
    results.append(message);
  }
  markSelected();
}
function openSearch() {
  if (dialog.open) return;
  input.value = '';
  renderResults();
  dialog.showModal();
  input.focus();
}
document.querySelector('#open-search').addEventListener('click', openSearch);
document.querySelector('#close-search').addEventListener('click', () => dialog.close());
input.addEventListener('input', renderResults);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    dialog.open ? dialog.close() : openSearch();
  }
});
input.addEventListener('keydown', event => {
  const links = [...results.querySelectorAll('a')];
  if (!links.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    markSelected();
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    links[selected].click();
  }
});
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

// A live calendar uses only actual submissions returned by LeetCode.
const lcStatus = document.querySelector('#leetcode-status');
const lcData = document.querySelector('#leetcode-data');
const lcRetry = document.querySelector('#retry-leetcode');
function renderLeetcode(data) {
  if (!data.solved || !data.calendar || !['all', 'easy', 'medium', 'hard'].every(key => Number.isInteger(data.solved[key]) && data.solved[key] >= 0)) throw new Error('Incomplete statistics');
  const calendar = new Map();
  for (const [timestamp, count] of Object.entries(data.calendar)) {
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isFinite(date.getTime()) && Number.isInteger(count) && count >= 0) {
      const key = date.toISOString().slice(0, 10);
      calendar.set(key, (calendar.get(key) || 0) + count);
    }
  }
  for (const key of ['all', 'easy', 'medium', 'hard']) document.querySelector(`#lc-${key}`).textContent = data.solved[key].toLocaleString();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const first = new Date(today);
  first.setUTCDate(first.getUTCDate() - 364);
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
  const cells = [];
  const monthLabels = [];
  let total = 0;
  let active = 0;
  let previousMonth = -1;
  for (let date = new Date(gridStart), index = 0; date <= today; date.setUTCDate(date.getUTCDate() + 1), index++) {
    const key = date.toISOString().slice(0, 10);
    const cell = document.createElement('span');
    const count = calendar.get(key) || 0;
    const inRange = date >= first;
    if (inRange) {
      total += count;
      if (count) active++;
    }
    cell.dataset.level = !inRange || !count ? '0' : count <= 2 ? '1' : count <= 5 ? '2' : count <= 9 ? '3' : '4';
    if (!inRange) cell.className = 'calendar-pad';
    cell.title = inRange ? `${key}: ${count} submission${count === 1 ? '' : 's'}` : '';
    cells.push(cell);
    if (date.getUTCDay() === 0 && date.getUTCMonth() !== previousMonth) {
      const label = document.createElement('span');
      label.textContent = date.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
      label.style.gridColumn = String(Math.floor(index / 7) + 1);
      monthLabels.push(label);
      previousMonth = date.getUTCMonth();
    }
  }
  const columns = Math.ceil(cells.length / 7);
  const heatmap = document.querySelector('#lc-heatmap');
  heatmap.style.setProperty('--weeks', columns);
  heatmap.replaceChildren(...cells);
  heatmap.setAttribute('aria-label', `${total.toLocaleString()} LeetCode submissions on ${active} active days in the last 365 days. Daily submission counts, not unique problems solved.`);
  const months = document.querySelector('#lc-months');
  months.style.setProperty('--weeks', columns);
  months.replaceChildren(...monthLabels);
  document.querySelector('#lc-summary').textContent = `${total.toLocaleString()} submissions · ${active} active days`;
}
async function loadLeetcode() {
  lcRetry.disabled = true;
  lcStatus.hidden = false;
  lcStatus.textContent = 'Loading LeetCode activity…';
  lcData.hidden = true;
  try {
    if (!['http:', 'https:'].includes(location.protocol)) throw new Error('Standalone preview');
    const response = await fetch('/api/leetcode', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('LeetCode unavailable');
    renderLeetcode(await response.json());
    lcStatus.hidden = true;
    lcData.hidden = false;
  } catch {
    lcStatus.textContent = 'Live activity is unavailable right now. You can still visit my LeetCode profile below.';
  } finally {
    lcRetry.disabled = false;
  }
}
if (lcStatus && lcData && lcRetry) {
  lcRetry.addEventListener('click', loadLeetcode);
  loadLeetcode();
}

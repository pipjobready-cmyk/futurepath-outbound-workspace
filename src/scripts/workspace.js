const storage = {
  get(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browser storage may be disabled. */ } },
};

const quotes = [
  'Small steps, taken consistently, create meaningful progress.',
  'The future is built by people willing to learn together.',
  'Curiosity turns uncertainty into possibility.',
  'A thoughtful introduction can open an unexpected door.',
  'Progress grows when good ideas meet generous people.',
  'Keep showing up. Your next useful conversation may be closer than you think.',
  'Learning is a practical way to make the future more hopeful.',
];
const today = new Date();
const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const daySeed = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);
const quoteText = document.getElementById('quoteText');
if (quoteText) quoteText.textContent = `“${quotes[daySeed % quotes.length]}”`;
const quoteDate = document.getElementById('quoteDate');
if (quoteDate) quoteDate.textContent = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

document.querySelectorAll('[data-date-offset]').forEach((el) => {
  const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - Number(el.dataset.dateOffset));
  el.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
});

const statePicker = document.getElementById('statePicker');
function updateStateQueries() {
  if (!statePicker) return;
  const option = statePicker.selectedOptions[0];
  const state = option.value;
  const abbreviation = option.dataset.abbr;
  document.querySelectorAll('.p2-search-link').forEach((link) => {
    const query = `("${state}" OR "${abbreviation}") (${link.dataset.org}) (${link.dataset.need}) (${link.dataset.roles})`;
    link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=us&hl=en&cr=countryUS`;
    link.textContent = `Search ${abbreviation} · ${link.closest('.p2-segment-card').querySelector('strong').textContent} ↗`;
    const preview = link.closest('.p2-segment-card').querySelector('[data-query-preview]');
    if (preview) preview.textContent = query;
  });
}
statePicker?.addEventListener('change', updateStateQueries);
updateStateQueries();

const defaultLeads = [
  { org:'AI & education podcast prospect', segment:'Podcast', signal:'Official show page to verify', stage:'New' },
  { org:'Future of work podcast prospect', segment:'Podcast', signal:'Recent episode to review', stage:'New' },
  { org:'California K–12 AI / CTE prospect', segment:'K–12 Education', signal:'Find program decision-maker', stage:'Researching' },
  { org:'Youth STEM community prospect', segment:'Youth STEM', signal:'Confirm active program', stage:'Qualified' },
  { org:'Innovation forum opportunity', segment:'Speaking & events', signal:'Human review before pitch', stage:'Awaiting approval' },
  { org:'Education partnership prospect', segment:'Higher Education', signal:'Introductory message pending', stage:'Contacted' },
];
let leads = storage.get('fp-astro-preview-leads-v1', null) || defaultLeads;
let selectedStage = 'All';
const leadRows = document.getElementById('leadRows');
const leadSearch = document.getElementById('leadSearch');
const leadCount = document.getElementById('leadCount');
const stages = ['New','Researching','Qualified','Awaiting approval','Contacted'];
function esc(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
function renderLeads() {
  if (!leadRows) return;
  const search = (leadSearch?.value || '').trim().toLowerCase();
  const visible = leads.filter((lead) => (selectedStage === 'All' || lead.stage === selectedStage) && `${lead.org} ${lead.segment} ${lead.signal}`.toLowerCase().includes(search));
  leadRows.innerHTML = visible.map((lead) => `<tr data-lead><td class="org">${esc(lead.org)}<small>Preview record · verify in workbook</small></td><td>${esc(lead.segment)}</td><td>${esc(lead.signal)}</td><td><span class="badge">${esc(lead.stage)}</span></td></tr>`).join('');
  if (leadCount) leadCount.textContent = `${visible.length} ${visible.length === 1 ? 'record' : 'records'} shown · preview data`;
  document.querySelectorAll('[data-count-all]').forEach((el) => el.textContent = leads.length);
  stages.forEach((stage) => document.querySelectorAll(`[data-count-stage="${stage}"]`).forEach((el) => el.textContent = leads.filter((lead) => lead.stage === stage).length));
}
document.querySelectorAll('[data-stage-filter]').forEach((button) => button.addEventListener('click', () => {
  selectedStage = button.dataset.stageFilter;
  document.querySelectorAll('[data-stage-filter]').forEach((el) => el.classList.toggle('selected', el === button));
  renderLeads();
}));
leadSearch?.addEventListener('input', renderLeads);
renderLeads();

const modal = document.getElementById('leadModal');
const addLead = document.getElementById('addLead');
const closeModal = () => { if (modal) modal.hidden = true; };
addLead?.addEventListener('click', () => { modal.hidden = false; document.getElementById('newLeadOrg')?.focus(); });
document.getElementById('closeLeadModal')?.addEventListener('click', closeModal);
document.getElementById('cancelLead')?.addEventListener('click', closeModal);
modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.getElementById('saveLead')?.addEventListener('click', () => {
  const orgInput = document.getElementById('newLeadOrg');
  const org = orgInput.value.trim();
  if (!org) { orgInput.focus(); return; }
  leads.unshift({ org, segment: document.getElementById('newLeadFocus').value.trim() || 'Unspecified', signal: 'Evidence to be verified', stage: document.getElementById('newLeadStage').value });
  storage.set('fp-astro-preview-leads-v1', leads); orgInput.value = ''; document.getElementById('newLeadFocus').value = '';
  selectedStage = 'All'; document.querySelectorAll('[data-stage-filter]').forEach((el) => el.classList.toggle('selected', el.dataset.stageFilter === 'All'));
  closeModal(); renderLeads();
});

const announcementList = document.getElementById('announcementList');
function renderAnnouncements() {
  if (!announcementList) return;
  const notes = storage.get('fp-astro-preview-announcements-v1', []);
  announcementList.innerHTML = notes.map((note) => `<article class="notice-item ${note.urgent ? 'urgent' : ''}"><strong>${note.urgent ? 'URGENT · ' : ''}${esc(note.text)}</strong><small>${esc(note.time)}</small></article>`).join('') || '<p class="muted tiny">No local notes yet.</p>';
}
document.getElementById('postAnnouncement')?.addEventListener('click', () => {
  const input = document.getElementById('announcementText'); const text = input.value.trim(); if (!text) { input.focus(); return; }
  const notes = storage.get('fp-astro-preview-announcements-v1', []);
  notes.unshift({ text, urgent: document.getElementById('announcementUrgent').checked, time: new Date().toLocaleString() });
  storage.set('fp-astro-preview-announcements-v1', notes.slice(0, 20)); input.value = ''; document.getElementById('announcementUrgent').checked = false; renderAnnouncements();
});
renderAnnouncements();

const chatPanel = document.getElementById('chatPanel');
const chatToggle = document.getElementById('chatToggle');
chatToggle?.addEventListener('click', () => { chatPanel.hidden = !chatPanel.hidden; chatToggle.setAttribute('aria-expanded', String(!chatPanel.hidden)); if (!chatPanel.hidden) document.getElementById('chatInput')?.focus(); });
function renderChat() {
  const box = document.getElementById('chatMessages'); if (!box) return;
  const messages = storage.get('fp-astro-preview-chat-v1', []);
  box.innerHTML = messages.map((message) => `<div class="chat-message">${esc(message.text)}<small>${esc(message.time)} · saved in this browser</small></div>`).join('') || '<p class="muted tiny">No local messages yet.</p>';
}
document.getElementById('chatForm')?.addEventListener('submit', (event) => {
  event.preventDefault(); const input = document.getElementById('chatInput'); const text = input.value.trim(); if (!text) return;
  const messages = storage.get('fp-astro-preview-chat-v1', []); messages.push({ text, time: new Date().toLocaleString() }); storage.set('fp-astro-preview-chat-v1', messages.slice(-50)); input.value = ''; renderChat();
});
renderChat();

document.querySelectorAll('[data-toast]').forEach((button) => button.addEventListener('click', () => window.alert(button.dataset.toast)));

// Personal daily focus card: status, checkpoint note, and to-do list stay on this device.
const workStatus = document.getElementById('workStatus');
const workCheckpoint = document.getElementById('workCheckpoint');
const checkpointSaved = document.getElementById('checkpointSaved');
const todayDate = document.querySelector('[data-today-date]');
if (todayDate) todayDate.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const checkpointKey = 'fp-personal-work-checkpoint-v1';
const savedCheckpoint = storage.get(checkpointKey, null);
if (savedCheckpoint && workStatus && workCheckpoint) {
  workStatus.value = savedCheckpoint.status || 'In progress';
  workCheckpoint.value = savedCheckpoint.note || workCheckpoint.value;
  if (checkpointSaved && savedCheckpoint.updatedAt) checkpointSaved.textContent = `Last saved ${savedCheckpoint.updatedAt}`;
}
function saveWorkCheckpoint() {
  if (!workStatus || !workCheckpoint) return;
  const updatedAt = new Date().toLocaleString();
  storage.set(checkpointKey, { status: workStatus.value, note: workCheckpoint.value.trim(), updatedAt });
  if (checkpointSaved) checkpointSaved.textContent = `Saved ${updatedAt}`;
}
document.getElementById('saveCheckpoint')?.addEventListener('click', saveWorkCheckpoint);
workStatus?.addEventListener('change', saveWorkCheckpoint);
workCheckpoint?.addEventListener('blur', saveWorkCheckpoint);

const todoList = document.getElementById('todoList');
const todoProgress = document.getElementById('todoProgress');
const todoEmpty = document.getElementById('todoEmpty');
const todoKey = 'fp-personal-todos-v1';
let todos = storage.get(todoKey, null);
if (!Array.isArray(todos) && todoList) {
  try {
    todos = JSON.parse(todoList.dataset.starterTasks || '[]').map((text, index) => ({ id: `starter-${index}`, text, done: false }));
  } catch { todos = []; }
  storage.set(todoKey, todos);
}
todos ||= [];
function renderTodos() {
  if (!todoList) return;
  const completed = todos.filter((todo) => todo.done).length;
  if (todoProgress) todoProgress.textContent = `${completed} / ${todos.length} done`;
  if (todoEmpty) todoEmpty.hidden = todos.length > 0;
  todoList.innerHTML = todos.map((todo) => `<li class="todo-item ${todo.done ? 'done' : ''}" data-todo-id="${esc(todo.id)}"><input type="checkbox" aria-label="Mark ${esc(todo.text)} complete" ${todo.done ? 'checked' : ''}><span>${esc(todo.text)}</span><button class="todo-remove" type="button" aria-label="Remove task">×</button></li>`).join('');
}
function saveTodos() { storage.set(todoKey, todos); renderTodos(); }
document.getElementById('todoForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  todos.push({ id: globalThis.crypto?.randomUUID?.() || `todo-${Date.now()}-${Math.random().toString(36).slice(2)}`, text, done: false });
  input.value = ''; saveTodos(); input.focus();
});
todoList?.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') return;
  const item = event.target.closest('[data-todo-id]');
  todos = todos.map((todo) => todo.id === item?.dataset.todoId ? { ...todo, done: event.target.checked } : todo);
  saveTodos();
});
todoList?.addEventListener('click', (event) => {
  const button = event.target.closest('.todo-remove'); if (!button) return;
  const item = button.closest('[data-todo-id]');
  todos = todos.filter((todo) => todo.id !== item?.dataset.todoId);
  saveTodos();
});
renderTodos();

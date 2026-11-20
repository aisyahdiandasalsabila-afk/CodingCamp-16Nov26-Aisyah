/* =====================================================================
   Life Dashboard — script.js
   Vanilla JS, ES6+, no frameworks
   ===================================================================== */

/* ─────────────────────────────────────────────────────────────────────
   SECTION 1 · CLOCK & GREETING
   ───────────────────────────────────────────────────────────────────── */

/**
 * Updates the digital clock, date string, and greeting every second.
 */
function updateClock() {
  const now = new Date();

  // ── Digital clock (HH:MM:SS) ──
  const h  = String(now.getHours()).padStart(2, '0');
  const m  = String(now.getMinutes()).padStart(2, '0');
  const s  = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('digitalClock');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

  // ── Full date string ──
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    dateEl.textContent =
      `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  // ── Greeting based on hour ──
  const hour = now.getHours();
  const msgEl = document.getElementById('greetingMessage');
  if (msgEl) {
    if (hour >= 5  && hour < 12) msgEl.textContent = 'Good Morning';
    else if (hour >= 12 && hour < 17) msgEl.textContent = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) msgEl.textContent = 'Good Evening';
    else                               msgEl.textContent = 'Good Night';
  }
}

// Run immediately then every second
updateClock();
setInterval(updateClock, 1000);


/* ─────────────────────────────────────────────────────────────────────
   SECTION 2 · CUSTOM NAME  (Challenge 2)
   ───────────────────────────────────────────────────────────────────── */

(function initName() {
  const nameEl    = document.getElementById('greetingName');
  const nameInput = document.getElementById('nameInput');
  const saveBtn   = document.getElementById('saveNameBtn');

  // Load saved name
  const saved = localStorage.getItem('dashboard_name');
  if (saved && nameEl) nameEl.textContent = saved;
  if (saved && nameInput) nameInput.value = saved;

  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    const val = nameInput.value.trim();
    if (!val) {
      showToast('Please enter a name.');
      return;
    }
    nameEl.textContent = val;
    localStorage.setItem('dashboard_name', val);
    showToast('Name saved!');
  });
})();


/* ─────────────────────────────────────────────────────────────────────
   SECTION 3 · LIGHT / DARK MODE  (Challenge 1)
   ───────────────────────────────────────────────────────────────────── */

(function initTheme() {
  const toggle   = document.getElementById('themeToggle');
  const icon     = document.getElementById('themeIcon');
  const htmlEl   = document.documentElement;

  // Load saved theme
  const saved = localStorage.getItem('dashboard_theme') || 'light';
  htmlEl.setAttribute('data-theme', saved);
  applyThemeIcon(saved);

  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next    = current === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('dashboard_theme', next);
    applyThemeIcon(next);
  });

  function applyThemeIcon(theme) {
    if (!icon) return;
    if (theme === 'dark') {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
  }
})();


/* ─────────────────────────────────────────────────────────────────────
   SECTION 4 · FOCUS TIMER  (Challenge 3 — custom duration)
   ───────────────────────────────────────────────────────────────────── */

(function initTimer() {
  // DOM refs
  const displayEl   = document.getElementById('timerDisplay');
  const labelEl     = document.getElementById('timerLabel');
  const progressEl  = document.getElementById('timerProgress');
  const startBtn    = document.getElementById('timerStart');
  const pauseBtn    = document.getElementById('timerPause');
  const resetBtn    = document.getElementById('timerReset');
  const customInput = document.getElementById('customMinutes');
  const setBtn      = document.getElementById('setTimerBtn');
  const finishOverlay = document.getElementById('timerFinishOverlay');
  const closeFinish   = document.getElementById('closeFinish');

  // Ring circumference: r=52, viewBox=120 → circ = 2π×52 ≈ 326.73
  const CIRCUMFERENCE = 2 * Math.PI * 52;

  let totalSeconds   = 25 * 60;   // default 25 min
  let remainSeconds  = totalSeconds;
  let intervalId     = null;
  let isRunning      = false;

  // Set initial ring
  updateDisplay(remainSeconds);
  updateRing(remainSeconds, totalSeconds);

  // ── Start ──
  startBtn.addEventListener('click', () => {
    if (isRunning) return;          // prevent double-start
    if (remainSeconds === 0) return;
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    if (labelEl) labelEl.textContent = 'Focus';

    intervalId = setInterval(() => {
      remainSeconds--;
      updateDisplay(remainSeconds);
      updateRing(remainSeconds, totalSeconds);

      if (remainSeconds <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        if (labelEl) labelEl.textContent = 'Done!';
        showTimerFinish();
      }
    }, 1000);
  });

  // ── Pause / Stop ──
  pauseBtn.addEventListener('click', () => {
    if (!isRunning) return;
    clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (labelEl) labelEl.textContent = 'Paused';
  });

  // ── Reset ──
  resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    isRunning         = false;
    remainSeconds     = totalSeconds;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (labelEl) labelEl.textContent = 'Focus';
    updateDisplay(remainSeconds);
    updateRing(remainSeconds, totalSeconds);
  });

  // ── Set custom duration (Challenge 3) ──
  setBtn.addEventListener('click', () => {
    const val = parseInt(customInput.value, 10);
    if (!val || val < 1 || val > 120) {
      showToast('Enter a number between 1 and 120.');
      return;
    }
    clearInterval(intervalId);
    isRunning     = false;
    totalSeconds  = val * 60;
    remainSeconds = totalSeconds;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (labelEl) labelEl.textContent = 'Focus';
    updateDisplay(remainSeconds);
    updateRing(remainSeconds, totalSeconds);
    showToast(`Timer set to ${val} minute${val > 1 ? 's' : ''}.`);
  });

  // ── Finish modal ──
  function showTimerFinish() {
    if (finishOverlay) {
      finishOverlay.classList.add('open');
    } else {
      alert('Focus session complete! Great work.');
    }
  }

  if (closeFinish) {
    closeFinish.addEventListener('click', () => {
      if (finishOverlay) finishOverlay.classList.remove('open');
      // Auto-reset after finish
      remainSeconds = totalSeconds;
      updateDisplay(remainSeconds);
      updateRing(remainSeconds, totalSeconds);
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      if (labelEl) labelEl.textContent = 'Focus';
    });
  }

  // ── Helpers ──
  function updateDisplay(secs) {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    if (displayEl) displayEl.textContent = `${mm}:${ss}`;
  }

  function updateRing(remaining, total) {
    if (!progressEl) return;
    const offset = CIRCUMFERENCE - (remaining / total) * CIRCUMFERENCE;
    progressEl.style.strokeDasharray  = CIRCUMFERENCE;
    progressEl.style.strokeDashoffset = offset;
  }
})();


/* ─────────────────────────────────────────────────────────────────────
   SECTION 5 · TO-DO LIST
   ───────────────────────────────────────────────────────────────────── */

(function initTodo() {
  // ── State ──
  let tasks      = loadTasks();
  let editingId  = null;
  let filter     = 'all';

  // ── DOM refs ──
  const addForm      = document.getElementById('addTaskForm');
  const taskInput    = document.getElementById('taskInput');
  const taskListEl   = document.getElementById('taskList');
  const emptyState   = document.getElementById('emptyState');
  const statsEl      = document.getElementById('todoStats');
  const clearBtn     = document.getElementById('clearCompleted');
  const tabBtns      = document.querySelectorAll('.todo-tabs .tab');

  // Modal
  const modalOverlay  = document.getElementById('modalOverlay');
  const editInput     = document.getElementById('editTaskInput');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn     = document.getElementById('cancelEdit');
  const saveEditBtn   = document.getElementById('saveEdit');

  // ── Add task ──
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) { showToast('Task cannot be empty.'); return; }

    // Duplicate check (case-insensitive)
    if (isDuplicate(text, null)) {
      showToast(`"${text}" already exists.`);
      return;
    }

    tasks.push({ id: Date.now(), text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
  });

  // ── Filter tabs ──
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab--active');
      btn.setAttribute('aria-selected', 'true');
      filter = btn.dataset.filter;
      renderTasks();
    });
  });

  // ── Clear completed ──
  clearBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    showToast('Completed tasks cleared.');
  });

  // ── Edit modal ──
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click',     closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

  saveEditBtn.addEventListener('click', saveEdit);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
  });

  function saveEdit() {
    const newText = editInput.value.trim();
    if (!newText) { showToast('Task cannot be empty.'); return; }
    if (isDuplicate(newText, editingId)) {
      showToast(`"${newText}" already exists.`);
      return;
    }
    const task = tasks.find(t => t.id === editingId);
    if (task) { task.text = newText; saveTasks(); renderTasks(); }
    closeModal();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    editingId = null;
    editInput.value = '';
  }

  // ── Render ──
  function renderTasks() {
    taskListEl.innerHTML = '';

    const visible = tasks.filter(t => {
      if (filter === 'active')    return !t.completed;
      if (filter === 'completed') return  t.completed;
      return true;
    });

    if (visible.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      visible.forEach(task => taskListEl.appendChild(buildTaskItem(task)));
    }

    // Stats
    const done  = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    if (statsEl) statsEl.textContent = `${done} / ${total} done`;
  }

  function buildTaskItem(task) {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type      = 'checkbox';
    cb.className = 'task-cb';
    cb.checked   = task.completed;
    cb.setAttribute('aria-label', `Mark "${task.text}" as complete`);
    cb.addEventListener('change', () => {
      task.completed = cb.checked;
      saveTasks();
      renderTasks();
    });

    // Text
    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn task-btn--edit';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.title     = 'Edit task';
    editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
    editBtn.addEventListener('click', () => openEditModal(task));

    const delBtn = document.createElement('button');
    delBtn.className = 'task-btn task-btn--del';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.title     = 'Delete task';
    delBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    delBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      showToast('Task deleted.');
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(actions);
    return li;
  }

  function openEditModal(task) {
    editingId       = task.id;
    editInput.value = task.text;
    modalOverlay.classList.add('open');
    setTimeout(() => editInput.focus(), 50);
  }

  // ── Helpers ──
  function isDuplicate(text, excludeId) {
    return tasks.some(
      t => t.text.toLowerCase() === text.toLowerCase() && t.id !== excludeId
    );
  }

  function saveTasks() { localStorage.setItem('dashboard_tasks', JSON.stringify(tasks)); }

  function loadTasks() {
    try { return JSON.parse(localStorage.getItem('dashboard_tasks')) || []; }
    catch { return []; }
  }

  // Initial render
  renderTasks();
})();


/* ─────────────────────────────────────────────────────────────────────
   SECTION 6 · QUICK LINKS
   ───────────────────────────────────────────────────────────────────── */

(function initLinks() {
  const DEFAULT_LINKS = [
    { id: 1, name: 'Google',    url: 'https://www.google.com'          },
    { id: 2, name: 'YouTube',   url: 'https://www.youtube.com'         },
    { id: 3, name: 'Gmail',     url: 'https://mail.google.com'         },
    { id: 4, name: 'Calendar',  url: 'https://calendar.google.com'     },
  ];

  let links = loadLinks();

  // Seed defaults if storage is empty
  if (links.length === 0) {
    links = DEFAULT_LINKS.map(l => ({ ...l }));
    saveLinks();
  }

  const form      = document.getElementById('addLinkForm');
  const nameInput = document.getElementById('linkName');
  const urlInput  = document.getElementById('linkUrl');
  const grid      = document.getElementById('linksGrid');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    let   url  = urlInput.value.trim();

    if (!name) { showToast('Please enter a link name.'); return; }
    if (!url)  { showToast('Please enter a URL.'); return; }

    // Auto-prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    // Basic URL validation
    try { new URL(url); } catch {
      showToast('Please enter a valid URL.');
      return;
    }

    links.push({ id: Date.now(), name, url });
    saveLinks();
    renderLinks();
    nameInput.value = '';
    urlInput.value  = '';
    showToast(`"${name}" added to Quick Links.`);
  });

  function renderLinks() {
    grid.innerHTML = '';
    links.forEach(link => grid.appendChild(buildPill(link)));
  }

  function buildPill(link) {
    // Wrapper is an <a> so it's keyboard-accessible
    const a = document.createElement('a');
    a.className  = 'link-pill';
    a.href       = link.url;
    a.target     = '_blank';
    a.rel        = 'noopener noreferrer';
    a.title      = link.url;
    a.setAttribute('aria-label', `Open ${link.name}`);

    // Icon (first letter avatar)
    const iconDiv = document.createElement('div');
    iconDiv.className   = 'link-pill__icon';
    iconDiv.textContent = link.name.charAt(0).toUpperCase();

    // Name
    const nameSpan = document.createElement('span');
    nameSpan.className   = 'link-pill__name';
    nameSpan.textContent = link.name;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className  = 'link-pill__del';
    delBtn.innerHTML  = '<i class="fa-solid fa-xmark"></i>';
    delBtn.title      = 'Remove link';
    delBtn.setAttribute('aria-label', `Remove ${link.name}`);
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();   // don't follow the <a>
      e.stopPropagation();
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
      showToast(`"${link.name}" removed.`);
    });

    a.appendChild(iconDiv);
    a.appendChild(nameSpan);
    a.appendChild(delBtn);
    return a;
  }

  function saveLinks() { localStorage.setItem('dashboard_links', JSON.stringify(links)); }

  function loadLinks() {
    try { return JSON.parse(localStorage.getItem('dashboard_links')) || []; }
    catch { return []; }
  }

  renderLinks();
})();


/* ─────────────────────────────────────────────────────────────────────
   SHARED UTILITY · Toast notification
   ───────────────────────────────────────────────────────────────────── */

let toastTimer = null;

/**
 * Show a toast message for 2.8 seconds.
 * @param {string} msg
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// --- UTIL ---
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================
// GENERIC TO-DO (Exercise + Personal)
// ==================
function initToDo(type) {
    const list = document.querySelector(`.${type}-list`);
    const modalAddBtn = document.getElementById(`modalAdd${capitalize(type)}Btn`);
    const nameInput = document.getElementById(`${type}NameInput`);
    const durationInput = document.getElementById(`${type}DurationInput`);

    if (!list || !modalAddBtn) return;

    const storageKey = type === "exercise" ? "cozyExercises" : "cozyPersonals";
    const logKey = type === "exercise" ? "cozyExercisesLog" : "cozyPersonalsLog";
    const lastResetKey = `${storageKey}LastReset`;

    let tasks = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Timer-specific vars (only for exercise)
    let timerInterval = null;
    let currentTask = null;
    let remainingTime = 0;
    const timerSound = type === "exercise" ? new Audio('assets/playlist/Alarm02.wav') : null;
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');
    const circumference = progressCircle ? 2 * Math.PI * 70 : 0;
    if (progressCircle) progressCircle.style.strokeDasharray = circumference;

    // --- DAILY RESET ---
    const todayStr = new Date().toDateString();
    const lastReset = localStorage.getItem(lastResetKey);

    if (lastReset !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = getLocalDateKey(yesterday);

        let log = JSON.parse(localStorage.getItem(logKey)) || {};
        if (!log[yKey]) {
            log[yKey] = tasks.filter(t => t.completed).map(t => t.name);
            localStorage.setItem(logKey, JSON.stringify(log));
        }

        // Reset today's tasks
        tasks.forEach(t => t.completed = false);
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        localStorage.setItem(lastResetKey, todayStr);
    }

    // --- SAVE ---
    function saveTasks() {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    }

    // --- RENDER LIST ---
    function renderList() {
        list.innerHTML = '';

        if (tasks.length === 0) {
            const placeholder = document.createElement('li');
            placeholder.className = 'text-center text-muted py-4 d-flex flex-column align-items-center gap-2';

            const img = document.createElement('img');
            img.src = type === "exercise" ? 'assets/img/workout.gif' : 'assets/img/music.gif';
            img.alt = 'No tasks yet';
            img.classList.add('img-fluid', 'rounded-4', 'mb-3');
            placeholder.appendChild(img);

            const text = document.createElement('p');
            text.className = 'mb-0';
            text.innerHTML = type === "exercise"
                ? 'No exercises yet! <br>Click "Add Exercise" to start your cozy routine.'
                : 'No personal tasks yet! <br>Click "Add Personal" to start your cozy routine.';
            placeholder.appendChild(text);

            list.appendChild(placeholder);
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `${type}-item d-flex justify-content-between align-items-center mb-3`;
            li.innerHTML = `
                <div class="form-check d-flex align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" id="${type}${index}" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label" for="${type}${index}">${task.name}</label>
                    <p class="small mb-0">${task.duration} min</p>
                </div>
                <div class="d-flex gap-1">
                    ${type === "exercise" ? `<button class="btns btn-primary start-btn btn-start fs-6"><i class="bi bi-play-fill"></i></button>` : ""}
                    <button class="btns btn-red delete-btn"><i class="bi bi-trash fs-6"></i></button>
                </div>
            `;
            list.appendChild(li);

            // Checkbox
            const checkbox = li.querySelector('.form-check-input');
            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveTasks();
                updateProgress();
            });

            // Delete
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener("click", () => {
                tasks.splice(index, 1);
                saveTasks();
                renderList();
                updateProgress();
            });

            // Start timer (exercise only)
            if (type === "exercise") {
                const startBtn = li.querySelector('.start-btn');
                startBtn.addEventListener('click', () => {
                    const btnIcon = startBtn.querySelector('i');

                    if (currentTask === task && timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        btnIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
                    } else {
                        document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
                        currentTask = task;
                        btnIcon.classList.replace('bi-play-fill', 'bi-pause-fill');
                        remainingTime = task.duration * 60;
                        startTimer(task, startBtn);
                    }
                });
            }
        });
    }

    // --- TIMER LOGIC ---
    function startTimer(task, btn) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (progressCircle) progressCircle.style.strokeDashoffset = 0;
                if (timerDisplay) timerDisplay.textContent = '00:00';
                btn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');

                let playCount = 0;
                if (window.audio) window.audio.volume = 0.3;
                timerSound.onended = () => {
                    playCount++;
                    if (playCount < 2) timerSound.play();
                    else {
                        timerSound.onended = null;
                        if (window.audio) window.audio.volume = 1.0;
                    }
                };
                timerSound.play();

                task.completed = true;
                saveTasks();
                renderList();
                updateProgress();
                remainingTime = 0;
                currentTask = null;
            } else {
                remainingTime--;
                const mins = Math.floor(remainingTime / 60);
                const secs = remainingTime % 60;
                if (timerDisplay) timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                if (progressCircle) progressCircle.style.strokeDashoffset = circumference * (remainingTime / (task.duration * 60));
            }
        }, 1000);
    }

    // --- ADD TASK ---
    modalAddBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const duration = parseInt(durationInput.value.trim(), 10);
        if (!name || !duration) return;

        tasks.push({ name, duration, completed: false });
        saveTasks();
        renderList();
        updateProgress();

        nameInput.value = "";
        durationInput.value = "";

        const modal = bootstrap.Modal.getInstance(document.getElementById(`add${capitalize(type)}Modal`));
        modal.hide();
    });

    // --- RESET BUTTON (exercise only) ---
    if (type === "exercise") {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                clearInterval(timerInterval);
                timerInterval = null;
                remainingTime = 0;
                currentTask = null;
                if (timerDisplay) timerDisplay.textContent = '00:00';
                if (progressCircle) progressCircle.style.strokeDashoffset = circumference;
                document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
            });
        }
    }

    // --- UPDATE PROGRESS & LOG ---
    function updateProgress() {
        const completedCount = tasks.filter(e => e.completed).length;
        const totalCount = tasks.length;

        const completedEl = document.getElementById(`${type}-completed-count`);
        const totalEl = document.getElementById(`${type}-total-count`);
        const progressBar = document.getElementById(`${type}-progress-bar`);

        if (completedEl) completedEl.textContent = completedCount;
        if (totalEl) totalEl.textContent = totalCount;

        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }

        // --- Update cozyTasksLog ---
        const todayKey = getLocalDateKey();
        let tasksLog = JSON.parse(localStorage.getItem("cozyTasksLog")) || {};
        const todayLog = tasksLog[todayKey] || { exercisesDone: [], personalsDone: [] };

        if (type === "exercise") todayLog.exercisesDone = tasks.filter(e => e.completed).map(e => e.name);
        if (type === "personal") todayLog.personalsDone = tasks.filter(p => p.completed).map(p => p.name);

        tasksLog[todayKey] = todayLog;
        localStorage.setItem("cozyTasksLog", JSON.stringify(tasksLog));
    }
    // --- INIT ---
    renderList();
    updateProgress();
}

// ==================
// INIT BOTH
// ==================
document.addEventListener('DOMContentLoaded', () => {
    initToDo("exercise");
    initToDo("personal");
});

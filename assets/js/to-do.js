// to-do.js
function initExerciseToDo() {
    // --- ELEMENTS ---
    const exerciseList = document.querySelector('.exercise-list');
    const modalAddBtn = document.getElementById('modalAddBtn');
    const exerciseNameInput = document.getElementById('exerciseNameInput');
    const exerciseDurationInput = document.getElementById('exerciseDurationInput');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');

    // If essential elements are missing, skip initialization
    if (!exerciseList || !modalAddBtn) return;

    // --- STATE ---
    let exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
    let timerInterval = null;
    let currentTask = null;
    let remainingTime = 0;

    const timerSound = new Audio('assets/playlist/Alarm02.wav');
    const circumference = progressCircle ? 2 * Math.PI * 70 : 0;
    if (progressCircle) progressCircle.style.strokeDasharray = circumference;

    // --- SAVE FUNCTION ---
    function saveExercises() {
        localStorage.setItem('cozyExercises', JSON.stringify(exercises));
    }

    // --- RENDER FUNCTION ---
    function renderList(listElement, items) {
        listElement.innerHTML = '';

        if (items.length === 0) {
            const placeholder = document.createElement('li');
            placeholder.className = 'text-center text-muted py-4 d-flex flex-column align-items-center gap-2';

            const img = document.createElement('img');
            img.src = 'assets/img/workout.gif';
            img.alt = 'No tasks yet';
            img.classList.add('img-fluid', 'rounded-4', 'mb-3');

            const text = document.createElement('p');
            text.className = 'mb-0';
            text.innerHTML = 'No exercises yet! <br>Click "Add Exercise" to start your cozy routine.';

            placeholder.appendChild(img);
            placeholder.appendChild(text);
            listElement.appendChild(placeholder);
            return;
        }

        items.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'exercise-item d-flex justify-content-between align-items-center mb-3';
            li.innerHTML = `
                <div class="form-check d-flex align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" id="exercise${index}" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label" for="exercise${index}">${task.name}</label>
                    <p class="small mb-0">${task.duration} min</p>
                </div>
                <div class="d-flex gap-1">
                    <button class="btns btn-primary start-btn btn-start fs-6"><i class="bi bi-play-fill"></i></button>
                    <button class="btns btn-red delete-btn btn-delete"><i class="bi bi-trash fs-6"></i></button>
                </div>
            `;
            listElement.appendChild(li);

            // --- Checkbox toggle ---
            const checkbox = li.querySelector('.form-check-input');
            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveExercises();
                updateExerciseProgress();
            });

            // --- Delete button ---
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener("click", () => {
                exercises.splice(index, 1);
                saveExercises();
                renderList(exerciseList, exercises);
                updateExerciseProgress();
            });

            // --- Start / Pause button ---
            const startBtn = li.querySelector('.start-btn');
            startBtn.addEventListener('click', () => {
                const btnIcon = startBtn.querySelector('i');

                if (currentTask === task && timerInterval) {
                    // Pause
                    clearInterval(timerInterval);
                    timerInterval = null;
                    btnIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
                } else {
                    // Start new timer
                    document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
                    currentTask = task;
                    btnIcon.classList.replace('bi-play-fill', 'bi-pause-fill');
                    remainingTime = task.duration * 60;
                    startTimer(task, startBtn);
                }
            });
        });
    }

    // --- TIMER FUNCTION ---
    function startTimer(task, btn) {
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                if (progressCircle) progressCircle.style.strokeDashoffset = 0;
                if (timerDisplay) timerDisplay.textContent = '00:00';
                btn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');

                // --- Lower music and play alarm ---
                let playCount = 0;
                if (window.audio) window.audio.volume = 0.3;

                timerSound.onended = () => {
                    playCount++;
                    if (playCount < 2) {
                        timerSound.play();
                    } else {
                        timerSound.onended = null;
                        if (window.audio) window.audio.volume = 1.0; // restore music
                    }
                };
                timerSound.play();

                task.completed = true;
                saveExercises();
                renderList(exerciseList, exercises);
                updateExerciseProgress();
                remainingTime = 0;
                currentTask = null;
                return;
            }

            remainingTime--;
            const mins = Math.floor(remainingTime / 60);
            const secs = remainingTime % 60;
            if (timerDisplay) timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            if (progressCircle) progressCircle.style.strokeDashoffset = circumference * (remainingTime / (task.duration * 60));
        }, 1000);
    }

    // --- MODAL BUTTON EVENT ---
    modalAddBtn.addEventListener("click", () => {
        const name = exerciseNameInput.value.trim();
        const duration = parseInt(exerciseDurationInput.value.trim(), 10);

        if (name && duration) {
            exercises.push({ name, duration, completed: false });
            saveExercises();
            renderList(exerciseList, exercises);
            updateExerciseProgress();

            exerciseNameInput.value = "";
            exerciseDurationInput.value = "";

            const modal = bootstrap.Modal.getInstance(document.getElementById("addExerciseModal"));
            modal.hide();
        }
    });

    // --- RESET BUTTON ---
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

    // --- PROGRESS FUNCTION ---
    function updateExerciseProgress() {
        const completedCount = exercises.filter(e => e.completed).length;
        const totalCount = exercises.length;

        const completedEl = document.getElementById('exercise-completed-count');
        const totalEl = document.getElementById('exercise-total-count');
        const progressBar = document.getElementById('exercise-progress-bar');

        if (!completedEl || !totalEl || !progressBar) return;

        completedEl.textContent = completedCount;
        totalEl.textContent = totalCount;

        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage + '%';
    }

    // --- INITIAL RENDER ---
    renderList(exerciseList, exercises);
    updateExerciseProgress();
}

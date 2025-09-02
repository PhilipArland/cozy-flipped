// to-do.js
function initExerciseToDo() {
    // --- ELEMENTS ---
    const exerciseList = document.querySelector('.exercise-list');

    const modalAddExerciseBtn = document.getElementById('modalAddBtn');
    const exerciseNameInput = document.getElementById('exerciseNameInput');
    const exerciseDurationInput = document.getElementById('exerciseDurationInput');

    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');

    if (!exerciseList || !modalAddExerciseBtn) {
        console.warn("Exercise To-Do elements not found on this page.");
        return;
    }

    // --- STATE ---
    let exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
    let timerInterval;
    let currentTask = null;
    let remainingTime = 0;

    const timerSound = new Audio('assets/playlist/Alarm02.wav');
    const circumference = 2 * Math.PI * 70;
    progressCircle.style.strokeDasharray = circumference;

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

        items.forEach(task => {
            const li = document.createElement('li');
            li.className = 'exercise-item d-flex justify-content-between align-items-center mb-3';
            li.innerHTML = `
                <div class="form-check d-flex align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" id="exercise${task.id}" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label" for="exercise${task.id}">${task.name}</label>
                    <p class="small mb-0">${task.duration} min</p>
                </div>
                <div class="d-flex gap-1">
                    <button class="start-btn btn-start fs-6"><i class="bi bi-play-fill"></i></button>
                    <button class="delete-btn btn-delete"><i class="bi bi-trash fs-6 text-white"></i></button>
                </div>
            `;
            listElement.appendChild(li);

            // Checkbox toggle
            li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
                task.completed = e.target.checked;
                saveExercises();
            });

            // Delete button
            li.querySelector('.delete-btn').addEventListener('click', () => {
                exercises = exercises.filter(t => t.id !== task.id);
                saveExercises();
                renderList(listElement, exercises);
            });

            // Start / Pause button
            li.querySelector('.start-btn').addEventListener('click', () => {
                const btnIcon = li.querySelector('.start-btn i');

                if (currentTask === task && timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    btnIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
                } else {
                    document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
                    currentTask = task;
                    btnIcon.classList.replace('bi-play-fill', 'bi-pause-fill');
                    if (!remainingTime || currentTask !== task) remainingTime = task.duration * 60;
                    startTimer(task, li.querySelector('.start-btn'));
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
                progressCircle.style.strokeDashoffset = 0;
                timerDisplay.textContent = '00:00';
                btn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');

                let playCount = 0;
                timerSound.onended = () => {
                    playCount++;
                    if (playCount < 2) timerSound.play();
                    else timerSound.onended = null;
                };
                timerSound.play();

                task.completed = true;
                saveExercises();
                renderList(exerciseList, exercises);
                remainingTime = 0;
                currentTask = null;
                return;
            }

            remainingTime--;
            const mins = Math.floor(remainingTime / 60);
            const secs = remainingTime % 60;
            timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            progressCircle.style.strokeDashoffset = circumference * (remainingTime / (task.duration * 60));
        }, 1000);
    }

    // --- MODAL BUTTON EVENT ---
    modalAddExerciseBtn.addEventListener('click', () => {
        const name = exerciseNameInput.value.trim();
        const duration = parseFloat(exerciseDurationInput.value);
        if (!name || isNaN(duration) || duration <= 0) return alert('Please enter a valid name and duration!');

        const task = { id: Date.now(), name, duration, completed: false, type: 'exercise' };
        exercises.push(task);
        saveExercises();
        renderList(exerciseList, exercises);

        exerciseNameInput.value = '';
        exerciseDurationInput.value = '';
        bootstrap.Modal.getInstance(document.getElementById('addExerciseModal')).hide();
    });

    // --- RESET BUTTON ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            remainingTime = 0;
            currentTask = null;
            timerDisplay.textContent = '00:00';
            progressCircle.style.strokeDashoffset = circumference;
            document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
        });
    }

    // --- INITIAL RENDER ---
    renderList(exerciseList, exercises);
}

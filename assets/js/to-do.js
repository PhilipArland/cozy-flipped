// to-do.js
function initExerciseToDo() {
    // --- ELEMENTS ---
    const exerciseList = document.querySelector('.exercise-list');
    const studyList = document.querySelector('.study-list');

    const modalAddExerciseBtn = document.getElementById('modalAddBtn');
    const modalAddStudyBtn = document.getElementById('modalAddStudyBtn');

    const exerciseNameInput = document.getElementById('exerciseNameInput');
    const exerciseDurationInput = document.getElementById('exerciseDurationInput');

    const studyNameInput = document.getElementById('studyNameInput');
    const studyDurationInput = document.getElementById('studyDurationInput');

    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');

    if (!exerciseList || !studyList || !modalAddExerciseBtn || !modalAddStudyBtn) {
        console.warn("To-Do elements not found on this page.");
        return;
    }

    // --- STATE ---
    let exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
    let studies = JSON.parse(localStorage.getItem('cozyStudies')) || [];
    let timerInterval;
    let currentTask = null;
    let remainingTime = 0;

    const timerSound = new Audio('assets/playlist/Alarm02.wav');
    const circumference = 2 * Math.PI * 70;
    progressCircle.style.strokeDasharray = circumference;

    // --- SAVE FUNCTIONS ---
    function saveExercises() {
        localStorage.setItem('cozyExercises', JSON.stringify(exercises));
    }

    function saveStudies() {
        localStorage.setItem('cozyStudies', JSON.stringify(studies));
    }

    // --- RENDER FUNCTION ---
    function renderList(listElement, items, type) {
        listElement.innerHTML = '';

        if (items.length === 0) {
            const placeholder = document.createElement('li');
            placeholder.className = 'text-center text-muted py-4 d-flex flex-column align-items-center gap-2';

            const img = document.createElement('img');
            img.src = type === 'exercise' ? 'assets/img/workout.gif' : 'assets/img/studying.gif';
            img.alt = 'No tasks yet';
            img.classList.add('img-fluid', 'rounded-4', 'mb-3');

            const text = document.createElement('p');
            text.className = 'mb-0';
            text.innerHTML = type === 'exercise'
                ? 'No exercises yet! <br>Click "Add Exercise" to start your cozy routine.'
                : 'No study tasks yet! <br>Click "Add Task" to start your cozy study session.';

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
                    <input class="form-check-input" type="checkbox" id="${type}${task.id}" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label" for="${type}${task.id}">${task.name}</label>
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
                type === 'exercise' ? saveExercises() : saveStudies();
            });

            // Delete button
            li.querySelector('.delete-btn').addEventListener('click', () => {
                if (type === 'exercise') {
                    exercises = exercises.filter(t => t.id !== task.id);
                    saveExercises();
                } else {
                    studies = studies.filter(t => t.id !== task.id);
                    saveStudies();
                }
                renderList(listElement, type === 'exercise' ? exercises : studies, type);
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
                task.type === 'exercise' ? saveExercises() : saveStudies();
                renderList(task.type === 'exercise' ? exerciseList : studyList, task.type === 'exercise' ? exercises : studies, task.type);
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

    // --- MODAL BUTTON EVENTS ---
    modalAddExerciseBtn.addEventListener('click', () => {
        const name = exerciseNameInput.value.trim();
        const duration = parseFloat(exerciseDurationInput.value);
        if (!name || isNaN(duration) || duration <= 0) return alert('Please enter a valid name and duration!');

        const task = { id: Date.now(), name, duration, completed: false, type: 'exercise' };
        exercises.push(task);
        saveExercises();
        renderList(exerciseList, exercises, 'exercise');

        exerciseNameInput.value = '';
        exerciseDurationInput.value = '';
        bootstrap.Modal.getInstance(document.getElementById('addExerciseModal')).hide();
    });

    modalAddStudyBtn.addEventListener('click', () => {
        const name = studyNameInput.value.trim();
        const duration = parseFloat(studyDurationInput.value);
        if (!name || isNaN(duration) || duration <= 0) return alert('Please enter a valid name and duration!');

        const task = { id: Date.now(), name, duration, completed: false, type: 'study' };
        studies.push(task);
        saveStudies();
        renderList(studyList, studies, 'study');

        studyNameInput.value = '';
        studyDurationInput.value = '';
        bootstrap.Modal.getInstance(document.getElementById('addStudyModal')).hide();
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
    renderList(exerciseList, exercises, 'exercise');
    renderList(studyList, studies, 'study');
}

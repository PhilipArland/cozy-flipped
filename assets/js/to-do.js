// to-do.js

function initExerciseToDo() {
    const exerciseList = document.querySelector('.exercise-list');
    const modalAddBtn = document.getElementById('modalAddBtn');
    const exerciseNameInput = document.getElementById('exerciseNameInput');
    const exerciseDurationInput = document.getElementById('exerciseDurationInput');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');

    if (!exerciseList || !modalAddBtn || !exerciseNameInput || !exerciseDurationInput) {
        console.warn("To-Do elements not found on this page.");
        return;
    }

    // Load exercises from localStorage or start empty
    let exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
    let timerInterval;
    let currentExercise = null;
    let remainingTime = 0;

    const timerSound = new Audio('assets/playlist/Alarm02.wav');
    const circumference = 2 * Math.PI * 70;
    progressCircle.style.strokeDasharray = circumference;

    // Save exercises
    function saveExercises() {
        localStorage.setItem('cozyExercises', JSON.stringify(exercises));
    }

    // Render exercise list
    function renderExercises() {
        exerciseList.innerHTML = '';

        if (exercises.length === 0) {
            const placeholder = document.createElement('li');
            placeholder.className = 'text-center text-muted py-4 d-flex flex-column align-items-center gap-2';

            const img = document.createElement('img');
            img.src = 'assets/img/workout.gif';
            img.alt = 'No exercises yet';
            img.classList.add('img-fluid', 'rounded-4', 'mb-3');

            const text = document.createElement('p');
            text.className = 'mb-0';
            text.innerHTML = 'No exercises yet! <br>Click "Add Exercise" to start your cozy routine.';

            placeholder.appendChild(img);
            placeholder.appendChild(text);
            exerciseList.appendChild(placeholder);
            return;
        }

        exercises.forEach(ex => {
            const li = document.createElement('li');
            li.className = 'exercise-item d-flex justify-content-between align-items-center mb-3';
            li.innerHTML = `
                <div class="form-check d-flex align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" id="exercise${ex.id}" ${ex.completed ? 'checked' : ''}>
                    <label class="form-check-label" for="exercise${ex.id}">${ex.name}</label>
                    <p class="small mb-0">${ex.duration} min</p>
                </div>
                <div class="d-flex gap-1">
                    <button class="start-btn btn-start fs-6"><i class="bi bi-play-fill"></i></button>
                    <button class="delete-btn btn-delete"><i class="bi bi-trash fs-6 text-white"></i></button>
                </div>
            `;

            exerciseList.appendChild(li);

            // Checkbox toggle
            li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
                ex.completed = e.target.checked;
                saveExercises();
            });

            // Delete button
            li.querySelector('.delete-btn').addEventListener('click', () => {
                exercises = exercises.filter(item => item.id !== ex.id);
                saveExercises();
                renderExercises();
            });

            // Start / Pause timer
            li.querySelector('.start-btn').addEventListener('click', () => {
                const btnIcon = li.querySelector('.start-btn i');

                if (currentExercise === ex && timerInterval) {
                    // Pause timer
                    clearInterval(timerInterval);
                    timerInterval = null;
                    btnIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
                } else {
                    // Stop any other running timer
                    document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));

                    currentExercise = ex;
                    btnIcon.classList.replace('bi-play-fill', 'bi-pause-fill');

                    if (!remainingTime || currentExercise !== ex) remainingTime = ex.duration * 60;

                    startExerciseTimer(ex, li.querySelector('.start-btn'));
                }
            });
        });
    }

    // Timer function
    function startExerciseTimer(exercise, btn) {
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                progressCircle.style.strokeDashoffset = 0;
                timerDisplay.textContent = '00:00';
                btn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');

                // Play sound twice
                let playCount = 0;
                timerSound.onended = () => {
                    playCount++;
                    if (playCount < 2) timerSound.play();
                    else timerSound.onended = null;
                };
                timerSound.play();

                exercise.completed = true;
                saveExercises();
                renderExercises();
                remainingTime = 0;
                currentExercise = null;
                return;
            }

            remainingTime--;
            const mins = Math.floor(remainingTime / 60);
            const secs = remainingTime % 60;
            timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            progressCircle.style.strokeDashoffset = circumference * (remainingTime / (exercise.duration * 60));
        }, 1000);
    }

    // Add exercise from modal
    modalAddBtn.addEventListener('click', () => {
        const name = exerciseNameInput.value.trim();
        const duration = parseFloat(exerciseDurationInput.value);

        if (!name || isNaN(duration) || duration <= 0) {
            alert('Please enter a valid name and duration!');
            return;
        }

        exercises.push({ id: Date.now(), name, duration, completed: false });
        saveExercises();
        renderExercises();

        exerciseNameInput.value = '';
        exerciseDurationInput.value = '';

        const modalEl = document.getElementById('addExerciseModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    });

    // Reset timer button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            remainingTime = 0;
            currentExercise = null;
            timerDisplay.textContent = '00:00';
            progressCircle.style.strokeDashoffset = circumference;
            document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
        });
    }

    // Initial render
    renderExercises();
}

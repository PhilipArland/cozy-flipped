const exerciseList = document.querySelector('.exercise-list');
const modalAddBtn = document.getElementById('modalAddBtn');
const exerciseNameInput = document.getElementById('exerciseNameInput');
const exerciseDurationInput = document.getElementById('exerciseDurationInput');

// Load exercises from localStorage or start empty
let exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];

// Save to localStorage
function saveExercises() {
    localStorage.setItem('cozyExercises', JSON.stringify(exercises));
}

// Timer state
let timerInterval;
let currentExercise = null;
let remainingTime = 0;

// Render exercises
function renderExercises() {
    exerciseList.innerHTML = '';

    if (exercises.length === 0) {
        const placeholder = document.createElement('li');
        placeholder.className = 'text-center text-muted py-4 d-flex flex-column align-items-center gap-2';

        // Add an image
        const img = document.createElement('img');
        img.src = 'assets/img/workout.gif'; // replace with your cute image path
        img.alt = 'No exercises yet';
        img.classList.add('img-fluid', 'rounded-4', 'mb-3');

        // Add text
        const text = document.createElement('p');
        text.className = 'mb-0';
        text.style.fontFamily = "'Comic Sans MS', cursive";
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
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="exercise${ex.id}" ${ex.completed ? 'checked' : ''}>
                <label class="form-check-label" for="exercise${ex.id}">${ex.name}</label>
                <p class="small">${ex.duration} min</p>
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

        // Start / Pause button
        const startBtn = li.querySelector('.start-btn');
        startBtn.addEventListener('click', () => {
            const icon = startBtn.querySelector('i');

            if (currentExercise === ex && timerInterval) {
                // Pause
                clearInterval(timerInterval);
                timerInterval = null;
                icon.classList.replace('bi-pause-fill', 'bi-play-fill');
            } else {
                // Stop any running timer and reset icons
                document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));

                currentExercise = ex;
                icon.classList.replace('bi-play-fill', 'bi-pause-fill');

                if (!remainingTime || currentExercise !== ex) {
                    remainingTime = ex.duration * 60; // minutes → seconds
                }

                startExerciseTimer(ex, startBtn);
            }
        });
    });
}


// Timer sound
const timerSound = new Audio('assets/playlist/Alarm02.wav');

// Start timer function
function startExerciseTimer(exercise, btn) {
    clearInterval(timerInterval);

    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 70;
    progressCircle.style.strokeDasharray = circumference;

    timerInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            progressCircle.style.strokeDashoffset = 0;
            timerDisplay.textContent = '00:00';
            btn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');

            // Play timer sound twice
            let playCount = 0;
            timerSound.onended = () => {
                playCount++;
                if (playCount < 2) timerSound.play();
                else timerSound.onended = null;
            };
            timerSound.play();

            // Auto-check exercise
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

    if (name && duration > 0) {
        exercises.push({ id: Date.now(), name, duration, completed: false });
        saveExercises();
        renderExercises();

        exerciseNameInput.value = '';
        exerciseDurationInput.value = '';
        const modalEl = document.getElementById('addExerciseModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    } else {
        alert('Please enter a valid name and duration!');
    }
});

// Reset timer
document.getElementById('resetBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timerDisplay');
    const progressCircle = document.getElementById('progressCircle');
    timerDisplay.textContent = '00:00';
    progressCircle.style.strokeDashoffset = 2 * Math.PI * 70;
    document.querySelectorAll('.start-btn i').forEach(i => i.classList.replace('bi-pause-fill', 'bi-play-fill'));
    remainingTime = 0;
    currentExercise = null;
});

// Initial render
renderExercises();


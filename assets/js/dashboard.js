// dashboard.js

function initDashboardPage() {
    applySavedProfile(); // 👈 ensures the welcome message updates on page load
}

// dashboard.js
function initDashboardPage() {
    // --- Exercise Progress ---
    function updateExerciseProgressDashboard() {
        const exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
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

    // --- Call once on page load ---
    updateExerciseProgressDashboard();

    // --- Optional: update every few seconds so dashboard stays synced ---
    setInterval(updateExerciseProgressDashboard, 2000);

    // ... your other dashboard logic (personal progress, calendar, etc.)
}

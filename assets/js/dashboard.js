// dashboard.js
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function initDashboardPage() {
    // --- Reset exercises daily ---
    function resetDailyExercises() {
        const today = new Date().toDateString(); // e.g., "Sun Sep 07 2025"
        const lastReset = localStorage.getItem('cozyExercisesLastReset');

        if (lastReset !== today) {
            // ✅ Finalize yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yKey = getLocalDateKey(yesterday);

            const exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
            let log = JSON.parse(localStorage.getItem("cozyExercisesLog")) || {};

            if (!log[yKey]) {
                log[yKey] = exercises.filter(e => e.completed).map(e => e.name);
                localStorage.setItem("cozyExercisesLog", JSON.stringify(log));
            }

            // Reset for today
            exercises.forEach(e => e.completed = false);
            localStorage.setItem('cozyExercises', JSON.stringify(exercises));
            localStorage.setItem('cozyExercisesLastReset', today);
        }
    }

    // Call it immediately on page load
    resetDailyExercises();

    // --- Personal Tasks ---
    function updatePersonalProgress() {
        const personalTasks = JSON.parse(localStorage.getItem('cozyPersonalTasks')) || [];
        const totalCount = personalTasks.length;
        const completedCount = personalTasks.filter(task => task.completed).length;
        const remainingCount = totalCount - completedCount;

        const personalEl = document.getElementById('personal-count');
        if (personalEl) personalEl.textContent = remainingCount;

        const progressBar = document.getElementById('personal-progress-bar');
        if (progressBar) {
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }
    }

    // --- Exercise Tasks ---
    function updateExerciseProgress() {
        const exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
        const totalCount = exercises.length;
        const completedCount = exercises.filter(e => e.completed).length;
        const remainingCount = totalCount - completedCount;

        const exerciseEl = document.getElementById('exercise-count');
        if (exerciseEl) exerciseEl.textContent = remainingCount;

        const progressBar = document.getElementById('exercise-progress-bar');
        const completedSpan = document.getElementById('exercise-completed-count');
        const totalSpan = document.getElementById('exercise-total-count');

        if (progressBar) {
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }

        if (completedSpan) completedSpan.textContent = completedCount;
        if (totalSpan) totalSpan.textContent = totalCount;
    }

    // --- Calendar Generation ---
    function generateCalendar() {
        const grid = document.getElementById("calendar-grid");
        const monthLabel = document.getElementById("calendar-month");
        if (!grid || !monthLabel) return;

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthName = date.toLocaleString("default", { month: "long" });
        monthLabel.textContent = `${monthName} ${year}`;
        grid.innerHTML = "";

        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        weekdays.forEach(d => {
            let div = document.createElement("div");
            div.textContent = d;
            div.style.fontWeight = "bold";
            div.style.color = "var(--text-primary)";
            grid.appendChild(div);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const exercises = JSON.parse(localStorage.getItem('cozyExercises')) || [];
        const completedLog = JSON.parse(localStorage.getItem('cozyExercisesLog')) || {};

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement("div"));
        }

        for (let d = 1; d <= daysInMonth; d++) {
            let div = document.createElement("div");
            div.style.color = "var(--text-primary)";
            div.textContent = d;

            const dayKey = getLocalDateKey(new Date(year, month, d));

            // --- Highlight today ---
            if (d === date.getDate()) {
                div.style.background = "var(--bg-cozy-orange)";
                div.style.color = "#fff";
                div.style.borderRadius = "6px";
            }

            // --- Highlight completed tasks ---
            if (completedLog[dayKey] && completedLog[dayKey].length > 0) {
                if (completedLog[dayKey].length === exercises.length) {
                    // ✅ All done
                    div.style.background = "var(--bg-cozy-green)";
                    div.style.color = "#fff";
                } else {
                    // ⚠️ Some done
                    div.style.background = "var(--bg-cozy-yellow)";
                    div.style.color = "#000";
                }
                div.style.borderRadius = "6px";
            }

            grid.appendChild(div);
        }
    }

    // --- Initial update on page load ---
    updatePersonalProgress();
    updateExerciseProgress();
    generateCalendar();

    // --- Keep them in sync live ---
    setInterval(() => {
        updatePersonalProgress();
        updateExerciseProgress();
    }, 2000);

    applySavedProfile();
}

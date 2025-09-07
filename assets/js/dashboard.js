// dashboard.js
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function initDashboardPage() {
    // --- Reset tasks daily ---
    function resetDailyTasks() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem("cozyTasksLastReset");

        if (lastReset !== today) {
            // ✅ Finalize yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yKey = getLocalDateKey(yesterday);

            const exercises = JSON.parse(localStorage.getItem("cozyExercises")) || [];
            const personals = JSON.parse(localStorage.getItem("cozyPersonals")) || [];
            let log = JSON.parse(localStorage.getItem("cozyTasksLog")) || {};

            if (!log[yKey]) {
                log[yKey] = {
                    exercisesDone: exercises.filter(e => e.completed).map(e => e.name),
                    personalsDone: personals.filter(p => p.completed).map(p => p.name)
                };
                localStorage.setItem("cozyTasksLog", JSON.stringify(log));
            }

            // Reset for today
            exercises.forEach(e => e.completed = false);
            personals.forEach(p => p.completed = false);

            localStorage.setItem("cozyExercises", JSON.stringify(exercises));
            localStorage.setItem("cozyPersonals", JSON.stringify(personals));
            localStorage.setItem("cozyTasksLastReset", today);
        }
    }

    resetDailyTasks();

    // --- Personal Tasks ---
    function updatePersonalProgress() {
        const personalTasks = JSON.parse(localStorage.getItem("cozyPersonals")) || [];
        const totalCount = personalTasks.length;
        const completedCount = personalTasks.filter(task => task.completed).length;
        const remainingCount = totalCount - completedCount;

        const personalEl = document.getElementById("personal-count");
        if (personalEl) personalEl.textContent = remainingCount;

        const progressBar = document.getElementById("personal-progress-bar");
        if (progressBar) {
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            progressBar.style.width = percentage + "%";
            progressBar.textContent = percentage + "%";
        }
    }

    // --- Exercise Tasks ---
    function updateExerciseProgress() {
        const exercises = JSON.parse(localStorage.getItem("cozyExercises")) || [];
        const totalCount = exercises.length;
        const completedCount = exercises.filter(e => e.completed).length;
        const remainingCount = totalCount - completedCount;

        const exerciseEl = document.getElementById("exercise-count");
        if (exerciseEl) exerciseEl.textContent = remainingCount;

        const progressBar = document.getElementById("exercise-progress-bar");
        const completedSpan = document.getElementById("exercise-completed-count");
        const totalSpan = document.getElementById("exercise-total-count");

        if (progressBar) {
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            progressBar.style.width = percentage + "%";
            progressBar.textContent = percentage + "%";
        }

        if (completedSpan) completedSpan.textContent = completedCount;
        if (totalSpan) totalSpan.textContent = totalCount;
    }

    // --- Calendar Generation (Exercises + Personals) ---
    function generateCalendar() {
        const grid = document.getElementById("calendar-grid");
        const monthLabel = document.getElementById("calendar-month");
        if (!grid || !monthLabel) return;

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = date.getDate();
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

        const exercises = JSON.parse(localStorage.getItem("cozyExercises")) || [];
        const personals = JSON.parse(localStorage.getItem("cozyPersonals")) || [];
        const completedLog = JSON.parse(localStorage.getItem("cozyTasksLog")) || {};

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement("div"));
        }

        for (let d = 1; d <= daysInMonth; d++) {
            let div = document.createElement("div");
            div.style.color = "var(--text-primary)";
            div.style.position = "relative";
            div.textContent = d;

            const dayKey = getLocalDateKey(new Date(year, month, d));

            // Today is always orange
            if (d === today) {
                div.style.background = "var(--bg-cozy-orange)";
                div.style.color = "#fff";
                div.style.borderRadius = "6px";

                if (completedLog[dayKey]) {
                    let banner = document.createElement("span");
                    banner.textContent = "✓";
                    banner.style.position = "absolute";
                    banner.style.top = "2px";
                    banner.style.right = "4px";
                    banner.style.fontSize = "0.7rem";
                    banner.style.color = "#fff";
                    banner.style.background = "var(--bg-cozy-green)";
                    banner.style.borderRadius = "4px";
                    banner.style.padding = "0 3px";
                    div.appendChild(banner);
                }
            } else {
                if (completedLog[dayKey]) {
                    const { exercisesDone = [], personalsDone = [] } = completedLog[dayKey];
                    const allExercisesDone = exercises.length > 0 && exercisesDone.length === exercises.length;
                    const allPersonalsDone = personals.length > 0 && personalsDone.length === personals.length;

                    if (allExercisesDone && allPersonalsDone) {
                        div.style.background = "var(--bg-cozy-green)"; // ✅ all done
                        div.style.color = "#fff";
                    } else {
                        div.style.background = "var(--bg-cozy-yellow)"; // ⚠️ some done
                        div.style.color = "#000";
                    }
                    div.style.borderRadius = "6px";
                }
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
        generateCalendar();
    }, 2000);

    applySavedProfile();
}

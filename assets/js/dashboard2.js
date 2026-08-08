// --- UTIL ---
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ==================
// DASHBOARD INIT
// ==================
function initDashboardPage() {
    // --- Reset tasks daily ---
    function resetDailyTasks() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem("cozyTasksLastReset");

        if (lastReset !== today) {
            // Finalize yesterday
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

    // --- Unified Task Progress (Exercises + Personal) ---
    function updateTaskProgress(type) {
        const tasks = JSON.parse(localStorage.getItem(type === "exercise" ? "cozyExercises" : "cozyPersonals")) || [];
        const completedCount = tasks.filter(t => t.completed).length;
        const totalCount = tasks.length;
        const remainingCount = totalCount - completedCount;

        const countEl = document.getElementById(`${type}-count`);
        const messageEl = countEl.nextElementSibling;

        if (totalCount === 0) {
            countEl.textContent = '';
            messageEl.textContent = 'You have no tasks today! 🛋️';
        } else if (remainingCount === 0) {
            countEl.textContent = '';
            messageEl.textContent = '🎉 All done!';
        } else {
            countEl.textContent = remainingCount;
            messageEl.textContent = 'remaining';
        }

        const progressBar = document.getElementById(`${type}-progress-bar`);
        const completedSpan = document.getElementById(`${type}-completed-count`);
        const totalSpan = document.getElementById(`${type}-total-count`);

        if (progressBar) {
            const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
        }
        if (completedSpan) completedSpan.textContent = completedCount;
        if (totalSpan) totalSpan.textContent = totalCount;

        // Update cozyTasksLog
        const todayKey = getLocalDateKey();
        let tasksLog = JSON.parse(localStorage.getItem("cozyTasksLog")) || {};
        const todayLog = tasksLog[todayKey] || { exercisesDone: [], personalsDone: [] };

        if (type === "exercise") todayLog.exercisesDone = tasks.filter(t => t.completed).map(t => t.name);
        if (type === "personal") todayLog.personalsDone = tasks.filter(t => t.completed).map(t => t.name);

        tasksLog[todayKey] = todayLog;
        localStorage.setItem("cozyTasksLog", JSON.stringify(tasksLog));
    }

    // --- Calendar Generation ---
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
            const div = document.createElement("div");
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
        for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));

        for (let d = 1; d <= daysInMonth; d++) {
            const div = document.createElement("div");
            div.style.color = "var(--text-primary)";
            div.style.position = "relative";
            div.textContent = d;

            const dayKey = getLocalDateKey(new Date(year, month, d));

            if (d === today) {
                div.style.background = "var(--bg-cozy-orange)";
                div.style.color = "#fff";
                div.style.borderRadius = "6px";
            } else if (completedLog[dayKey]) {
                const { exercisesDone = [], personalsDone = [] } = completedLog[dayKey];
                const allExercisesDone = exercises.length > 0 && exercisesDone.length === exercises.length;
                const allPersonalsDone = personals.length > 0 && personalsDone.length === personals.length;

                if (allExercisesDone && allPersonalsDone) {
                    div.style.background = "var(--bg-cozy-green)";
                    div.style.color = "#fff";
                } else if (exercisesDone.length > 0 || personalsDone.length > 0) {
                    div.style.background = "var(--bg-cozy-yellow)";
                    div.style.color = "#000";
                }
                div.style.borderRadius = "6px";
            }

            grid.appendChild(div);
        }
    }

    // --- Initial update on page load ---
    updateTaskProgress("personal");
    updateTaskProgress("exercise");
    generateCalendar();

    // --- Keep them in sync live ---
    setInterval(() => {
        updateTaskProgress("personal");
        updateTaskProgress("exercise");
        generateCalendar();
    }, 2000);

    applySavedProfile();
}

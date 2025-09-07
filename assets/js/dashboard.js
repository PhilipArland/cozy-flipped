// --- UTIL ---
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// --- GENERIC TASK PROGRESS (exercise + personal) ---
function updateTaskProgress(type) {
    const storageKey = type === "exercise" ? "cozyExercises" : "cozyPersonals";
    const tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const remainingCount = totalCount - completedCount;

    // --- Update counts & messages in DOM ---
    const countEl = document.getElementById(`${type}-count`);
    const messageEl = countEl ? countEl.nextElementSibling : null;

    if (totalCount === 0) {
        if (countEl) countEl.textContent = '';
        if (messageEl) messageEl.textContent = 'You have no tasks today! 🛋️';
    } else if (remainingCount === 0) {
        if (countEl) countEl.textContent = '';
        if (messageEl) messageEl.textContent = '🎉 All done!';
    } else {
        if (countEl) countEl.textContent = remainingCount;
        if (messageEl) messageEl.textContent = 'remaining';
    }

    // --- Update progress bar and counts ---
    const progressBar = document.getElementById(`${type}-progress-bar`);
    const completedSpan = document.getElementById(`${type}-completed-count`);
    const totalSpan = document.getElementById(`${type}-total-count`);

    if (progressBar) {
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        progressBar.style.width = percentage + "%";
        progressBar.textContent = percentage + "%";
    }

    if (completedSpan) completedSpan.textContent = completedCount;
    if (totalSpan) totalSpan.textContent = totalCount;

    // --- Update today's log ---
    const todayKey = getLocalDateKey();
    let tasksLog = JSON.parse(localStorage.getItem("cozyTasksLog")) || {};
    const todayLog = tasksLog[todayKey] || { exercisesDone: [], personalsDone: [] };

    if (type === "exercise") todayLog.exercisesDone = tasks.filter(t => t.completed).map(t => t.name);
    if (type === "personal") todayLog.personalsDone = tasks.filter(t => t.completed).map(t => t.name);

    tasksLog[todayKey] = todayLog;
    localStorage.setItem("cozyTasksLog", JSON.stringify(tasksLog));
}

// --- INIT ON DASHBOARD ---
document.addEventListener('DOMContentLoaded', () => {
    updateTaskProgress("exercise");
    updateTaskProgress("personal");

    // --- Live sync ---
    setInterval(() => {
        updateTaskProgress("exercise");
        updateTaskProgress("personal");
    }, 2000);

    // Apply user profile globally
    applySavedProfile();
});

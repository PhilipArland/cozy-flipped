console.log("dashboard.js loaded");

function initDashboardPage() {

    console.log("initDashboardPage() called");

    const todoColumn = document.getElementById("todoColumn");
    const progressColumn = document.getElementById("progressColumn");
    const doneColumn = document.getElementById("doneColumn");

    console.log("todoColumn:", todoColumn);
    console.log("progressColumn:", progressColumn);
    console.log("doneColumn:", doneColumn);

    if (!todoColumn || !progressColumn || !doneColumn) {
        console.log("Kanban elements not found!");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("kanbanTasks"));

    if (!tasks) {
        tasks = [
            {
                id: Date.now(),
                title: "Website Backup",
                status: "todo",
                label: "Website"
            }
        ];

        saveTasks();
    }


    function saveTasks() {
        localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }


    function renderTasks() {

        todoColumn.innerHTML = "";
        progressColumn.innerHTML = "";
        doneColumn.innerHTML = "";

        const todoTasks = tasks.filter(task => task.status === "todo");
        const progressTasks = tasks.filter(task => task.status === "progress");
        const doneTasks = tasks.filter(task => task.status === "done");


        todoTasks.forEach(task => {
            todoColumn.appendChild(createTaskCard(task));
        });

        progressTasks.forEach(task => {
            progressColumn.appendChild(createTaskCard(task));
        });

        doneTasks.forEach(task => {
            doneColumn.appendChild(createTaskCard(task));
        });


        addCardButton(todoColumn, "todo");
        addCardButton(progressColumn, "progress");
        addCardButton(doneColumn, "done");


        todoCount.textContent = todoTasks.length;
        progressCount.textContent = progressTasks.length;
        doneCount.textContent = doneTasks.length;
    }


    function createTaskCard(task) {

        const card = document.createElement("div");

        card.className = "card border shadow-sm";

        card.innerHTML = `
            <div class="card-body p-3">

                <div class="d-flex justify-content-between align-items-start">

                    <h6 class="mb-2">
                        ${escapeHtml(task.title)}
                    </h6>

                    <div class="dropdown">
                        <button
                            class="btn btn-sm btn-light p-1"
                            data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end">

                            ${task.status !== "todo"
                ? `
                                        <li>
                                            <button
                                                class="dropdown-item move-task"
                                                data-id="${task.id}"
                                                data-status="todo">
                                                Move to To Do
                                            </button>
                                        </li>
                                      `
                : ""
            }

                            ${task.status !== "progress"
                ? `
                                        <li>
                                            <button
                                                class="dropdown-item move-task"
                                                data-id="${task.id}"
                                                data-status="progress">
                                                Move to In Progress
                                            </button>
                                        </li>
                                      `
                : ""
            }

                            ${task.status !== "done"
                ? `
                                        <li>
                                            <button
                                                class="dropdown-item move-task"
                                                data-id="${task.id}"
                                                data-status="done">
                                                Move to Done
                                            </button>
                                        </li>
                                      `
                : ""
            }

                            <li>
                                <hr class="dropdown-divider">
                            </li>

                            <li>
                                <button
                                    class="dropdown-item text-danger delete-task"
                                    data-id="${task.id}">
                                    Delete
                                </button>
                            </li>

                        </ul>
                    </div>

                </div>

                ${task.label
                ? `
                            <span class="badge bg-primary-subtle text-primary">
                                ${escapeHtml(task.label)}
                            </span>
                          `
                : ""
            }

            </div>
        `;

        return card;
    }


    function addCardButton(column, status) {

        const button = document.createElement("button");

        button.className =
            "btn btn-light text-start text-muted border-0";

        button.innerHTML = `
            <i class="bi bi-plus-lg me-1"></i>
            Add a card
        `;

        button.addEventListener("click", function () {

            const title = prompt("Enter task name:");

            if (!title || !title.trim()) return;

            tasks.push({
                id: Date.now(),
                title: title.trim(),
                status: status,
                label: ""
            });

            saveTasks();
            renderTasks();

        });

        column.appendChild(button);
    }


    document.addEventListener("click", function (event) {

        const moveButton =
            event.target.closest(".move-task");

        const deleteButton =
            event.target.closest(".delete-task");


        if (moveButton) {

            const id = Number(moveButton.dataset.id);
            const status = moveButton.dataset.status;

            const task = tasks.find(task => task.id === id);

            if (task) {
                task.status = status;

                saveTasks();
                renderTasks();
            }
        }


        if (deleteButton) {

            const id = Number(deleteButton.dataset.id);

            tasks = tasks.filter(task => task.id !== id);

            saveTasks();
            renderTasks();
        }

    });


    function escapeHtml(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    renderTasks();
}
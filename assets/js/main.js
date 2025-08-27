document.addEventListener("DOMContentLoaded", function () {

    /*** Helper: Load HTML into a target element ***/
    function loadHTML(targetId, url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(html => {
                document.getElementById(targetId).innerHTML = html;
                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    /*** Helper: Load main content pages ***/
    function loadPage(page, callback) {
        fetch(`pages/${page}.html`)
            .then(res => res.text())
            .then(html => {
                document.getElementById('content').innerHTML = html;
                handlePageInit(page); // 🔁 Centralize page-specific initialization
                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    /*** Handle per-page logic ***/
    function handlePageInit(page) {
        syncActiveLinks(page);

        if (page === 'activities') {
            if (typeof initExerciseToDo === 'function') initExerciseToDo();
            attachGoBackHomeListener();
        }

        if (page === 'dashboard') {
            attachViewActivitiesListener();
            attachGoBackHomeListener();
            generateCalendar();
        }

        if (page === 'settings') {
            initSettingsPage();
            updateStorageInfo()
        }
    }

    /*** Handle getting local storage ***/
    function getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2; // 2 bytes per char
            }
        }
        return total; // bytes
    }

    function updateStorageInfo() {
        const storageInfo = document.getElementById("storage-info");
        if (!storageInfo) return;

        const itemCount = localStorage.length;
        const sizeBytes = getLocalStorageSize();
        const sizeKB = (sizeBytes / 1024).toFixed(2);

        storageInfo.textContent = `You have ${itemCount} item(s) in localStorage (~${sizeKB} KB)`;
    }


    /*** Sync active state between sidebars ***/
    function syncActiveLinks(page) {
        document.querySelectorAll('#left-sidebar a[data-page], #mobileSidebar a[data-page]')
            .forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === page);
            });
    }

    /*** View All > Activities Button Listener ***/
    function attachViewActivitiesListener() {
        const btn = document.getElementById('viewActivitiesBtn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                loadPage('activities');
            });
        }
    }

    /*** Go Back < Button Listener ***/
    function attachGoBackHomeListener() {
        const btn = document.getElementById('goBackBtn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                loadPage('dashboard');
            });
        }
    }

    function initSettingsPage() {
        const fileInput = document.getElementById("profile-img");
        const saveBtn = document.getElementById("save-settings");
        const usernameInput = document.getElementById("username");
        let uploadedImageData = null;

        // Load saved data on page init
        const savedName = localStorage.getItem("cozy-username");
        const savedImg = localStorage.getItem("cozy-profile-img");

        if (savedName) {
            usernameInput.value = savedName;
            const sidebarName = document.getElementById("sidebar-username");
            if (sidebarName) sidebarName.textContent = savedName;
        }

        if (savedImg) {
            const sidebarImg = document.getElementById("sidebar-profile-img");
            if (sidebarImg) sidebarImg.src = savedImg;
        }

        // Preview uploaded image
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        uploadedImageData = e.target.result;

                        let preview = document.getElementById("profile-preview");
                        if (!preview) {
                            preview = document.createElement("img");
                            preview.id = "profile-preview";
                            preview.className = "img-fluid rounded-4 mt-3";
                            fileInput.closest(".upload-box").appendChild(preview);
                        }
                        preview.src = uploadedImageData;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Save button → update + persist
        if (saveBtn) {
            saveBtn.addEventListener("click", function () {
                const newName = usernameInput.value.trim();

                // Update + save name
                if (newName) {
                    const sidebarName = document.getElementById("sidebar-username");
                    if (sidebarName) sidebarName.textContent = newName;
                    localStorage.setItem("cozy-username", newName);
                }

                // Update + save image
                if (uploadedImageData) {
                    const sidebarImg = document.getElementById("sidebar-profile-img");
                    if (sidebarImg) sidebarImg.src = uploadedImageData;
                    localStorage.setItem("cozy-profile-img", uploadedImageData);
                }

                function showSettingsAlert() {
                    const alertEl = document.getElementById('settings-toast');
                    alertEl.style.display = 'block';
                    alertEl.classList.add('show'); // triggers Bootstrap fade-in

                    // Auto-hide after 2 seconds
                    setTimeout(() => {
                        alertEl.classList.remove('show'); // fade-out
                        setTimeout(() => alertEl.style.display = 'none', 150); // hide after fade
                    }, 3000);
                }

                showSettingsAlert();
            });
        }
    }


    function generateCalendar() {
        console.log("Calendar initialized");

        const grid = document.getElementById("calendar-grid");
        const monthLabel = document.getElementById("calendar-month");

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthName = date.toLocaleString("default", { month: "long" });
        monthLabel.textContent = `${monthName} ${year}`;

        grid.innerHTML = "";

        // Weekday labels
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        weekdays.forEach(d => {
            let div = document.createElement("div");
            div.textContent = d;
            div.style.fontWeight = "bold";
            grid.appendChild(div);
        });

        // Days of month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots before first day
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(document.createElement("div"));
        }

        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            let div = document.createElement("div");
            div.textContent = d;

            if (d === date.getDate()) {
                div.style.background = "var(--cozy-orange)";
                div.style.color = "white";
                div.style.borderRadius = "6px";
            }

            grid.appendChild(div);
        }
    }

    /*** Mobile Sidebar ***/
    loadHTML("mobileSidebar", "includes/mobile-sidebar.html", () => {
        const toggleBtn = document.getElementById("mobileSidebarToggle");
        const sidebar = document.getElementById("mobileSidebar");
        const overlay = document.getElementById("sidebarOverlay");

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("active");
                overlay.classList.toggle("active");

                // ✅ toggle body scroll lock
                if (sidebar.classList.contains("active")) {
                    document.body.classList.add("no-scroll");
                } else {
                    document.body.classList.remove("no-scroll");
                }
            });

            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll"); // ✅ unlock scrolling
            });
        }

        const links = document.querySelectorAll("#mobileSidebar a[data-page]");
        links.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.getAttribute("data-page");
                loadPage(page);
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll"); // ✅ unlock after clicking link
            });
        });
    });


    /*** Right Sidebar (Music Player) ***/
    loadHTML("right-sidebar", "includes/right-sidebar.html", () => {
        if (typeof initPlaylist === "function") {
            initPlaylist();
        }
    });

    /*** Left Sidebar ***/
    loadHTML("left-sidebar", "includes/left-sidebar.html", () => {
        const toggleBtn = document.getElementById('toggle-btn');
        const sidebar = document.getElementById('left-sidebar');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('closed');
                toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            });
        }

        document.querySelectorAll('#left-sidebar a[data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                loadPage(page);
            });
        });
    });

    /*** Load default page ***/
    loadPage('settings');
});

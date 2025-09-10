// ===== Global Theme & Profile Helpers =====
function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function applySavedProfile() {
    const savedName = localStorage.getItem("cozy-username");
    const savedImg = localStorage.getItem("cozy-profile-img");

    const usernameDisplays = [
        document.getElementById("sidebar-username"),
        document.getElementById("navbar-username")
    ];
    const profileImages = [
        document.getElementById("sidebar-profile-img"),
        document.getElementById("navbar-profile-img"),
        document.getElementById("nav-profile-img")
    ];

    if (savedName) {
        usernameDisplays.forEach(el => { if (el) el.textContent = savedName; });
    }

    if (savedImg) {
        profileImages.forEach(el => { if (el) el.src = savedImg; });
    }
}

function applyDynamicFooter() {
    const year = new Date().getFullYear();
    const yearEls = [
        document.getElementById("footer-year"),          // desktop
        document.getElementById("mobile-footer-year")    // mobile (if exists)
    ];

    yearEls.forEach(el => {
        if (el) el.textContent = year;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    applyDynamicFooter();
});


// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", function () {

    applySavedTheme();
    applySavedProfile();
    applyDynamicFooter();
    applySavedSidebarBehavior();

    function loadPage(page, callback) {
        fetch(`pages/${page}.html`)
            .then(res => res.text())
            .then(html => {
                const content = document.getElementById('content');
                content.innerHTML = html;

                // Force scroll to top instantly
                window.scrollTo(0, 0);

                handlePageInit(page);

                // Reapply profile info after loading new content
                applySavedProfile();

                if (callback) callback();
            })
            .catch(err => console.error(err));
    }


    /*** Helper: Load HTML into a target element ***/
    function loadHTML(targetId, url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(html => {
                const target = document.getElementById(targetId);
                target.innerHTML = html;

                // Reset scroll positions for sidebars too
                target.scrollTop = 0;

                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    /*** Handle per-page logic ***/
    function handlePageInit(page) {
        syncActiveLinks(page);

        if (page === 'dashboard') {
            if (typeof initDashboardPage === 'function') initDashboardPage();
            initToDo("exercise");
            initToDo("personal");
            attachViewActivitiesListener();
            attachGoBackHomeListener();
        }

        if (page === 'activities') {
            initToDo("exercise");
            initToDo("personal");
            attachGoBackHomeListener();
        }

        if (page === 'settings') {
            if (typeof initSettingsPage === 'function') initSettingsPage();
        }
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

    /*** Mobile Sidebar ***/
    loadHTML("mobileSidebar", "includes/mobile-sidebar.html", () => {
        const toggleBtn = document.getElementById("mobileSidebarToggle");
        const sidebar = document.getElementById("mobileSidebar");
        const overlay = document.getElementById("sidebarOverlay");

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("active");
                overlay.classList.toggle("active");
                document.body.classList.toggle("no-scroll", sidebar.classList.contains("active"));
            });

            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        }

        document.querySelectorAll("#mobileSidebar a[data-page]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.getAttribute("data-page");
                loadPage(page);
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("no-scroll");
            });
        });
    });

    /*** Right Sidebar (Music Player) ***/
    loadHTML("right-sidebar", "includes/right-sidebar.html", () => {
        if (typeof initPlayer === "function") initPlayer();
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

        applyDynamicFooter();
    });

    /*** Load default page ***/
    loadPage('settings');
});

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
                if (callback) callback();
            })
            .catch(err => console.error(err));
    }

    /*** Sync active state between sidebars ***/
    function syncActiveLinks(page) {
        document.querySelectorAll('#left-sidebar a[data-page], #mobileSidebar a[data-page]')
            .forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === page);
            });
    }

    /*** MOBILE SIDEBAR ***/
    loadHTML("mobileSidebar", "includes/mobile-sidebar.html", () => {
        console.log("Mobile sidebar loaded");

        const toggleBtn = document.getElementById("mobileSidebarToggle");
        const sidebar = document.getElementById("mobileSidebar");
        const overlay = document.getElementById("sidebarOverlay");

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener("click", () => {
                sidebar.classList.toggle("active");
                overlay.classList.toggle("active");
            });

            overlay.addEventListener("click", () => {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
            });
        }

        // Attach click events to mobile links
        const links = document.querySelectorAll("#mobileSidebar a[data-page]");
        links.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const page = link.getAttribute("data-page");

                loadPage(page, () => {
                    if (page === 'activities' && typeof initExerciseToDo === 'function') {
                        initExerciseToDo();
                    }
                });

                // Close sidebar after selecting a page
                sidebar.classList.remove("active");
                overlay.classList.remove("active");

                // Sync active state
                syncActiveLinks(page);
            });
        });
    });

    /*** RIGHT SIDEBAR (Music Player) ***/
    loadHTML("right-sidebar", "includes/right-sidebar.html", () => {
        console.log("Right sidebar loaded");
        if (typeof initPlaylist === "function") {
            initPlaylist(); // Call function from playlist.js
        }
    });

    /*** LEFT SIDEBAR ***/
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
                loadPage(page, () => {
                    if (page === 'activities' && typeof initExerciseToDo === 'function') {
                        initExerciseToDo();
                    }
                });

                // Sync active state
                syncActiveLinks(page);
            });
        });
    });

    /*** Load default page (activities) ***/
    loadPage('activities', () => syncActiveLinks('activities'));
});

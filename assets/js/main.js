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

    function attachViewActivitiesListener() {
        const btn = document.getElementById('viewActivitiesBtn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                loadPage('activities', () => {
                    if (typeof initExerciseToDo === 'function') {
                        initExerciseToDo();
                    }
                    syncActiveLinks('activities'); // ✅ Add this line
                });
            });
        }
    }

    /*** Weather fetch with safety and loading state ***/
    const apiKey = "4f45e19606259e2ffb0eced14857d496";

    function getWeatherByLocation() {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const tempEl = document.getElementById("temperature");
            const descEl = document.getElementById("weather-description");
            const locEl = document.getElementById("location");
            const iconEl = document.getElementById("weather-icon");

            if (tempEl) tempEl.textContent = "Loading...";
            if (descEl) descEl.textContent = "";
            if (locEl) locEl.textContent = "";
            if (iconEl) iconEl.innerHTML = "";

            // 🌤 Get weather from OpenWeatherMap
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            fetch(weatherUrl)
                .then(response => response.json())
                .then(data => {
                    if (tempEl && descEl && iconEl) {
                        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
                        descEl.textContent = data.weather[0].description;
                        const icon = data.weather[0].icon;
                        iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon" style="width: 120px; height: 120px;">`;
                    }

                    // 🧭 Use OpenStreetMap Nominatim to get city name
                    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

                    return fetch(geoUrl);
                })
                .then(response => response.json())
                .then(locationData => {
                    if (locEl) {
                        const address = locationData.address;
                        const city = address.city || address.town || address.village || address.state_district || "Unknown location";
                        locEl.textContent = city;
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    if (tempEl) tempEl.textContent = "Error loading weather";
                });

        }, error => {
            console.error("Geolocation error:", error);
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
                    if (page === 'dashboard') {
                        getWeatherByLocation();
                        attachViewActivitiesListener()
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
                    if (page === 'dashboard') {
                        getWeatherByLocation();
                        attachViewActivitiesListener()
                    }
                });

                // Sync active state
                syncActiveLinks(page);
            });
        });
    });

    /*** Load default page (dashboard) and weather ***/
    loadPage('dashboard', () => {
        syncActiveLinks('dashboard');
        getWeatherByLocation();
        attachViewActivitiesListener();
    });

});

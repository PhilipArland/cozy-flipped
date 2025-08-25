// main.js
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

    /*** RIGHT SIDEBAR (music player) ***/
    loadHTML("right-sidebar", "includes/right-sidebar.html", () => {
        console.log("Right sidebar loaded");

        // Music player elements
        const tracks = [
            { title: "Multo", artist: "Cup of Joe", src: "assets/playlist/multo.mp3", cover: "assets/playlist/multo.jpg" },
            { title: "Migraine", artist: "Moonstar88", src: "assets/playlist/migraine.mp3", cover: "assets/playlist/migraine.jpg" },
            { title: "Paraluman", artist: "Adie", src: "assets/playlist/paraluman.mp3", cover: "assets/playlist/paraluman.jpg" },
        ];

        const playBtn = document.getElementById("playBtn");
        const playIcon = document.getElementById("playIcon");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const shuffleBtn = document.getElementById("shuffleBtn");
        const repeatBtn = document.getElementById("repeatBtn");
        const progressContainer = document.getElementById("progressContainer");
        const progressBar = document.getElementById("progressBar");
        const currentTimeEl = document.getElementById("currentTime");
        const durationEl = document.getElementById("duration");
        const trackTitle = document.getElementById("trackTitle");
        const trackArtist = document.getElementById("trackArtist");
        const trackCover = document.getElementById("trackCover");
        const playlistContainer = document.getElementById("playlistContainer");

        let currentTrack = 0, isShuffle = false, repeatMode = 0;
        const audio = new Audio(tracks[currentTrack].src);

        function buildPlaylist() {
            playlistContainer.innerHTML = "";
            tracks.forEach((track, i) => {
                const item = document.createElement("div");
                item.className = `playlist-item d-flex align-items-center ${i === currentTrack ? "active" : ""}`;
                item.setAttribute("data-track", i);
                item.innerHTML = `
                    <div class="icon-box me-3">
                        <img src="${track.cover}" class="rounded-circle" style="width:40px; height:40px; object-fit:cover;" alt="${track.title}">
                    </div>
                    <div>
                        <h6 class="mb-1 fs-6">${track.title}</h6>
                        <small class="text-muted">${track.artist} • <span class="track-duration">--:--</span></small>
                    </div>
                `;
                playlistContainer.appendChild(item);

                const tempAudio = new Audio(track.src);
                tempAudio.onloadedmetadata = () => {
                    let min = Math.floor(tempAudio.duration / 60);
                    let sec = Math.floor(tempAudio.duration % 60).toString().padStart(2, "0");
                    item.querySelector(".track-duration").textContent = `${min}:${sec}`;
                };
            });
        }

        function loadTrack(index) {
            const track = tracks[index];
            audio.src = track.src;
            trackTitle.textContent = track.title;
            trackArtist.textContent = track.artist;
            trackCover.innerHTML = `<img src="${track.cover}" alt="${track.title} Cover" class="img-fluid rounded-4 shadow">`;
            durationEl.textContent = "0:00";
            currentTimeEl.textContent = "0:00";
            audio.onloadedmetadata = () => {
                let min = Math.floor(audio.duration / 60);
                let sec = Math.floor(audio.duration % 60).toString().padStart(2, "0");
                durationEl.textContent = `${min}:${sec}`;
            };
            document.querySelectorAll(".playlist-item").forEach(item => item.classList.remove("active"));
            const activeItem = playlistContainer.querySelector(`[data-track="${index}"]`);
            if (activeItem) activeItem.classList.add("active");
        }

        function togglePlay() {
            if (audio.paused) { audio.play(); playIcon.classList.replace("bi-play-fill", "bi-pause-fill"); }
            else { audio.pause(); playIcon.classList.replace("bi-pause-fill", "bi-play-fill"); }
        }

        function nextTrack() {
            if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
            if (isShuffle) {
                let nextIndex; do { nextIndex = Math.floor(Math.random() * tracks.length); }
                while (nextIndex === currentTrack && tracks.length > 1);
                currentTrack = nextIndex;
            } else currentTrack = (currentTrack + 1) % tracks.length;
            loadTrack(currentTrack); audio.play(); playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
        }

        function prevTrack() { currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; loadTrack(currentTrack); audio.play(); playIcon.classList.replace("bi-play-fill", "bi-pause-fill"); }

        function toggleRepeat() {
            const icon = repeatBtn.querySelector("i");
            if (repeatMode === 0) { repeatMode = 2; icon.className = "bi bi-repeat-1"; repeatBtn.classList.add("active"); }
            else { repeatMode = 0; icon.className = "bi bi-repeat"; repeatBtn.classList.remove("active"); }
        }

        function updateProgress() {
            if (!isNaN(audio.duration)) { progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`; }
            let min = Math.floor(audio.currentTime / 60); let sec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
            currentTimeEl.textContent = `${min}:${sec}`;
        }

        function seekTrack(e) {
            const width = progressContainer.clientWidth, clickX = e.offsetX;
            if (!isNaN(audio.duration)) { audio.currentTime = (clickX / width) * audio.duration; }
        }

        playlistContainer.addEventListener("click", e => {
            const item = e.target.closest(".playlist-item");
            if (item) { currentTrack = parseInt(item.getAttribute("data-track")); loadTrack(currentTrack); audio.play(); playIcon.classList.replace("bi-play-fill", "bi-pause-fill"); }
        });

        playBtn.addEventListener("click", togglePlay);
        prevBtn.addEventListener("click", prevTrack);
        nextBtn.addEventListener("click", nextTrack);
        shuffleBtn.addEventListener("click", () => { isShuffle = !isShuffle; shuffleBtn.classList.toggle("active", isShuffle); });
        repeatBtn.addEventListener("click", toggleRepeat);
        progressContainer.addEventListener("click", seekTrack);
        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", nextTrack);

        buildPlaylist();
        loadTrack(currentTrack);
    });

    /*** LEFT SIDEBAR ***/
    loadHTML("left-sidebar", "includes/left-sidebar.html", () => {
        const toggleBtn = document.getElementById('toggle-btn');
        const sidebar = document.getElementById('left-sidebar');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
        });

        document.querySelectorAll('#left-sidebar a[data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                loadPage(page, () => {
                    if (page === 'activities' && typeof initExerciseToDo === 'function') {
                        initExerciseToDo();
                    }
                });

                document.querySelectorAll('#left-sidebar a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    });

    /*** Load default page (dashboard) ***/
    loadPage('activities');
});

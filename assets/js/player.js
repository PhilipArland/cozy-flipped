// player.js

window.defaultTracks = [
    { id: 1, title: "Multo", artist: "Cup of Joe", src: "assets/playlist/multo.mp3", cover: "assets/playlist/cover/multo.jpg" },
    { id: 2, title: "Tingin", artist: "Cup of Joe ft. Janine Teñoso", src: "assets/playlist/tingin.mp3", cover: "assets/playlist/cover/tingin.jpg" },
    { id: 3, title: "Dalangin", artist: "Earl Agustin", src: "assets/playlist/dalangin.mp3", cover: "assets/playlist/cover/dalangin.jpg" },
    { id: 4, title: "Migraine", artist: "Moonstar88", src: "assets/playlist/migraine.mp3", cover: "assets/playlist/cover/migraine.jpg" },
    { id: 5, title: "Paraluman", artist: "Adie", src: "assets/playlist/paraluman.mp3", cover: "assets/playlist/cover/paraluman.jpg" },
    { id: 6, title: "Kundiman", artist: "Silent Sanctuary", src: "assets/playlist/kundiman.mp3", cover: "assets/playlist/cover/kundiman.jpg" },
    { id: 7, title: "Ikot", artist: "Over October", src: "assets/playlist/ikot.mp3", cover: "assets/playlist/cover/ikot.jpg" },
    { id: 8, title: "Museo", artist: "Eliza Maturan", src: "assets/playlist/museo.mp3", cover: "assets/playlist/cover/museo.jpg" },
];

function initPlayer(tracks = window.defaultTracks) {
    console.log("Player initialized");

    // 🎵 Load current playlist (default is Cozy)
    let currentTrack = 0;
    const audio = new Audio(tracks[currentTrack].src);
    let isShuffled = false;
    let playHistory = [];
    let repeatMode = "all"; // can be 'off', 'all', 'one'

    // DOM elements
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

    /*** Build playlist ***/
    function buildPlaylist() {
        playlistContainer.innerHTML = "";
        tracks.forEach((track, i) => {
            playlistContainer.appendChild(createPlaylistItem(track, i, i === currentTrack));
        });
    }

    function createPlaylistItem(track, i, isActive) {
        const item = document.createElement("div");
        item.className = `playlist-item d-flex align-items-center ${isActive ? "active" : ""}`;
        item.setAttribute("data-track", i);
        item.innerHTML = `
            <div class="icon-box me-3">
                <img src="${track.cover}" 
                    class="rounded-circle" 
                    style="width:40px; height:40px; object-fit:cover;" 
                    alt="${track.title}">
            </div>
            <div class="w-100">
                <h6 class="mb-1 fs-6 track-title">${track.title}</h6>
                <div class="d-flex justify-content-between track small">
                    <small class="track-artist">${track.artist}</small>
                    <small class="track-duration">--:--</small>
                </div>
            </div>
        `;

        const tempAudio = new Audio(track.src);
        tempAudio.onloadedmetadata = () => {
            let min = Math.floor(tempAudio.duration / 60);
            let sec = Math.floor(tempAudio.duration % 60).toString().padStart(2, "0");
            item.querySelector(".track-duration").textContent = `${min}:${sec}`;
        };

        return item;
    }

    /*** Load track with animations ***/
    function loadTrack(index, animate = true) {
        const track = tracks[index];
        audio.src = track.src;
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        trackCover.innerHTML = `<img src="${track.cover}" alt="${track.title} Cover" class="img-fluid rounded-4 shadow">`;

        audio.onloadedmetadata = () => {
            let min = Math.floor(audio.duration / 60);
            let sec = Math.floor(audio.duration % 60).toString().padStart(2, "0");
            durationEl.textContent = `${min}:${sec}`;
        };

        // reset active states
        document.querySelectorAll(".playlist-item").forEach(item => {
            item.classList.remove("active");
            const img = item.querySelector(".icon-box img");
            if (img) img.classList.remove("rotate");
        });

        const activeItem = playlistContainer.querySelector(`[data-track="${index}"]`);
        if (!activeItem) return;

        activeItem.classList.add("active");

        if (animate) {
            void activeItem.offsetWidth; // reflow
            activeItem.classList.add("move-up");

            activeItem.addEventListener("transitionend", function handler() {
                activeItem.classList.remove("move-up");
                playlistContainer.prepend(activeItem);

                activeItem.classList.add("move-in");
                void activeItem.offsetWidth;
                activeItem.classList.add("show");

                activeItem.addEventListener("transitionend", () => {
                    activeItem.classList.remove("move-in", "show");
                }, { once: true });

                activeItem.removeEventListener("transitionend", handler);
            }, { once: true });
        }
    }

    /*** Controls ***/
    function togglePlay() {
        const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
        if (audio.paused) {
            audio.play();
            playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
            if (activeImg) activeImg.classList.add("rotate");
        } else {
            audio.pause();
            playIcon.classList.replace("bi-pause-fill", "bi-play-fill");
            if (activeImg) activeImg.classList.remove("rotate");
        }
    }

    function nextTrack() {
        if (isShuffled) {
            let next;
            do {
                next = Math.floor(Math.random() * tracks.length);
            } while (next === currentTrack && tracks.length > 1);

            playHistory.push(currentTrack);
            currentTrack = next;
        } else {
            playHistory.push(currentTrack);
            currentTrack = (currentTrack + 1) % tracks.length;
        }

        loadTrack(currentTrack);
        audio.play();
        playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

        const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
        if (activeImg) activeImg.classList.add("rotate");
    }

    function prevTrack() {
        if (isShuffled && playHistory.length > 0) {
            currentTrack = playHistory.pop();
        } else {
            currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        }

        loadTrack(currentTrack);
        audio.play();
        playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

        const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
        if (activeImg) activeImg.classList.add("rotate");
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            isShuffled = !isShuffled;
            shuffleBtn.classList.toggle("active", isShuffled);
            console.log(`Shuffle is now ${isShuffled ? "ON" : "OFF"}`);
        });
    }

    if (repeatBtn) {
        const repeatIcon = repeatBtn.querySelector("i");
        repeatIcon.className = "bi bi-repeat";

        repeatBtn.addEventListener("click", () => {
            if (repeatMode === "all") {
                repeatMode = "one";
                repeatIcon.className = "bi bi-repeat-1";
                repeatBtn.classList.add("active");
            } else {
                repeatMode = "all";
                repeatIcon.className = "bi bi-repeat";
                repeatBtn.classList.remove("active");
            }
            console.log("Repeat mode:", repeatMode);
        });
    }

    playlistContainer.addEventListener("click", e => {
        const item = e.target.closest(".playlist-item");
        if (item) {
            currentTrack = parseInt(item.getAttribute("data-track"));
            loadTrack(currentTrack);
            audio.play();
            playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

            const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
            if (activeImg) activeImg.classList.add("rotate");
        }
    });

    function updateProgress() {
        if (!isNaN(audio.duration)) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        }
        let min = Math.floor(audio.currentTime / 60);
        let sec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
        currentTimeEl.textContent = `${min}:${sec}`;
    }

    function seekTrack(e) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        if (!isNaN(audio.duration)) {
            audio.currentTime = (clickX / width) * audio.duration;
        }
    }

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevTrack);
    nextBtn.addEventListener("click", nextTrack);
    progressContainer.addEventListener("click", seekTrack);
    audio.addEventListener("timeupdate", updateProgress);

    audio.addEventListener("ended", () => {
        if (repeatMode === "one") {
            audio.currentTime = 0;
            audio.play();
        } else if (repeatMode === "all") {
            nextTrack();
        } else {
            playIcon.classList.replace("bi-pause-fill", "bi-play-fill");
            const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
            if (activeImg) activeImg.classList.remove("rotate");
        }
    });

    buildPlaylist();
    loadTrack(0, false); // no animation on first render
}

function initPlaylist() {
    console.log("Playlist initialized");

    const tracks = [
        { title: "Multo", artist: "Cup of Joe", src: "assets/playlist/multo.mp3", cover: "assets/playlist/cover/multo.jpg" },
        { title: "Migraine", artist: "Moonstar88", src: "assets/playlist/migraine.mp3", cover: "assets/playlist/cover/migraine.jpg" },
        { title: "Paraluman", artist: "Adie", src: "assets/playlist/paraluman.mp3", cover: "assets/playlist/cover/paraluman.jpg" },
        { title: "Kundiman", artist: "Silent Sanctuary", src: "assets/playlist/kundiman.mp3", cover: "assets/playlist/cover/kundiman.jpg" },
        { title: "Museo", artist: "Eliza Maturan", src: "assets/playlist/museo.mp3", cover: "assets/playlist/cover/museo.jpg" },
    ];

    // DOM elements
    const playBtn = document.getElementById("playBtn");
    const playIcon = document.getElementById("playIcon");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");
    const trackTitle = document.getElementById("trackTitle");
    const trackArtist = document.getElementById("trackArtist");
    const trackCover = document.getElementById("trackCover");
    const playlistContainer = document.getElementById("playlistContainer");

    let currentTrack = 0;
    const audio = new Audio(tracks[currentTrack].src);

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
                    class="rounded-circle ${isActive ? "" : ""}" 
                    style="width:40px; height:40px; object-fit:cover;" 
                    alt="${track.title}">
            </div>
            <div>
                <h6 class="mb-1 fs-6">${track.title}</h6>
                <small class="text-muted">${track.artist} • <span class="track-duration">--:--</span></small>
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

        // ✅ Remove the initial "no-animate" marker BEFORE we decide to animate
        if (activeItem.classList.contains("just-loaded")) {
            activeItem.classList.remove("just-loaded");
        }

        activeItem.classList.add("active");

        if (animate) {
            // OUT animation
            void activeItem.offsetWidth; // reflow
            activeItem.classList.add("move-up");

            activeItem.addEventListener("transitionend", function handler() {
                activeItem.classList.remove("move-up");
                playlistContainer.prepend(activeItem);

                // IN animation
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
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack(currentTrack);
        audio.play();
        playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

        // ✅ Add rotation to new active song
        const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
        if (activeImg) activeImg.classList.add("rotate");
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrack);
        audio.play();
        playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

        // ✅ Add rotation
        const activeImg = playlistContainer.querySelector(`[data-track="${currentTrack}"] .icon-box img`);
        if (activeImg) activeImg.classList.add("rotate");
    }

    playlistContainer.addEventListener("click", e => {
        const item = e.target.closest(".playlist-item");
        if (item) {
            currentTrack = parseInt(item.getAttribute("data-track"));
            loadTrack(currentTrack);
            audio.play();
            playIcon.classList.replace("bi-play-fill", "bi-pause-fill");

            // ✅ Add rotation
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

    /*** Event listeners ***/
    playlistContainer.addEventListener("click", e => {
        const item = e.target.closest(".playlist-item");
        if (item) {
            currentTrack = parseInt(item.getAttribute("data-track"));
            loadTrack(currentTrack);
            audio.play();
            playIcon.classList.replace("bi-play-fill", "bi-pause-fill");
        }
    });

    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", prevTrack);
    nextBtn.addEventListener("click", nextTrack);
    progressContainer.addEventListener("click", seekTrack);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", nextTrack);

    // init playlist
    buildPlaylist();
    loadTrack(0, false); // no animation on first render
    const firstActive = playlistContainer.querySelector('[data-track="0"]');
    if (firstActive) firstActive.classList.add('just-loaded'); // gets removed on next time track 0 is loaded
}

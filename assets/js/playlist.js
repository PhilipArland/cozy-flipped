// playlist.js
function initPlaylistGrid() {
    console.log("Playlist grid initialized");

    const grid = document.getElementById("playlistsGrid");
    const createBtn = document.getElementById("createPlaylistBtn");

    // Load playlists from localStorage or default
    let playlists = JSON.parse(localStorage.getItem("playlists")) || [
        { id: 1, name: "Chill Vibes", cover: "assets/img/cozy-music.jpg", tracks: [] },
        { id: 2, name: "Workout Mix", cover: "assets/img/workout.jpg", tracks: [] }
    ];

    function savePlaylists() {
        localStorage.setItem("playlists", JSON.stringify(playlists));
    }

    /*** Renders the grid of playlist cards ***/
    function renderGrid() {
        grid.innerHTML = "";
        playlists.forEach(p => {
            const col = document.createElement("div");
            col.className = "col-md-4 col-sm-6";
            col.innerHTML = `
                <div class="card rounded-4 shadow-sm border-0 overflow-hidden h-100 playlist-card"
                    data-id="${p.id}">
                    <img src="${p.cover}" class="card-img-top" alt="${p.name}">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <h6 class="fw-bold mb-0">${p.name}</h6>
                        <button class="btn btn-sm btn-outline-danger btn-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });
    }

    /*** Create new playlist ***/
    function createPlaylist() {
        const name = prompt("Enter playlist name:");
        if (!name) return;
        const newPlaylist = {
            id: Date.now(),
            name,
            cover: "assets/img/default-cover.jpg",
            tracks: []
        };
        playlists.push(newPlaylist);
        savePlaylists();
        renderGrid();
    }

    /*** Event binding ***/
    if (createBtn) {
        createBtn.addEventListener("click", createPlaylist);
    }

    grid.addEventListener("click", e => {
        const card = e.target.closest(".playlist-card");
        const deleteBtn = e.target.closest(".btn-delete");
        if (!card) return;

        const id = parseInt(card.getAttribute("data-id"));

        if (deleteBtn) {
            playlists = playlists.filter(p => p.id !== id);
            savePlaylists();
            renderGrid();
        } else {
            // Navigate to player view (pass playlist ID via query)
            window.location.href = `player.html?playlist=${id}`;
        }
    });

    /*** Render All Songs card (uses tracks from player.js) ***/
    /*** Render All Songs card (uses tracks from player.js) ***/
    function renderAllSongs() {
        const container = document.getElementById("allSongsList");
        if (!container) return;

        container.innerHTML = "";

        if (!window.allTracks || !window.allTracks.length) {
            container.innerHTML = `<p class="">No songs available yet.</p>`;
            return;
        }

        window.allTracks.forEach(song => {
            const item = document.createElement("div");
            item.className = "song-item d-flex align-items-center justify-content-between mb-3";
            item.style.cursor = "pointer";
            item.style.background = "transparent"; // matches cozy-card background

            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <img src="${song.cover}" 
                            class="rounded-3 shadow-sm" 
                            style="width:50px; height:50px; object-fit:cover;" 
                            alt="${song.title}">
                    </div>
                    <div class="d-flex flex-column">
                        <h6 class="mb-0 fw-bold" style="color: var(--text-primary)">${song.title}</h6>
                        <small class="text-muted" style="color: var(--text-secondary) !important">${song.artist}</small>
                        <span class="me-3 small track-duration" style="color: var(--text-secondary) !important">--:--</span>
                    </div>
                </div>

                <div class="d-flex align-items-center">
                    <button class="btns btn-secondary rounded-circle shadow-sm add-btn">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
            `;

            // Duration
            const tempAudio = new Audio(song.src);
            tempAudio.onloadedmetadata = () => {
                let min = Math.floor(tempAudio.duration / 60);
                let sec = Math.floor(tempAudio.duration % 60).toString().padStart(2, "0");
                item.querySelector(".track-duration").textContent = `${min}:${sec}`;
            };

            // Play song when clicking the item (except the + button)
            item.addEventListener("click", e => {
                if (e.target.closest(".add-btn")) return; // prevent conflict
                e.preventDefault();
                if (typeof playSong === "function") {
                    playSong(song);
                }
            });

            // Add button event
            item.querySelector(".add-btn").addEventListener("click", e => {
                e.stopPropagation();
                console.log(`Add "${song.title}" to a playlist`);
                // TODO: show modal/selector for playlists here
            });

            container.appendChild(item);
        });

    }


    // Init render
    renderGrid();
    renderAllSongs();
}

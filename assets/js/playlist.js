// playlist.js

/*** Renders All Songs card (uses tracks from localStorage or global allTracks) ***/
function renderAllSongs() {
    // Load saved songs from localStorage
    window.allTracks = JSON.parse(localStorage.getItem("allTracks")) || window.allTracks || [];

    const container = document.getElementById("allSongsList");
    if (!container) return;

    container.innerHTML = "";

    if (!window.allTracks || !window.allTracks.length) {
        container.innerHTML = `<p class="text-muted">No songs available yet.</p>`;
        return;
    }

    window.allTracks.forEach(song => {
        const item = document.createElement("div");
        item.className = "song-item d-flex align-items-center justify-content-between mb-3";
        item.style.cursor = "pointer";

        item.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <img src="${song.cover || 'assets/img/default-cover.jpg'}" 
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

        <div class="dropdown">
            <button class="btn btn-sm bg-transparent border-0" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li><a class="dropdown-item add-to-playlist" href="#">➕ Add to Playlist</a></li>
                <li><a class="dropdown-item add-to-favorite" href="#">❤️ Add to Favorites</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger delete-song" href="#">🗑️ Delete Song</a></li>
            </ul>
        </div>
    `;

        // Duration
        const tempAudio = new Audio(song.src);
        tempAudio.onloadedmetadata = () => {
            let min = Math.floor(tempAudio.duration / 60);
            let sec = Math.floor(tempAudio.duration % 60).toString().padStart(2, "0");
            item.querySelector(".track-duration").textContent = `${min}:${sec}`;
        };

        // Play song when clicking the item (but ignore clicks inside dropdown)
        item.addEventListener("click", e => {
            if (e.target.closest(".dropdown")) return;
            if (typeof playSong === "function") {
                playSong(song);
            }
        });

        // Dropdown events
        item.querySelector(".add-to-playlist").addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Add "${song.title}" to playlist`);
            // TODO: open playlist selection modal
        });

        item.querySelector(".add-to-favorite").addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Add "${song.title}" to favorites`);
            // TODO: implement favorites storage
        });

        item.querySelector(".delete-song").addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Delete "${song.title}"`);

            // Remove from allTracks
            window.allTracks = window.allTracks.filter(s => s.id !== song.id);
            localStorage.setItem("allTracks", JSON.stringify(window.allTracks));

            // Re-render list
            renderAllSongs();
        });

        container.appendChild(item);
    });

}


/*** Initializes Playlist Grid ***/
function initPlaylistGrid() {
    console.log("Playlist grid initialized");

    const grid = document.getElementById("playlistsGrid");
    const createBtn = document.getElementById("createPlaylistBtn");

    // ===== Handle Add Song Form =====
    const addSongForm = document.getElementById("addSongForm");
    if (addSongForm) {
        addSongForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const title = document.getElementById("songTitle").value;
            const artist = document.getElementById("songArtist").value;
            const fileInput = document.getElementById("songFile");

            if (!fileInput.files.length) {
                alert("Please select an audio file.");
                return;
            }

            const file = fileInput.files[0];
            const url = URL.createObjectURL(file);

            const newSong = {
                id: Date.now(),
                title,
                artist,
                src: url,
                cover: "assets/img/default-song-cover.jpg"
            };

            if (!window.allTracks) window.allTracks = [];
            window.allTracks.push(newSong);
            localStorage.setItem("allTracks", JSON.stringify(window.allTracks));

            renderAllSongs();

            const modal = bootstrap.Modal.getInstance(document.getElementById("addSongModal"));
            modal.hide();
            e.target.reset();
        });
    }

    // Load playlists from localStorage or default
    let playlists = JSON.parse(localStorage.getItem("playlists")) || [
        { id: 1, name: "Chill Vibes", cover: "assets/img/cozy-welcome.jpg", tracks: [] },
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
            cover: "assets/img/cozy-welcome.jpg",
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

    // Init render
    renderGrid();
    renderAllSongs();
}


/*** Add Song Form Handler ***/
document.getElementById("addSongForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("songTitle").value;
    const artist = document.getElementById("songArtist").value;
    const fileInput = document.getElementById("songFile");

    if (!fileInput.files.length) {
        alert("Please select an audio file.");
        return;
    }

    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);

    const newSong = {
        id: Date.now(),
        title,
        artist,
        src: url,
        cover: "assets/img/default-song-cover.jpg"
    };

    if (!window.allTracks) window.allTracks = [];
    window.allTracks.push(newSong);

    localStorage.setItem("allTracks", JSON.stringify(window.allTracks));

    renderAllSongs();

    const modal = bootstrap.Modal.getInstance(document.getElementById("addSongModal"));
    modal.hide();

    e.target.reset();
});

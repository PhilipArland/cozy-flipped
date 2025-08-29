// ===== GLOBAL THEME & PROFILE HELPERS =====

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

// function applySavedTheme() {
//     const savedTheme = localStorage.getItem("theme") || "light";
//     if (savedTheme === "dark") {
//         document.body.classList.add("dark-mode");
//     } else {
//         document.body.classList.remove("dark-mode");
//     }
// }

function applySavedSidebarBehavior() {
    const savedBehavior = localStorage.getItem("sidebarBehavior") || "always";
    const sidebar = document.getElementById("left-sidebar");

    if (!sidebar) return;

    const alwaysRadio = document.getElementById("sidebarAlways");
    const collapsedRadio = document.getElementById("sidebarCollapsed");

    // Apply the saved behavior to the sidebar
    if (savedBehavior === "collapsed") {
        sidebar.classList.add("closed");
        if (collapsedRadio) collapsedRadio.checked = true;
    } else {
        sidebar.classList.remove("closed");
        if (alwaysRadio) alwaysRadio.checked = true;
    }
}

// ===== LOCAL STORAGE HELPERS =====
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += (localStorage[key].length + key.length) * 2;
        }
    }
    return total;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

async function updateStorageInfo() {
    const storageInfo = document.getElementById("storage-info");
    const progressBar = document.getElementById("storage-progress");
    if (!storageInfo || !progressBar) return;

    let sizeBytes = getLocalStorageSize();
    let quotaBytes = 5 * 1024 * 1024; // fallback 5MB

    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            quotaBytes = estimate.quota || quotaBytes;
        } catch { }
    }

    const usedFormatted = formatBytes(sizeBytes);
    const quotaFormatted = formatBytes(quotaBytes);

    storageInfo.textContent = `Approx. ${usedFormatted} used of ${quotaFormatted}`;
    storageInfo.style.color = 'var(--text-primary)';

    let percent = Math.min((sizeBytes / quotaBytes) * 100, 100);
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent.toFixed(2));
}

// ===== UNIVERSAL STATUS MODAL =====
function showStatusModal(type, title, message) {
    const modalEl = document.getElementById("settings-modal");
    if (!modalEl) return;

    const titleEl = modalEl.querySelector(".modal-title");
    const imgEl = modalEl.querySelector(".modal-img img");
    const bodyEl = modalEl.querySelector(".modal-body");

    const images = {
        success: "assets/img/congrats.gif",
        error: "assets/img/coffee.gif",
        warning: "assets/img/music.gif",
        info: "assets/img/dance.gif",
        delete: "assets/img/delete.gif"
    };

    if (imgEl) {
        imgEl.src = images[type] || images.info;
        imgEl.alt = type + " icon";
    }
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = message;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// ===== SETTINGS PAGE INITIALIZATION =====
function initSettingsPage() {
    const usernameInput = document.getElementById("username");
    const fileInput = document.getElementById("profile-img");
    const saveBtn = document.getElementById("save-settings");
    const clearBtn = document.getElementById("clear-storage");
    const modalEl = document.getElementById("settings-modal");
    let uploadedImageData = null;

    const lightModeRadio = document.getElementById("lightMode");
    const darkModeRadio = document.getElementById("darkMode");

    // Sync radio buttons with saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    lightModeRadio.checked = savedTheme === "light";
    darkModeRadio.checked = savedTheme === "dark";

    lightModeRadio.addEventListener("change", () => {
        if (lightModeRadio.checked) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    });

    darkModeRadio.addEventListener("change", () => {
        if (darkModeRadio.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        }
    });

    // Sidebar behavior
    const sidebarAlwaysRadio = document.getElementById("sidebarAlways");
    const sidebarCollapsedRadio = document.getElementById("sidebarCollapsed");
    const leftSidebar = document.getElementById("left-sidebar");

    // Apply saved sidebar state on load
    const savedSidebar = localStorage.getItem("sidebarBehavior") || "always";
    if (savedSidebar === "collapsed") {
        sidebarCollapsedRadio.checked = true;
        leftSidebar.classList.add("closed");
    } else {
        sidebarAlwaysRadio.checked = true;
        leftSidebar.classList.remove("closed");
    }

    // Event listeners to save changes
    sidebarAlwaysRadio.addEventListener("change", () => {
        if (sidebarAlwaysRadio.checked) {
            leftSidebar.classList.remove("closed");
            localStorage.setItem("sidebarBehavior", "always");
        }
    });

    sidebarCollapsedRadio.addEventListener("change", () => {
        if (sidebarCollapsedRadio.checked) {
            leftSidebar.classList.add("closed");
            localStorage.setItem("sidebarBehavior", "collapsed");
        }
    });



    // Load existing profile data into inputs
    const savedName = localStorage.getItem("cozy-username");
    const savedImg = localStorage.getItem("cozy-profile-img");

    if (savedName) usernameInput.value = savedName;
    if (savedImg) uploadedImageData = savedImg;

    // Image preview
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

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
        });
    }

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const newName = usernameInput.value.trim();
            const hasImage = uploadedImageData !== null;

            if (!newName && !hasImage) {
                showStatusModal("warning", "Nothing to Save", "Please enter a name or upload an image first.");
                return;
            }

            if (newName) localStorage.setItem("cozy-username", newName);
            if (hasImage) localStorage.setItem("cozy-profile-img", uploadedImageData);

            // Apply globally
            applySavedProfile();
            updateStorageInfo();
            showStatusModal("success", "Changes Saved", "Your profile settings have been updated successfully.");
        });
    }

    // Clear storage
    // Clear storage
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            const confirmModalEl = document.getElementById("confirm-clear-modal");
            const confirmModal = new bootstrap.Modal(confirmModalEl);
            confirmModal.show();

            const confirmBtn = document.getElementById("confirm-clear-btn");
            confirmBtn.onclick = function () {
                // Clear user profile
                localStorage.removeItem("cozy-username");
                localStorage.removeItem("cozy-profile-img");

                // Clear songs and playlists
                localStorage.removeItem("allTracks");
                localStorage.removeItem("playlists");

                // Reset globals (so app doesn’t still hold old data in memory)
                window.allTracks = [];
                window.playlists = [];

                // Reset UI inputs
                usernameInput.value = "";
                const preview = document.getElementById("profile-preview");
                if (preview) preview.remove();
                if (fileInput) fileInput.value = "";
                uploadedImageData = null;

                // Re-render songs and playlists if render functions exist
                if (typeof renderAllSongs === "function") renderAllSongs();
                if (typeof renderPlaylists === "function") renderPlaylists();

                // Apply defaults globally
                applySavedProfile();
                updateStorageInfo();
                confirmModal.hide();

                showStatusModal("delete", "Storage Cleared", "All saved data, playlists, and songs have been removed.");
            };
        });
    }


    // Cleanup on modal close
    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", function () {
            const preview = document.getElementById("profile-preview");
            if (preview) preview.remove();
            if (fileInput) fileInput.value = "";
            uploadedImageData = null;
        });
    }

    // Initialize popovers
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(el => new bootstrap.Popover(el));

    // Initial storage info
    updateStorageInfo();
}

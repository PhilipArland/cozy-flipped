/*** Handle getting local storage size ***/
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += (localStorage[key].length + key.length) * 2; // 2 bytes per char
        }
    }
    return total; // bytes
}

// Helper: format bytes into KB, MB, GB
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

/*** Update storage usage info & progress bar ***/
async function updateStorageInfo() {
    const storageInfo = document.getElementById("storage-info");
    const progressBar = document.getElementById("storage-progress");
    if (!storageInfo || !progressBar) return;

    const sizeBytes = getLocalStorageSize();
    let quotaBytes = 5 * 1024 * 1024; // fallback 5MB

    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota) {
                quotaBytes = estimate.quota;
            }
        } catch (err) {
            console.warn("Could not get storage quota, using default 5MB", err);
        }
    }

    // Format values dynamically
    const usedFormatted = formatBytes(sizeBytes);
    const quotaFormatted = formatBytes(quotaBytes);

    // Update text
    storageInfo.textContent = `Approx. ${usedFormatted} used of ${quotaFormatted}`;

    // Update progress
    let percent = Math.min((sizeBytes / quotaBytes) * 100, 100);
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent.toFixed(2));
}


/*** Init Settings Page ***/
function initSettingsPage() {
    const usernameInput = document.getElementById("username");
    const fileInput = document.getElementById("profile-img");
    const saveBtn = document.getElementById("save-settings");
    const clearBtn = document.getElementById("clear-storage");
    const modalEl = document.getElementById("settings-modal");
    let uploadedImageData = null;

    // Universal elements for username & profile images
    const usernameDisplays = [
        document.getElementById("sidebar-username"),
        document.getElementById("navbar-username")
    ];
    const profileImages = [
        document.getElementById("sidebar-profile-img"),
        document.getElementById("navbar-profile-img"),
        document.getElementById("nav-profile-img")
    ];

    // Load saved data
    const savedName = localStorage.getItem("cozy-username");
    const savedImg = localStorage.getItem("cozy-profile-img");

    if (savedName) {
        usernameInput.value = savedName;
        usernameDisplays.forEach(el => { if (el) el.textContent = savedName; });
    }

    if (savedImg) {
        profileImages.forEach(el => { if (el) el.src = savedImg; });
    }

    // Preview uploaded image
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

    // Save settings
    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const newName = usernameInput.value.trim();

            if (newName) {
                usernameDisplays.forEach(el => { if (el) el.textContent = newName; });
                localStorage.setItem("cozy-username", newName);
            }

            if (uploadedImageData) {
                profileImages.forEach(el => { if (el) el.src = uploadedImageData; });
                localStorage.setItem("cozy-profile-img", uploadedImageData);
            }

            updateStorageInfo();

            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }

    // Clear storage
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            localStorage.removeItem("cozy-username");
            localStorage.removeItem("cozy-profile-img");

            usernameInput.value = "";
            const preview = document.getElementById("profile-preview");
            if (preview) preview.remove();
            if (fileInput) fileInput.value = "";
            uploadedImageData = null;

            usernameDisplays.forEach(el => { if (el) el.textContent = "Cozy User"; });
            profileImages.forEach(el => { if (el) el.src = "assets/img/yeti.jpg"; });

            updateStorageInfo();

            if (modalEl) {
                modalEl.querySelector(".modal-title").innerHTML =
                    '<i class="bi bi-trash-fill text-danger me-2"></i> Storage Cleared';
                modalEl.querySelector(".modal-body").textContent =
                    "All saved data has been removed from local storage.";
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
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

    const darkModeToggle = document.getElementById('darkModeToggle');

    // Apply saved mode on load
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="bi bi-sun-fill me-1"></i> Light Mode';
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-mode");

            // Save preference
            localStorage.setItem("theme", isDark ? "dark" : "light");

            // Update button icon & text dynamically
            darkModeToggle.innerHTML = isDark
                ? '<i class="bi bi-sun-fill me-1"></i> Light Mode'
                : '<i class="bi bi-moon-fill me-1"></i> Dark Mode';
        });
    }

    // Initial storage info
    updateStorageInfo();
}



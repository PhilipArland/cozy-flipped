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
    const fileInput = document.getElementById("profile-img");
    const saveBtn = document.getElementById("save-settings");
    const usernameInput = document.getElementById("username");
    let uploadedImageData = null;

    // Load saved data on page init
    const savedName = localStorage.getItem("cozy-username");
    const savedImg = localStorage.getItem("cozy-profile-img");

    if (savedName) {
        usernameInput.value = savedName;
        const sidebarName = document.getElementById("sidebar-username");
        if (sidebarName) sidebarName.textContent = savedName;
    }

    if (savedImg) {
        const sidebarImg = document.getElementById("sidebar-profile-img");
        if (sidebarImg) sidebarImg.src = savedImg;
    }

    // Preview uploaded image
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
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
            }
        });
    }

    // Save button → update + persist
    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const newName = usernameInput.value.trim();

            if (newName) {
                const sidebarName = document.getElementById("sidebar-username");
                if (sidebarName) sidebarName.textContent = newName;
                localStorage.setItem("cozy-username", newName);
            }

            if (uploadedImageData) {
                const sidebarImg = document.getElementById("sidebar-profile-img");
                if (sidebarImg) sidebarImg.src = uploadedImageData;
                localStorage.setItem("cozy-profile-img", uploadedImageData);
            }

            // 🔥 update storage info right after saving
            updateStorageInfo();

            const modalEl = document.getElementById("settings-modal");
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });
    }

    // Cleanup on modal close
    const modalEl = document.getElementById("settings-modal");
    if (modalEl) {
        modalEl.addEventListener("hidden.bs.modal", function () {
            const preview = document.getElementById("profile-preview");
            if (preview) preview.remove();

            if (fileInput) fileInput.value = "";
            uploadedImageData = null;
        });
    }

    // Clear storage button
    const clearBtn = document.getElementById("clear-storage");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            localStorage.removeItem("cozy-username");
            localStorage.removeItem("cozy-profile-img");

            const sidebarName = document.getElementById("sidebar-username");
            if (sidebarName) sidebarName.textContent = "Cozy User";

            const sidebarImg = document.getElementById("sidebar-profile-img");
            if (sidebarImg) sidebarImg.src = "assets/img/yeti.jpg"; // default avatar

            usernameInput.value = "";
            const preview = document.getElementById("profile-preview");
            if (preview) preview.remove();
            if (fileInput) fileInput.value = "";
            uploadedImageData = null;

            updateStorageInfo();

            const modalEl = document.getElementById("settings-modal");
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

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Show initial storage info
    updateStorageInfo();
}

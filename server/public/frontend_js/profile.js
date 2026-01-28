const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) window.location.href = "/";

document.addEventListener("DOMContentLoaded", () => {
    fetchProfile();
});

// 1. Fetch & Show Data
async function fetchProfile() {
    try {
        const res = await axios.get(`${BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            const user = res.data.user;

            // Fill Inputs
            document.getElementById("fullName").value = user.name;
            document.getElementById("email").value = user.email;
            document.getElementById("joinDate").value = new Date(user.createdAt).toDateString();
            
            // Stats
            document.getElementById("totalInc").innerText = `₹${user.totalIncome}`;
            document.getElementById("totalExp").innerText = `₹${user.totalExpense}`;

            // Avatar & Badge
            const initial = user.name.charAt(0).toUpperCase();
            document.getElementById("avatarText").innerText = initial;
            
            if (user.isPremium) {
                document.getElementById("premiumBadge").classList.remove("hidden");
                document.getElementById("avatarText").style.border = "3px solid #FFD700";
            }
        }
    } catch (err) {
        showToast("Failed to load profile");
    }
}

// 2. Update Name
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value;

    try {
        const res = await axios.put(`${BASE_URL}/api/profile/update`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            showToast("Profile Updated!");
            // Update LocalStorage Name too
            let localUser = JSON.parse(localStorage.getItem("user"));
            localUser.name = name;
            localStorage.setItem("user", JSON.stringify(localUser));
        }
    } catch (err) {
        showToast("Update Failed");
    }
});

// 3. Change Password
document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPass = document.getElementById("oldPass").value;
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmPass").value;

    if (newPass !== confirmPass) {
        showToast("New passwords do not match!");
        return;
    }
    if (newPass.length < 6) {
        showToast("Password must be 6+ chars");
        return;
    }

    try {
        const res = await axios.put(`${BASE_URL}/api/profile/change-password`, 
            { oldPassword: oldPass, newPassword: newPass }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
            showToast("Password Changed! Please Login again.");
            setTimeout(logout, 2000);
        }
    } catch (err) {
        showToast(err.response?.data?.message || "Error changing password");
    }
});

function logout() {
    localStorage.clear();
    window.location.href = "/";
}
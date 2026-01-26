const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", () => {
    // Show user name in sidebar
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
        document.querySelector(".user-greeting").innerText = `Welcome, ${user.name.split(' ')[0]}`;
    }

    fetchLeaderboard();
});

async function fetchLeaderboard() {
    try {
        const res = await axios.get(`${BASE_URL}/api/leaderboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            updateUI(res.data);
        }

    } catch (err) {
        console.error("Leaderboard Error:", err);
        // If 403 (Access Denied for Non-Premium), redirect or show message
        if (err.response && err.response.status === 403) {
            alert("This feature is for Premium Users only!");
            window.location.href = "dashboard.html";
        } else {
            showToast("Failed to load leaderboard");
        }
    }
}

function updateUI(data) {
    // 1. Update My Stats Card
    document.getElementById("myRank").innerText = `#${data.myRank}`;
    document.getElementById("myScore").innerText = `₹${data.myScore || 0}`;

    // 2. Populate Table
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    data.leaderboard.forEach((user, index) => {
        const rank = index + 1;
        const row = document.createElement("tr");
        
        // Determine Rank Badge Class
        let rankClass = "rank-other";
        if (rank === 1) rankClass = "rank-1";
        else if (rank === 2) rankClass = "rank-2";
        else if (rank === 3) rankClass = "rank-3";

        // Premium Icon
        const premiumIcon = user.isPremium ? `<i class="fa-solid fa-crown premium-crown" title="Premium Member"></i>` : '';

        // Row Highlight (if it's ME)
        // Check local storage ID vs row ID
        const currentUserId = JSON.parse(localStorage.getItem("user")).id;
        const isMe = user.id === currentUserId ? 'style="background-color: #EEF2FF;"' : '';

        row.innerHTML = `
            <td ${isMe}>
                <div class="rank-badge ${rankClass}">${rank}</div>
            </td>
            <td ${isMe}>
                <div class="user-info">
                    ${user.name} ${premiumIcon}
                    ${isMe ? '<span style="font-size:0.7rem; color:#4F46E5; font-weight:bold;">(You)</span>' : ''}
                </div>
            </td>
            <td ${isMe}>₹${Number(user.totalExpense).toFixed(2)}</td>
            <td ${isMe}>
                ${user.isPremium ? '<span style="color:#10B981; font-weight:500;">Premium</span>' : '<span style="color:#6b7280;">Standard</span>'}
            </td>
        `;
        list.appendChild(row);
    });
}
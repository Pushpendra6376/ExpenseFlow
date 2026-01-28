const cashfree = Cashfree({
    mode: "sandbox", 
});

async function buyPremium() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            return;
        }

        const res = await axios.post(`${BASE_URL}/api/payment/create-order`, 
            { amount: 199 }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
            const sessionId = res.data.paymentSessionId;
            
            const checkoutOptions = {
                paymentSessionId: sessionId,
                redirectTarget: "_self", 
            };
            
            cashfree.checkout(checkoutOptions);
        } else {
            showToast("Failed to create order");
        }

    } catch (error) {
        console.error("Premium Error:", error);
        showToast("Error initiating payment");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Dashboard.js me humne button banaya tha, us par onclick laga hua tha.
    // Agar nahi hai to yahan id se attach kar sakte hain.
    // Example: <button onclick="buyPremium()">Buy Premium</button>
});
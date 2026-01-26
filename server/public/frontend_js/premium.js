const cashfree = Cashfree({
    mode: "sandbox", // Production me "production" karein
});

async function buyPremium() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            return;
        }

        // 1. Create Order on Backend
        // Amount hardcoded 199 hai, aap chahe to dynamic rakh sakte hain
        const res = await axios.post(`${BASE_URL}/api/payment/create-order`, 
            { amount: 199 }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
            const sessionId = res.data.paymentSessionId;
            
            // 2. Launch Cashfree Checkout
            const checkoutOptions = {
                paymentSessionId: sessionId,
                redirectTarget: "_self", // Wahi tab me open hoga
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

// Button par event listener lagayein
document.addEventListener("DOMContentLoaded", () => {
    // Dashboard.js me humne button banaya tha, us par onclick laga hua tha.
    // Agar nahi hai to yahan id se attach kar sakte hain.
    // Example: <button onclick="buyPremium()">Buy Premium</button>
});
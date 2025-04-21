// Simple script to test server connectivity
const renderBackendUrl = "https://login-sys-5w4y.onrender.com";

async function testServer() {
    try {
        console.log("Testing server health endpoint...");
        const healthRes = await fetch(`${renderBackendUrl}/health`);
        const healthText = await healthRes.text();
        console.log("Health response status:", healthRes.status);
        console.log("Health response text:", healthText);
        
        try {
            const healthJson = JSON.parse(healthText);
            console.log("Health JSON:", healthJson);
        } catch (e) {
            console.error("Failed to parse health response as JSON:", e);
        }
        
        console.log("\nTesting login endpoint with dummy data...");
        const loginRes = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "testuser",
                password: "testpass"
            })
        });
        
        const loginText = await loginRes.text();
        console.log("Login response status:", loginRes.status);
        console.log("Login response text:", loginText);
        
        try {
            const loginJson = JSON.parse(loginText);
            console.log("Login JSON:", loginJson);
        } catch (e) {
            console.error("Failed to parse login response as JSON:", e);
        }
        
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testServer(); 
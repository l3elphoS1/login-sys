const renderBackendUrl = "https://login-sys-5w4y.onrender.com"; // Define Backend URL

// Login form handler
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value; // This now holds username or email
    const password = document.getElementById("password").value;

    try {
        console.log("Attempting login with:", { username });
        
        const res = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
        });
        
        console.log("Login response status:", res.status);
        
        // First check if the response is ok
        if (!res.ok) {
            let errorMessage = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error("Error parsing error response:", jsonError);
                // If we can't parse the JSON, try to get the text
                try {
                    const textError = await res.text();
                    console.log("Error response text:", textError);
                } catch (textError) {
                    console.error("Error getting response text:", textError);
                }
            }
            throw new Error(errorMessage);
        }

        // Try to parse the response as JSON
        let result;
        try {
            const responseText = await res.text();
            console.log("Raw response:", responseText);
            
            if (!responseText) {
                throw new Error("Empty response from server");
            }
            
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Error parsing JSON response:", jsonError);
            throw new Error("Invalid response from server. Please try again later.");
        }
        
        if (result.success) {
            // เก็บข้อมูล user ใน localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            // แสดง alert ก่อน redirect
            alert("Login successful");
            // redirect ไปยังหน้า shop
            window.location.href = "shop.html";
        } else {
            alert(result.message || "Login failed");
        }
        document.getElementById("login-form").reset();
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Error during login. Please try again later.");
    }
});

// Registration form handler
document.getElementById("register-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const email = document.getElementById("reg-email").value;
    
    try {
        console.log("Attempting registration with:", { username, email });
        
        const res = await fetch(`${renderBackendUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, email })
        });
        
        console.log("Registration response status:", res.status);
        
        // Try to parse the response as JSON
        let result;
        try {
            const responseText = await res.text();
            console.log("Raw registration response:", responseText);
            
            if (!responseText) {
                throw new Error("Empty response from server");
            }
            
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Error parsing registration response:", jsonError);
            throw new Error("Invalid response from server. Please try again later.");
        }
        
        if (!result.success) {
            throw new Error(result.message || 'Registration failed');
        }
        
        alert("Registration successful! Please login.");
        document.getElementById("register-form").reset();
        toggleForms(); // Switch to login form
    } catch (error) {
        console.error("Registration error:", error);
        alert(error.message || "Error connecting to server. Please try again later.");
    }
});
document.getElementById("login-form").addEventListener("submit", async(e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${renderBackendUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            let errorMessage = `HTTP error! status: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
                console.error("Error parsing error response:", jsonError);
                try {
                    const textError = await res.text();
                    errorMessage = textError || errorMessage;
                } catch (textError) {
                    console.error("Error getting response text:", textError);
                }
            }
            throw new Error(errorMessage);
        }

        let result;
        const responseText = await res.text();
        if (!responseText || responseText.trim() === "") {
            throw new Error("Empty response from server");
        }

        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Error parsing JSON response:", jsonError);
            throw new Error("Invalid response from server. Please try again later.");
        }

        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            alert("Login successful");
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

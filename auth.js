// Authentication API base URL - Update this to your API endpoint
const API_BASE_URL = "https://apex-football.free.nf/api"

// Store JWT token
function setAuthToken(token) {
  localStorage.setItem("apex_auth_token", token)
}

function getAuthToken() {
  return localStorage.getItem("apex_auth_token")
}

function clearAuthToken() {
  localStorage.removeItem("apex_auth_token")
}

function setWithExpiry(key, value, ttl) {
  const now = Date.now();

  const item = {
    value,
    expiry: now + ttl, // ttl in milliseconds
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  console.log(itemStr)
  const item = JSON.parse(itemStr);
  const now = Date.now();

  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

// Register Form Handler
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: password,
      role: document.getElementById("role").value,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Registration successful! Please login.")
        window.location.replace("./login.html");
      } else {
        alert(`Registration failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    }
  })
}

// Login Form Handler
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        setWithExpiry('apex_auth_token', data.token, 60 * 60 * 1000);
        alert("Login successful!")
        window.location.replace("../agents/players.html");
      } else {
        alert(`Login failed: ${data.error || "Invalid credentials"}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    }
  })
}

// Check if user is authenticated (for protected pages)
function checkAuth() {
  const token = getWithExpiry("apex_auth_token")
  if (!token) {
    alert("Please login to access this page.")
    window.location.replace("./auth/login.html");
    return false
  }
  return true
}

// Logout function
function logout() {
  clearAuthToken()
  window.location.replace("./auth/login.html");
}

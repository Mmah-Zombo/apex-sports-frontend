const API_BASE_URL = "http://localhost:8000/api"

// Check authentication
const token = localStorage.getItem("token")
if (!token) {
  window.location.href = "login.html"
}

// Load current user data
async function loadUserData() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const user = await response.json()
      document.getElementById("username").value = user.username
      document.getElementById("email").value = user.email
    } else if (response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "login.html"
    } else {
      throw new Error("Failed to load user data")
    }
  } catch (error) {
    console.error("Error loading user data:", error)
    alert("Failed to load user data")
    window.location.href = "profile.html"
  }
}

// Handle profile update
document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const userData = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (response.ok) {
      alert("Profile updated successfully!")
      window.location.href = "profile.html"
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to update profile"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while updating your profile")
  }
})

// Handle password change
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match!")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })

    if (response.ok) {
      alert("Password changed successfully!")
      document.getElementById("changePasswordForm").reset()
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to change password"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while changing your password")
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("token")
  window.location.href = "login.html"
})

// Initialize
loadUserData()

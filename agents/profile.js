const API_BASE_URL = "http://localhost:8000/api"

// Check authentication
const token = localStorage.getItem("apex_auth_token")
if (!token) {
 window.location.replace("../auth/login.html");
}

// Load user profile
async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const user = await response.json()

      // Update profile display
      const initials = user.username.substring(0, 2).toUpperCase()
      document.getElementById("avatarInitials").textContent = initials
      document.getElementById("userName").textContent = user.username
      document.getElementById("userEmail").textContent = user.email
      document.getElementById("profileUsername").textContent = user.username
      document.getElementById("profileEmail").textContent = user.email

      // Format and display creation date
      if (user.created_at) {
        const date = new Date(user.created_at)
        document.getElementById("memberSince").textContent = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    } else if (response.status === 401) {
      localStorage.removeItem("apex_auth_token")
     window.location.replace("../auth/login.html");
    } else {
      throw new Error("Failed to load profile")
    }
  } catch (error) {
    console.error("Error loading profile:", error)
    alert("Failed to load profile data")
  }
}

// Load activity statistics
async function loadStatistics() {
  try {
    // Load players count
    const playersResponse = await fetch(`${API_BASE_URL}/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (playersResponse.ok) {
      const players = await playersResponse.json()
      document.getElementById("playerCount").textContent = players.length
    }

    // Load agents count
    const agentsResponse = await fetch(`${API_BASE_URL}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (agentsResponse.ok) {
      const agents = await agentsResponse.json()
      document.getElementById("agentCount").textContent = agents.length
    }

    // Load clubs count
    const clubsResponse = await fetch(`${API_BASE_URL}/clubs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (clubsResponse.ok) {
      const clubs = await clubsResponse.json()
      document.getElementById("clubCount").textContent = clubs.length
    }

    // Load contracts count
    const contractsResponse = await fetch(`${API_BASE_URL}/contracts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (contractsResponse.ok) {
      const contracts = await contractsResponse.json()
      const activeContracts = contracts.filter((c) => c.status === "Active")
      document.getElementById("contractCount").textContent = activeContracts.length
    }
  } catch (error) {
    console.error("Error loading statistics:", error)
  }
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("apex_auth_token")
 window.location.replace("../auth/login.html");
})

// Initialize
loadProfile()
loadStatistics()

const API_BASE_URL = "http://localhost:8000/api"

// Check authentication
const token = localStorage.getItem("token")
if (!token) {
  window.location.href = "login.html"
}

// Get player ID from URL
const urlParams = new URLSearchParams(window.location.search)
const playerId = urlParams.get("id")

if (!playerId) {
  alert("Player ID not found")
  window.location.href = "players.html"
}

// Load player data
async function loadPlayer() {
  try {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const player = await response.json()
      document.getElementById("firstName").value = player.first_name
      document.getElementById("lastName").value = player.last_name
      document.getElementById("dateOfBirth").value = player.date_of_birth
      document.getElementById("nationality").value = player.nationality
      document.getElementById("position").value = player.position
      document.getElementById("marketValue").value = player.market_value || ""
      document.getElementById("agentId").value = player.agent_id || ""
      document.getElementById("currentClubId").value = player.current_club_id || ""
    } else {
      throw new Error("Failed to load player")
    }
  } catch (error) {
    console.error("Error loading player:", error)
    alert("Failed to load player data")
    window.location.href = "players.html"
  }
}

// Load agents for dropdown
async function loadAgents() {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const agents = await response.json()
      const agentSelect = document.getElementById("agentId")
      agents.forEach((agent) => {
        const option = document.createElement("option")
        option.value = agent.id
        option.textContent = `${agent.first_name} ${agent.last_name}`
        agentSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading agents:", error)
  }
}

// Load clubs for dropdown
async function loadClubs() {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const clubs = await response.json()
      const clubSelect = document.getElementById("currentClubId")
      clubs.forEach((club) => {
        const option = document.createElement("option")
        option.value = club.id
        option.textContent = club.name
        clubSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading clubs:", error)
  }
}

// Handle form submission
document.getElementById("editPlayerForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const playerData = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    date_of_birth: document.getElementById("dateOfBirth").value,
    nationality: document.getElementById("nationality").value,
    position: document.getElementById("position").value,
    market_value: Number.parseFloat(document.getElementById("marketValue").value) || null,
    agent_id: document.getElementById("agentId").value || null,
    current_club_id: document.getElementById("currentClubId").value || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(playerData),
    })

    if (response.ok) {
      alert("Player updated successfully!")
      window.location.href = "players.html"
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to update player"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while updating the player")
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("token")
  window.location.href = "login.html"
})

// Initialize
loadAgents()
loadClubs()
loadPlayer()

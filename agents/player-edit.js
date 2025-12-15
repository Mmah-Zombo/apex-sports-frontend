const API_BASE_URL = "https://apex-football.free.nf/api"

// Check authentication
function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = Date.now();

  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

const token = getWithExpiry("apex_auth_token");

if (!token) {
  window.location.replace('../auth/login.html')
}

// Get player ID from URL
const urlParams = new URLSearchParams(window.location.search)
const userId = urlParams.get("id")
let playerId = null;

if (!userId) {
  alert("User ID not found")
  window.location.href = "players.html"
}

// Load player data
async function loadPlayer() {
  try {
    const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const player = await userResponse.json()
    playerId = player.email
    const response = await fetch(`${API_BASE_URL}/player_profiles/${player.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

    if (response.ok) {
      const player = await response.json()
      document.getElementById("name").value = player.name
      document.getElementById("preferred_foot").value = player.preferred_foot
      document.getElementById("weight_kg").value = player.weight_kg
      document.getElementById("nationality").value = player.nationality
      document.getElementById("email").value = player.email
      document.getElementById("position").value = player.position
      document.getElementById("height_cm").value = player.height_cm || ""
      document.getElementById("age").value = player.age || ""
      document.getElementById("current_club").value = player.current_club || ""
    } else {
      console.log(response)
      // throw new Error("Failed to load player")
    }
  } catch (error) {
    console.error("Error loading player:", error)
    // alert("Failed to load player data")
    // window.location.href = "players.html"
  }
}

// Load agents for dropdown
async function loadAgents() {
  // try {
  //   const response = await fetch(`${API_BASE_URL}/agents`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })

  //   if (response.ok) {
  //     const agents = await response.json()
  //     const agentSelect = document.getElementById("agentId")
  //     agents.forEach((agent) => {
  //       const option = document.createElement("option")
  //       option.value = agent.id
  //       option.textContent = `${agent.first_name} ${agent.last_name}`
  //       agentSelect.appendChild(option)
  //     })
  //   }
  // } catch (error) {
  //   console.error("Error loading agents:", error)
  // }
}

// Load clubs for dropdown
async function loadClubs() {
  // try {
  //   const response = await fetch(`${API_BASE_URL}/clubs`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })

  //   if (response.ok) {
  //     const clubs = await response.json()
  //     const clubSelect = document.getElementById("currentClubId")
  //     clubs.forEach((club) => {
  //       const option = document.createElement("option")
  //       option.value = club.id
  //       option.textContent = club.name
  //       clubSelect.appendChild(option)
  //     })
  //   }
  // } catch (error) {
  //   console.error("Error loading clubs:", error)
  // }
}

// Handle form submission
document.getElementById("editPlayerForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const playerData = {
    name: document.getElementById("name").value,
    preferred_foot: document.getElementById("preferred_foot").value,
    weight_kg: Number.parseFloat(document.getElementById("weight_kg").value) || nullå,
    nationality: document.getElementById("nationality").value,
    position: document.getElementById("position").value,
    email: document.getElementById("email").value,
    height_cm: Number.parseFloat(document.getElementById("height_cm").value) || null,
    age: Number(document.getElementById("age").value) || null,
    current_club: document.getElementById("current_club").value || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/player_profiles/${playerId}`, {
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
  localStorage.removeItem("apex_auth_token")
 window.location.replace("../auth/login.html");
})

// Initialize
loadAgents()
loadClubs()
loadPlayer()

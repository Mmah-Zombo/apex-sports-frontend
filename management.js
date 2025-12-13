// Management API base URL
const API_BASE_URL = "http://localhost:8000/api"

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem("apex_auth_token")
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (response.status === 401) {
    alert("Session expired. Please login again.")
    window.location.replace("./auth/login.html");
    throw new Error("Unauthorized")
  }

  return response
}

// ===================
// PLAYERS MANAGEMENT
// ===================
async function loadPlayers() {
  try {
    const response = await apiRequest("/users")
    const users = await response.json()

    // Filter only players
    const players = users.filter((u) => u.role === "Player")

    // Get player profiles
    const profilesResponse = await apiRequest("/player_profiles")
    const profiles = await profilesResponse.json()

    const tbody = document.querySelector("#playersTable tbody")
    tbody.innerHTML = ""

    if (players.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No players found</td></tr>'
      return
    }

    players.forEach((player) => {
      const profile = profiles.find((p) => p.user_id === player.id) || {}
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${player.id}</td>
                <td>${player.name}</td>
                <td>${player.email}</td>
                <td>${profile.position || "N/A"}</td>
                <td>${profile.age || "N/A"}</td>
                <td>${profile.current_club || "Free Agent"}</td>
                <td>${profile.nationality || "N/A"}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editPlayer(${player.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="deletePlayer(${player.id})">Delete</button>
                </td>
            `
      tbody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading players:", error)
    document.querySelector("#playersTable tbody").innerHTML =
      '<tr><td colspan="8" class="loading-cell">Error loading players</td></tr>'
  }
}

async function createPlayer() {
  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: "Player",
  }

  try {
    // Create user account
    const userResponse = await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (!userResponse.ok) {
      const error = await userResponse.json()
      alert(`Error creating user: ${error.error}`)
      return
    }

    // Get the user ID from response or fetch the user
    const usersResponse = await apiRequest("/users")
    const users = await usersResponse.json()
    const newUser = users.find((u) => u.email === userData.email)

    if (!newUser) {
      alert("User created but could not find user ID")
      return
    }

    // Create player profile
    const profileData = {
      user_id: newUser.id,
      position: document.getElementById("position").value,
      age: Number.parseInt(document.getElementById("age").value),
      height_cm: Number.parseInt(document.getElementById("height_cm").value),
      weight_kg: Number.parseInt(document.getElementById("weight_kg").value),
      preferred_foot: document.getElementById("preferred_foot").value,
      current_club: document.getElementById("current_club").value || "",
      nationality: document.getElementById("nationality").value,
    }

    const profileResponse = await apiRequest("/player_profiles", {
      method: "POST",
      body: JSON.stringify(profileData),
    })

    if (profileResponse.ok) {
      alert("Player created successfully!")
      window.location.href = "players.html"
    } else {
      const error = await profileResponse.json()
      alert(`Error creating player profile: ${error.error}`)
    }
  } catch (error) {
    console.error("Error creating player:", error)
    alert("Error creating player. Please try again.")
  }
}

async function deletePlayer(id) {
  if (!confirm("Are you sure you want to delete this player?")) return

  try {
    const response = await apiRequest(`/users/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      alert("Player deleted successfully!")
      loadPlayers()
    } else {
      const error = await response.json()
      alert(`Error deleting player: ${error.error}`)
    }
  } catch (error) {
    console.error("Error deleting player:", error)
    alert("Error deleting player. Please try again.")
  }
}

// ===================
// AGENTS MANAGEMENT
// ===================
async function loadAgents() {
  try {
    const response = await apiRequest("/users")
    const users = await response.json()

    const agents = users.filter((u) => u.role === "Agent")

    const profilesResponse = await apiRequest("/agent_profiles")
    const profiles = await profilesResponse.json()

    const tbody = document.querySelector("#agentsTable tbody")
    tbody.innerHTML = ""

    if (agents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No agents found</td></tr>'
      return
    }

    agents.forEach((agent) => {
      const profile = profiles.find((p) => p.user_id === agent.id) || {}
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${agent.id}</td>
                <td>${agent.name}</td>
                <td>${agent.email}</td>
                <td>${profile.license_number || "N/A"}</td>
                <td>${profile.years_experience || "N/A"}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editAgent(${agent.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="deleteAgent(${agent.id})">Delete</button>
                </td>
            `
      tbody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading agents:", error)
    document.querySelector("#agentsTable tbody").innerHTML =
      '<tr><td colspan="6" class="loading-cell">Error loading agents</td></tr>'
  }
}

async function createAgent() {
  const userData = {
    email: document.getElementById("email").value,
    role: "Agent",
  }

  try {
    // const userResponse = await apiRequest("/users", {
    //   method: "POST",
    //   body: JSON.stringify(userData),
    // })

    // if (!userResponse.ok) {
    //   const error = await userResponse.json()
    //   alert(`Error creating user: ${error.error}`)
    //   return
    // }

    const usersResponse = await apiRequest("/users")
    const users = await usersResponse.json()
    const newUser = users.find((u) => u.email === userData.email)

    if (!newUser) {
      alert("User created but could not find user ID")
      return
    }

    const profileData = {
      user_id: Number(newUser.id),
      license_number: document.getElementById("license_number").value,
      years_experience: Number.parseInt(document.getElementById("years_experience").value),
    }

    const profileResponse = await apiRequest("/agent_profiles", {
      method: "POST",
      body: JSON.stringify(profileData),
    })

    if (profileResponse.ok) {
      alert("Agent created successfully!")
      window.location.href = "agents.html"
    } else {
      const error = await profileResponse.json()
      alert(`Error creating agent profile: ${error.error}`)
    }
  } catch (error) {
    console.error("Error creating agent:", error)
    alert("Error creating agent. Please try again.")
  }
}

async function deleteAgent(id) {
  if (!confirm("Are you sure you want to delete this agent?")) return

  try {
    const response = await apiRequest(`/users/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      alert("Agent deleted successfully!")
      loadAgents()
    } else {
      const error = await response.json()
      alert(`Error deleting agent: ${error.error}`)
    }
  } catch (error) {
    console.error("Error deleting agent:", error)
    alert("Error deleting agent. Please try again.")
  }
}

// ===================
// CLUBS MANAGEMENT
// ===================
async function loadClubs() {
  try {
    const response = await apiRequest("/clubs")
    const clubs = await response.json()

    const usersResponse = await apiRequest("/users")
    const users = await usersResponse.json()

    const tbody = document.querySelector("#clubsTable tbody")
    tbody.innerHTML = ""

    if (clubs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No clubs found</td></tr>'
      return
    }

    clubs.forEach((club) => {
      const manager = users.find((u) => u.id === club.manager_user_id)
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${club.id}</td>
                <td>${club.name}</td>
                <td>${club.location}</td>
                <td>${club.league}</td>
                <td>${manager ? manager.name : "No Manager"}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editClub(${club.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="deleteClub(${club.id})">Delete</button>
                </td>
            `
      tbody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading clubs:", error)
    document.querySelector("#clubsTable tbody").innerHTML =
      '<tr><td colspan="6" class="loading-cell">Error loading clubs</td></tr>'
  }
}

async function createClub() {
  const clubData = {
    name: document.getElementById("name").value,
    location: document.getElementById("location").value,
    league: document.getElementById("league").value,
    manager_user_id: document.getElementById("manager_user_id").value || null,
  }

  try {
    const response = await apiRequest("/clubs", {
      method: "POST",
      body: JSON.stringify(clubData),
    })

    if (response.ok) {
      alert("Club created successfully!")
      window.location.href = "clubs.html"
    } else {
      const error = await response.json()
      alert(`Error creating club: ${error.error}`)
    }
  } catch (error) {
    console.error("Error creating club:", error)
    alert("Error creating club. Please try again.")
  }
}

async function deleteClub(id) {
  if (!confirm("Are you sure you want to delete this club?")) return

  try {
    const response = await apiRequest(`/clubs/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      alert("Club deleted successfully!")
      loadClubs()
    } else {
      const error = await response.json()
      alert(`Error deleting club: ${error.error}`)
    }
  } catch (error) {
    console.error("Error deleting club:", error)
    alert("Error deleting club. Please try again.")
  }
}

// ===================
// CONTRACTS MANAGEMENT
// ===================
async function loadContracts() {
  try {
    const response = await apiRequest("/contracts")
    const contracts = await response.json()

    const usersResponse = await apiRequest("/users")
    const users = await usersResponse.json()

    const clubsResponse = await apiRequest("/clubs")
    const clubs = await clubsResponse.json()

    const tbody = document.querySelector("#contractsTable tbody")
    tbody.innerHTML = ""

    if (contracts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No contracts found</td></tr>'
      return
    }

    contracts.forEach((contract) => {
      const player = users.find((u) => u.id === contract.player_user_id)
      const agent = users.find((u) => u.id === contract.agent_user_id)
      const club = clubs.find((c) => c.id === contract.club_id)

      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${contract.id}</td>
                <td>${player ? player.name : "Unknown"}</td>
                <td>${club ? club.name : "Unknown"}</td>
                <td>${agent ? agent.name : "Unknown"}</td>
                <td>${contract.start_date}</td>
                <td>${contract.end_date}</td>
                <td>€${Number.parseFloat(contract.salary).toLocaleString()}</td>
                <td><span class="status-badge status-${contract.status.toLowerCase()}">${contract.status}</span></td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editContract(${contract.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="deleteContract(${contract.id})">Delete</button>
                </td>
            `
      tbody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading contracts:", error)
    document.querySelector("#contractsTable tbody").innerHTML =
      '<tr><td colspan="9" class="loading-cell">Error loading contracts</td></tr>'
  }
}

async function createContract() {
  const contractData = {
    player_user_id: Number.parseInt(document.getElementById("player_user_id").value),
    club_id: Number.parseInt(document.getElementById("club_id").value),
    agent_user_id: Number.parseInt(document.getElementById("agent_user_id").value),
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value,
    salary: Number.parseFloat(document.getElementById("salary").value),
    status: document.getElementById("status").value,
  }

  try {
    const response = await apiRequest("/contracts", {
      method: "POST",
      body: JSON.stringify(contractData),
    })

    if (response.ok) {
      alert("Contract created successfully!")
      window.location.href = "contracts.html"
    } else {
      const error = await response.json()
      alert(`Error creating contract: ${error.error}`)
    }
  } catch (error) {
    console.error("Error creating contract:", error)
    alert("Error creating contract. Please try again.")
  }
}

async function deleteContract(id) {
  if (!confirm("Are you sure you want to delete this contract?")) return

  try {
    const response = await apiRequest(`/contracts/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      alert("Contract deleted successfully!")
      loadContracts()
    } else {
      const error = await response.json()
      alert(`Error deleting contract: ${error.error}`)
    }
  } catch (error) {
    console.error("Error deleting contract:", error)
    alert("Error deleting contract. Please try again.")
  }
}

// Edit functions (placeholder - would need separate edit pages)
function editPlayer(id) {
  alert(`Edit player ${id} - This would redirect to an edit page`)
}

function editAgent(id) {
  alert(`Edit agent ${id} - This would redirect to an edit page`)
}

function editClub(id) {
  alert(`Edit club ${id} - This would redirect to an edit page`)
}

function editContract(id) {
  alert(`Edit contract ${id} - This would redirect to an edit page`)
}

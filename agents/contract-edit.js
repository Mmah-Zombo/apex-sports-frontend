const API_BASE_URL = "http://localhost:8000/api"

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

// Get contract ID from URL
const urlParams = new URLSearchParams(window.location.search)
const contractId = urlParams.get("id")

if (!contractId) {
  alert("Contract ID not found")
  window.location.href = "contracts.html"
}

// Load players for dropdown
async function loadPlayers() {
  try {
    const response = await fetch(`${API_BASE_URL}/players`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const players = await response.json()
      const playerSelect = document.getElementById("playerId")
      players.forEach((player) => {
        const option = document.createElement("option")
        option.value = player.id
        option.textContent = `${player.first_name} ${player.last_name}`
        playerSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading players:", error)
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
      const clubSelect = document.getElementById("clubId")
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

// Load contract data
async function loadContract() {
  try {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const contract = await response.json()
      document.getElementById("playerId").value = contract.player_id
      document.getElementById("clubId").value = contract.club_id
      document.getElementById("startDate").value = contract.start_date
      document.getElementById("endDate").value = contract.end_date
      document.getElementById("salary").value = contract.salary
      document.getElementById("status").value = contract.status
      document.getElementById("bonusClauses").value = contract.bonus_clauses || ""
    } else {
      throw new Error("Failed to load contract")
    }
  } catch (error) {
    console.error("Error loading contract:", error)
    alert("Failed to load contract data")
    window.location.href = "contracts.html"
  }
}

// Handle form submission
document.getElementById("editContractForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const contractData = {
    player_id: Number.parseInt(document.getElementById("playerId").value),
    club_id: Number.parseInt(document.getElementById("clubId").value),
    start_date: document.getElementById("startDate").value,
    end_date: document.getElementById("endDate").value,
    salary: Number.parseFloat(document.getElementById("salary").value),
    status: document.getElementById("status").value,
    bonus_clauses: document.getElementById("bonusClauses").value || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contractData),
    })

    if (response.ok) {
      alert("Contract updated successfully!")
      window.location.href = "contracts.html"
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to update contract"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while updating the contract")
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("apex_auth_token")
   window.location.replace("../auth/login.html");
})

// Initialize
loadPlayers()
loadClubs()
setTimeout(loadContract, 500) // Wait for dropdowns to load

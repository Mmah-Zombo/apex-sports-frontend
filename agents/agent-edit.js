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

// Get agent ID from URL
const urlParams = new URLSearchParams(window.location.search)
const userId = urlParams.get("id")
let agentId = null;

if (!userId) {
  alert("User ID not found")
  window.location.href = "agents.html"
}

// Load agent data
async function loadAgent() {
  try {
    const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const agent = await userResponse.json()
    agentId = agent.email
    const response = await fetch(`${API_BASE_URL}/agent_profiles/${agent.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

    console.log(response)
    if (response.ok) {
      const agent = await response.json()
      document.getElementById("name").value = agent.name
      document.getElementById("email").value = agent.email
      document.getElementById("license_number").value = agent.license_number || ""
      document.getElementById("years_experience").value = agent.years_experience || ""
    } else {
      console.error("Error loading agent:", error)
      // throw new Error("Failed to load agent")
    }
  } catch (error) {
    console.error("Error loading agent:", error)
    // alert("Failed to load agent data")
    // window.location.href = "agents.html"
  }
}

// Handle form submission
document.getElementById("editAgentForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const agentData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    license_number: document.getElementById("license_number").value || null,
    years_experience: Number(document.getElementById("years_experience").value) || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/agent_profiles/${agentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agentData),
    })

    if (response.ok) {
      alert("Agent updated successfully!")
      window.location.href = "agents.html"
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to update agent"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while updating the agent")
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("apex_auth_token")
   window.location.replace("../auth/login.html");
})

// Initialize
loadAgent()

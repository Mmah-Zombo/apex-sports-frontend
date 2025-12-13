const API_BASE_URL = "http://localhost:8000/api"

// Check authentication
const token = localStorage.getItem("token")
if (!token) {
  window.location.replace("../auth/login.html");
}

// Get agent ID from URL
const urlParams = new URLSearchParams(window.location.search)
const agentId = urlParams.get("id")

if (!agentId) {
  alert("Agent ID not found")
  window.location.href = "agents.html"
}

// Load agent data
async function loadAgent() {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(response)
    if (response.ok) {
      const agent = await response.json()
      document.getElementById("firstName").value = agent.first_name
      document.getElementById("lastName").value = agent.last_name
      document.getElementById("email").value = agent.email
      document.getElementById("phoneNumber").value = agent.phone_number || ""
      document.getElementById("licenseNumber").value = agent.license_number || ""
      document.getElementById("agencyName").value = agent.agency_name || ""
    } else {
      throw new Error("Failed to load agent")
    }
  } catch (error) {
    console.error("Error loading agent:", error)
    // alert("Failed to load agent data")
    window.location.href = "agents.html"
  }
}

// Handle form submission
document.getElementById("editAgentForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const agentData = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone_number: document.getElementById("phoneNumber").value || null,
    license_number: document.getElementById("licenseNumber").value || null,
    agency_name: document.getElementById("agencyName").value || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
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
  localStorage.removeItem("token")
   window.location.replace("../auth/login.html");
})

// Initialize
loadAgent()

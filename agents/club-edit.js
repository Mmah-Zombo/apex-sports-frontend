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

// Get club ID from URL
const urlParams = new URLSearchParams(window.location.search)
const clubId = urlParams.get("id")

if (!clubId) {
  alert("Club ID not found")
  window.location.href = "clubs.html"
}

// Load club data
async function loadClub() {
  try {
    const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const club = await response.json()
      document.getElementById("name").value = club.name
      document.getElementById("location").value = club.location
      document.getElementById("league").value = club.league || ""
      document.getElementById("manager_name").value = club.manager_name || ""
    } else {
      throw new Error("Failed to load club")
    }
  } catch (error) {
    console.error("Error loading club:", error)
    alert("Failed to load club data")
    window.location.href = "clubs.html"
  }
}

// Handle form submission
document.getElementById("editClubForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const clubData = {
    name: document.getElementById("name").value,
    location: document.getElementById("location").value,
    league: document.getElementById("league").value || null,
    manager_name: document.getElementById("manager_name").value || null,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clubData),
    })

    if (response.ok) {
      console.log(response)
      alert("Club updated successfully!")
      window.location.href = "clubs.html"
    } else {
      const error = await response.json()
      alert(`Error: ${error.detail || "Failed to update club"}`)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred while updating the club")
  }
})

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault()
  localStorage.removeItem("apex_auth_token")
   window.location.replace("../auth/login.html");
})

// Initialize
loadClub()

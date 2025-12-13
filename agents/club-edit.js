const API_BASE_URL = "http://localhost:8000/api"

// Check authentication
const token = localStorage.getItem("token")
if (!token) {
  window.location.href = "login.html"
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
      document.getElementById("country").value = club.country
      document.getElementById("city").value = club.city
      document.getElementById("league").value = club.league || ""
      document.getElementById("foundedYear").value = club.founded_year || ""
      document.getElementById("stadiumName").value = club.stadium_name || ""
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
    country: document.getElementById("country").value,
    city: document.getElementById("city").value,
    league: document.getElementById("league").value || null,
    founded_year: Number.parseInt(document.getElementById("foundedYear").value) || null,
    stadium_name: document.getElementById("stadiumName").value || null,
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
  localStorage.removeItem("token")
  window.location.href = "login.html"
})

// Initialize
loadClub()

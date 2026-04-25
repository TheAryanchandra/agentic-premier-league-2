let learnerId = null;

const profileForm = document.getElementById("profile-form");
const profileActiveView = document.getElementById("profile-active-view");
const nameInput = document.getElementById("name-input");
const mobileInput = document.getElementById("mobile-input");

const learnForm = document.getElementById("learn-form");
const profileStatus = document.getElementById("profile-status");
const loadingOverlay = document.getElementById("loading-overlay");
const logoutBtn = document.getElementById("logout-btn");

// Handle persistent login on page load
window.addEventListener("DOMContentLoaded", async () => {
  const savedId = localStorage.getItem("learnerId");
  if (savedId) {
    learnerId = parseInt(savedId);
    
    // Fetch profile details to restore UI state
    const response = await fetch(`/api/profile/${learnerId}`);
    if (response.ok) {
      const data = await response.json();
      onProfileActive(data.learner);
    } else {
      localStorage.removeItem("learnerId");
      showProfileForm();
    }
  } else {
    showProfileForm();
  }
});

// Handle Profile Creation
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData(profileForm);
  const payload = {
    name: nameInput.value,
    mobile: mobileInput.value,
    pace: formData.get("pace"),
    learning_style: formData.get("learning_style"),
    age_group: formData.get("age_group"),
    domain_levels: {
      technology: "beginner",
      sports: "beginner",
      business: "beginner",
    },
  };

  profileStatus.textContent = "Creating your account...";

  const response = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    profileStatus.textContent = data.error || "Unable to save learner profile.";
    return;
  }

  learnerId = data.learner.id;
  localStorage.setItem("learnerId", learnerId);
  onProfileActive(data.learner);
});

learnForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!learnerId) {
    profileStatus.textContent = "Save a learner profile first so the lesson can adapt.";
    return;
  }

  // Show loading state
  loadingOverlay.style.display = "flex";
  
  // Immediately scroll to output section to prepare the user
  document.querySelector(".output").scrollIntoView({ behavior: 'smooth' });

  const formData = new FormData(learnForm);
  const imageFile = document.getElementById("image-upload").files[0];
  let imageData = null;

  if (imageFile) {
    imageData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
  }

  const payload = {
    learner_id: learnerId,
    concept: formData.get("concept"),
    domain: formData.get("domain") || null,
    context: formData.get("context"),
    objective: formData.get("objective"),
    image_data: imageData,
    quick_wins: {
      eli10: formData.get("eli10") === "on",
      analogy: formData.get("analogy") === "on",
      test_me: formData.get("test_me") === "on",
    },
  };

  try {
    const response = await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    // Hide loading state
    loadingOverlay.style.display = "none";

    if (!response.ok) {
      document.getElementById("summary").textContent = data.error || "Unable to build lesson.";
      return;
    }

    renderLesson(data);
    loadHistory();

    // Show learner details at the bottom of the lesson
    const resultContainer = document.querySelector(".lesson-container");
    let detailsEl = document.getElementById("lesson-footer-details");
    if (!detailsEl) {
      detailsEl = document.createElement("div");
      detailsEl.id = "lesson-footer-details";
      detailsEl.className = "lesson-footer";
      resultContainer.appendChild(detailsEl);
    }
    
    // Get active learner details
    const profileResponse = await fetch(`/api/profile/${learnerId}`);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      const l = profileData.learner;
      detailsEl.innerHTML = `
        <hr>
        <p><strong>Lesson generated for:</strong> ${l.name} | <strong>Mobile:</strong> +91-${l.mobile || 'N/A'} | <strong>Mode:</strong> ${l.age_group}</p>
      `;
    }

    // Smooth scroll to results with a small delay for the animation to feel better
    setTimeout(() => {
      document.querySelector(".output").scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (error) {
    console.error("Error building lesson:", error);
    loadingOverlay.style.display = "none";
    document.getElementById("summary").textContent = "A connection error occurred. Please try again.";
  }
});

function renderLesson(data) {
  document.getElementById("result-title").textContent = data.personalization.concept;
  document.getElementById("domain-pill").textContent = data.domain;
  document.getElementById("summary").textContent = data.content.summary;
  
  // Ensure profile info is visible in output
  const infoEl = document.getElementById("active-profile-info");
  infoEl.textContent = `Learner: ${data.learner.name} (${data.learner.age_group}) | Style: ${data.learner.learning_style}`;

  renderList("key-points", data.content.key_points || []);
  renderList("next-steps", data.content.next_steps || []);
  renderList(
    "quiz",
    (data.content.quiz || []).map((item) => `${item.question} (${item.expected_focus})`)
  );
  renderList(
    "sources",
    (data.sources || []).map(
      (item) => `<a href="${item.url}" target="_blank" rel="noreferrer">${item.source}: ${item.title}</a>`
    ),
    true
  );
}

function renderList(id, items, allowHtml = false) {
  const list = document.getElementById(id);
  list.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "No items yet.";
    list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    if (allowHtml) {
      li.innerHTML = item;
    } else {
      li.textContent = item;
    }
    list.appendChild(li);
  });
}

// Helper to update UI when a profile is active
function onProfileActive(learner) {
  // Hide form, show active view
  profileForm.style.display = "none";
  profileActiveView.style.display = "block";
  document.getElementById("profile-container").classList.add("compact");
  
  document.getElementById("active-user-name").textContent = `Welcome, ${learner.name}!`;
  document.getElementById("active-user-details").innerHTML = 
    `Mobile: <strong>+91-${learner.mobile || 'N/A'}</strong> | ` +
    `Mode: <strong>${learner.age_group}</strong> | Pace: <strong>${learner.pace}</strong>`;


  // Show active profile info in results
  const infoEl = document.getElementById("active-profile-info");
  infoEl.textContent = `Active Profile: ${learner.age_group} | ${learner.pace} pace`;
  infoEl.classList.add("visible");

  // Unlock learn form and add "Ready" badge
  learnForm.classList.remove("locked");
  learnForm.classList.add("unlocked");
  document.getElementById("ready-badge-container").innerHTML = '<span class="ready-badge">Ready!</span>';
  
  profileStatus.textContent = "";
  loadHistory();
}

function showProfileForm() {
  profileForm.style.display = "block";
  profileActiveView.style.display = "none";
}

// Handle Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("learnerId");
  learnerId = null;
  
  // Reset UI
  showProfileForm();
  document.getElementById("profile-container").classList.remove("compact");
  profileStatus.textContent = "Logged out.";

  document.getElementById("active-profile-info").classList.remove("visible");
  learnForm.classList.add("locked");
  learnForm.classList.remove("unlocked");
  document.getElementById("ready-badge-container").innerHTML = "";
  document.getElementById("history-list").innerHTML = "<li>No past lessons yet.</li>";
  
  // Clear forms
  profileForm.reset();
  learnForm.reset();
});

async function loadHistory() {
  if (!learnerId) return;
  const response = await fetch(`/api/history/${learnerId}`);
  const data = await response.json();
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  
  if (!data.history || data.history.length === 0) {
    list.innerHTML = "<li>No past lessons yet.</li>";
    return;
  }

  data.history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.concept} (${item.domain})`;
    li.className = "history-item";
    list.appendChild(li);
  });
}

// Handle suggestion chips
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion-chip")) {
    const concept = e.target.getAttribute("data-concept");
    document.getElementById("concept-input").value = concept;
    
    // Add a small visual feedback
    e.target.style.transform = "scale(0.95)";
    setTimeout(() => e.target.style.transform = "scale(1)", 100);
  }
});

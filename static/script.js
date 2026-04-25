let learnerId = null;

const profileForm = document.getElementById("profile-form");
const profileActiveView = document.getElementById("profile-active-view");
const nameInput = document.getElementById("name-input");

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
        <p><strong>Lesson generated for:</strong> ${l.name} | <strong>Mode:</strong> ${l.age_group}</p>
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
  // Update Recent Lessons Preview
  document.getElementById("result-title").textContent = data.personalization.concept;
  document.getElementById("domain-pill").textContent = data.domain;
  document.getElementById("summary").textContent = data.content.summary;
  
  const infoEl = document.getElementById("active-profile-info");
  infoEl.textContent = `Learner: ${data.learner.name} (${data.learner.age_group}) | Style: ${data.learner.learning_style}`;
  infoEl.classList.add("visible");

  // Populate Modal
  document.getElementById("modal-title").textContent = data.personalization.concept;
  document.getElementById("modal-domain").textContent = data.domain;
  document.getElementById("modal-summary").textContent = data.content.summary;
  document.getElementById("modal-profile-info").textContent = 
    `Profile: ${data.learner.age_group} | Pace: ${data.learner.pace}`;

  // Reset Deep Dive State
  const deepDive = document.getElementById("modal-deep-dive");
  const detailedText = document.getElementById("modal-detailed-explanation");
  const toggleBtn = document.getElementById("toggle-deep-dive");
  
  deepDive.style.display = "none";
  toggleBtn.textContent = "Show Detailed Breakdown ↓";
  detailedText.textContent = data.content.detailed_explanation || "No deep dive available for this topic yet.";

  renderList("modal-key-points", data.content.key_points || []);
  renderList("modal-next-steps", data.content.next_steps || []);
  
  const quizList = data.content.quiz || [];
  const quizCard = document.querySelector(".quiz-card");
  if (quizList.length === 0) {
    quizCard.style.display = "none";
  } else {
    quizCard.style.display = "block";
    renderList(
      "modal-quiz",
      quizList.map((item) => `${item.question} (${item.expected_focus})`)
    );
  }

  const sourcesList = data.sources || [];
  const sourcesCard = document.querySelector(".sources-card");
  if (sourcesList.length === 0) {
    sourcesCard.style.display = "none";
  } else {
    sourcesCard.style.display = "block";
    renderList(
      "modal-sources",
      sourcesList.map(
        (item) => `<a href="${item.url}" target="_blank" rel="noreferrer">${item.source}: ${item.title}</a>`
      ),
      true
    );
  }

  // Add footer details to modal
  const modalFooter = document.getElementById("modal-footer");
  modalFooter.innerHTML = `
    <hr>
    <p><strong>Personalized for:</strong> ${data.learner.name}</p>
  `;

  // Open Modal
  const modal = document.getElementById("lesson-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scroll

  // Show "View Full Details" button on main page preview
  document.getElementById("main-view-details").style.display = "block";
}


// Deep Dive Toggle Logic
document.getElementById("toggle-deep-dive").addEventListener("click", () => {
  const deepDive = document.getElementById("modal-deep-dive");
  const btn = document.getElementById("toggle-deep-dive");
  
  if (deepDive.style.display === "none") {
    deepDive.style.display = "block";
    btn.textContent = "Hide Detailed Breakdown ↑";
    deepDive.scrollIntoView({ behavior: 'smooth' });
  } else {
    deepDive.style.display = "none";
    btn.textContent = "Show Detailed Breakdown ↓";
  }
});

// Modal closing logic
document.getElementById("close-modal").addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
  const modal = document.getElementById("lesson-modal");
  if (e.target === modal) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function closeModal() {
  const modal = document.getElementById("lesson-modal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
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

  // Persist for re-opening lessons
  localStorage.setItem("learnerName", learner.name);
  localStorage.setItem("learnerAge", learner.age_group);
  localStorage.setItem("learnerPace", learner.pace);


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
  localStorage.removeItem("learnerName");
  localStorage.removeItem("learnerAge");
  localStorage.removeItem("learnerPace");
  learnerId = null;
  cachedHistory = [];
  
  // Reset UI
  showProfileForm();
  document.getElementById("profile-container").classList.remove("compact");
  profileStatus.textContent = "Logged out.";

  // Reset Results Section
  document.getElementById("result-title").textContent = "Personalized Lesson";
  document.getElementById("domain-pill").textContent = "Domain";
  document.getElementById("summary").textContent = "Save a learner profile, then ask about any concept to see the adaptive lesson.";
  document.getElementById("main-view-details").style.display = "none";
  
  const footerDetails = document.getElementById("lesson-footer-details");
  if (footerDetails) footerDetails.innerHTML = "";

  document.getElementById("active-profile-info").classList.remove("visible");
  
  // Reset Learn Form
  learnForm.classList.add("locked");
  learnForm.classList.remove("unlocked");
  document.getElementById("ready-badge-container").innerHTML = "";
  document.getElementById("history-list").innerHTML = "<p>No past lessons yet. Start exploring!</p>";
  
  // Clear forms
  profileForm.reset();
  learnForm.reset();
  
  // Update suggestions for default view
  updateSuggestions("19-35");
});

let cachedHistory = [];

async function loadHistory() {
  if (!learnerId) return;
  const response = await fetch(`/api/history/${learnerId}`);
  const data = await response.json();
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  
  if (!data.history || data.history.length === 0) {
    list.innerHTML = "<p>No past lessons yet. Start exploring!</p>";
    return;
  }

  cachedHistory = data.history;

  data.history.forEach((item, index) => {
    const card = document.createElement("li");
    card.className = "history-card";
    card.innerHTML = `
      <div class="domain-meta">${item.domain}</div>
      <h4 class="concept-name">${item.concept}</h4>
      <p class="summary-snippet">${item.response_payload.content.summary}</p>
      <button class="view-lesson-btn" onclick="openPastLesson(${index})">View Full Lesson</button>
    `;
    list.appendChild(card);
  });
}

function openPastLesson(index) {
  const data = cachedHistory[index];
  if (data) {
    // Re-construct the data object structure expected by renderLesson
    const fullData = {
      ...data.response_payload,
      learner: {
        name: localStorage.getItem("learnerName") || "Learner",
        age_group: localStorage.getItem("learnerAge") || "19-35",
        pace: localStorage.getItem("learnerPace") || "moderate",
        learning_style: "example-based"
      }
    };
    renderLesson(fullData);
  }
}

// Global accessor for the button in the primary lesson-container
function viewCurrentDetails() {
  const modal = document.getElementById("lesson-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
const ageRecommendations = {
  "3-5": ["Rainbows", "Clouds", "Sharing", "Animals", "Counting", "Colors"],
  "6-10": ["Photosynthesis", "Gravity", "Multiplication", "Dinosaurs", "Water Cycle", "Solar System"],
  "11-14": ["Atoms", "Algebra", "Ecosystems", "Internet History", "Cell Biology", "Ancient Rome"],
  "15-18": ["Calculus", "DNA", "Quantum Physics", "Cryptography", "Philosophy", "World War II"],
  "18-24": ["Neural Networks", "Blockchain", "Existentialism", "Macroeconomics", "Organic Chemistry"],
  "25-34": ["REST APIs", "Agile", "Project Management", "SQL", "Personal Branding", "Public Speaking"],
  "35-50": ["Leadership", "Strategic Planning", "Wealth Management", "System Architecture", "Emotional Intelligence"],
  "50+": ["Digital Legacy", "Mentorship", "AI Ethics", "History of Art", "Genealogy"],
  "retired": ["Astronomy", "Gardening Science", "World History", "Modern Physics", "Creative Writing"]
};

// Extended Global Concept Database for Autocomplete (Smart Suggestions)
const globalConcepts = [
  "REST APIs", "GraphQL", "Photosynthesis", "Quantum Entanglement", "Blockchain", "DLS Method", "Machine Learning", 
  "Artificial Intelligence", "Neural Networks", "Calculus", "Organic Chemistry", "World War II", "French Revolution",
  "Strategic Planning", "Project Management", "Agile Methodology", "Public Speaking", "Emotional Intelligence",
  "Cryptography", "Dark Matter", "Climate Change", "Renewable Energy", "Digital Marketing", "Python Programming",
  "React Framework", "Node.js", "Docker Containers", "Kubernetes", "Cloud Computing", "Personal Finance",
  "Macroeconomics", "Microeconomics", "Psychology", "Sociology", "Ancient Civilizations", "Space Exploration",
  "Genetic Engineering", "CRISPR", "Human Anatomy", "First Aid", "Meditation", "Mental Health", "Leadership Skills"
];

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function showAutocomplete(query, ageGroup) {
  const dropdown = document.getElementById("concept-autocomplete");
  if (!query) {
    dropdown.style.display = "none";
    return;
  }

  const ageSpecific = ageRecommendations[ageGroup] || [];
  const allSuggestions = [...new Set([...ageSpecific, ...globalConcepts])];
  
  const filtered = allSuggestions
    .filter(item => item.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8); // Limit to top 8

  if (filtered.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  dropdown.innerHTML = filtered.map(item => `
    <div class="autocomplete-item" data-concept="${item}">
      <span class="icon">🔍</span>
      <span>${item}</span>
    </div>
  `).join("");

  dropdown.style.display = "flex";
}

// Handle autocomplete item click
document.getElementById("concept-autocomplete").addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (item) {
    const concept = item.getAttribute("data-concept");
    const input = document.getElementById("concept-input");
    input.value = concept;
    document.getElementById("concept-autocomplete").style.display = "none";
    
    input.classList.add("highlight-pulse");
    setTimeout(() => input.classList.remove("highlight-pulse"), 1000);
  }
});

// Close dropdown when clicking outside
window.addEventListener("click", (e) => {
  if (!e.target.closest(".input-with-dropdown")) {
    document.getElementById("concept-autocomplete").style.display = "none";
  }
});

const conceptInput = document.getElementById("concept-input");
const ageSelect = document.querySelector('select[name="age_group"]');

conceptInput.addEventListener("input", debounce((e) => {
  showAutocomplete(e.target.value, ageSelect.value);
}, 300));

function updateSuggestions(ageGroup) {
  const suggestionsRow = document.querySelector(".suggestions-row");
  if (!suggestionsRow) return;

  const concepts = ageRecommendations[ageGroup] || ageRecommendations["25-34"];
  suggestionsRow.innerHTML = "";

  concepts.slice(0, 6).forEach(concept => {
    const chip = document.createElement("span");
    chip.className = "suggestion-chip";
    chip.setAttribute("data-concept", concept);
    chip.textContent = concept;
    suggestionsRow.appendChild(chip);
  });
}

// Add event listener for age group changes
document.querySelector('select[name="age_group"]').addEventListener("change", (e) => {
  updateSuggestions(e.target.value);
});

// Initialize suggestions on page load
window.addEventListener("DOMContentLoaded", () => {
  const ageSelect = document.querySelector('select[name="age_group"]');
  if (ageSelect) updateSuggestions(ageSelect.value);
});

// Handle suggestion chips (updated for dynamic chips)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion-chip")) {
    const concept = e.target.getAttribute("data-concept");
    const input = document.getElementById("concept-input");
    input.value = concept;
    
    // Visual feedback
    e.target.style.transform = "scale(0.95)";
    setTimeout(() => e.target.style.transform = "scale(1)", 100);
    
    // Add a small pulse to the input to show it changed
    input.classList.add("highlight-pulse");
    setTimeout(() => input.classList.remove("highlight-pulse"), 1000);
  }
});


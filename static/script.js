let learnerId = null;

const profileForm = document.getElementById("profile-form");
const learnForm = document.getElementById("learn-form");
const profileStatus = document.getElementById("profile-status");

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(profileForm);
  const payload = {
    name: formData.get("name"),
    pace: formData.get("pace"),
    learning_style: formData.get("learning_style"),
    domain_levels: {
      technology: formData.get("technology_level"),
      sports: formData.get("sports_level"),
      business: formData.get("business_level"),
    },
  };

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
  profileStatus.textContent = `Profile saved for ${data.learner.name}.`;
  loadHistory();
});

learnForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!learnerId) {
    profileStatus.textContent = "Save a learner profile first so the lesson can adapt.";
    return;
  }

  const formData = new FormData(learnForm);
  const payload = {
    learner_id: learnerId,
    concept: formData.get("concept"),
    domain: formData.get("domain") || null,
    context: formData.get("context"),
    objective: formData.get("objective"),
    quick_wins: {
      eli10: formData.get("eli10") === "on",
      analogy: formData.get("analogy") === "on",
      test_me: formData.get("test_me") === "on",
    },
  };

  const response = await fetch("/api/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    document.getElementById("summary").textContent = data.error || "Unable to build lesson.";
    return;
  }

  renderLesson(data);
  loadHistory();
});

function renderLesson(data) {
  document.getElementById("result-title").textContent = data.personalization.concept;
  document.getElementById("domain-pill").textContent = data.domain;
  document.getElementById("summary").textContent = data.content.summary;

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

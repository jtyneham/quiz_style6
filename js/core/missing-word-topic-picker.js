/**
 * Owns the topic-picker UI and selection state for both Missing Word variants.
 * The game engine consumes its state but does not need to know picker DOM details.
 */
export function createMissingWordTopicPicker({ root, topics, mode, initialTopics }) {
  const picker = root.getElementById("topicPicker");
  const trigger = root.getElementById("topicPickerButton");
  const panel = root.getElementById("topicPanel");
  const label = root.getElementById("topicLabel");
  const search = root.getElementById("topicSearch");
  const list = root.getElementById("topicList");
  const allButton = root.getElementById("topicAllButton");
  const clearButton = root.getElementById("topicClearButton");
  const doneButton = root.getElementById("topicDoneButton");

  let selectedTopics = new Set(initialTopics);
  let pendingTopics = new Set(initialTopics);
  let allTopicsMode = mode === "pokemon" && selectedTopics.size === 0;
  let pendingAllTopicsMode = allTopicsMode;

  function state() {
    return { selectedTopics, allTopicsMode };
  }

  function updateLabel() {
    if (allTopicsMode || (mode === "general" && selectedTopics.size === 0)) {
      label.textContent = mode === "pokemon" ? "Topic: All" : "Topic: All Topics";
    } else if (selectedTopics.size === 0) {
      label.textContent = "Topic: None";
    } else if (selectedTopics.size === 1) {
      label.textContent = `Topic: ${[...selectedTopics][0]}`;
    } else {
      label.textContent = `Topics: ${selectedTopics.size} selected`;
    }
  }

  function renderOptions() {
    const query = search.value.trim().toLowerCase();
    list.replaceChildren();
    allButton.classList.toggle("selected", mode === "pokemon" && pendingAllTopicsMode);

    topics
      .filter((topic) => topic.toLowerCase().includes(query))
      .forEach((topic) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = `topic-option${pendingTopics.has(topic) ? " selected" : ""}`;

        const checkbox = document.createElement("span");
        checkbox.className = "topic-checkbox";
        const text = document.createElement("span");
        text.textContent = topic;
        option.append(checkbox, text);

        option.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (pendingTopics.has(topic)) pendingTopics.delete(topic);
          else pendingTopics.add(topic);
          pendingAllTopicsMode = false;
          renderOptions();
          picker.classList.add("open");
        });
        list.appendChild(option);
      });
  }

  function setOpen(open) {
    picker.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
    if (!open) return;
    pendingAllTopicsMode = allTopicsMode;
    pendingTopics = new Set(allTopicsMode ? [] : selectedTopics);
    renderOptions();
  }

  function tapFeedback(button) {
    button.classList.remove("tap-feedback");
    void button.offsetWidth;
    button.classList.add("tap-feedback");
    window.setTimeout(() => button.classList.remove("tap-feedback"), 150);
  }

  trigger.addEventListener("click", () => setOpen(!picker.classList.contains("open")));
  panel.addEventListener("click", (event) => event.stopPropagation());
  allButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    tapFeedback(allButton);
    pendingTopics.clear();
    pendingAllTopicsMode = true;
    renderOptions();
  });
  clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    tapFeedback(clearButton);
    pendingTopics.clear();
    pendingAllTopicsMode = false;
    renderOptions();
  });
  doneButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    tapFeedback(doneButton);
    if (mode === "pokemon") {
      allTopicsMode = pendingAllTopicsMode;
      selectedTopics = allTopicsMode ? new Set() : new Set(pendingTopics);
    } else {
      selectedTopics = new Set(pendingTopics);
      allTopicsMode = selectedTopics.size === 0;
    }
    updateLabel();
    search.value = "";
    window.setTimeout(() => setOpen(false), 90);
  });
  search.addEventListener("input", renderOptions);
  root.addEventListener("click", (event) => {
    if (!picker.contains(event.target)) setOpen(false);
  });

  updateLabel();
  return { close: () => setOpen(false), getState: state };
}

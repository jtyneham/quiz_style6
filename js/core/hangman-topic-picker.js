import { bindOutsideDismiss } from "./ui.js";

/** Shared topic picker for both Hangman variants. */
export function createHangmanTopicPicker({
  root,
  topics,
  supportsRandom,
  initialTopics = [],
  initialRandomMode = false,
  onApply
}) {
  const trigger = root.getElementById("topicsBtn");
  const count = root.getElementById("topicsCount");
  const overlay = root.getElementById("topicsOverlay");
  const grid = root.getElementById("topicsGrid");
  const closeButton = root.getElementById("topicsClose");
  const selectAllButton = root.getElementById("selectAllTopics");
  const clearButton = root.getElementById("clearTopics");
  const cancelButton = root.getElementById("cancelTopics");
  const applyButton = root.getElementById("applyTopics");

  let selectedTopics = new Set(initialTopics);
  let draftTopics = new Set(initialTopics);
  let randomMode = Boolean(initialRandomMode);
  let draftRandomMode = Boolean(initialRandomMode);

  function updateLabel() {
    if (supportsRandom && randomMode) {
      count.textContent = "Random";
    } else if (selectedTopics.size === topics.length) {
      count.textContent = "All";
    } else {
      count.textContent = String(selectedTopics.size);
    }
  }

  function renderChoices() {
    grid.replaceChildren();

    if (supportsRandom) {
      const randomButton = document.createElement("button");
      randomButton.type = "button";
      randomButton.className = "topic-chip random-topic";
      randomButton.textContent = "Random";
      randomButton.classList.toggle("selected", draftRandomMode);
      randomButton.addEventListener("click", () => {
        draftRandomMode = true;
        draftTopics.clear();
        renderChoices();
      });
      grid.appendChild(randomButton);
    }

    topics.forEach((topic) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "topic-chip";
      button.textContent = topic;
      button.classList.toggle(
        "selected",
        !draftRandomMode && draftTopics.has(topic)
      );
      button.addEventListener("click", () => {
        draftRandomMode = false;
        if (draftTopics.has(topic)) {
          draftTopics.delete(topic);
        } else {
          draftTopics.add(topic);
        }
        renderChoices();
      });
      grid.appendChild(button);
    });
  }

  function open() {
    draftTopics = new Set(selectedTopics);
    draftRandomMode = randomMode;
    renderChoices();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function apply() {
    if (!draftRandomMode && draftTopics.size === 0) return;

    randomMode = draftRandomMode;
    selectedTopics = new Set(draftTopics);
    updateLabel();
    close();
    onApply?.(getState());
  }

  function getState() {
    return {
      selectedTopics: new Set(selectedTopics),
      randomMode
    };
  }

  trigger.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  cancelButton.addEventListener("click", close);
  selectAllButton.addEventListener("click", () => {
    draftRandomMode = false;
    draftTopics = new Set(topics);
    renderChoices();
  });
  clearButton.addEventListener("click", () => {
    draftRandomMode = false;
    draftTopics.clear();
    renderChoices();
  });
  applyButton.addEventListener("click", apply);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  bindOutsideDismiss(root, overlay, () => {
    if (overlay.classList.contains("open")) close();
  }, trigger);

  updateLabel();
  return { close, getState };
}

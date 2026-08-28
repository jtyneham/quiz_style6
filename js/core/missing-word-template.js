/** Static Shadow DOM structure shared by both Missing Word variants. */
export const missingWordTemplate = `
  <div class="app" data-ui="game-root">
    <header class="topbar" data-ui="game-toolbar">
      <div class="utility-actions" data-ui="utility-actions">
        <button id="homeButton" class="home-button" data-ui="home-action" type="button" aria-label="Back to Home" title="Home">
          <img src="assets/home.svg" alt="" aria-hidden="true">
        </button>
        <button id="fullscreenButton" class="fullscreen-button" data-ui="fullscreen-action" type="button" aria-label="Enter fullscreen" title="Fullscreen">
          <img id="fullscreenIcon" src="assets/fullscreen.svg" alt="" aria-hidden="true">
          <span id="fullscreenLabel" class="visually-hidden">Fullscreen</span>
        </button>
      </div>
      <div class="difficulty-control" data-ui="difficulty-control" aria-label="Difficulty">
        <button type="button" class="active" data-level="mixed" aria-pressed="true">Mixed</button>
        <button type="button" data-level="2" aria-pressed="false">Medium</button>
        <button type="button" data-level="3" aria-pressed="false">Hard</button>
      </div>
    </header>
    <main class="main" data-ui="game-content">
      <section class="game" aria-label="Guess the missing word">
        <div class="topic-picker" data-ui="topic-picker" id="topicPicker">
          <button class="topic-picker-button" data-ui="topic-picker-trigger" id="topicPickerButton" type="button" aria-expanded="false">
            <span class="topic-label" id="topicLabel">Topic: None</span>
            <span class="topic-chevron">▼</span>
          </button>
          <div class="topic-panel" data-ui="overlay-panel" id="topicPanel">
            <input class="topic-search" id="topicSearch" type="search" placeholder="Search topics..." autocomplete="off">
            <div class="topic-all-row"><span>All Topics</span><button id="topicAllButton" type="button">Use All</button></div>
            <div class="topic-list" id="topicList"></div>
            <div class="topic-panel-footer">
              <button class="topic-clear" id="topicClearButton" type="button">Clear</button>
              <button class="topic-done" id="topicDoneButton" type="button">Done</button>
            </div>
          </div>
        </div>
        <div class="word-card" data-ui="game-primary-surface" id="wordCard" aria-live="polite" role="button" tabindex="0" aria-label="Game action">
          <div id="wordDisplay" class="word-display empty"></div>
        </div>
        <button id="actionButton" class="action-button" data-ui="primary-action" type="button">Next Word</button>
      </section>
    </main>
  </div>`;

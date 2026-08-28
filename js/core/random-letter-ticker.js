/** Creates and animates the Ideas ticker used by Random Letter. */
export function createRandomLetterTicker({ root, topics }) {
  const rows = [
    ["#tickerTrack1", "#tickerGroup1A", "#tickerGroup1B", 0, 1],
    ["#tickerTrack2", "#tickerGroup2A", "#tickerGroup2B", -180, 0.94],
    ["#tickerTrack3", "#tickerGroup3A", "#tickerGroup3B", -360, 1.06],
    ["#tickerTrack4", "#tickerGroup4A", "#tickerGroup4B", -540, 0.98]
  ].map(([track, groupA, groupB, offset, speedFactor]) => ({
    track: root.querySelector(track),
    groupA: root.querySelector(groupA),
    groupB: root.querySelector(groupB),
    offset,
    speedFactor,
    width: 0
  }));

  let previousTimestamp = performance.now();

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function fillGroup(group, topicList) {
    group.replaceChildren();
    topicList.forEach((topic) => {
      const label = document.createElement("span");
      label.className = "topic";
      label.textContent = topic;
      const separator = document.createElement("span");
      separator.className = "separator";
      separator.textContent = "•";
      separator.setAttribute("aria-hidden", "true");
      group.append(label, separator);
    });
  }

  function measure() {
    rows.forEach((row) => {
      row.width = row.groupA.getBoundingClientRect().width;
    });
  }

  function populate(row) {
    fillGroup(row.groupA, shuffle(topics));
    fillGroup(row.groupB, shuffle(topics));
  }

  function animate(timestamp) {
    const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.1);
    previousTimestamp = timestamp;
    const speed = Math.max(window.innerWidth / 13.33, 130);

    rows.forEach((row) => {
      row.offset -= speed * row.speedFactor * elapsedSeconds;
      if (row.width > 0 && Math.abs(row.offset) >= row.width) {
        row.offset += row.width;
        populate(row);
        requestAnimationFrame(measure);
      }
      row.track.style.transform = `translate3d(${row.offset}px, 0, 0)`;
    });

    requestAnimationFrame(animate);
  }

  rows.forEach(populate);
  requestAnimationFrame(measure);
  requestAnimationFrame(animate);
  window.addEventListener("resize", measure);
}

function renderBookmarks(videoId, frames, duration) {
  const container = document.querySelector(".container");
  if (!container) return;

  const existingVideoBookmarks = document.getElementById(videoId);
  if (existingVideoBookmarks) {
    existingVideoBookmarks.remove();
  }

  const div = document.createElement("div");
  div.classList = "videoId";
  div.id = videoId;
  div.innerHTML = frames
    .map(
      (frame) => `
        <div id="${frame.timestamp}" data-key="${
        frame.timestamp
      }" class="timeframe">
          <div class="play-time">
            <button class="btn play"></button>
            <div class="time"><p>${frame.title}</p>${(
        frame.timestamp / 60
      ).toFixed(2)}/${(duration / 60).toFixed(2)}</div>  
          </div>
          <button class="btn delete"></button>
        </div>`
    )
    .join("");

  container.appendChild(div);
}

function renderVideos(videoIds, frames, duration) {
  const container = document.querySelector(".container");
  if (!container) return;

  const existingVideoBookmarks = document.getElementById(videoId);
  if (existingVideoBookmarks) {
    existingVideoBookmarks.remove();
  }

  const div = document.createElement("div");
  div.classList = "videoId";
  div.id = videoId;
  div.innerHTML = frames
    .map(
      (frame) => `
        <div id="${frame.timestamp}" data-key="${
        frame.timestamp
      }" class="timeframe">
          <div class="play-time">
            <button class="btn play"></button>
            <div class="time"><p>${frame.title}</p>${(
        frame.timestamp / 60
      ).toFixed(2)}/${(duration / 60).toFixed(2)}</div>  
          </div>
          <button class="btn delete"></button>
        </div>`
    )
    .join("");

  container.appendChild(div);
}

function attachEventListeners() {
  const container = document.querySelector(".container");
  if (!container) return;

  container.addEventListener("click", async (event) => {
    const frame = event.target.closest(".timeframe");
    const play = event.target.closest(".play-time");
    const del = event.target.closest(".delete");

    if (play) {
      const playTime = frame.dataset.key;

      chrome.runtime.sendMessage({
        action: "notifyBackgroundToPlay",
        timeFrame: playTime,
      });
    }

    if (del) {
      const playTime = frame.dataset.key;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        if (currentUrl.includes("youtube.com/watch")) {
          const videoId = new URL(currentUrl).searchParams.get("v");

          chrome.storage.local.get([videoId], (result) => {
            if (result[videoId]) {
              const newFrames = result[videoId].frames.filter(
                (frame) => frame.timestamp.toString() !== playTime
              );

              chrome.storage.local.set(
                {
                  [videoId]: {
                    frames: newFrames,
                    duration: result[videoId].duration,
                  },
                },
                () =>
                  renderBookmarks(videoId, newFrames, result[videoId].duration)
              );
            }
          });
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBookmarks") {
    renderBookmarks(request.videoId, request.frames, request.duration);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body");
  const theme = document.querySelector(".theme");

  function handleThemeChange() {
    body.classList.toggle("dark");
    body.classList.toggle("light");
  }

  if (theme) theme.addEventListener("click", handleThemeChange);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const title = activeTab.title;
    console.log(tabs[0]);
    const currentUrl = tabs[0].url;
    if (currentUrl.includes("youtube.com/watch")) {
      const videoId = new URL(currentUrl).searchParams.get("v");
      const textContainer = document.querySelector(".Video-title");
      textContainer.textContent = title.slice(0, title.length - 10);

      chrome.storage.local.get([videoId], (result) => {
        if (result[videoId]) {
          renderBookmarks(
            videoId,
            result[videoId].frames,
            result[videoId].duration
          );
        }
      });
    }else{
      chrome.storage.local.get(null, (result) => {
        if (result) {
          console.log(result); // Logs all stored data
      }
      })
    }
  });

  attachEventListeners();
});

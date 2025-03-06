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

function renderVideos(videos) {
  const container = document.querySelector(".container");
  if (!container) return;

  const existingVideoBookmarks = document.querySelector(".video");
  if (existingVideoBookmarks) {
    existingVideoBookmarks.remove();
  }

  const videoIdsDiv = document.createElement("div");
  videoIdsDiv.classList = "videos";
  videoIdsDiv.innerHTML = videos.map((video) => `
        <div class="video" id="${video.videoId}" data-key="${
        video.videoId
      }" class="timeframe">
          <div class="play-time">
            <button class="btn play"></button>
            <div class="time"><p>${video.videoTitle}</p></div>  
          </div>
          <button class="btn delete"></button>
        </div>`
    )
    .join("");
  container.appendChild(videoIdsDiv);
}

function attachEventListeners() {
  const container = document.querySelector(".container");
  if (!container) return;

  container.addEventListener("click", async (event) => {
    const videoId = event.target.closest(".video");
    const frame = event.target.closest(".timeframe");
    const play = event.target.closest(".play-time");
    const del = event.target.closest(".delete");

    if (play) {      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        if (currentUrl.includes("youtube.com/watch")) {
          const playTime = frame.dataset.key;
          chrome.runtime.sendMessage({
            action: "notifyBackgroundToPlay",
            timeFrame: playTime,
          });
        }else{
          const Id = videoId.dataset.key  
          
          chrome.runtime.sendMessage({ action: "open_new_tab", url: `https://www.youtube.com/watch?v=${Id}` });
        }
      })
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
              if (newFrames.length) {
                chrome.storage.local.set(
                  {
                    [videoId]: {
                      frames: newFrames,
                      duration: result[videoId].duration,
                    },
                  },
                  () =>
                    renderBookmarks(
                      videoId,
                      newFrames,
                      result[videoId].duration
                    )
                );
              } else {
                chrome.storage.local.remove([videoId], () =>
                  renderBookmarks(videoId, newFrames, result[videoId].duration)
                );
              }
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
    } else {
      chrome.storage.local.get(null, (result) => {
        if (result) {
          const videos = [];
          Object.keys(result).forEach((key) => {
            const video = {
              videoTitle: result[key].videoTitle,
              videoId: key,
            };
            videos.push(video)
          });
          renderVideos(videos)
        }
      });
    }
  });

  attachEventListeners();
});

const ytp_right_controls =
  document.getElementsByClassName("ytp-right-controls");
const video_stream = document.getElementsByClassName("video-stream");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.action === "injectBookmark") {
    if (ytp_right_controls.length === 0) return;

    const pastBtn = document.querySelector(".ytp-bookmark");
    if (pastBtn) pastBtn.remove();

    const btn = document.createElement("button");
    btn.classList.add("ytp-bookmark", "ytp-button", "glasp-extension");

    const div = document.createElement("div");
    div.classList.add("custom-div");
    div.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,256,256" width="26px" height="26px" style="margin: auto" fill="#ffffff">
        <g transform="scale(5.12,5.12)">
          <path d="M37,48c-0.17578,0 -0.34766,-0.04687 -0.50391,-0.13672l-11.49609,-6.70703l-11.49609,6.70703c-0.30859,0.17969 -0.69141,0.18359 -1,0.00391c-0.3125,-0.17969 -0.50391,-0.50781 -0.50391,-0.86719v-44c0,-0.55078 0.44922,-1 1,-1h24c0.55469,0 1,0.44922 1,1v44c0,0.35938 -0.19141,0.6875 -0.50391,0.86719c-0.15234,0.08984 -0.32422,0.13281 -0.49609,0.13281z"></path>
        </g>
      </svg>`;

    btn.appendChild(div);
    ytp_right_controls[0].prepend(btn);

    btn.addEventListener("click", () => {
      if (video_stream.length === 0) return;

      const currentTime = video_stream[0].currentTime;
      const videoDuration = video_stream[0].duration;
      const videoId = new URL(window.location.href).searchParams.get("v");

      const title = prompt("Bookmark title");

      const titleElement = document.querySelector(
        "h1.ytd-watch-metadata yt-formatted-string"
      );
      const text = titleElement?.innerText.trim() || "Text not found";

      chrome.runtime.sendMessage({
        action: "bookmarkAdded",
        videoId: videoId,
        timestamp: currentTime,
        duration: videoDuration,
        title: title,
        videoTitle: text,
      });
    });
  }

  if (request.action === "notifyContentToPlay") {
    console.log("Received play request:", request.timeFrame);
    console.log("Video stream exists:", video_stream.length > 0);

    if (video_stream.length > 0) {
      try {
        const timeToPlay = parseFloat(request.timeFrame);
        console.log("Attempting to set time:", timeToPlay);

        if (!isNaN(timeToPlay)) {
          video_stream[0].currentTime = timeToPlay;
          console.log("Successfully set video time");
        } else {
          console.error("Invalid time received");
        }
      } catch (error) {
        console.error("Error setting video time:", error);
      }
    } else {
      console.error("No video stream found");
    }
  }

  if (request.action === "GET_DURATION") {
    const duration = video_stream.duration;
    sendResponse({ duration: duration });
  }
});

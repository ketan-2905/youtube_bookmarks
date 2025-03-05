chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (tab.url.includes("youtube.com/watch")) {
      const videoId = new URL(tab.url).searchParams.get("v");

      chrome.tabs.sendMessage(tabId, {
        action: "injectBookmark",
        videoId: videoId,
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "bookmarkAdded") {
    chrome.storage.local.get([request.videoId], (result) => {
      let existingFrames = result[request.videoId]?.frames || [];
      existingFrames = existingFrames.filter(
        (existingFrame) => existingFrame.timestamp !== request.timestamp
      );
      console.log(existingFrames);

      const updatedFrames = [
        ...existingFrames,
        { timestamp: request.timestamp, title: request.title },
      ];

      if (!result) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const title = activeTab.title;

          if (currentUrl.includes("youtube.com/watch")) {
            const videoId = new URL(currentUrl).searchParams.get("v");
            chrome.tabs.sendMessage(
              activeTab.id,
              { action: "GET_DURATION" },
              (response) => {
                chrome.storage.local.set(
                  {
                    [request.videoId]: {
                      frames: updatedFrames,
                      duration: response.duration,
                      videoTitle: title.slice(0, title.length - 10),
                      videoId: request.videoId,
                    },
                  },
                  () => {
                    chrome.runtime.sendMessage({
                      action: "updateBookmarks",
                      videoId: request.videoId,
                      frames: updatedFrames,
                      duration: request.duration,
                    });
                  }
                );
              }
            );
          }
        });
      } else {
        chrome.storage.local.set(
          {
            [request.videoId]: {
              frames: updatedFrames,
              duration: request.duration,
              videoTitle: request.videoTitle,
              videoId: request.videoId,
            },
          },
          () => {
            chrome.runtime.sendMessage({
              action: "updateBookmarks",
              videoId: request.videoId,
              frames: updatedFrames,
              duration: request.duration,
            });
          }
        );
      }
    });
  }

  if (request.action === "notifyBackgroundToPlay") {
    if (request.action === "notifyBackgroundToPlay") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "notifyContentToPlay",
          timeFrame: request.timeFrame,
        });
      });
    }
  }
});

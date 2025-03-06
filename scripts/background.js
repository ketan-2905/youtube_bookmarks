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
      const updatedFrames = [
        ...existingFrames,
        { timestamp: request.timestamp, title: request.title },
      ];

      if (!result[request.videoId]) {
        // New video, need to get all metadata
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const title = activeTab.title;
          const currentUrl = activeTab.url;
          if (currentUrl.includes("youtube.com/watch")) {
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
                    // Storage updated callback
                    chrome.runtime.sendMessage({
                      action: "updateBookmarks",
                      videoId: request.videoId,
                      frames: updatedFrames,
                      duration: response.duration,
                    });
                  }
                );
              }
            );
          }
        });
      } else {
        // Update existing video data
        chrome.storage.local.set(
          {
            [request.videoId]: {
              ...result[request.videoId], // Preserve existing data
              frames: updatedFrames,
            },
          },
          () => {
            chrome.runtime.sendMessage({
              action: "updateBookmarks",
              videoId: request.videoId,
              frames: updatedFrames,
              duration: result[request.videoId].duration,
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

  if (request.action === "open_new_tab") {
    chrome.tabs.create({ url: request.url });
  }
});

// This is an immediately-invoked function expression (IIFE) that executes the code immediately.
(() => {
  // Declare variables to store DOM elements and video information
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  // Function to fetch bookmarks from Chrome storage
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      // Retrieve bookmarks for the current video from Chrome storage
      chrome.storage.sync.get([currentVideo], (obj) => {
        // If bookmarks are found, parse them; otherwise, set an empty array
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  // Function to handle adding a new bookmark
  const addNewBookmarkEventHandler = async () => {
    // Get the current timestamp of the YouTube video
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime), // Create a bookmark object with time and description
    };

    // Fetch existing bookmarks from Chrome storage
    currentVideoBookmarks = await fetchBookmarks();

    // Add the new bookmark to the list and sort bookmarks by time
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  // Listener for messages from the background script
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    // Handle different message types
    if (type === "NEW") {
      // If a new video is loaded, update the current video ID and call newVideoLoaded()
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      // If the background script requests to play a specific timestamp, set the player's current time
      youtubePlayer.currentTime = value;
    } else if ( type === "DELETE") {
      // If a bookmark needs to be deleted based on the specified time, filter it out from the list
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      // Save the updated bookmarks list back to Chrome storage
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      // Send back the updated bookmarks list to the background script for further processing
      response(currentVideoBookmarks);
    }
  });

  // Function to handle a new video loaded
  const newVideoLoaded = async () => {
    // Check if the bookmark button already exists in the DOM
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    // Fetch existing bookmarks from Chrome storage for the current video
    currentVideoBookmarks = await fetchBookmarks();

    // Create the bookmark button and add it to the DOM if it doesn't exist
    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      // Set the properties of the bookmark button
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      // Get the left controls container of the YouTube player and the player itself
      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      // Append the bookmark button to the left controls container
      youtubeLeftControls.appendChild(bookmarkBtn);

      // Add an event listener to the bookmark button to handle new bookmark creation
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  // Call newVideoLoaded to handle the initial video load
  newVideoLoaded();
})();

// Function to format a time value in "HH:mm:ss" format
const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};

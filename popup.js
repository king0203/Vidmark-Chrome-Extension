// Import the 'getActiveTabURL' function from the 'utils.js' file.
import { getActiveTabURL } from "./utils.js";

// Function to add a new bookmark element to the DOM.
const addNewBookmark = (bookmarks, bookmark) => {
  // Create necessary DOM elements for the new bookmark.
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  // Set the bookmark title text and class.
  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";

  // Set class for the controls element that contains play and delete controls for the bookmark.
  controlsElement.className = "bookmark-controls";

  // Add play and delete controls to the controls element using the 'setBookmarkAttributes' function.
  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  // Set the id and class for the new bookmark element, and add a 'timestamp' attribute to store the time.
  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  // Append the bookmark title and controls to the new bookmark element.
  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);

  // Append the new bookmark element to the 'bookmarks' container in the DOM.
  bookmarks.appendChild(newBookmarkElement);
};

// Function to view the existing bookmarks on the page.
const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  // If there are bookmarks for the current video, add each bookmark using 'addNewBookmark'.
  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    // If there are no bookmarks, display a message indicating so.
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

// Event handler for the 'Play' control on a bookmark.
const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  // Send a message to the content script with the bookmark time to play the video from that timestamp.
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

// Event handler for the 'Delete' control on a bookmark.
const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

  // Remove the bookmark element from the DOM.
  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  // Send a message to the content script with the bookmark time to delete the corresponding bookmark.
  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

// Function to set attributes for a bookmark control element (e.g., play or delete).
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  // Set the image source and title for the control element.
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;

  // Add the specified event listener to the control element (e.g., onPlay or onDelete).
  controlElement.addEventListener("click", eventListener);

  // Append the control element to its parent element (e.g., the controls element of a bookmark).
  controlParentElement.appendChild(controlElement);
};

// Event listener for when the DOM content is loaded.
document.addEventListener("DOMContentLoaded", async () => {
  // Get the active tab's URL using the 'getActiveTabURL' function.
  const activeTab = await getActiveTabURL();

  // Parse the query parameters from the URL to extract the video ID.
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);
  const currentVideo = urlParameters.get("v");

  // Check if the active tab's URL is a YouTube video page and if there is a valid video ID.
  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    // Fetch the bookmarks for the current video from Chrome storage.
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      // View the fetched bookmarks on the page.
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // If the page is not a YouTube video page, display a message indicating so.
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
  }
});

 chrome.tabs.onUpdated.addListener((tabId,tab)=>{
 // This line registers an event listener for the chrome.tabs.onUpdated event, which is triggered when a tab is updated.
   
    if(tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters= tab.url.split('?')[1];
        const urlParameters =new URLSearchParams(queryParameters);

// This condition checks if the tab.url property exists and if it includes the string "youtube.com/watch".
// This condition is used to ensure that the code block is executed only when the updated tab's URL matches a YouTube video page.
// const queryParameters = tab.url.split('?')[1];:

// This line extracts the query parameters from the URL of the updated tab.
// It uses the split('?') method to split the URL into an array using the "?" character as the separator.
// The [1] index retrieves the second element of the resulting array, which contains the query parameters.

//url search params is method to work with urls

      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v"),
      });

//The chrome.tabs.sendMessage method is part of the Chrome Extension API and 
//allows communication between the extension background script and content 
//scripts running in the tab.

//The urlParameters.get("v") retrieves the value of the query parameter with 
//the key "v", which is typically used to represent the video ID in YouTube URLs      

    }

 })


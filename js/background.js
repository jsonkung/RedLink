// Constants
const ADD_TEXT = "add"
const CLEAR_TEXT = "clear"
const HEADER = "http://"

/*
 * Given a keyword and url, stores the binding of keyword -> url in chrome sync storage
 * so it can be accessed at a later time
 *
 * @param keyword to bind url to
 * @param url to bind to the keyword
 */
var setLink = function (keyword, url) {
    // Create the update to the data storage
    var update = {};
    update[keyword] = url;
    chrome.storage.sync.set(update, function() {
        // Notify of an error
        if (chrome.runtime.error) {
            console.log("Runtime error.");
        // Otherwise notify of successful binding
        } else {
            console.log('Value of %s is set to %s', keyword, url);
        }

    });
}

/*
 * Navigate current tab to the given URL
 *
 * @param url to redirect the tab to
 */
var navigate = function (url) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}

// Create event listener to hear when omnibox input is entered
chrome.omnibox.onInputEntered.addListener(function (text) {
    // Standardize text
    text = text.trim().toLowerCase();

    // Check to see if the request was to add a new binding
    if (text.indexOf(ADD_TEXT) == 0) {
        // Split tokens by whitespace and remove empty tokens
        let tokens = text.substring(ADD_TEXT.length).split(/(\s+)/).filter( e => e.trim().length > 0);
        // If there are not exactly 2 tokens, badly formatted request
        // Expect "add key url"
        if (tokens.length != 2) {
            throw new Error("Unable to add entry");
        }
        // Set new binding
        setLink(tokens[0], tokens[1]);
    // If request was to clear, clear the storage and notify success
    } else if (text.indexOf(CLEAR_TEXT) == 0) {
        chrome.storage.sync.clear(function () {
            console.log("Storage cleared");
        });
    } else {
        // If the request was normal, attempt to get the binding from chrome storage and navigate to URL
        chrome.storage.sync.get(text, function(result) {
            console.log('Value of %s currently is %s', text, result[text]);
            navigate(HEADER + result[text]);

        });
    }

});

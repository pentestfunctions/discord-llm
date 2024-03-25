// ==UserScript==
// @name         Discord Enhanced Message Extractor
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  More dynamically extract and print the newest message on Discord along with channel and room IDs
// @author       Rowboat Enhanced
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let recentMessages = [];
    let roomId = null;
    let channelId = null;

    function sendToServer(message, channelId, roomId) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://localhost:5000/receive-message",
            data: JSON.stringify({ message: message, channelId: channelId, roomId: roomId }),
            headers: {
                "Content-Type": "application/json"
            },
            onload: function(response) {
                console.log(response.responseText);
            },
            onerror: function(error) {
                console.error('Error:', error);
            }
        });
    }

    function extractLatestMessage() {
        let messageContainers = document.querySelectorAll('[role="listitem"][data-list-item-id^="chat-messages___"], [role="article"][data-list-item-id^="chat-messages___"]');

        if (messageContainers.length > 0) {
            let latestMessageContainer = messageContainers[messageContainers.length - 1];
            let messageContent = latestMessageContainer.querySelector('[id^="message-content-"]');
            let message = messageContent ? messageContent.innerText.trim() : "";

            if (message && !recentMessages.includes(message)) {
                sendToServer(message, channelId, roomId);
                recentMessages.push(message);
                console.log(`Sending message: ${message}, channelId: ${channelId}, roomId: ${roomId}`);

                if (recentMessages.length > 5) {
                    recentMessages.shift();
                }
            }
        } else {
            console.log('Message container not found.');
        }
    }

    function updateChannelAndRoomIds() {
        let matches = /\/channels\/(\d+)\/(\d+)/.exec(window.location.pathname);
        if (matches) {
            channelId = matches[1];
            roomId = matches[2];
        }
    }

    let observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                extractLatestMessage();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    function onUrlChange() {
        updateChannelAndRoomIds();
        extractLatestMessage();
    }

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        onUrlChange();
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        onUrlChange();
    };

    window.addEventListener('popstate', onUrlChange);

    updateChannelAndRoomIds();
    extractLatestMessage();
})();

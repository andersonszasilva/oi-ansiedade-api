'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var user = {
	username: ""	
};

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
	user.username = document.querySelector('#name').value.trim();
    
    if(user.username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
    }
    onConnected();
    event.preventDefault();
}



function onConnected() {
	var chatMessage = JSON.parse('{"type":"JOIN","content":null,"user":{"username":"Anderson"}}');
	onMessageReceived(chatMessage);
	var request = new XMLHttpRequest();
	request.open('GET', 'http://localhost:8080/messages?user=Anderson', true);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(chatMessage));
	request.onload = function() {
		if(request.status === 200) {
			console.log(request.status)
			console.log(request.responseText)
			var messages = JSON.parse(request.responseText)
			
			for (let message of messages) {
				onMessageReceived(message);
			}
			
		} else onError();
	}
	
    connectingElement.classList.add('hidden');
}




function onError() {
    connectingElement.textContent = 'Could not connect to  server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent) {
        var chatMessage = {
            user: user,
            content: messageInput.value,
            type: 'CHAT'
        };

        sendMessageToServer(chatMessage)
        messageInput.value = '';
    }
    event.preventDefault();
}

function sendMessageToServer(chatMessage) {
	console.log("Enviando messagem");
	console.log(chatMessage);
	
	var request = new XMLHttpRequest();
	request.open('POST', 'http://localhost:8080/messages', true);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(chatMessage));
	request.onload = function() {
		if(request.status === 200) {
			console.log(request.status)
			console.log(request.responseText)
			var message = JSON.parse(request.responseText)
			
			setTimeout(function(){ onMessageReceived(message); }, 1000);
			
		} else onError();
	}
	
	onMessageReceived(chatMessage)
	
}


function onMessageReceived(message) {
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.user.username + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.user.username + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.user.username[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.user.username);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.user.username);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)

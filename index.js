const dialogflow = require('dialogflow');
const uuid = require('uuid');

//fix for dynamic port issue in heroku
const express = require('express');
const expressApp = express();
const port = process.env.PORT || 3000
expressApp.get('/', (req, res) => { res.send('Started!') });
expressApp.listen(port, () => { console.log(`Listening on port ${port}`) });

//telegram
var TelegramBot = require('node-telegram-bot-api'),
    token       = process.env.TEL_BOT_KEY,
    bot         = new TelegramBot(token, { polling: true });

var 	TelegramBot = require('node-telegram-bot-api'),
		token       = process.env.TEL_BOT_KEY,
		bot         = new TelegramBot(token, { polling: true });

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function processMessage(userInput, projectId = "foracebotapiv2") {
	let privateKey  = JSON.parse(process.env.PRIVATE_KEY)
	let clientEmail = process.env.CLIENT_EMAIL
	let config = {
		credentials: {
			private_key: privateKey,
			client_email: clientEmail
		}
	}

	const sessionId     = uuid.v4();
	const sessionClient = new dialogflow.SessionsClient(config);
	const sessionPath   = sessionClient.sessionPath(projectId, sessionId);

	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text         : userInput.text, // The query to send to the dialogflow agent
				languageCode : 'en-US',  // The language used by the client (en-US)
			},
		},
	};

	const responses = await sessionClient.detectIntent(request);
	const result = responses[0].queryResult;
	const response = `${result.fulfillmentText}\n--------------\nIntent: ${result.intent.displayName}`;
	bot.sendMessage(userInput.chat.id, response);
}

function localCustom(chatId, response){
	bot.sendMessage(chatId, response);
}

bot.on('message', (msg) => {
	if(msg.text == 'testnoapi'){
		localCustom(msg.chat.id, 'me ok.')
	}else{
		processMessage(msg);
	}
});

//dialogflow
const dialogflow = require('dialogflow');
const uuid = require('uuid');

//telegram
const TelegramBot = require('node-telegram-bot-api');
const token = ENV['TEL_BOT_KEY'];
const bot = new TelegramBot(token, {polling: true});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function processMessage(userInput, projectId = "foracebotapiv2") {
	const sessionId     = uuid.v4();
	const sessionClient = new dialogflow.SessionsClient();
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
		// Query: `${result.queryText}`,
		// Response: `${result.fulfillmentText}`,
		// Intent: `${result.intent.displayName}`,
	const response = `${result.fulfillmentText}\n\n--------------\nIntent: ${result.intent.displayName}`;
	bot.sendMessage(userInput.chat.id, response);
}

function localCustom(chatId, response){
	bot.sendMessage(chatId, response);
}

bot.on('message', (msg) => {
	// const chatId = msg.chat.id;
	if(msg.text == 'testnoapi'){
		localCustom(msg.chat.id, 'me ok.')
	}else{
		processMessage(msg);
	}
});
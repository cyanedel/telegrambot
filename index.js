//dialogflow
var dialogflow = require('dialogflow');
var uuid = require('uuid');

//telegram
var 	TelegramBot = require('node-telegram-bot-api'),
		port        = process.env.PORT || 8443,
		host        = process.env.HOST,
		token       = process.env.TEL_BOT_KEY,
 		externalUrl = process.env.CUSTOM_ENV_VARIABLE || 'https://forasbot.herokuapp.com',
		bot         = new TelegramBot(token, { webHook: { port : port, host : host } });
bot.setWebHook(externalUrl + ':8443/bot' + token);
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

	//console.log(privateKey)
	//console.log(clientEmail)

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
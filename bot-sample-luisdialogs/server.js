/* -------------------------------------------------------------------- */
// bot-sample-luisdialogs
// A simple example for the Microsoft Bot Framework using LUIS based
// intent dialogs.
//
// This will show you a simple bot that utlisises intent dialogs to
// understand and guide the user through the conversation. However instead
// of matching the input of the user against dialogs manually, the LUIS.ai
// platform is used to extract the intent and optional entities.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// Uses https://www.luis.ai
// You can find an introduction to LUIS here:
// https://docs.botframework.com/en-us/node/builder/guides/understanding-natural-language/
// 
// See https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/
// and https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/#intent-recognizers
//
// If you want a good generic example on how to start with the ms bot
// framework, you should also have a look at the echobot example from
// FUSE Labs at Microsoft Research.
// Link: https://github.com/fuselabs/echobot
/* -------------------------------------------------------------------- */

// A live bot needs an app id and the corresponding password to be able
// to communicate with the Bot Framework middleware.
// Usually this will be defined in the app settings of your server and NOT
// in the actual code for security reasons.
// Note that for the testing locally with the Bot Framework Channel
// Emulator you should not enter id and password.
if (process.env.NODE_ENV !== 'production') {
    process.env.MICROSOFT_APP_ID = "";
    process.env.MICROSOFT_APP_PASSWORD = "";
    process.env.LUIS_APP_URL = "";
}

// Restify provides a REST server. Essentially a bot is just a web
// application providing a REST endpoint the bot framework middleware
// can communicate with.
// See https://github.com/restify/node-restify
var restify = require('restify');

// Botbuilder is the official module that provides interfaces and
// functionality around the MS Bot Framework for node.
// See https://github.com/Microsoft/BotBuilder
var builder = require('botbuilder');

// Create a new server and make it listen on port 3798.
// Note that this is the standard port for the bot framework v3.
// Show a console message on startup.
var server = restify.createServer();
server.listen(process.env.port || 3798, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create a new connection to the bot framework middleware. This will
// make the bot known and authenticate it with the app credentials.
// See https://docs.botframework.com/en-us/node/builder/chat/UniversalBot/#connectors
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Create the actual bot.
// A universal bot is responsible for managing all of the conversations
// your bot has with a user while the bot framework middleware will do
// the actual communication with the chat platforms.
// So it's bot -> connector -> bot framework mw -> skype || slack || ..
// See https://docs.botframework.com/en-us/node/builder/chat/UniversalBot/
var bot = new builder.UniversalBot(connector);

// Set the endpoint your bot is listening at.
// Note while /api/messages is the default, it can be changed in the
// management page of your bot.
server.post('/api/messages', connector.listen());

// This creates a connection to the LUIS app
// You need a registered LUIS app on https://www.luis.ai/applicationlist
// The app url is the one you will get if you publish your LUIS app.
var recognizer = new builder.LuisRecognizer(process.env.LUIS_APP_URL);

// Instead of dialogs, LUIS works with intents
// you define these within your LUIS app, which will then used
// as triggers for your app when LUIS identifies them.
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

// Bind all dialogs to intents
bot.dialog('/', intents);

// Default intent for unrecognised intents / requests.
intents.onDefault([
    function (session, args, next) {
        session.send("Sorry, I didn't get that. Can you please try again?");
    }
]);

// This would be an intent defined in your LUIS app called "Welcome",
// which might listen to utterances like "Hello", "Hi" or similar.
// Note that the actual dialog behaves exactly like an IntentDialog.
// Since LUIS is just a preprocessor to manage IntentDialogs you could
// actually mix & match approaches and use LUIS as well as your own regular
// expressions if you so choose. 
// See https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/
intents.matches('Welcome', [
    function (session, args, next) {
        // show a simple answer
        session.send("Oh, hello! Nice to see you!");
    }
]);

/* -------------------------------------------------------------------- */
// bot-sample-intentdialogs
// A simple example for the Microsoft Bot Framework using intent dialogs.
//
// This will show you a simple bot that utlisises intent dialogs to
// understand and guide the user through the conversation. IntendDialogs
// can be called based on matching the input of the user against
// regular expressions.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// See https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/
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

// We use an intent dialog based bot. When the user starts interacting with
// the bot, the root dialog will be called. With an intent dialog, regular
// expressions can be defined, which if they match call respective dialogs.
// onDefault acts as a closure that will be called if none of the defined
// matches hit.
// See https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/
bot.dialog('/', new builder.IntentDialog()
    .matches(/^hi/i, '/welcome')
    .matches(/your name/i, '/botname')
    .matches(/my name/i, '/username')
    .onDefault(builder.DialogAction.send("I'm sorry, I didn't understand. You can ask me for my name and tell me yours."))
);

// The user message matched /^hi/i
bot.dialog('/welcome', [
    function (session) {
        // Simple text reply back to the user
        session.send('Hello.');
        session.endDialog();
    }
]);

// The user message matched /^your name/i
// This is to catch phrases like "What's your name?"
bot.dialog('/username', [
    function (session) {
        // Simple text reply back to the user
        session.send('Nice to meet you!');
        session.endDialog();
    }
]);

// The user message matched /^my name/i
// This is to catch phrases like "My name is XY."
bot.dialog('/botname', [
    function (session) {
        // Simple text reply back to the user
        session.send('My name is Bot. I\'m here to show you how IntentDialogs work.');
        session.endDialog();
    }
]);

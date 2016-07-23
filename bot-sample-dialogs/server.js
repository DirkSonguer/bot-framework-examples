/* -------------------------------------------------------------------- */
// bot-sample-dialogs
// A simple example for the Microsoft Bot Framework using promts.
//
// This will show you a simple bot that utlisises dialogs to guide the
// user through the conversation.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// See https://docs.botframework.com/en-us/node/builder/chat/dialogs/
//
// If you want a good generic example on how to start with the ms bot
// framework, you should also have a look at the echobot example from
// FUSE Labs at Microsoft Research.
// Link: https://github.com/fuselabs/echobot.
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

// We use a standard dialog based bot. When the user starts interacting with
// the bot, the first step of the root dialog will be called.
// See https://docs.botframework.com/en-us/node/builder/chat/dialogs/
bot.dialog('/', [
    function (session, args, next) {
        // Offer a way to reset the name stored in the session. This checks
        // if the user has entered "reset". If so, then delete the value
        // in session.userData.name so that the bot asks again.
        if (session.message.text == 'reset') {
            session.userData.name = '';
        }

        // Check if the user name is stored in the session
        if (!session.userData.name) {
            // If the name is unknown, then jump to the /profile dialog
            // to let the user enter it.
            session.beginDialog('/profile');
        } else {
            // If the user name is stored in the session, then continue
            // to the next step in the waterfall.
            next();
        }
    },
    function (session, results) {
        // Acknowledge the users name from the session
        session.send('Hello %s!', session.userData.name);
    }
]);

// Create a new dialog called /profile. Dialogs can call each other with
// session.beginDialog('/dialog_name');
bot.dialog('/profile', [
    function (session) {
        // Simple text prompt. This will show a message and wait for user
        // input. The entire response of the user will be handed to the
        // next waterfall step.
        // See https://docs.botframework.com/en-us/node/builder/chat/prompts/
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        // Store the users name in the session. Note that everything you store
        // in session.userData will be persistent for the entire chat session
        // with the current user. Also note that the length of a session
        // depends on the respective channel. Some might run out, others have
        // to be reset programatically.
        session.userData.name = results.response;

        // End the dialog. This will then return the to the calling dialog.
        session.endDialog();
    }
]);

/* -------------------------------------------------------------------- */
// bot-sample-prompts
// A simple example for the Microsoft Bot Framework using promts.
//
// This will show you a simple bot that interacts with the user via
// several types of promts. Promts are messages by bots, which then
// wait for user interaction and proceed to the next waterfall step.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// See https://docs.botframework.com/en-us/node/builder/chat/prompts/
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

// We use a standard dialog based bot, which asks the user a couple of
// questions to showcase multiple types of promts.
// See https://docs.botframework.com/en-us/node/builder/chat/prompts/
bot.dialog('/', [
    // Root node of the dialog. This will be called on first user
    // interaction with the bot.
    function (session, args, next) {
        // Simple text prompt. This will show a message and wait for user
        // input. The entire response of the user will be handed to the
        // next waterfall step. There are no restrictions what the user
        // can type.
        builder.Prompts.text(session, "Hi! What is your name?");
    },
    function (session, results) {
        // Acknowledge the users name
        session.send("Hi " + results.response + ".")

        // A numerical prompt. This will ask the user for a number and won't
        // continue if the user enters anything else.
        builder.Prompts.number(session, "How old are you?");
    },
    function (session, results) {
        // Acknowledge the users name
        session.send(results.response + "? Nice.")

        // Ask the user for their favourite color. This will show a number
        // of choices the user has to choose from. Depending on the channel
        // they can choose by typing or tapping / clicking.
        // Note that only the offered options can be chosen. Users will get
        // a notification if they don't and the dialog won't continue.
        builder.Prompts.choice(session, "What is your favourite colour?", ["Red", "Green", "Blue", "RGB"]);
    },
    function (session, results) {
        // Acknowledge the users favourite colour
        session.send(results.response.entity + ", eh? Good choice!");

        // A confirmation prompt asks a yes / no question. Depending on the
        // channel they can choose by typing or tapping / clicking.
        builder.Prompts.time(session, "What is todays date and time?");
    },
    function (session, results) {
        // Acknowledge the 
        // Note that results.response.entity does contain the raw input by
        // the user. If you want a proper date object, use the EntityRecognizer.
        // builder.EntityRecognizer.resolveTime([results.response]);
        var timeData = builder.EntityRecognizer.resolveTime([results.response]);
        session.send(timeData + ", did I get that right? Cool!");

        // A confirmation prompt asks a yes / no question. Depending on the
        // channel they can choose by typing or tapping / clicking.
        builder.Prompts.confirm(session, "So, do you get now how promts work?");
    },
    function (session, results) {
        // The answer for a confirmation will be given as boolean, even when
        // the user answers by typing "yes" or "no"..
        if (results.response) {
            session.send("Super! Happy coding, then.");
        } else {
            session.send("No? Well, maybe you should read https://docs.botframework.com/en-us/node/builder/chat/prompts/");
        }
    }
]);
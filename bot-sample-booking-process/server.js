/* -------------------------------------------------------------------- */
// bot-sample-booking-process
// An example that will run through a booking dialog as a demo.
// Note that the bot does not have any backend integration. It is meant
// to showcase an end-to-end guided dialog with multiple types of
// interactions.
//
// When running this example, note that it is up to the channel to
// interpret how the dialogs will be displayed. So cards might look very
// different in web chat vs. Skype vs. Slack.
// It is advised to test each card implementation in every channel
// your bot connects to to make sure they look adequate.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// Uses https://www.luis.ai
// You can find an introduction to LUIS here:
// https://docs.botframework.com/en-us/node/builder/guides/understanding-natural-language/
//
// Specific LUIS app used: https://www.luis.ai/application/e65ecd54-4f2a-4af3-b51d-2beee361d7ab
// The LUIS app export can be found in /LUIS. You can create a new LUIS
// application, import the data and then run against the published app
// instead.
//
// See https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/
// and https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/#intent-recognizers
//
// The example will be based on the current hero image on the official
// bot framework site: https://dev.botframework.com/.
// The image in question is https://dev.botframework.com/Client/images/hero-foreground-v3.png
// Image (c) 2016 by Microsoft.
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
    process.env.LUIS_APP_URL = "https://api.projectoxford.ai/luis/v1/application?id=e65ecd54-4f2a-4af3-b51d-2beee361d7ab&subscription-key=c01e068a748f45918abc029e69c1ffd4";
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
// The app url is the one you will get if you publish your LUIS app
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

// Triggered by a salutation intent defined in the LUIS app called
// "Welcome", which listens to utterances like "Hello", "Hi" or similar.
intents.matches('Welcome', [
    function (session) {
        // Get the current name of the user from the session information.
        // Note that this is dependant on the current channel and its privacy
        // settings. This might contain the user name, but also just an ID.
        var currentUsername = '';
        if (session.message.address.user.name) currentUsername = " " + session.message.address.user.name;

        // Simple text reply back to the user
        session.send('Hello ' + currentUsername + '. I\'m a demo bot emulating a booking process. Start the process by requesting an appointment for a haircut');
        session.endDialog();
    }
]);

// Triggered by the "Haircut" intent defined in the LUIS app. It listens
// to utterances requesting a haircut. It might also contain a prebuild
// datetime entity.
// The goal of this intent is to negotiate an appointment for a haircut.
// Note that once the intent has been recognised, this is now a guided
// dialog since the bot needs specific information to book an appointment.
// For the example we assume that the bot needs the name of the user plus
// the date and time for the appointment.
intents.matches('Haircut', [
    function (session, args, next) {
        // Since this marks the beginning of the process, clear all data we have
        // collected beforehand.
        // the appointment object will be used to store all data needed to
        // actually book an appointment with the (fictional) backend system.
        session.userData.appointment = {};

        // First check if the user has already given information about the
        // desired date and time for the appointment.
        // If so, then store it in the user session.
        // Note: findEntity() will only find the FIRST entity with the
        // given type. If the user uttered a more complex phrase like:
        // "I want an appointment this Wednesday or Friday", it will only
        // pick the first recognised date. Alternatively, use findAllEntities()
        // and parse by hand.
        if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date')) {
            session.userData.appointment.date = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
            session.userData.appointment.date.entity = session.userData.appointment.date.entity[0].toUpperCase() + session.userData.appointment.date.entity.slice(1)
        }
        if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time')) {
            session.userData.appointment.time = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time');
        }

        // If the user has not been identified yet, check if we can extract
        // the user name from the session. If so, then we can jump to the next
        // step in the waterfall.
        // Note that this is dependant on the current channel and its privacy
        // settings. This might contain the user name, but also just an ID.
        if (session.message.address.user.name) {
            session.userData.appointment.name = session.message.address.user.name.toString();
            next();
            return;
        }

        // Otherwise we do not have the user name and need to ask for it.
        builder.Prompts.text(session, "Sure. What is the name I can note down for this appointment?")
    },
    // Second step, this negotiates the date for the appointment.
    function (session, results, next) {
        // Check if the user has provided an answer to the current question.
        // If so, the result should contain the users name.
        if ((typeof results !== 'undefined') && (typeof results.response !== 'undefined')) {
            session.userData.appointment.name = results.response;
        }

        // Check if the date for the appointment is already known. If so, then we
        // can jump to the next step in the waterfall.
        if (session.userData.appointment.date) {
            next();
            return;
        }

        // Otherwise we need to ask for it.
        builder.Prompts.text(session, "Hi " + session.userData.appointment.name + ", at what day do you want your appointment?")
    },
    // Third step, this negotiates the time for the appointment.
    function (session, results, next) {
        console.log(JSON.stringify(results.response));
        // Check if the user has provided an answer to the current question.
        // If so, the result should contain the appointment date.
        if ((typeof results !== 'undefined') && (typeof results.response !== 'undefined')) {
            // Note that LUIS stored the appointments as a "builtin.datetime.date".
            // To keep the data consistent, we will handle the user input the same way
            // and construct a similar object.
            appointmentDate = {};
            appointmentDate.entity = results.response[0].toUpperCase() + results.response.slice(1);
            appointmentDate.type = "builtin.datetime.date";
            appointmentDate.startIndex = 0;
            appointmentDate.endIndex = appointmentDate.entity.length;
            appointmentDate.resolution = {};
            appointmentDate.resolution.date = '';
            session.userData.appointment.date = appointmentDate;
        }

        // Check if the time for the appointment is already known. If so, then we
        // can jump to the next step in the waterfall.
        if (session.userData.appointment.time) {
            next();
            return;
        }

        // Otherwise we need to ask for it.
        session.send(session.userData.appointment.date.entity + ", I have these times available:");

        // In this case we simulate that we checked the backend service for the given date
        // and received an array with possible options.
        lifestyleFilter = ['10:30 AM', '11:30 AM', 'See more'];

        // We will present the user the list of options and as choice promts and wait until the
        // user selected an option.
        builder.Prompts.choice(session, "", lifestyleFilter);
    },
    // Fourth step, this asks for confirmation.
    function (session, results, next) {
        console.log(JSON.stringify(session.userData));
        if ((typeof results !== 'undefined') && (typeof results.response !== 'undefined')) {
            // Note that LUIS stored the appointments as a "builtin.datetime.time".
            // To keep the data consistent, we will handle the user input the same way
            // and construct a similar object.
            appointmentDate = {};
            appointmentDate.entity = results.response.entity;
            appointmentDate.type = "builtin.datetime.time";
            appointmentDate.startIndex = 0;
            appointmentDate.endIndex = appointmentDate.entity.length;
            appointmentDate.resolution = {};
            appointmentDate.resolution.comment = 'ampm';
            appointmentDate.resolution.time = '';
            session.userData.appointment.time = appointmentDate;
        }

        // Ask for confirmation.
        session.send("Great! Does this look correct?");

        // Create a new message with the confirmation.
        // Note that cards are managed as attachments that each channel can interpret
        // as they see fit. Remember that some channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // This is the actual thumbnail card. For each card you can add the
                // specific options like title, text and so on.
                new builder.ThumbnailCard(session)
                    // Show fictional brand
                    .title("Haircut at Fourstylists")
                    // Show negotiated data
                    .subtitle(session.userData.appointment.date.entity + ", " + session.userData.appointment.time.entity)
                    // Show fictional address
                    .text("1234 Olive Street Seattle, WA 98101")
                    .images([
                        // Show some fictional brand image
                        builder.CardImage.create(session, "https://s-media-cache-ak0.pinimg.com/564x/3b/7c/55/3b7c55d281f2580a0eb860d0aff19705.jpg")
                    ])
                    .buttons([
                        // Define a button with an action. The action label will
                        // be picked up by the choice prompt and handed on to the
                        // next step in the waterfall.
                        builder.CardAction.imBack(session, "confirm", "Book now"),
                        builder.CardAction.imBack(session, "cancel", "Cancel")
                    ]),
            ]);

        // Send the message to the user and end the dialog
        builder.Prompts.choice(session, msg, "confirm|cancel");
    },
    // Fifth step, all done.
    function (session, results) {
        if (results.response.entity == 'confirm') {
            // Call backend, do booking

            // Show confirmation message
            session.send('Great! We\'re waiting for you ' + session.userData.appointment.date.entity + ", " + session.userData.appointment.time.entity + '. See you then!');
            session.endDialog();
        } else {
            session.send('Oh, ok. Please feel free to request an appointment for another time.');
            session.endDialog();
        }
    }
]);
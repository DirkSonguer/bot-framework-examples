/* -------------------------------------------------------------------- */
// bot-sample-cards
// A simple example for the Microsoft Bot Framework sending card based
// information to a user.
//
// This will show you a simple bot that utlisises cards to send rich
// information to a user. Cards provide flexible layouts that might
// contain images, titles, subtitles, text and action buttons.
//
// Note that with cards specifically it is up to the channel to
// interpret how they will be displayed. So cards might look very
// different in web chat vs. Skype vs. Slack.
// It is advised to test each card implementation in every channel
// your bot connects to to make sure they look adequate.
//
// Author: dirk@songuer.de
// Link: https://github.com/DirkSonguer/bot-framework-examples
//
// See https://docs.botframework.com/en-us/node/builder/chat/dialogs/
//
// If you want a good generic example on how to start with the ms bot
// framework, you should also have a look at the echobot example from
// FUSE Labs at Microsoft Research.
// Link: https://github.com/fuselabs/echobot
//
// For cards and prompts specifically, the Skype demo app does also
// features examples for all kinds of use cases and variants.
// Link: https://github.com/Microsoft/BotBuilder/blob/master/Node/examples/demo-skype/app.js
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
        // Use a choice prompt to ask the user what to showcase.
        // Choice prompts show a number of options the user has to choose from.
        // Depending on the channel they can choose by typing or tapping / clicking.
        // Note that only the offered options can be chosen. Users will get
        // a notification if they don't and the dialog won't continue.
        builder.Prompts.choice(session, "What kind of card do you want to test?", ["HeroCard", "Thumbnail", "List", "Carousel", "Actions"]);
    },
    function (session, results) {
        // Based on what the user selected, call the respective dialog.
        // Note that the dialogs are just named according to the prompts choices
        // so we can just call them directly by option id.
        session.beginDialog('/' + results.response.entity);
    }
]);

// This showcases a simple hero card.
// A hero card is used to send the user a visually rich information. It supports
// a number of options that the developer can use to style the information.
// Title - Title of card
// Subtitle - Link for the title
// Text - Text of the card
// Images[] - For a hero card, a single image is supported
// Buttons[] - Hero cards support one or more buttons
// Tap - An action to take when tapping on the card
// See https://docs.botframework.com/en-us/csharp/builder/sdkreference/attachments.html#herocard
bot.dialog('/HeroCard', [
    function (session) {
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // This is the actual hero card. For each card you can add the
                // specific options like title, text and so on.
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Microsoft Bot Framework")
                    .text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
                    .images([
                        builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-7.png")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://dev.botframework.com/"))
            ]);

        // Send the message to the user and end the dialog
        session.send(msg);
        session.endDialog();
    }
]);

// A thumbnail is pretty much the same as a hero card, just the
// layout within the channel is different. While the hero card
// prominently features the image, the thumbnail will only display
// it as thumnail next to the text content.
// Otherwise the same options are used as with a hero card.
bot.dialog('/Thumbnail', [
    function (session) {
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // This is the actual thumbnail card. For each card you can add the
                // specific options like title, text and so on.
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Skype Bots")
                    .text("Skype bots are a new way to bring expertise, products, services and entertainment into your daily messaging on Skype.")
                    .images([
                        builder.CardImage.create(session, "https://skypeblogs.files.wordpress.com/2016/07/bots-hero-image.png")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://blogs.skype.com/2016/03/30/skype-bots-preview-comes-to-consumers-and-developers/"))
            ]);

        // Send the message to the user and end the dialog
        session.send(msg);
        session.endDialog();
    }
]);

// A list is literally just a number of cards, regardless of type.
// Note that the attachments option of a message is an array, so
// it can be filled with an infinite number of cards of different
// types. So you can mix and match hero and thumbnail cards together
// to do layouting for different channels.
bot.dialog('/List', [
    function (session) {
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // The previous hero card
                new builder.HeroCard(session)
                    .title("Microsoft Bot Framework")
                    .text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
                    .images([
                        builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-7.png")
                    ]),
                // The previous thumbnail card
                new builder.ThumbnailCard(session)
                    .title("Skype Bots")
                    .text("Skype bots are a new way to bring expertise, products, services and entertainment into your daily messaging on Skype.")
                    .images([
                        builder.CardImage.create(session, "https://skypeblogs.files.wordpress.com/2016/07/bots-hero-image.png")
                    ]),
            ]);

        // Send the message to the user and end the dialog
        session.send(msg);
        session.endDialog();
    }
]);

// A carousel is a list of cards, which will be displayed as carousel
// (usually as horizontal scroll / swipe list). Additionally to
// adding multiple cards to the attachments option, the attachmentLayout
// needs to be set as (builder.AttachmentLayout.carousel to activate
// the respective view.
// Note that in this example we also add a button action to each card
// and use a choice prompt to wait for input instead of session.send().
// This will present the user with a carousel of cards to select from.
// Each card can even support multiple actions.
bot.dialog('/Carousel', [
    function (session) {
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            // This will set the view mode to carousel
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                // A hero card as previously shown
                new builder.HeroCard(session)
                    .title("Microsoft Bot Framework")
                    .text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
                    .images([
                        builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-7.png")
                            // Here instead of tap to open an url, the image is opened in full view
                            .tap(builder.CardAction.showImage(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-7.png"))
                    ])
                    .buttons([
                        // Define a button with an action. The action label will
                        // be picked up by the choice prompt and handed on to the
                        // next step in the waterfall.
                        builder.CardAction.imBack(session, "botframework", "More about the Bot framework")
                    ]),
                // A hero card as previously shown
                new builder.HeroCard(session)
                    .title("Skype Bots")
                    .text("Skype bots are a new way to bring expertise, products, services and entertainment into your daily messaging on Skype.")
                    .images([
                        builder.CardImage.create(session, "https://skypeblogs.files.wordpress.com/2016/07/bots-hero-image.png")
                            // Here instead of tap to open an url, the image is opened in full view
                            .tap(builder.CardAction.showImage(session, "https://skypeblogs.files.wordpress.com/2016/07/bots-hero-image.png"))
                    ])
                    .buttons([
                        // Define a button with an action. The action label will
                        // be picked up by the choice prompt and handed on to the
                        // next step in the waterfall.
                        builder.CardAction.imBack(session, "skype", "More about Skype")
                    ]),
                // A hero card as previously shown
                new builder.HeroCard(session)
                    .title("Meet the bots")
                    .text("Say hello! Try out a bot and add it to your favorite conversation experiences.")
                    .images([
                        builder.CardImage.create(session, "https://skypeblogs.files.wordpress.com/2016/03/delphi_botsearch.png?w=675&h=450")
                            // Here instead of tap to open an url, the image is opened in full view
                            .tap(builder.CardAction.showImage(session, "https://skypeblogs.files.wordpress.com/2016/03/delphi_botsearch.png?w=675&h=450"))
                    ])
                    .buttons([
                        // Define a button with an action. The action label will
                        // be picked up by the choice prompt and handed on to the
                        // next step in the waterfall.
                        builder.CardAction.imBack(session, "botdirectory", "More about the Bot directory")
                    ])
            ]);

        // Show the carousel, then wait for the respective input
        builder.Prompts.choice(session, msg, "botframework|skype|botdirectory");
    },
    function (session, results) {
        // This is just an example on how to utilise the response of the user
        session.endDialog('You selected to learn more about %s', results.response.entity);
    }
]);

// An action is essentially a card calling a global dialog method
// with respective parameters. So instead of using choice prompts
// or a similar waterfall approach, you can link to separate
// dialogs.
// The dialog action will route the action command to a dialog.
bot.beginDialogAction('News', '/News');

// Create the dialog itself.
bot.dialog('/News', [
    function (session, args) {
        session.endDialog("Loading news from: " + args.data);
    }
]);

// Otherwise an actions is just a normal card of any type that
// features a dialogAction with the respective parameters.
bot.dialog('/Actions', [
    function (session) { 
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // This is the actual hero card. For each card you can add the
                // specific options like title, text and so on.
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Microsoft Bot Framework")
                    .text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
                    .images([
                        builder.CardImage.create(session, "https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default-7.png")
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "News", "https://blog.botframework.com/", "Get news")
                    ])
            ]);

        // Send the message to the user and end the dialog
        session.send(msg);
        session.endDialog();
    }
]);

# bot-framework-examples

A number of sample projects for the Microsoft Bot Framework. All these are node.js based
and work locally against the emulator without any need to create a bot in the Bot Framework
Manager. Of course they can also run them live.

Note that each sub-project is meant as an easy example to showcase one specific aspect of
the bot framework.

If you want to know more about these examples, please check: http://randomdev.tumblr.com/tagged/bots


## Samples

* _bot-sample-cards_: This will show you a simple bot that utlisises cards to send rich information to a user.
Cards provide flexible layouts that might contain images, titles, subtitles, text and action buttons.
* _bot-sample-dialogs_: This will show you a simple bot that utlisises dialogs to guide the user
through the conversation.
* _bot-sample-intentdialogs_: This will show you a simple bot that utlisises intent dialogs to understand
and guide the user through the conversation. IntendDialogs can be called based on matching the input of
the user against regular expressions.
* _bot-sample-prompts_: This will show you a simple bot that interacts with the user via several types
of promts. Promts are messages by bots, which then wait for user interaction and proceed to the next waterfall
step.


## Prerequisites

* Node.js: https://nodejs.org/en/
* MS Bot Framework Channel Emulator: https://docs.botframework.com/en-us/tools/bot-framework-emulator/


## How to run locally

* Clone this repository
* Open a console and change into a specific sub-project
* Install node-modules with "npm install"
* Run sample with "node ./server.js"
* Open the MS Bot Framework Channel Emulator
* Start chatting with the bot
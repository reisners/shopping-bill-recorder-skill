'use strict'

const { google } = require('googleapis');
const alexaSkillKit = require('alexa-skill-kit')
const MessageTemplate = require('alexa-message-builder')

const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];


function shoppingBillRecorderSkill(event, context) {
  // Do something with `event` and use `callback` to reply

  console.log("event="+JSON.stringify(event));

  alexaSkillKit(event, context, message => {

    console.log("message="+JSON.stringify(message));
    console.log("context="+JSON.stringify(context));

    if (message.type === 'LaunchRequest') {
      return new MessageTemplate()
        .addText(`Willkommen zur Belegerfassung. Sage Einkauf bei SHOP am DATUM für BETRAG Euro.`)
        .addRepromptText(`Sage Einkauf bei SHOP am DATUM für BETRAG Euro.`)
        .keepSession()
        .get();
    }

    if (message.type === 'IntentRequest') {
      if (message.intent.name === 'RecordBill') {
        //const accessToken = context.System.user.accessToken;
        const shop = message.intent.slots.SHOP.value;
        const date = message.intent.slots.DATE.value;
        const amount_euros = message.intent.slots.AMOUNT_EUROS.value;
        const amount_cents = message.intent.slots.AMOUNT_CENTS.value;
        const amount = amount_euros + amount_cents/100;
        
        /*
        var request = {
          // The spreadsheet to apply the updates to.
          spreadsheetId: '1vWmEGdj8VS0tfqwSl8WCbIPonpcjMsNKb7H0nWeMAAg',
      
          resource: {
            // A list of updates to apply to the spreadsheet.
            // Requests will be applied in the order they are specified.
            // If any request is not valid, no requests will be applied.
            requests: [],  // TODO: Update placeholder value.
      
            // TODO: Add desired properties to the request body.
          },
      
          auth: authClient,
        };
      
        sheets.spreadsheets.batchUpdate(request, function(err, response) {
          if (err) {
            console.error(err);
            return;
          }
      
          // TODO: Change code below to process the `response` object:
          console.log(JSON.stringify(response, null, 2));
        });
        */
        return "Also: du hast am "+date+" bei "+shop+" "+amount+" Euro ausgegeben.";
      }  
      return "Du hast Intent "+message.intent.name+" aktiviert.";
    }

    return "War etwas?";
  
  });


}
exports.handler = shoppingBillRecorderSkill

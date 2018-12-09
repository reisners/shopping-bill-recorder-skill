'use strict'

const { google } = require('googleapis');
const alexaSkillKit = require('alexa-skill-kit')
const MessageTemplate = require('alexa-message-builder')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const spreadsheetId = '1vWmEGdj8VS0tfqwSl8WCbIPonpcjMsNKb7H0nWeMAAg';
const range = 'Bills!A2:D';

function shoppingBillRecorderSkill(event, context) {
  // Do something with `event` and use `callback` to reply

  console.log("event="+JSON.stringify(event));

  alexaSkillKit(event, context, message => {

    console.log("message="+JSON.stringify(message));

    if (message.type === 'LaunchRequest') {
      if (message.user.accessToken) {
        return new MessageTemplate()
        .addText(`Willkommen zur Belegerfassung. Sage: Einkauf für CATEGORY bei SHOP am DATUM für BETRAG.`)
        .addRepromptText(`Sage: Einkauf für CATEGORY bei SHOP am DATUM für BETRAG.`)
        .keepSession()
        .get();
      } else {
        return new MessageTemplate()
        .addText(`Zur Belegerfassung aktiviere bitte zuerst die Kontoverknüpfung.`)
        .get();
      }
    }

    if (message.type === 'IntentRequest') {
      if (message.intent.name === 'RecordBill') {
        
        const accessToken = message.user.accessToken;
        const shop = extractSlotValue(message.intent.slots.SHOP);
        const date = message.intent.slots.DATE.value;
        const category = extractSlotValue(message.intent.slots.CATEGORY);

        const amount_euros = message.intent.slots.AMOUNT_EUROS.value ? parseInt(message.intent.slots.AMOUNT_EUROS.value) : 0;
        const amount_cents = message.intent.slots.AMOUNT_CENTS.value ? parseInt(message.intent.slots.AMOUNT_CENTS.value) : 0;
        const amount = amount_euros + amount_cents/100.0;

        console.log("amount_euros="+amount_euros+", amount_cents="+amount_cents+", amount="+amount);

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({access_token: accessToken});
      
        return updateSheet(oAuth2Client, date, shop, amount, category);
      }  
      return "Du hast Intent "+message.intent.name+" aktiviert.";
    }

    return "War etwas?";
  
  });
}

async function updateSheet(auth, date, shop, amount, category) {
  return new Promise( (resolve, reject) => {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          [date, shop, amount, category]
        ]
      },
    }, (err, result) => {
      if (err) {
        // Handle error.
        console.log(err);
        reject("Beim Speichern des Einkaufsbelegs ist ein Fehler aufgetreten.");
      } else {
        resolve("Ich habe den Einkaufsbeleg abgespeichert.");
      }
    });  
  });
}

function extractSlotValue(slot) {
  console.log("slot="+JSON.stringify(slot));
  return slot.resolutions.resolutionsPerAuthority[0].values ? slot.resolutions.resolutionsPerAuthority[0].values[0].value.name : slot.value;
}

exports.handler = shoppingBillRecorderSkill

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const bot = require('./bot');
const service = require('./service')
const express = require('express')

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = './token.json';
const CRED_PATH = './credentials.json'
const CHECK_MAIL_INTERVAL = 300000;

const app = express()
const port = process.env.PORT || 3000;
const host = '0.0.0.0'

var messages = [];
var newestDate = 0;
var placeHolderNewestDate = 0;

app.listen(port, host, ()=> console.log(`server is running on port ${port}`))

const startAuth = () => {
    messages = []
    // Load client secrets from a local file.
    fs.readFile(CRED_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), listMessages);
    });
}

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

const listMessages = (auth) => {
    const gmail = google.gmail('v1');
    gmail.users.messages.list({
        auth:auth,
        userId:'me',
        maxResults:10,
        q:`label:inbox`,
    },(err, res) => {
        if(err){
            console.error(err);
        }
        // check if any messages are present
        if(!('messages' in res.data)){
            console.log('no messages to check')
            return
        }

        //console.log(newestMsg)
        console.log('calling print messages')
        printMessages(res.data.messages,auth,true)

        return
    })
}

const printMessages = (data, auth) => {
    var gmail = google.gmail('v1');
    gmail.users.messages.get({
        auth: auth,
        format:'full',
        userId: 'me',
        id: data[0].id
    }, async (err, response) => {
        try {
            let msg = service.createMsg(response)

            if(msg.date.getTime() > newestDate){
              // makes sure we get the newest date out of the group of messages received
              placeHolderNewestDate < msg.date.getTime() ? placeHolderNewestDate = msg.date.getTime() : null
              decodeMessageAndFilter(msg)
            }
       
            data.splice(0,1);
            if(data.length>0) {
              printMessages(data,auth);
            }else if(messages.length > 0){
              console.log('calling sendMessages')
              await sendMessages();
            }

        } catch (error) {
          console.log(error)
        }
        return        
    });
    
}

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

const decodeMessageAndFilter = (data) => {
    var stringToSearch = 'capstone'
    data.message = Buffer.from(data.message, 'base64').toString('utf8')
    var occurences = occurrences(data.message, stringToSearch)
    if(occurences >= 4){ 
      data.occurences = occurences
      messages.push(data)
    }
    return
}

const sendMessages = async () => {
    newestDate = placeHolderNewestDate;
    console.log('length of messages being sent: ' + messages.length)
    for(var i = 0; i < messages.length; i++){
      var status = await bot.sendAlert(messages[i])
      console.log(`Status #${i}: ${status}`)
    }
   
}


setInterval(startAuth,CHECK_MAIL_INTERVAL) 
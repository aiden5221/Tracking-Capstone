const { Client, Intents, GatewayIntentBits, codeBlock, bold } = require('discord.js');
const { send } = require('express/lib/response');
const { listOfGifs } = require('./gifs')
require('dotenv').config({path:'../.env'})

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageTyping, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildEmojisAndStickers
] });

const TOKEN = process.env.DISCORD_TOKEN;
var channel;

client.on("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
})

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false; 
    var msg = message.content.split(' ')
    if(msg[0].toLowerCase() == '$newsroom'){
        channel = await client.channels.fetch(message.channelId)
        isOn = true;
    }
    if(msg[0].toLowerCase() == '$alert'){
        msg.shift()
        sendAlert(msg.join(' '))
    }

    console.log(`Message from ${message.author.username}: ${message.content}`);
});

const queryRandomGif = () => {
    const randomInt = Math.floor(Math.random() * listOfGifs.length -1) + 1;
    return listOfGifs[randomInt]
}

const sendAlert = async (message) => {
    var status = "channel isn't initialized or bot isn't turned on!"
    
    var formattedDate = new Date(message.date).toLocaleString(undefined, {
        day:    'numeric',
        month:  'numeric',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
      })
    var formattedMsg = `From: ${message.sentFrom}\nTime: ${formattedDate}\nOccurences: ${message.occurences}\nSnippet: ${message.snippet}\n`

    if(channel != null && channel != 'undefined' && isOn){
        
        channel.send({
            embeds:[{
                image:{
                    url: `${queryRandomGif()}`,
                },
            }],  
            content: bold(":fire::fire:ALERT RECEIVED:fire::fire:\n"),
        })
        .then(channel.send({
            content: codeBlock(formattedMsg)
        }))
        .catch((err)=> console.log(err))

        await new Promise(resolve => setTimeout(resolve, 5000));

        return "SENT ALERT"
    }

    return status
}

client.login(TOKEN);

module.exports = { sendAlert }
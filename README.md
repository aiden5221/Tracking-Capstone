# Capstone Tracker Discord Bot

The capstone tracker discord bot is a bot designed using Discord.js, Express, and Google Apis to monitor a user's gmail inbox for specific keywords. If the max number of allowed occurrences in an email for the keywords specified is hit, an alert is sent to the specified discord channel.

This bot was used for determining when the engineering capstone projects were released by the capstone coordinator to be assigned to groups. This was crucial as projects were fcfs.

## Usage
1. Open index.html to create a credentials.js in the local directory by following the prompt via Google signin.
2. Create a bot under a discord account, allowing permissions to create & read messages via discord dev portal and gather token.js file containing bot credentials.
3. Run the following command to start the bot and Gmail inbox monitoring
```javascript
npm start
```

## Bot Commands

The bot will deliver alerts to the channel that this command is entered in.
```
$newsroom
```
Used to run a test alert to ensure that the bot is running correctly, enter input to have the bot use for the alert.
```
$alert {input}
```


## License
[MIT](https://choosealicense.com/licenses/mit/)

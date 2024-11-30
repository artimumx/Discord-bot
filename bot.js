require('dotenv').config();
const { Client } = require('discord.js');
const {logMessageUpdate, logMessageDelete, logRoles, logChannels, logPunishments, logMemberJoin, logMemberLeave, logThreads, logVoice} = require("./logger.js");
const {createManagementChannel, createLogCategory, buttonsInteractions, manualInit} = require("./bot-management.js")
const { loadCommands } = require("./load-commands.js")
const { edenException } = require("./exceptions.js")

// intents of the bot

const client = new Client({
  intents: [
    "Guilds",
    "GuildModeration",
    "GuildEmojisAndStickers",
    "GuildPresences",
    "GuildIntegrations",
    "GuildMessages",
    "MessageContent",
    "GuildMembers",
    "GuildMessageReactions",
    "GuildVoiceStates"
  ]
});



// load commands
loadCommands(client)

// initial function

client.on("ready",(c)=>{
  console.log(`✅ ${c.user.username} is online`)
})
// create a channel for bot managing

createManagementChannel(client)
createLogCategory(client)
buttonsInteractions(client)
manualInit(client)
// log code 

logMessageUpdate(client)
logMessageDelete(client)
logRoles(client)
logChannels(client)
logPunishments(client)
logMemberJoin(client)
logMemberLeave(client)
logThreads(client)
logVoice(client)

// exceptions

edenException(client)

// log in the bot

client.login(process.env.TOKEN);

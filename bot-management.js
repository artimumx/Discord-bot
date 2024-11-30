const fs = require("fs")
const path = require("path")
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');

const loggingStatusFilePath = path.join(__dirname, 'loggingStatus.json');
let loggingStatus = {};

// load and save status of track
function loadStatus(){
    try {
        const data = fs.readFileSync(loggingStatusFilePath);
        loggingStatus = JSON.parse(data);
      } catch (error) {
        console.error('Could not read logging status file:', error);
      }
      
} loadStatus()

function saveLoggingStatus() {
    fs.writeFileSync(loggingStatusFilePath, JSON.stringify(loggingStatus, null, 2));
}

// create channels
function createManagementChannel(client){

    client.on('guildCreate', async (guild) => {
        try {
          
          const channelName = 'legacy-bot';
          let channel = guild.channels.cache.find(ch => ch.name === channelName);
      
          if (!channel) {
            // Create the management channel and restrict visibility to admins
            channel = await guild.channels.create({
              name: channelName,
              type: 0, // Text channel
              topic: "This is the management channel for the bot",
              permissionOverwrites: [
                {
                  id: guild.id, // @everyone role
                  deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access to view the channel
                },
                {
                  id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow admins to view and send messages
                }
              ]
            });
      
            console.log(`Created a new admin-only channel: ${channel.name} in ${guild.name}`);
          }
      
          // Create buttons for enabling and disabling logging
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('enable-log')
                .setLabel('Enable Logs')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('disable-log')
                .setLabel('Disable Logs')
                .setStyle(ButtonStyle.Danger)
            );
      
          // Send the message with buttons
          await channel.send({
            content: "Use the buttons below to manage bot features:",
            components: [row]
          });
      
        } catch (error) {
          console.error('Error creating channel or sending message:', error);
        }
      });
}
function createLogCategory(client){

    client.on('guildCreate', async (guild) => {
        try {
          const categoryName = 'Legacy Log';
          const channelNames = ['messages', 'members', 'roles', 'channels', 'punishments', 'threads','voice'];
      
          // Check if the category already exists
          let logCategory = guild.channels.cache.find(ch => ch.name === categoryName && ch.type === 4); // Type 4 is category
          if (!logCategory) {
            // Create the category
            logCategory = await guild.channels.create({
              name: categoryName,
              type: 4, // Category type
              permissionOverwrites: [
                {
                  id: guild.id, // @everyone role
                  deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access to view the category
                },
                {
                  id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                  allow: [PermissionsBitField.Flags.ViewChannel], // Allow admins to view the category
                }
              ]
            });
      
            console.log(`Created logging category: ${logCategory.name} in ${guild.name}`);
          }
      
          // Create the logging channels if they don't already exist
          const createdChannels = {};
          for (const channelName of channelNames) {
            let logChannel = guild.channels.cache.find(ch => ch.name === channelName);
            if (!logChannel) {
              logChannel = await guild.channels.create({
                name: channelName,
                type: 0, // Text channel
                parent: logCategory.id, // Place the channel under the logging category
                permissionOverwrites: [
                  {
                    id: guild.id, // @everyone role
                    deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access
                  },
                  {
                    id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                    allow: [PermissionsBitField.Flags.ViewChannel], // Allow admins to view the channel
                  }
                ]
              });
      
              console.log(`Created logging channel: ${logChannel.name} in ${guild.name}`);
            }
            createdChannels[channelName] = logChannel.id;
          }
      
          // Save the log channel IDs in loggingStatus for the current server
          loggingStatus[guild.id] = {
            messageLog: createdChannels['messages'],
            memberLog: createdChannels['members'],
            roleLog: createdChannels['roles'],
            channelLog: createdChannels['channels'],
            punishmentsLog: createdChannels['punishments'],
            threadsLog: createdChannels['threads'],
            voiceLog: createdChannels['voice'],
            loggingEnabled: true // Set default logging to enabled
          };
      
          // Save to JSON file
          saveLoggingStatus();
      
          console.log(`Logging setup completed in ${guild.name}`);
        } catch (error) {
          console.error('Error creating logging setup:', error);
        }
      });
      
}
// manage interactions
function buttonsInteractions(client){

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
      
        const { customId, guild } = interaction;
      
        if (customId === 'enable-log') {
          loggingStatus[guild.id].loggingEnabled = true;
          await interaction.reply({ content: "Logging has been enabled for this server.", ephemeral: true });
          console.log(`Logging enabled in ${guild.name}`);
        } else if (customId === 'disable-log') {
          loggingStatus[guild.id].loggingEnabled = false;
          await interaction.reply({ content: "Logging has been disabled for this server.", ephemeral: true });
          console.log(`Logging disabled in ${guild.name}`);
        }
      
        // Write updated logging status to the JSON file
        fs.writeFileSync(loggingStatusFilePath, JSON.stringify(loggingStatus, null, 2));
      });
      
}

function manualInit(client){

  client.on('messageCreate', async (message) => {
    // Check if the message is --init and the sender has admin permissions
    if (message.content === '--init' && message.author.id == "145069674680287232") {
      const guild = message.guild;
  
      try {
        const categoryName = 'Legacy Log';
        const channelNames = ['messages', 'members', 'roles', 'channels', 'punishments', 'threads', 'voice'];
  
        // Check if the category already exists
        let logCategory = guild.channels.cache.find(ch => ch.name === categoryName && ch.type === 4); // Type 4 is category
        if (!logCategory) {
          // Create the category
          logCategory = await guild.channels.create({
            name: categoryName,
            type: 4, // Category type
            permissionOverwrites: [
              {
                id: guild.id, // @everyone role
                deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access to view the category
              },
              {
                id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                allow: [PermissionsBitField.Flags.ViewChannel], // Allow admins to view the category
              }
            ]
          });
  
          console.log(`Created logging category: ${logCategory.name} in ${guild.name}`);
        }
  
        // Create the logging channels if they don't already exist
        const createdChannels = {};
        for (const channelName of channelNames) {
          let logChannel = guild.channels.cache.find(ch => ch.name === channelName);
          if (!logChannel) {
            logChannel = await guild.channels.create({
              name: channelName,
              type: 0, // Text channel
              parent: logCategory.id, // Place the channel under the logging category
              permissionOverwrites: [
                {
                  id: guild.id, // @everyone role
                  deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access
                },
                {
                  id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                  allow: [PermissionsBitField.Flags.ViewChannel], // Allow admins to view the channel
                }
              ]
            });
  
            console.log(`Created logging channel: ${logChannel.name} in ${guild.name}`);
          }
          createdChannels[channelName] = logChannel.id;
        }
  
        // Save the log channel IDs in loggingStatus for the current server
        loggingStatus[guild.id] = {
          messageLog: createdChannels['messages'],
          memberLog: createdChannels['members'],
          roleLog: createdChannels['roles'],
          channelLog: createdChannels['channels'],
          punishmentsLog: createdChannels['punishments'],
          threadsLog: createdChannels['threads'],
          voiceLog: createdChannels['voice'],
          loggingEnabled: true // Set default logging to enabled
        };
  
        // Save to JSON file
        saveLoggingStatus();
  
        console.log(`Logging setup completed in ${guild.name}`);
        message.channel.send('Logging setup has been initialized.');
      } catch (error) {
        console.error('Error creating logging setup:', error);
        message.channel.send('An error occurred while setting up logging.');
      }
    }
  });
  
  client.on('messageCreate', async (message) => {
    // Check if the message is --init-management and the sender has admin permissions
    if (message.content === '--init' && message.author.id == "145069674680287232") {
      const guild = message.guild;
  
      try {
        const channelName = 'legacy-bot';
        let channel = guild.channels.cache.find(ch => ch.name === channelName);
  
        if (!channel) {
          // Create the management channel and restrict visibility to admins
          channel = await guild.channels.create({
            name: channelName,
            type: 0, // Text channel
            topic: "This is the management channel for the bot",
            permissionOverwrites: [
              {
                id: guild.id, // @everyone role
                deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone access to view the channel
              },
              {
                id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator))?.id, // Grant admins access
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow admins to view and send messages
              }
            ]
          });
  
          console.log(`Created a new admin-only channel: ${channel.name} in ${guild.name}`);
        }
  
        // Create buttons for enabling and disabling logging
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('enable-log')
              .setLabel('Enable Logs')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('disable-log')
              .setLabel('Disable Logs')
              .setStyle(ButtonStyle.Danger)
          );
  
        // Send the message with buttons
        await channel.send({
          content: "Use the buttons below to manage bot features:",
          components: [row]
        });
  
        message.channel.send('Management channel initialized.');
      } catch (error) {
        console.error('Error creating channel or sending message:', error);
        message.channel.send('An error occurred while setting up the management channel.');
      }
    }
  });
  
}

module.exports = { createManagementChannel, createLogCategory, buttonsInteractions, manualInit, loggingStatus }
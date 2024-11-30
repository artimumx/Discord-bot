const { EmbedBuilder } = require("discord.js")
const {loggingStatus} = require("./bot-management")

// logging 

function logMessageUpdate(client){

  client.on('messageUpdate', (oldMessage, newMessage) => {

    if (!loggingStatus[oldMessage.guild.id].loggingEnabled) return; // Check logging state
    if (newMessage.author.bot) return;
    
    const logChannelId = loggingStatus[oldMessage.guild.id]?.messageLog;
    if (!logChannelId) return; // Exit if no log channel is found for this server
  
  
    const userMention = newMessage.author.toString();
  
  
    const embed = new EmbedBuilder()
        .setColor('#b8ff96') 
        .setTitle('Message Edited')
        .setDescription(`${userMention} edited their message in ${newMessage.channel}.`)
        .addFields(
          { name: 'Old Message', value: `\`\`\`${oldMessage.content}\`\`\`` },
          { name: 'New Message', value: `\`\`\`${newMessage.content}\`\`\`` }
        )
        .setTimestamp();
    
  
      const logChannel = client.channels.cache.get(logChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [embed] });
      }
  });

}
function logMessageDelete(client){

  client.on('messageDelete', (deletedMessage) => {

    if (!loggingStatus[deletedMessage.guild.id]?.loggingEnabled) return;
    if (deletedMessage.author.bot) return;
  
    const logChannelId = loggingStatus[deletedMessage.guild.id]?.messageLog;
    if (!logChannelId) return;
  
    if (!deletedMessage.author || deletedMessage.author.bot) return;
  
  
    const userMention = deletedMessage.author.toString();
  
  
    const embed = new EmbedBuilder()
          .setColor('#f54242') 
          .setTitle('Message Deleted')
          .setDescription(`${userMention} deleted their message in ${deletedMessage.channel}.`)
          .addFields({ name: 'Deleted Message', value: `\`\`\`${deletedMessage.content}\`\`\`` || '*Message content not available*' });
  
      const logChannel = client.channels.cache.get(logChannelId);
      if (logChannel) {
          logChannel.send({ embeds: [embed] });
      }
  });

}
function logRoles(client){

  client.on('guildAuditLogEntryCreate', async (entry,g) => {

    if (!loggingStatus[g.id]?.loggingEnabled) return;
    
    const logChannelId = loggingStatus[g.id]?.roleLog;
    if (!logChannelId) return;
  
  
    if (entry.action === 30 || entry.action === 31 || entry.action === 32) {
        let { executor, target, changes } = entry;
    
  
        const executorMention = executor.toString();
        let targetMention = target ? target.toString() : 'Unknown Target';
  
        let actionType;
        if (entry.action === 30) {
          actionType = 'created';
          changes = ""
        } else if (entry.action === 31) {
          actionType = 'updated';
        } else {
          actionType = 'deleted';
          targetMention = changes[0].old
          changes = ""
        }
    
  
        const embed = new EmbedBuilder()
          .setColor('#ff6e90') 
          .setTitle(`Role ${actionType}`)
          .setDescription(`${executorMention} ${actionType} a role \"${targetMention}\".`)
          .addFields(
            { name: 'Changes', value: formatChanges(changes) || '\`\`\`No changes recorded\`\`\`' }
          );
    
  
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
          logChannel.send({ embeds: [embed] })
            .catch(error => {
              console.error('Error Sending Embed:', error);
    
  
              if (error.code === 429) {
                console.log('Rate limited. Waiting for retry...');
  
                setTimeout(() => {
                  logChannel.send({ embeds: [embed] })
                    .catch(retryError => console.error('Error Retry Sending Embed:', retryError));
                }, 5000); 
              }
            });
        } else {
          console.error('Log Channel not found');
        }
      }
    });

}
function logChannels(client){

  client.on('guildAuditLogEntryCreate', async (entry,g) => {

    if (!loggingStatus[g.id]?.loggingEnabled) return;
  
    const logChannelId = loggingStatus[g.id]?.channelLog;
    if (!logChannelId) return;
 

    if (entry.action === 10 || entry.action === 11 || entry.action === 12) {
      let { executor, target, changes } = entry;
  

      const executorMention = executor.toString();
      let targetMention;
  

      let actionType;
      if (entry.action === 10) {
        actionType = 'created';
        targetMention = target?.toString() || 'Unknown Target';
        changes = ""
      } else if (entry.action === 11) {
        actionType = 'updated';
        targetMention = target?.toString() || 'Unknown Target';
      } else {
        actionType = 'deleted';
        targetMention = target?.name || 'Unknown Target';
        changes = ""
      }
  

      const embed = new EmbedBuilder()
        .setColor('#ffc56e') 
        .setTitle(`Channel ${actionType}`)
        .setDescription(`${executorMention} ${actionType} a channel \"${targetMention}\".`)
        .addFields(
          { name: 'Changes', value: formatChanges(changes) || '\`\`\`No changes recorded\`\`\`' }
        );
  

      const logChannel = client.channels.cache.get(logChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [embed] })
          .catch(error => {
            console.error('Error Sending Embed:', error);
  

            if (error.code === 429) {
              console.log('Rate limited. Waiting for retry...');

              
              setTimeout(() => {
                logChannel.send({ embeds: [embed] })
                  .catch(retryError => console.error('Error Retry Sending Embed:', retryError));
              }, 5000);
            }
          });
      } else {
        console.error('Log Channel not found');
      }
    }
  });

}
function logPunishments(client){

  client.on('guildAuditLogEntryCreate', async (entry,g) => {

    if (!loggingStatus[g.id]?.loggingEnabled) return;
  
    const logChannelId = loggingStatus[g.id]?.punishmentsLog;
    if (!logChannelId) return;
  

    if (entry.action === 22 || entry.action === 20 || (entry.action >= 24 && entry.action <= 27) && entry.action !== 25) {
      const { executor, target, reason, changes } = entry;
      const executorMention = executor.toString();
      const targetMention = target.toString();
  
      let state;
      let actionType;
      if (entry.action === 22) {
        actionType = 'banned';
      } else if (entry.action === 20) {
        actionType = 'kicked';
      } else {

        if(!changes[0].old){
          actionType = 'timed out';
          let timeoutEnd = new Date(`${changes[0].new}`)
          let currentTime = new Date()
          let timeDifference = timeoutEnd - currentTime;
  
          let seconds = Math.floor((timeDifference / 1000) % 60);
          let minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
          let hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
          let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          state = `Timeout ends in:\n${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
        }
        else{
          actionType = 'untimed out';
          let timeoutEnd = new Date(`${changes[0].old}`)
          let currentTime = new Date()
          let timeDifference = timeoutEnd - currentTime;
  
          let seconds = Math.floor((timeDifference / 1000) % 60);
          let minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
          let hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
          let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          state = `The remaining timeout should have ended in:\n${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`

        }
      }
  
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(`Member ${actionType}`)
        .setDescription(`${executorMention} ${actionType} ${targetMention}.`)
        .setThumbnail(`https://cdn.discordapp.com/avatars/${entry.target.id}/${entry.target.avatar}.png`)
        .addFields({ name: 'Reason', value: `\`\`\`${reason ?? 'No reason provided'}\`\`\`` })
        .addFields({ name: 'Time', value: `\`\`\`${state}\`\`\`` || '\`\`\`No time provided\`\`\`' });

      if(!state){
        embed.data.fields.pop()
      }
      const logChannel = client.channels.cache.get(logChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [embed] })
          .catch(error => {
            console.error('Error Sending Embed:', error);
  

            if (error.code === 429) {
              console.log('Rate limited. Waiting for retry...');

              setTimeout(() => {
                logChannel.send({ embeds: [embed] })
                  .catch(retryError => console.error('Error Retry Sending Embed:', retryError));
              }, 5000);
            }
          });
      } else {
        console.error('Log Channel not found');
      }
    }
  });

}
function logMemberJoin(client){

  client.on('guildMemberAdd', (member) => {
    if (!loggingStatus[member.guild.id]?.loggingEnabled) return;

    const logChannelId = loggingStatus[member.guild.id]?.memberLog;
    if (!logChannelId) return;
  

    const channel = member.guild.channels.cache.get(logChannelId);

    if (channel) {
        const embed = new EmbedBuilder()
            .setColor('#03fc98')
            .setTitle('Member Joined')
            .setDescription(`${member} has joined the server.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
});

}
function logMemberLeave(client){

  client.on('guildMemberRemove', (member) => {
    if (!loggingStatus[member.guild.id]?.loggingEnabled) return;
  
    const logChannelId = loggingStatus[member.guild.id]?.memberLog;
    if (!logChannelId) return;
  
  
      const channel = member.guild.channels.cache.get(logChannelId);
  
      if (channel) {
          const embed = new EmbedBuilder()
              .setColor('#fc7303')
              .setTitle('Member Left')
              .setDescription(`${member.user.tag} has left the server.`)
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp();
  
          channel.send({ embeds: [embed] });
      }
  });
  
}
function logThreads(client){

  client.on('threadCreate', (thread) => {
    if (!loggingStatus[thread.guild.id]?.loggingEnabled) return;
  
    const logChannelId = loggingStatus[thread.guild.id]?.threadsLog;
    if (!logChannelId) return;
  
      const channel = thread.guild.channels.cache.get(logChannelId);

      if (channel) {
          const embed = new EmbedBuilder()
              .setColor('#03fc98')
              .setTitle('New Thread Was Created')
              .setDescription(`<#${thread.id}> was created in <#${thread.parentId}> by <@${thread.ownerId}>`)
              .addFields({ name: 'Thread name', value: `\`\`\`${thread.name}\`\`\`` })
              .setTimestamp();
  
         channel.send({ embeds: [embed] });
      }
  });

  client.on('threadDelete', (thread) => {
    if (!loggingStatus[thread.guild.id]?.loggingEnabled) return;
    const logChannelId = loggingStatus[thread.guild.id]?.threadsLog;
    if (!logChannelId) return;
  
      const channel = thread.guild.channels.cache.get(logChannelId);

      if (channel) {
          const embed = new EmbedBuilder()
              .setColor('#fc7303')
              .setTitle('A Thread Was Deleted')
              .setDescription(`<#${thread.id}> in <#${thread.parentId}> was Delete, the owner was <@${thread.ownerId}>`)
              .addFields({ name: 'Thread name', value: `\`\`\`${thread.name}\`\`\`` })
              .setTimestamp();
  
         channel.send({ embeds: [embed] });
      }
  });


}
function logVoice(client){
  
  client.on('voiceStateUpdate', (oldState, newState) => {

    if (!loggingStatus[oldState.guild.id]?.loggingEnabled) return;
    const logChannelId = loggingStatus[oldState.guild.id]?.voiceLog;
    if (!logChannelId) return;

    const channel = newState.guild.channels.cache.get(logChannelId);
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    const userName = newState.guild.members.cache.get(newState.id).user.username; // This gets the user's name from the GuildMember

    // Check if the user joins a voice channel
    if (!oldChannel && newChannel) {
        const embed = new EmbedBuilder()
            .setColor('#03fc98')
            .setTitle(`Member Joined A Voice Channel`)
            .setDescription(`<@${newState.id}> Joined <#${newChannel.id}>`)
            .addFields({ name: 'Username', value: `\`\`\`${userName}\`\`\`` })
            .setTimestamp();
  
        channel.send({ embeds: [embed] });
    }
    // Check if the user leaves a voice channel
    else if (oldChannel && !newChannel) {
        const embed = new EmbedBuilder()
            .setColor('#fc7303')
            .setTitle(`Member Left A Voice Channel`)
            .setDescription(`<@${oldState.id}> Left <#${oldChannel.id}>`)
            .addFields({ name: 'Username', value: `\`\`\`${userName}\`\`\`` })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
    // Check if the user switches from one voice channel to another
    else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        const embed = new EmbedBuilder()
            .setColor('#03a9fc')
            .setTitle(`Member Switched Voice Channels`)
            .setDescription(`<@${newState.id}> Moved from <#${oldChannel.id}> to <#${newChannel.id}>`)
            .addFields({ name: 'Username', value: `\`\`\`${userName}\`\`\`` })
            .setTimestamp();
        
        channel.send({ embeds: [embed] });
    }
});

}
// formating 

function formatChanges(changes) {
  if (!changes || !changes.length) return '';

  return changes.map(change => {

    if (change.key === 'permission_overwrites') {
      const oldPermissions = formatPermissionOverwrites(change.old);
      const newPermissions = formatPermissionOverwrites(change.new);
      return `Permission Overwrites:\nOld: \`${oldPermissions}\`\nNew: \`${newPermissions}\``;
    }


    return `**${change.key}**: \`\`\`${formatValue(change.old)}\`\`\`to:⬇️ \`\`\`${formatValue(change.new)}\`\`\``;
  }).join('\n');
}
function formatPermissionOverwrites(overwrites) {
  if (!overwrites || !Array.isArray(overwrites)) return 'undefined';

  return overwrites.map(overwrite => {
    return `{ id: ${overwrite.id}, type: ${overwrite.type}, allow: ${overwrite.allow}, deny: ${overwrite.deny} }`;
  }).join(', ');
}
function formatValue(value) {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value;
}

module.exports = { logMessageUpdate, logMessageDelete, logRoles, logChannels, logPunishments, logMemberJoin, logMemberLeave, logThreads, logVoice }
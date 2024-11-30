const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a certain number of messages.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to delete.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('contain')
                .setDescription('Filter messages to delete based on content.')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('bots')
                .setDescription('Delete only bot messages.')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('embeds')
                .setDescription('Delete only messages with embeds.')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Delete messages only from a specific user.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        try {
            const amount = interaction.options.getInteger('amount');
            const containFilter = interaction.options.getString('contain');
            const deleteBots = interaction.options.getBoolean('bots');
            const deleteEmbeds = interaction.options.getBoolean('embeds');
            const targetUser = interaction.options.getUser('user');

            if (isNaN(amount) || amount <= 0) {
                return interaction.reply('Please provide a valid positive number for the amount of messages to delete.');
            }

            let messages;
            if (deleteBots) {
                messages = await interaction.channel.messages.fetch({ limit: amount});
                messages = messages.filter(message => message.author.bot);
            } else {
                messages = await interaction.channel.messages.fetch({ limit: amount});
                if (containFilter) {
                    messages = messages.filter(message => message.content.includes(containFilter));
                }
                if (deleteEmbeds) {
                    messages = messages.filter(message => message.embeds.length > 0);
                }
                if (targetUser) {
                    messages = messages.filter(message => message.author.id === targetUser.id);
                }
            }

            await interaction.reply(`Attempting to delete ${messages.size} messages...`);
            await interaction.channel.bulkDelete(messages);

            // Ensure you acknowledge only once
            return interaction.editReply(`Successfully deleted ${messages.size} messages.`);
        } catch (error) {
            console.error('Error deleting messages:', error);
            return interaction.editReply('An error occurred while trying to delete messages.');
        }
    },
};

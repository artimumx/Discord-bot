const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the specified user or yourself.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to get information about')),
	async execute(interaction) {
        // Get the target user from the interaction options, or default to the user who ran the command
        const targetUser = interaction.options.getUser('target') || interaction.user;
		const member = interaction.guild.members.cache.get(targetUser.id);

		// Create an embed with the desired information
		const embed = {
			color: member.displayColor,
			title: `User Information for ${targetUser.username}`,
			thumbnail: {
				url: targetUser.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: 'Roles',
					value: member.roles.cache.map(role => `<@&${role.id}>`).join(', ') || 'No roles',
				},
				{
					name: 'Joined Server On',
					value: member.joinedAt.toISOString().split('T')[0],
				},
			],
		};

		await interaction.reply({ embeds: [embed] });
	},
};

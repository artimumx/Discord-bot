const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Assigns a role to the specified user.')
		.addUserOption(option => 
			option.setName('target')
				.setDescription('The user to verify')
				.setRequired(true)),
	async execute(interaction) {
		// Check if the user has the ADMINISTRATOR permission
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
			return;
		}

		// Get the target user
		const targetUser = interaction.options.getUser('target');
		const targetMember = interaction.guild.members.cache.get(targetUser.id);
		const roleId = '1200797433458855988';  // Replace with your role ID

		try {
			if (!targetMember) {
				await interaction.reply({ content: `User ${targetUser.tag} not found in the server.`, ephemeral: true });
				return;
			}

			// Assign the role
			await targetMember.roles.add(roleId);
			await interaction.reply({ content: `Verified and assigned the role to ${targetUser.tag}.`, ephemeral: true });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while verifying the user.', ephemeral: true });
		}
	},
};

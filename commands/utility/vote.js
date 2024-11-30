const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Start a vote')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('The question for the vote')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('emoji1')
				.setDescription('The first emoji for voting')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('emoji2')
				.setDescription('The second emoji for voting')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('emoji3')
				.setDescription('An optional third emoji for voting')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('emoji4')
				.setDescription('An optional fourth emoji for voting')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('emoji5')
				.setDescription('An optional fifth emoji for voting')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('emoji6')
				.setDescription('An optional sixth emoji for voting')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('emoji7')
				.setDescription('An optional seventh emoji for voting')
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName('emoji8')
				.setDescription('An optional eighth emoji for voting')
				.setRequired(false)
		)
        .addAttachmentOption(option =>
            option.setName("attachment1")
            .setDescription("attachments uploading here")
            .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName("attachment2")
                .setDescription("attachments uploading here")
                .setRequired(false)
                )
                ,
            
	async execute(interaction) {
		try{
					// Get options from the user's command
		const question = interaction.options.getString('question');
		const emoji1 = interaction.options.getString('emoji1');
		const emoji2 = interaction.options.getString('emoji2');
		const emoji3 = interaction.options.getString('emoji3');
		const emoji4 = interaction.options.getString('emoji4');
		const emoji5 = interaction.options.getString('emoji5');
		const emoji6 = interaction.options.getString('emoji6');
		const emoji7 = interaction.options.getString('emoji7');
		const emoji8 = interaction.options.getString('emoji8');
        const attachment1 = interaction.options.getAttachment("attachment1")
        const attachment2 = interaction.options.getAttachment("attachment2")


		// Send the vote message
		let content = `**Vote**: ${question}`;
        let Done = "DONE ! ! ! !"

        if(attachment1){content += `\n${attachment1.url}`}
        if(attachment2){content += `\n${attachment2.url}`}


		const voteMessage = await interaction.channel.send({
			content,
		});

		await voteMessage.react(emoji1);
		await voteMessage.react(emoji2);
		if (emoji3) await voteMessage.react(emoji3);
		if (emoji4) await voteMessage.react(emoji4);
		if (emoji5) await voteMessage.react(emoji5);
		if (emoji6) await voteMessage.react(emoji6);
		if (emoji7) await voteMessage.react(emoji7);
		if (emoji8) await voteMessage.react(emoji8);


        await interaction.reply({
            content: Done,
            ephemeral: true,
        });

		

		}catch(error){
			console.log(error)
		}
		
	},
};



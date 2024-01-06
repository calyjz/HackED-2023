const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('@wozardlozard/discord.js');

exports.handleButton = async function(interaction, message, client) {
    var embed = message.embeds[0];
    var guild = client.guilds.cache.find(x => x.id == interaction.guildId);

    if (embed.fields?.length > 0 && embed.fields[1] && embed.fields[2]) { // [1]: message link, [2]: author id
        var messageId = embed.fields[1].value.split("/")[embed.fields[1].value.split("/").length - 1];
        var channelId = embed.fields[1].value.split("/")[embed.fields[1].value.split("/").length - 2];
        var authorId = embed.fields[2].value.slice(3, -1);

        switch (interaction.customId) {
            case "delete":
                var channel = guild.channels.cache.find(x => x.id == channelId);
                if (!channel) return;

                try {
                    var messages = await channel.messages.fetch({ limit: 100, cache: false });
                } catch {
                    return;
                }

                var existing = messages.find(x => x.id == messageId);
                if (!existing) return;

                try {
                    await existing.delete();
                    interaction.reply({ content: "The message was successfully deleted.", ephemeral: true });

                    var rows = updateComponents(message.components, [1, 0]);

                    message.edit({ embeds: [embed], components: rows });
                } catch {
                    interaction.reply({ content: "The message could not be deleted.", ephemeral: true });
                }

                break;

            case "timeout":
                var member = await guild.members.fetch({ user: authorId, cache: false });
                if (!member) return;

                var modal = new ModalBuilder()
                    .setCustomId("timeout-modal")
                    .setTitle("Set timeout duration")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId("timeout-input")
                                .setRequired(true)
                                .setLabel("Timeout duration (60s, 5m, 10m, 1h, 1d, 1w)")
                                .setMinLength(2)
                                .setMaxLength(3)
                                .setStyle(TextInputStyle.Short)
                        ),
                    );

                await interaction.showModal(modal);

                var filter = interaction => interaction.customId == "timeout-modal";
                var collected = await interaction.awaitModalSubmit({ filter: filter, time: 90000 });

                var duration = collected?.fields?.getTextInputValue("timeout-input").toLowerCase();
                if (!duration) return;

                var durations = {
                    "60s": 60 * 1000,
                    "5m": 5 * 60 * 1000,
                    "10m": 10 * 60 * 1000,
                    "1h": 3600 * 1000,
                    "1d": 86400 * 1000,
                    "1w": 604800 * 1000,
                };

                try {
                    await member.timeout(durations[duration]);
                    collected.reply({ content: "The member was successfully timed out.", ephemeral: true });

                    var rows = updateComponents(message.components, [1, 1]);

                    message.edit({ embeds: [embed], components });
                } catch {
                    collected.reply({ content: "The member could not be timed out.", ephemeral: true });
                }

                break;
        }
    }
}


function updateComponents(components, toDisable) {
    var i, j;
    var rows = [];

    for (i = 0; i < components.length; i++) {
        rows.push(new ActionRowBuilder());

        for (j = 0; j < components[i].components.length; j++) {
            if (toDisable[0] == i && toDisable[1] == j) {
                rows[i].addComponents(
                    new ButtonBuilder().setCustomId(components[i].components[j].customId).setEmoji(components[i].components[j].emoji).setLabel(components[i].components[j].label).setStyle(ButtonStyle.Success).setDisabled(true),
                );
            } else {
                rows[i].addComponents(
                    new ButtonBuilder().setCustomId(components[i].components[j].customId).setEmoji(components[i].components[j].emoji).setLabel(components[i].components[j].label).setStyle(components[i].components[j].style).setDisabled(components[i].components[j].disabled),
                );
            }
        }
    }

    return rows;
}
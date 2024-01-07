const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('@wozardlozard/discord.js');
const { OpenAI } = require('openai');
const process = require('node:process');

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});

const { } = require('./initial-message-scan.js');

exports.detailedAnalysis = async function (message, field, overlap, interaction) {
    var content = field.value;
    var length = content.length;
    var responses = [];
    var embed = EmbedBuilder.from(message.embeds[0]);

    var separation = Math.floor(length / 3);
    if (separation < overlap) {
        separation = length;
    }

    if (length < separation || length < 20) {
        await interaction.reply({ content: "The flagged message is too short for a detailed analysis.", ephemeral: true });
        return null;
    }

    var rows = updateComponents(message.components, [0, 0]);
    await message.edit({ embeds: [embed], components: rows });

    await interaction.reply({ content: "The detailed analysis is running. Please wait...", ephemeral: true });

    responses = await splitSmall(content, overlap);
    responses = responses.slice(0, 20);

    var violations = {
        "hate": "Hate speech",
        "hate/threatening": "Hate speech with threat of violence",
        "harassment": "Harassment",
        "harassment/threatening": "Harassment with threat of violence",
        "self-harm": "Promotion of self-harm",
        "self-harm/intent": "Intent of self-harm",
        "self-harm/instructions": "Instructions of self-harm",
        "sexual": "Sexually explicit",
        "sexual/minors": "Sexually explicit",
        "violence": "Violence",
        "violence/graphic": "Graphic violence",
    }

    var fields = [];
    var k;

    let fieldString = "";
    for (k = 0; k < responses.length; k++) {
        fields.push({ name: `Flagged phrase – ${responses[k].first} to ${responses[k].last}`, value: responses[k].split + "\n\n" + ((responses[k].result.flagged) ? "• " + Object.entries(responses[k].result.categories).filter(x => x[1]).map(x => violations[x[0]] + ` (${(responses[k].result.category_scores[x[0]] * 100).toFixed(2)}% confidence)`).join("\n• ") : "Not flagged") });
    }

    /*var embed = new EmbedBuilder()
        .setTitle("Message Flagged")
        .setColor("Blurple")
        .addFields(fields);

    var channel = message.guild.channels.cache.find(x => x.id == process.env.NOTIFCHANNEL);

    if (channel) {
        channel.send({ embeds: [embed] });
    }*/

    embed = embed.addFields(fields);

    return embed;
}


async function splitSmall(value, overlap) {
    var realResponses = [];
    var responses = [{ split: value, first: 0, last: value.length, result: { flagged: false } }];

    while (responses.length > 0) {
        var response = responses.shift();
        var content = response.split;
        var length = content.length;
        var offset = response.first;
        var outs = [];

        if (length > 40) {
            var separation = Math.floor(length / 3);
        } else if (length > 20) {
            var separation = Math.floor(length / 2);
        } else {
            realResponses.push(response);
            continue;
        }
        if (separation < overlap) {
            separation = length;
        }

        if (length < separation) return;

        var newIndex = 0;
        var oldIndex = 0;
        var i;

        for (i = 0; i < Math.floor(length / separation) + (Math.floor((length % separation + Math.floor(length / separation) * overlap) / separation)); i++) {
            if ((length - (oldIndex + separation - overlap)) < separation) {
                newIndex = length;
            } else {
                newIndex = oldIndex + separation;
            }
            if (content[oldIndex - 2]?.match(/(\w|\d|.|,)/) && content[oldIndex - 1]?.match(/[a-zA-Z]/)) {
                first = oldIndex - 1;
            } else {
                first = oldIndex;
            }
            if (content[newIndex + 1]?.match(/(\w|\d|.|,)/) && content[newIndex]?.match(/[a-zA-Z]/)) {
                last = newIndex + 1;
            } else {
                last = newIndex;
            }
            outs.push({ value: content.substring(first, last), first: offset + first, last: offset + last });

            oldIndex = newIndex - overlap;
        }

        var tempResponses = [];
        var tempRes;
        var j;
        for (j = 0; j < outs.length; j++) {
            if (outs[j].value != content) {
                try {
                    tempRes = await openai.moderations.create({ input: outs[j].value });
                } catch (err) {
                    console.log(err);
                    return { error: true };
                }

                if (tempRes?.results?.length > 0 && tempRes.results[0].flagged) {
                    tempResponses.push({ split: outs[j].value, first: outs[j].first, last: outs[j].last, result: tempRes.results[0] });
                }
            }
        }
        if (tempResponses.length > 0) {
            responses.push(...tempResponses);
        } else {
            if (response.split != value) { realResponses.push(response); }
        }
    }

    console.log(realResponses)
    return realResponses;
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
const { EmbedBuilder } = require('@wozardlozard/discord.js');
const { OpenAI } = require('openai');
const process = require('node:process');

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});

const {} = require('./initial-message-scan.js');

exports.detailedAnalysis = async function(message, field, overlap) {
    var content = field.value;
    var length = content.length;
    var outs = [];
    var responses = [];

    var separation = Math.floor(length / 3);
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
        outs.push(content.substring(oldIndex, newIndex));
        oldIndex = newIndex - overlap;
    }

    console.log(outs);

    var tempRes;
    var j;
    for (j = 0; j < outs.length; j++) {
        try {
            tempRes = await openai.moderations.create({ input: outs[j] });
        } catch (err) {
            console.log(err);
            return { error: true };
        }

        if (tempRes?.results?.length > 0) {
            responses.push({ split: outs[j], result: tempRes.results[0] });
        }
    }

    console.log(responses);

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
    for (k = 0; k < responses.length; k++) {
        fields.push({ name: `Split ${k + 1}`, value: responses[k].split + "\n\n" + ((responses[k].result.flagged) ? "• " + Object.entries(responses[k].result.categories).filter(x => x[1]).map(x => violations[x[0]] + ` (${(responses[k].result.category_scores[x[0]] * 100).toFixed(2)}% confidence)`).join("\n• ") : "Not flagged") });
    }

    var embed = new EmbedBuilder()
        .setTitle("Message Flagged")
        .setColor("Blurple")
        .addFields(fields);

    var channel = message.guild.channels.cache.find(x => x.id == process.env.NOTIFCHANNEL);

    if (channel) {
        channel.send({ embeds: [embed] });
    }
}
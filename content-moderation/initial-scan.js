const { EmbedBuilder } = require('@wozardlozard/discord.js');
const { OpenAI } = require('openai');
const process = require('node:process');

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});

exports.initialScan = async function(content, author, guild) {
    try {
        var res = await openai.moderations.create({ input: content });
    } catch (err) {
        console.log(err);

        return { error: true };
    }

    if (res?.results?.length > 0) {
        var result = res.results[0];
        
        if (result.flagged) {
            var embed = new EmbedBuilder()
                .setTitle("Message Flagged")
                .setColor("Blurple")
                .addFields({
                    name: "Message", value: content,
                    name: "Violated categories", value: Object.entries(result.categories).filter(x => x[1]).map(x => x[0] + ` (${(result.category_scores[x[0]] * 100).toFixed(2)}% confidence)`).join("\n")
                });

            var channel = guild.channels.cache.find(x => x.id == process.env.NOTIFCHANNEL);

            if (channel) {
                channel.send({ embeds: [embed] });
            }
        }
    } else {
        return { clean: true };
    }
}
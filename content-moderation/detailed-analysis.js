const { EmbedBuilder } = require('@wozardlozard/discord.js');
const process = require('node:process');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});

const scanner = require("./scan-message.js");

exports.analysis = async function (message, overlap) {
    let content = message.value;
    let length = content.length;
    let outs = [];
    let responses = [];
    let responseViolations = [];

    let separation = Math.floor(length / 3);
    //vv following case breaks it.
    if(separation < overlap){
        separation = length;
    }

    //split.
    if (length < separation) { return content } else {
        let newIndex = 0;
        let oldIndex = 0;

        for (let i = 0; i < Math.floor(length / separation) + (Math.floor((length % separation + Math.floor(length / separation) * overlap) / separation)); i++) {
            if ((length - (oldIndex + separation - overlap)) < separation) {
                newIndex = length;
            } else {
                newIndex = oldIndex + separation;
            }
            outs.push(content.substring(oldIndex, newIndex));
            oldIndex = newIndex - 1;
        }
    }

    /*
    The following sequence does not work. Try/catch throws an error.
    - Jeff
     */
    let tempRes;
    for (let j = 0; j < outs.length; j++) {
        try {
            tempRes = await openai.moderations.create({ input: content });
        } catch (err) {
            console.log(err);
            return { error: true };
        }

        if (res?.results?.length > 0) {
            responses.push(tempRes[0]);
        }
    }

    console.log(responses)

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

    var embed = new EmbedBuilder()
        .setTitle("Message Flagged")
        .setColor("Blurple")
        .addFields([
            { name: "Splits", value: `${responses}` }
        ]);

    var channel = guild.channels.cache.find(x => x.id == process.env.NOTIFCHANNEL);

    if (channel) {
        channel.send({ embeds: [embed] });
    }
}
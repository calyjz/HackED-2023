const { EmbedBuilder } = require('@wozardlozard/discord.js');
const { get } = require('node-superfetch');

exports.handleMessageContextMenu = async function(interaction, message) {
    try {
        var factcheckQuery = await get(`https://content-factchecktools.googleapis.com/v1alpha1/claims:search?query=${message.content}&key=${process.env.GOOGLE}`);
    } catch {
        return;
    }

    if (factcheckQuery?.body?.claims?.length > 0 && factcheckQuery?.ok) {
        var factcheckResult = factcheckQuery.body.claims;
        var i, fields = [];

        if (factcheckResult?.length > 0) {
            factcheckResult = factcheckResult.slice(0, 5);

            for (i = 0; i < factcheckResult.length; i++) {
                fields.push({ name: `Similar claim ${i + 1}`, value: `Claim: ${factcheckResult[i].text}\n\nClaimed by: ${factcheckResult[i].claimant}\nClaim date: ${factcheckResult[i].claimDate?.split("T")[0]}\n\nAccording to [this article](${factcheckResult[i].claimReview[0]?.url}) written by ${factcheckResult[i].claimReview[0]?.publisher?.name}, this claim is rated as: ${factcheckResult[i].claimReview[0]?.textualRating}` });
            }

            var embed = new EmbedBuilder()
                .setTitle("Fact Check")
                .setColor("Blurple")
                .addFields(fields);

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: "The fact checker did not find any similar articles on your topic.", ephemeral: true });
        }
    } else {
        await interaction.reply({ content: "The fact checker did not find any similar articles on your topic.", ephemeral: true });
    }
}
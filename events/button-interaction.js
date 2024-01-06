exports.handleButton = function(interaction, message) {
    var embed = message.embeds[0];

    if (embed.fields?.length > 0 && embed.fields[1] && embed.fields[2]) { // [1]: message link, [2]: author id
        var messageId = embed.fields[1].value.split("/")[embed.fields[1].value.split("/").length - 1];
        var authorId = embed.fields[2].value.slice(3, -1);

        console.log(messageId, authorId);
    }
}
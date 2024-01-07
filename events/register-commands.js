const { ContextMenuCommandBuilder, ApplicationCommandType, REST, Routes } = require('@wozardlozard/discord.js');
const process = require('node:process');

exports.registerAppCommands = async function() {
    var factcheck = new ContextMenuCommandBuilder()
        .setName("Fact check")
        .setType(ApplicationCommandType.Message);

    factcheck = factcheck.toJSON();

    const rest = new REST().setToken(process.env.TOKEN);

    try {
        await rest.put(Routes.applicationCommands(process.env.BOT), { body: [factcheck] });
        console.log("Successfully updated application commands.");
    } catch (err) {
        console.log("An error occurred while updating application commands:\n\n" + (err.stack || err));
    }
}
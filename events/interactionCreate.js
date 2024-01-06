const { Events, ComponentType } = require("discord.js");

/*
WHEN USER CLICKS EMBED BUTTON
*/

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        //If interaction not button, exit
        if (!interaction.isButton()) { return };

        // p.message SHOULD exist? But this points to the bot's message the button was attached to.
        // ***Need to get message and result from initialScan in here!

        //Switch buttons
        switch (interaction.customId) {
            case "analyze":
                //vv this did not fire on button click.
                console.log("m")
                break;
            case "delete":
                break;
            case "timeout":
                break;
            case "kick":
                break;
            case "ban":
                break;
        }
    }
}
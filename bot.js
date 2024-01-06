const { Client, Options, Partials, GatewayIntentBits } = require('@wozardlozard/discord.js');
const process = require('node:process');

require('dotenv').config();


/*
DISCORD.JS CLIENT INSTANTIATION
*/

const client = new Client({
    makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        AutoModerationRuleManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        GuildForumThreadManager: 0,
        GuildTextThreadManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        MessageManager: 20,
        GuildMemberManager: {
            maxSize: 1,
            keepOverLimit: member => member.id == process.env.BOT,
        },
        UserManager: {
            maxSize: 1,
            keepOverLimit: user => user.id == process.env.BOT,
        },
    }),
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 60,
            lifetime: 1800,
        },
    },
    failIfNotExists: false,
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
});


client.login(process.env.TOKEN).catch(err => {
    console.log("An error occurred while trying to connect to Discord: " + (err.stack || err));

    client.destroy();
}).then(() => {
    if (global.gc) global.gc();
});


client.once('ready', async () => {
    if (global.gc) global.gc();

    console.log("Ready! Connected as " + client.user.tag + ".");
});
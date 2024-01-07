const { Client, Options, Partials, GatewayIntentBits, ChannelType, InteractionType } = require('@wozardlozard/discord.js');
const process = require('node:process');

require('dotenv').config();


const { registerAppCommands } = require('./events/register-commands.js');
const { initialMessageScan } = require('./content-moderation/initial-message-scan.js');
const { handleButton } = require('./events/button-interaction.js');
const { usernameScan } = require('./content-moderation/scan-username.js');
const { handleMessageContextMenu } = require('./events/message-interaction.js')


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
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
});


/*
CONNECT TO DISCORD
*/

client.login(process.env.TOKEN).catch(err => {
    console.log("An error occurred while trying to connect to Discord: " + (err.stack || err));

    client.destroy();
}).then(() => {
    if (global.gc) global.gc();
});


/*
ONCE CONNECTED
*/

client.once('ready', async () => {
    await registerAppCommands();

    if (global.gc) global.gc();

    console.log("Ready! Connected as " + client.user.tag + ".");
});


/*
WHEN USER SENDS MESSAGE
*/

client.on('messageCreate', async message => {
    if (!message) return;
    if (message.author.id == process.env.BOT) return;
    if (message.channel.type == ChannelType.DM) return;
    if (!message.guild || !message.guild.available) return;
    if (!message.author || message.author.bot || !message.channel) return;
    if (!message.content) return;
    if (message.channel.id == process.env.NOTIFCHANNEL) return;

    var result = await initialMessageScan(message);

    if (result) message.channel.send({ content: "```\n" + JSON.stringify(result) + "\n```" });
});

/*
CHECKING USERNAMES
when users first join or update their usernames
*/
client.on('guildMemberAdd', async(member) =>{
    //check if member variable is empty
    if (!member) return;
    
    var result = await usernameScan(member);//check the username content

    if(result) message.channel.send({content: "'''\n" + JSON.stringify(result) + "\n'''"});
});

client.on('guildMemberUpdate', async(newMember)=>{
    if(!newMember) return;
    var result = await usernameScan(newMember);
    
    if(result) message.channel.send({content: "'''\n" + JSON.stringify(result) + "\n'''"})
});
/*
if user joins{
    get user
    usernameScan()
}

*/


/*
WHEN BUTTON IS CLICKED
*/

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        var message;
        if (interaction.message.partial) {
            message = await interaction.message.fetch();
        } else {
            message = interaction.message;
        }

        if (interaction.message.embeds?.length > 0) {
            handleButton(interaction, message, client);
        } else {
            await interaction.reply({ content: "An error occurred.", ephemeral: true });
        }
    }

    if (interaction.isMessageContextMenuCommand()) {
        var message;
        if (interaction.targetMessage.partial) {
            message = await interaction.targetMessage.fetch();
        } else {
            message = interaction.targetMessage;
        }
        
        if (message.content && message.author && !message.author.bot) {
            handleMessageContextMenu(interaction, message);
        } else {
            await interaction.reply({ content: "Fact check could not be performed on this message type.", ephemeral: true });
        }
    }
});


/*
WHEN MEMBER JOINS SERVER
*/

client.on('guildMemberAdd', member => {
    console.log(member.displayName);
});
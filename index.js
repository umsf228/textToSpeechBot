import { configDotenv } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import commands from './commands.js';

configDotenv()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`Бот ${client.user.tag} запущен!`);
});

client.on('messageCreate', async (message) => {
    try {
        if (!message.guild) return;

        for (const command of commands) {
            if (message.content.startsWith(command.command)) {
                await command.func(message);
                break;
            }
        }
        
    } catch (e) {
        message.reply('Произошла ошибка', e.message);
        console.error(e)
    }
});

client.login(process.env.TOKEN);

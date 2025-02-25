import { configDotenv } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus  } from '@discordjs/voice';
import googleTTS from "google-tts-api";
import splitString from './helpers/split-string.js';
import express from 'express';

configDotenv()

const app = express()
const PORT = process.env.PORT || 8000;

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
        if (!message.content.startsWith('!tts ')) return;

        const text = message.content.slice(5);
        const textChunks = splitString(text, 200)

        if (!message.member.voice.channel) {
            message.reply('Вы должны быть в голосовом канале!');
            return
        }

        for (const chunk of textChunks) {
            const url = googleTTS.getAudioUrl(chunk, {
                lang: 'ru',
                slow: false,
                host: 'https://translate.google.com',
            });
    
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
    
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Ошибка загрузки аудио: ${response.statusText}`);
            const audioStream = response.body;
            const resource = createAudioResource(audioStream);
    
            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            await new Promise((resolve) => {
                player.on(AudioPlayerStatus.Idle, () => {
                    resolve();
                });
            });
        }
    } catch (e) {
        message.reply('Произошла ошибка', e.message);
        console.error(e)
    }
});

client.login(process.env.TOKEN);

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus  } from '@discordjs/voice';
import googleTTS from "google-tts-api";
import splitString from './helpers/split-string.js';

const commands = [
    {
        command: "!tts ",
        func: async message => {
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
        }
    },
    {
        command: "!voice ",
        func: async message => {
            const url = message.content.slice(7);

            if (!message.member.voice.channel) {
                message.reply('Вы должны быть в голосовом канале!');
                return
            }

            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const resource = createAudioResource(url);

            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            await new Promise((resolve) => {
                player.on(AudioPlayerStatus.Idle, () => {
                    resolve();
                });
            });
        }
    },
    {
        command: "!baza",
        func: async message => {
            try {
                const response = await fetch(process.env.GIST_LINK)
                const data = await response.json()
                const result = JSON.parse(data.files["bazaPhrases.json"].content)
                const randomNum = Math.floor(Math.random() * result.length)
                message.reply(result[randomNum])
            } catch (error) {
                throw Error(error)
            }
        }
    }
]

export default commands
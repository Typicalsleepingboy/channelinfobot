process.env.TZ = "Asia/Jakarta";

const { Client, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        32767 // All intents
    ]
});

const token = 'MTIwNTk4MDc0NjAwMzUxNzQ5MA.GUJvds.Or_0Fibti1x9sY4YI1EhvIvucjwQXWt8bv-u9I';
const guildId = '989164395684855849';
const targetChannelId = '1205994925456494602'; // Ganti dengan ID saluran yang Anda inginkan
const channelIds = [
    '1205994949443846244',
    '1206000534411022336',
    '1206016397675601950',
];

let statsMessages = []; // Menyimpan referensi pesan yang akan diperbarui

client.once('ready', async () => {
    console.log('Bot is ready!');
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found!');
        return;
    }

    const targetChannel = guild.channels.cache.get(targetChannelId);
    if (!targetChannel) {
        console.error('Target Channel not found!');
        return;
    }

    // Mendapatkan data untuk setiap channel
    setInterval(async () => {
        const updatedChannelsData = await Promise.all(channelIds.map(async (channelId, index) => {
            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
                console.error(`Channel ${channelId} not found!`);
                return null;
            }

            const messages = await channel.messages.fetch();
            const totalMessages = messages.filter(message => !message.author.bot && message.content).size;
            const totalImages = messages.filter(message => message.attachments.size > 0 && message.attachments.some(attachment => attachment.url.endsWith('.png') || attachment.url.endsWith('.jpg') || attachment.url.endsWith('.jpeg'))).size;
            const totalVoiceMessages = messages.filter(message => message.attachments.size > 0 && message.attachments.some(attachment => attachment.contentType.startsWith('audio'))).size;

            // Menemukan waktu pesan terakhir dan mengonversinya ke zona waktu UTC+7 (WIB)
            const lastMessage = messages.first();
            const lastMessageTime = lastMessage ? new Date(lastMessage.createdTimestamp).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Tidak ada pesan';

            return {
                channelName: channel.name, // Menggunakan nama saluran sebagai channelName
                totalMessages,
                totalImages,
                totalVoiceMessages,
                lastMessageTime
            };
        }));

        updatedChannelsData.forEach(async (data, index) => {
            if (data) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`${data.channelName} Info`)
                    .addFields([
                        { name: 'Total Messages', value: data.totalMessages.toString(), inline: true },
                        { name: 'Total Images', value: data.totalImages.toString(), inline: true },
                        { name: 'Total Voice Messages', value: data.totalVoiceMessages.toString(), inline: true },
                        { name: 'Last Message Time (WIB)', value: data.lastMessageTime.toString(), inline: true }
                    ])
                    .setTimestamp()
                    .setFooter({ text: 'Pesan ini akan update setiap 5 detik', iconURL: 'https://cdn.discordapp.com/attachments/991343076918444052/1205993384435519509/a6f72f55888fcea2ef1f0537ae10e008d3edab3b_s2_n3_y2.jpg?ex=65da63dd&is=65c7eedd&hm=2d29221ff10ca814c33c18a0f248ad30b28e0bcb2da2f9a4986e18e68095a859&' });

                const message = await statsMessages[index];
                if (message) {
                    message.edit({ embeds: [embed] });
                } else {
                    // Jika pesan belum ada, kirim pesan baru ke saluran target
                    const newMessage = await targetChannel.send({ embeds: [embed] });
                    statsMessages[index] = newMessage;
                }
            }
        });
    }, 5000);
});

client.login(token);

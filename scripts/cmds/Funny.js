const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'voice',
    aliases: ["funny", "sound", "audiofx"],
    author: 'Rasel Mahmud',
    usePrefix: false,
    category: 'Funny Voice & Sound Effects'
  },
  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(' ');
      if (!query) return message.reply('🔊 Please provide a search query (e.g., "fart", "laugh", "scream", "bruh")!');

      const searchResponse = await axios.get(`https://mostakim.onrender.com/mostakim/ytSearch?search=${encodeURIComponent(query + " funny sound effect short")}`);
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const parseDuration = (timestamp) => {
        const parts = timestamp.split(':').map(part => parseInt(part));
        if (parts.length === 2) {
          return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
          return parts[0];
        }
        return 999;
      };

      // Filter ONLY audio under 10 seconds (strictly funny/short clips)
      const filteredClips = searchResponse.data.filter(video => {
        try {
          const totalSeconds = parseDuration(video.timestamp);
          return totalSeconds <= 10 && totalSeconds >= 1;
        } catch {
          return false;
        }
      });

      if (filteredClips.length === 0) {
        return message.reply('😂 No funny short audio found (under 10 seconds)! Try: fart, laugh, wow, oof, bruh, scream, yeet');
      }

      const selectedClip = filteredClips[0];
      const tempFilePath = path.join(__dirname, 'temp_funny_audio.m4a');
      
      const apiResponse = await axios.get(`https://mostakim.onrender.com/m/sing?url=${selectedClip.url}`);
      
      if (!apiResponse.data.url) {
        throw new Error('No audio URL found');
      }

      const writer = fs.createWriteStream(tempFilePath);
      const audioResponse = await axios({
        url: apiResponse.data.url,
        method: 'GET',
        responseType: 'stream'
      });

      audioResponse.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      api.setMessageReaction("😂", event.messageID, () => {}, true);

      await message.reply({
        body: `🎤 *Funny sound effect:* ${selectedClip.title}\n⏱️ Duration: ${selectedClip.timestamp} (under 10 sec)\n🔊 *Playing...*`,
        attachment: fs.createReadStream(tempFilePath)
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Temp file deletion error:", err);
      });

    } catch (error) {
      message.reply(`❌ Error: ${error.message}\nTry a different funny word like: fart, sneeze, laugh, scream`);
    }
  }
};

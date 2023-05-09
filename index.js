require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const minimist = require("minimist");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("ready", () => console.log(`Logged in as ${client.user.tag}`));

client.on("messageCreate", async (message) => {
  if (!message.mentions.users.has(client.user.id)) return;
  console.log("mentioned");
  const channel = message.mentions.channels.first();
  if (!channel) return message.reply("チャンネルを指定しろボケ");
  if (!channel.isTextBased()) return message.reply("テキストチャンネルじゃねーよボケ")
  const originalId = message.reference.messageId;
  if (!originalId) return message.reply("返信で元メッセージを指定しろボケ");
  const original = await message.channel.messages.fetch(originalId);
  const del = minimist(message.content.split(" ")).d;
  channel.send({
    content: original.content,
    embeds: original.embeds,
    allowedMentions: { parse: [""] },
    files: [...message.attachments.values()]
  })
  .then(() => {
    if (del) {
      original.delete()
      .then(() => message.reply("Redirected and Deleted!"))
      .catch(() => message.reply("消せなかったわ"))
    } else message.reply("Redirected!")
  })
  .catch(() => message.reply("メッセージ送れなかったわ"));
});

process.on("uncaughtException", console.error);

void client.login(process.env.DISCORD_TOKEN);
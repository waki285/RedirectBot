require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const minimist = require("minimist");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
  allowedMentions: { repliedUser: false }
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
  if (del && !message.member.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageMessages)) return message.reply("お前消せる権限ないよね")
  channel.send({
    content: original.content,
    embeds: original.embeds,
    allowedMentions: { parse: [] },
    files: [...message.attachments.values()]
  })
  .then(() => {
    if (del) {
      original.delete()
      .then(() => message.reply("Redirected and Deleted!"))
      .catch(() => message.reply("消せなかったわ"))
    } else message.reply("Redirected!")
  })
  .catch((e) => {console.error(e);message.reply("メッセージ送れなかったわ")});
});

process.on("uncaughtException", console.error);

void client.login(process.env.DISCORD_TOKEN);
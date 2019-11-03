const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();


var streams = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('you', { type: 'WATCHING' })
});

if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
}

async function log (msg)
{
    console.log("log called");
    let dir = "./logs/" + msg.guild.id;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    if (!streams.hasOwnProperty(msg.guild.id)) {
        streams[msg.guild.id] = {};
    }
    
    if (!streams[msg.guild.id].hasOwnProperty(msg.channel.id))
    {
        streams[msg.guild.id][msg.channel.id] = fs.createWriteStream(dir+"/"+msg.channel.id+".txt", { flags: "a"});
    }
    let text = `${Date().padStart(100)}, ${msg.author.tag.padStart(40)}, ${msg.content}`;
    streams[msg.guild.id][msg.channel.id].write(text+'\n');
}

client.on('message', msg => {
    log(msg);
  if (!msg.content.startsWith(`<@${client.user.id}>`) || msg.author.bot) return;
  msg.content = msg.content.substring(client.user.id.length + 3).trim();
  console.log(msg.content);
  if (/^get <#.+>$/.test(msg.content))
  {
      msg.channel.send(`Logs for ${msg.content.substr(4)}:`, { files: ["./logs/" + msg.guild.id + "/" + msg.content.substring(6, msg.content.length-1) + ".txt"] });
  }
});

client.login(require("./secrets/bot.json").token);
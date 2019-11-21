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

async function log (msg, type)
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
    let text = `${Date().padStart(75)}, ${msg.id.padStart(20)}, ${type.padStart(10)}, ${msg.author.tag.padStart(40)}, ${msg.content.replace(/\\/g, '\\\\').replace(/\,/g, '\\,')}`;
    streams[msg.guild.id][msg.channel.id].write(text+'\n');
}

client.on('message', msg => {
    log(msg, 'create');
//msg.reply("pong");
	console.log(msg.content);
  if (!(msg.content.startsWith(`<@${client.user.id}>`) || msg.content.startsWith(`<@!${client.user.id}>`)) || msg.author.bot) return;
  msg.content = msg.content.substring(msg.content.search('>')+1).trim();
  console.log(msg.content);
  if (/^get <#.+>$/.test(msg.content))
  {
	  if (msg.member.permissions.has('ADMINISTRATOR')) {
      		msg.author.send(`Logs for ${msg.content.substr(4)} in ${msg.guild.name} (https:/\/discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}:`,
			{ files: ["./logs/" + msg.guild.id + "/" + msg.content.substring(6, msg.content.length-1) + ".txt"] });
  	} else { msg.reply("you don't have admin, sucks!"); }
  }
  if (msg.content == 'help') msg.reply("https://github.com/Exr0n/discordbots-observer");
});

client.on('messageUpdate', (src, dst) => {
	log(dst, 'edit');
});

client.login(require("./secrets/bot.json").token);

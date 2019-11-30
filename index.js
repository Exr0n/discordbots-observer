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
	
    if (! type) throw new Error("No type specified!");
    //console.log("log called");
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

async function log_if_guild(msg, type) {
	if (! msg.guild) return; // only logs if it's from a guild
	log(msg, type).catch(console.error);
}

client.on('message', msg => {
  log_if_guild(msg, 'create'); // only log messages from servers
//msg.reply("pong");
//	console.log(msg.content);
  if (!(msg.content.startsWith(`<@${client.user.id}>`) || msg.content.startsWith(`<@!${client.user.id}>`)) || msg.author.bot) return;
  msg.content = msg.content.substring(msg.content.search('>')+1).trim();
  //console.log(msg.content);
  if (/^get <#.+>$/.test(msg.content))
  {
	  if (msg.member.permissions.has('ADMINISTRATOR')) {
      		msg.author.send(`Logs for ${msg.content.substr(4)} in ${msg.guild.name} (https:/\/discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}:`,
			{ files: ["./logs/" + msg.guild.id + "/" + msg.content.substring(6, msg.content.length-1) + ".txt"] })
            .catch(console.error);
  	} else { msg.reply("you don't have admin, sucks!").catch(console.error); }
  }
  if (msg.content == 'help') msg.reply("https://github.com/Exr0n/discordbots-observer");
  if (msg.content == 'ping') {
	  msg.reply("pong...")
	  .then(rep => {
		  let ping = rep.createdTimestamp-msg.createdTimestamp;
		  rep.edit(`<@${msg.author.id}> pong: +` + ping.toString() + "ms roundtrip.");
	  })
	  .catch(console.error);
  }
});

client.on('messageReactionAdd', (mR, u) => {
	log_if_guild(Object.assign(mR.message, {author: u, content: mR.emoji.toString()}), 'react');
});

client.on('messageUpdate', (src, dst) => {
	log_if_guild(dst, 'edit');
});

client.on('messageDelete', (msg) => {
	log_if_guild(msg, 'delete');
});

client.on('disconnect', () => {
	login();
});

function login () {
	client.login(require("./secrets/bot.json").token);
}

login();

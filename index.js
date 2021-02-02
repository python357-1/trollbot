const Discord = require('discord.js');
const client = new Discord.Client();
const redis = require('redis')
const server = redis.createClient()
require('dotenv').config()

server.on("error", (err) => {
  console.error(err)
})
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('type "trollbot help" if u dum lmao')
});

let activePlayers = [];
let playerMap = new Map()
playerMap['python357'] = ['https://i.imgur.com/kU1brlO.png']
playerMap['powerboyNL'] = [
  'https://i.imgur.com/osSlcdp.png',
  'https://i.imgur.com/u08Rmad.png'
]
playerMap['SampeBoj77'] = [
  'https://i.imgur.com/WV5dBvK.png',
  'https://i.imgur.com/JiL2Ubj.png'
]
playerMap['Ctoons05'] = [
  'https://i.imgur.com/5j6Rgjf.png',
  'https://i.imgur.com/K2NJv5L.png'
]
playerMap['choccy melk'] = ['https://i.imgur.com/JN5zSr4.png']
playerMap['firebender123'] = ['https://i.imgur.com/hJBQb1H.png']
playerMap['cbrl'] = [
  'https://i.imgur.com/36fxRED.png',
  'https://i.imgur.com/j1ILiMM.png'
]

client.on('message', msg => {
  if (msg.content === 'trollbot play') {
    if (activePlayers.indexOf(msg.author.username) != -1) {
      let imageArr = playerMap[activePlayers[Math.round(Math.random() * (activePlayers.length - 1))]]
      let image = imageArr[Math.round(Math.random() * (imageArr.length - 1))]
      msg.channel.send(image)
    } else {
      msg.channel.send('try being in the game, loser')
    }
  } else if (msg.content === "trollbot addme") {
    let player = msg.author.username
    server.rpush(msg.guild.id, msg.author.username)
    server.lrange(msg.guild.id, 0, -1, redis.print)
    msg.channel.send(`${player} has joined the game!`)
  } else if (msg.content === "trollbot clear") {
    server.del(msg.guild.id)
    msg.channel.send('Players cleared!')
  } else if (msg.content === "trollbot show") {
    server.lrange(msg.guild.id, 0, -1, (err, res) => {
      active_players = res
      if (err) {
        console.error(err)
      }
      console.log(res)

      if (active_players.length < 1) {
        if (msg.author.username == "python357") {
          msg.channel.send('nobody\'s playing, father')
        } else {
          msg.channel.send('nobody\'s playing bitch')
        }
      } else {
        msg.channel.send(`Active Players: ${active_players.join(', ')}`)
      }
    })
  } else if (msg.content === "trollbot help") {
    msg.channel.send(`
\`trollbot addme\` - adds you to the current game
\`trollbot show\` - shows players in current game
\`trollbot clear\` - clears current game's players
\`trollbot play\` - shows a random image of the current players
\`trollbot help\` - really 
    `)
  }
});

client.login(process.env.TOKEN)
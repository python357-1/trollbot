const Discord = require('discord.js');
const client = new Discord.Client();
const redis = require('redis')
const server = redis.createClient()
const Youtube = require("youtube-node")
const unshortener = require('unshortener')
const mongoose = require('mongoose')
const { Schema } = mongoose
const fetch = require('node-fetch')
require('dotenv').config()

const imageURL = "https://python357-image-generator.herokuapp.com/create?"
const responses = require('./canned-responses.json')

let youtube = new Youtube();
youtube.setKey(process.env.YOUTUBE_KEY)

server.on("error", (err) => {
  console.error(err)
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('type "trollbot help" if u dum lmao')
});

let connection_string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URL}/trollbot`
mongoose.connect(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
})
mongoose.connection.on('error', (err) => {
  console.log(err)
})

const playerSchema = new Schema({
  username: String,
  nickname_player: Boolean,
  status_player: Boolean,
  nickname_url: String,
  status_url: String
})

const Player = mongoose.model('Player', playerSchema)

function randomMessage(msg) {
  let message = responses[Math.round(Math.random() * responses.length - 1)]
  msg.author.send(message)
}
client.on('message', msg => {
  if (msg.channel.type == "dm") {
    if (msg.author.username == 'powerboyNL' || msg.author.username == 'python357') {
      if (msg.content.includes("sex")) {
        msg.author.send('yes daddy :hot_face:')
      } else {
        randomMessage(msg)
      }
    } else {
      randomMessage(msg)
    }
  }
  if (msg.content === 'trollbot play') {
    const sourceURL = 'https://python357-image-generator.herokuapp.com/players'
    server.lrange(msg.guild.id, 0, -1, (err, res) => {
      if (err) {
        console.error(err)
      }
      let currentPlayer = res[Math.ceil(Math.random() * res.length - 1)]
      Player.findOne({ username: currentPlayer }, (err, player) => {
        console.log(player)
        if (player.nickname_player && player.status_player) {
          let rand = Math.round(Math.random() * 1)
          if (rand >= 0.5) {
            msg.channel.send(`${sourceURL}/${player.nickname_url}`)
          } else {
            msg.channel.send(`${sourceURL}/${player.status_url}`)
          }
        } else if (player.nickname_player) {
          msg.channel.send(`${sourceURL}/${player.nickname_url}`)
        } else if (player.status_player) {
          msg.channel.send(`${sourceURL}/${player.status_url}`)
        } else {
          msg.channel.send(player.username)
        }
      })
    })
  } else if (msg.content === "trollbot add me") {
    // check if player has images in mongoDB
    Player.find({ username: msg.author.username }, (err, data) => {
      if (data.length < 1) {
        // if not, tell them they are being added
        msg.channel.send(':clock1: please wait you are being added :clock1:')
        player = new Player({
          username: msg.author.username,
          nickname_player: false,
          status_player: false
        })
        player.save((err) => {
          if (err) console.error(err)
        });
        msg.channel.send(":thumbsup: you are added and good to go :ok_hand:")
      }
    })
    let player = msg.author.username
    server.rpush(msg.guild.id, msg.author.username)
    msg.channel.send(`${player} has joined the game!`)
  } else if (msg.content === "trollbot clear") {
    server.del(msg.guild.id)
    msg.channel.send('Players cleared!')
  } else if (msg.content === "trollbot show") {
    server.lrange(msg.guild.id, 0, -1, (err, res) => {
      if (err) {
        console.error(err)
      }
      if (res.length < 1) {
        if (msg.author.username == "python357") {
          msg.channel.send('nobody\'s playing, father')
        } else {
          msg.channel.send('nobody\'s playing bitch')
        }
      } else {
        msg.channel.send(`Active Players: ${res.join(', ')}`)
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
  } else if (msg.content == "trollbot add") {
    msg.channel.send('no :thumbsup:')
  } else if (msg.content == "trollbot add nickname") {
    fetch(`${imageURL}username=${msg.author.username}&type=nickname`)
      .then(res => res.json())
      .then(json => Player.updateOne({ username: msg.author.username }, { $set: { nickname_player: true, nickname_url: json.nick_filename } }))

    msg.channel.send(':ok_hand: added')
  } else if (msg.content == "trollbot add status") {
    fetch(`${imageURL}username=${msg.author.username}&type=status`)
      .then(res => res.json())
      .then(json => Player.updateOne({ username: msg.author.username }, { $set: { status_player: true, status_url: json.stat_filename } }))

    msg.channel.send(':ok_hand: added')
  } else {
    if (msg.author.username != 'trollbot') {
      const YT_REGEX = /<https:\/\/www.youtube.com\/watch\?v=.{1,}>/
      if (YT_REGEX.test(msg.cleanContent)) {
        let uncleanString = msg.cleanContent;
        let cleanString = uncleanString.substr(1, (uncleanString.length - 2))
        let vidID = cleanString.split('=')[1]

        youtube.getById(vidID, (err, res) => {
          if (err) {
            console.error(err)
          } else {
            msg.channel.send(res.items[0].snippet.title)
          }
        })
      }
    }
  }
});
client.login(process.env.TOKEN)
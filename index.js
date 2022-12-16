const EventEmitter = require('events');
const { Client, Intents } = require('discord.js');
const path = require('path');
const WOKCommands = require('wokcommands');
const weather = require('weather-js')
require('dotenv').config();

const city = 'Wendeburg, DE'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

const Event = new EventEmitter();
var data = {}
var lastTemp = 0
var lastWeather = ''

const checkWeather = () => {
    weather.find({ search: city, degreeType: 'C' }, function (err, result) {
        if (err) { console.log(err) }

        data.temp = result[0].current.temperature
        data.day = result[0].current.day
        data.weather = result[0].current.skytext
        data.humidity = result[0].current.humidity

        if (data.weather.includes('Rain') && !lastWeather.includes('Rain')) {
            lastWeather = data.weather
            Event.emit('Raining')
        }

        if (data.temp > lastTemp ) {
            Event.emit('Hotter', data)
        } else if (data.temp < lastTemp) {
            Event.emit('Colder', data)
        }
	lastTemp = data.temp
    })
}

client.on('ready', async () => {
    
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'commands')
    })
    const author = await client.users.fetch('140508899064283136', false)
    checkWeather()
    setInterval(() => {
        checkWeather()
    }, 3600000)

    Event.on('Raining', () => {
        author.send({
            content: "It's raining!"
        })
    })
    Event.on('Hotter', x => {
        author.send({
            content: `Temperature has increased to ${x.temp}°C!`
        })
    })
    Event.on('Colder', x => {
        author.send({
            content: `Temperature has decreased to ${x.temp}°C!`
        })
    })
})
client.login(process.env.TOKEN)

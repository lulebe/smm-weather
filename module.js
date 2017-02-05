const $ = require('jquery')
const dot = require('dot')
const path = require('path')

const speech = require('../../speech/recognition')

let moduleData = null

const parseIcon = {
  'clear-day': {
    icon: 'sun.png',
    shortText: 'Sonnig',
    text: 'Das Wetter ist sonnig bei '
  },
  'clear-night': {
    icon: 'sun.png', //TODO find icon
    shortText: 'Sternenklar',
    text: 'Die Nacht ist sternenklar bei '
  },
  'rain': {
    icon: 'rain.png',
    shortText: 'Regen',
    text: 'Das Wetter ist regnerisch bei '
  },
  'snow': {
    icon: 'snow.png',
    shortText: 'Schnee',
    text: 'Es schneit bei '
  },
  'sleet': {
    icon: 'rain-snow.png',
    shortText: 'Schneeregen',
    text: 'Es fällt Schneeregen bei '
  },
  'wind': {
    icon: 'wind.png',
    shortText: 'starker Wind',
    text: 'Es windet stark bei '
  },
  'fog': {
    icon: 'snow.png', //TODO find icon
    shortText: 'Nebel',
    text: 'Das Wetter ist neblig bei '
  },
  'cloudy': {
    icon: 'clouds.png',
    shortText: 'Bewölkt',
    text: 'Der Himmel ist bewölkt bei '
  },
  'partly-cloudy-day': {
    icon: 'sun-clouds.png',
    shortText: 'Leicht bewölkt',
    text: 'Der Himmel ist leicht bewölkt bei '
  },
  'partly-cloudy-night': {
    icon: 'moon-clouds.png',
    shortText: 'Leicht bewölkt',
    text: 'Zwischen den Wolken sieht man die Sterne bei '
  }
}

function renderError (domNode) {
  domNode.html("<strong>couldn't get weather data</strong>")
}

function renderWeather (domNode, weather) {
  const render = dot.template(`
    <div class="smm-weather-container">
      <img src="file://{{=it.weatherIconPath}}" class="smm-weather-img">
      <div class="smm-weather-info">
        <strong>{{=it.temperature}}°C</strong>
        <br><br>
        {{=it.humidity}}%
      </div>
    </div>
    <em>{{=it.description}}</em>
  `)
  domNode.html(render({
    weatherIconPath: path.join(__dirname, parseIcon[weather.currently.icon].icon || 'sun-clouds.png'),
    temperature: Math.round(weather.currently.temperature),
    humidity: weather.currently.humidity * 100,
    description: parseIcon[weather.currently.icon].shortText || 'Überraschend'
  }))
}

function getPos (cb) {
  $.get('https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true')
  .then(data => {
    if (data.status == 'OK')
      cb(null, data.location)
    else
      cb(true, null)
  })
}

function getWeather (cb) {
  getPos((err, pos) => {
    if (err) return cb(err)
    const lat = pos.lat
    const lon = pos.lng
    let url = 'https://api.darksky.net/forecast/'+moduleData.API_Key+'/'+lat+','+lon+'/'
    url += '?exclude=minutely,daily,alerts,flags&units=ca'
    $.get(url).then(data => {
      cb(null, data)
    }, () => {
      cb(true, null)
      renderError(domNode)
    })
  })
}

speech.addCommands({
  'Wie ist das Wetter': () => {
    getWeather((err, data) => {
      if (err)
        responsiveVoice.speak('Entschuldigung, es gab einen Fehler.', "Deutsch Female", {onend: () => {
          require('../../renderer').showVoiceOverlay(false)
        }})
      else {
        let summary = parseIcon[data.currently.icon].text || "Ich kann dir nicht sagen wie das Wetter ist, aber es sind "
        let text = summary + Math.round(data.currently.temperature) + " Grad."
        responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
          require('../../renderer').showVoiceOverlay(false)
        }})
      }
    })
  }, //TODO: implement all these phrases
  'Wie wird das Wetter heute um :time': () => {
    require('../../renderer').showVoiceOverlay(false)
  },
  'Wie wird das Wetter heute Nacht': () => {
    require('../../renderer').showVoiceOverlay(false)
  },
  'Wie wird das Wetter morgen': () => {
    require('../../renderer').showVoiceOverlay(false)
  },
  'Wie ist das Wetter in *city': () => {
    require('../../renderer').showVoiceOverlay(false)
  },
  'Wie wird das Wetter nächste Woche': () => {
    require('../../renderer').showVoiceOverlay(false)
  }
})

module.exports = function (data) {
  moduleData = data
  return {
    renderStatus: function (domNode) {
      getWeather((err, data) => {
        if (err)
          renderError(domNode)
        else
          renderWeather(domNode, data)
      })
    }
  }
}

const $ = require('jquery')
const dot = require('dot')
const path = require('path')

const voiceDE = require('./voice_de')
const voiceEN = require('./voice_en')

let moduleData = null

const parseIcon = {
  'clear-day': {
    icon: 'sun.png',
    shortTextDE: 'Sonnig',
    textStartDE: 'Das Wetter ',
    textEndDE: ' ist sonnig bei '
  },
  'clear-night': {
    icon: 'sun.png', //TODO find icon
    shortTextDE: 'Sternenklar',
    textStartDE: 'Die Nacht ',
    textEndDE: ' ist sternenklar bei '
  },
  'rain': {
    icon: 'rain.png',
    shortTextDE: 'Regen',
    textStartDE: 'Das Wetter ',
    textEndDE: ' ist regnerisch bei '
  },
  'snow': {
    icon: 'snow.png',
    shortTextDE: 'Schnee',
    textStartDE: '',
    textEndDE: ' schneit es bei '
  },
  'sleet': {
    icon: 'rain-snow.png',
    shortTextDE: 'Schneeregen',
    textStartDE: '',
    textEndDE: ' fällt Schneeregen bei '
  },
  'wind': {
    icon: 'wind.png',
    shortTextDE: 'starker Wind',
    textStartDE: '',
    textEndDE: ' windet es stark bei '
  },
  'fog': {
    icon: 'snow.png', //TODO find icon
    shortTextDE: 'Nebel',
    textStartDE: 'Das Wetter ',
    textEndDE: ' ist neblig bei '
  },
  'cloudy': {
    icon: 'clouds.png',
    shortTextDE: 'Bewölkt',
    textStartDE: 'Der Himmel ',
    textEndDE: ' ist bewölkt bei '
  },
  'partly-cloudy-day': {
    icon: 'sun-clouds.png',
    shortTextDE: 'Leicht bewölkt',
    textStartDE: 'Der Himmel ',
    textEndDE: ' ist leicht bewölkt bei '
  },
  'partly-cloudy-night': {
    icon: 'moon-clouds.png',
    shortTextDE: 'Leicht bewölkt',
    textStartDE: '',
    textEndDE: 'sieht man  zwischen den Wolken die Sterne bei '
  }
}

function renderError (domNode) {
  domNode.html("<strong>couldn't get weather data</strong>")
}

function renderWeather (domNode, weather) {
  const language = require('../../renderer').getSettings().language
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
  const renderData = {
    weatherIconPath: path.join(__dirname, parseIcon[weather.currently.icon].icon || 'sun-clouds.png'),
    temperature: Math.round(weather.currently.temperature),
    humidity: weather.currently.humidity * 100
  }
  switch (language) {
    case 'DE':
      renderData.description = parseIcon[weather.currently.icon].shortTextDE || 'Überraschend'
      break;
    default:
      renderData.description = weather.currently.summary
  }
  domNode.html(render(renderData))
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

function loadWeather (lat, lon, cb) {
  let url = 'https://api.darksky.net/forecast/'+moduleData.API_Key+'/'+lat+','+lon+'/'
  url += '?exclude=minutely,alerts,flags&units=ca'
  $.get(url).then(data => {
    cb(null, data)
  }, () => {
    cb(true, null)
  })
}

function getWeather (cb) {
  getPos((err, pos) => {
    if (err) return cb(err)
    loadWeather(pos.lat, pos.lng, cb)
  })
}

module.exports = function (data) {
  moduleData = data
  voiceDE(getWeather, loadWeather, parseIcon)
  voiceEN(getWeather, loadWeather, parseIcon)
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

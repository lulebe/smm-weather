const $ = require('jquery')
const dot = require('dot')
const path = require('path')

function getIcon (icon) {
  switch (icon) {
    case 'clear-day':
      return 'sun.png'
    case 'clear-night': //TODO find icon
      return 'sun.png'
    case 'rain':
      return 'rain.png'
    case 'snow':
      return 'snow.png'
    case 'sleet':
      return 'rain-show.png' //TODO find icon
    case 'wind':
      return 'wind.png'
    case 'fog':
      return '' //TODO find icon
    case 'cloudy':
      return 'clouds.png'
    case 'partly-cloudy-day':
      return 'sun-clouds.png'
    case 'partly-cloudy-night':
      return 'moon-clouds.png'
    default:
      return 'sun-clouds-few.png'
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
    weatherIconPath: path.join(__dirname, getIcon(weather.currently.icon)),
    temperature: Math.round(weather.currently.temperature),
    humidity: weather.currently.humidity * 100,
    description: weather.currently.summary
  }))
}

function getPos (cb) {
  $.get('https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true')
  .then(data => {
    if (data.status == 'OK')
      cb(data.location)
  })
}


module.exports = function (data) {
  return {
    renderStatus: function (domNode) {
      getPos(pos => {
        const lat = pos.lat
        const lon = pos.lng
        let url = 'https://api.darksky.net/forecast/'+data.API_Key+'/'+lat+','+lon+'/'
        url += '?exclude=minutely,daily,alerts,flags&units=ca'
        $.get(url).then(data => {
          renderWeather(domNode, data)
        }, () => {
          renderError(domNode)
        })
      })
    }
  }
}

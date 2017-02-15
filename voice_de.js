const speech = require('../../speech/recognition')
const $ = require('jquery')

const renderer = require('../../renderer');

module.exports = function (getWeather, loadWeather, parseIcon) {

  const voiceErrorDE = () => {
    responsiveVoice.speak('Entschuldigung, es gab einen Fehler.', 'Deutsch Female', {onend: () => {
      renderer.showVoiceOverlay(false)
    }})
  }


  speech.addCommands({
    'Wie ist das Wetter': () => {
      getWeather((err, data) => {
        if (err)
          voiceErrorDE()
        else {
          let summary
          if (parseIcon[data.currently.icon])
            summary = parseIcon[data.currently.icon].textStartDE + 'zur Zeit' + parseIcon[data.currently.icon].textEndDE
          else
            summary = "Ich kann dir nicht sagen wie das Wetter ist, aber es sind "
          let text = summary + Math.round(data.currently.temperature) + " Grad."
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        }
      })
    },
    'Wie wird das Wetter in :hours Stunden': (hours) => {
      let hour
      try {
        hour = parseInt(hours)
      } catch (e) {
        voiceErrorDE()
        return
      }
      if (hour < 0 || hour > 47)
        return voiceErrorDE()
      getWeather((err, data) => {
        if (err)
          voiceErrorDE()
        else {
          let summary
          if (parseIcon[data.hourly.data[hour].icon])
            summary = parseIcon[data.hourly.data[hour].icon].textStartDE + 'in ' + hour + ' Stunden' + parseIcon[data.hourly.data[hour].icon].textEndDE
          else
            summary = "Ich kann dir nicht sagen wie das Wetter wird, aber es werden "
          let text = summary + Math.round(data.hourly.data[hour].temperature) + " Grad."
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        }
      })
    },
    'Wie wird das Wetter heute Nacht': () => {
      const hour = 26 - new Date().getHours()
      getWeather((err, data) => {
        if (err)
          voiceErrorDE()
        else {
          let summary
          if (parseIcon[data.hourly.data[hour].icon])
            summary = parseIcon[data.hourly.data[hour].icon].textStartDE + 'heute Nacht' + parseIcon[data.hourly.data[hour].icon].textEndDE
          else
            summary = "Ich kann dir nicht sagen wie das Wetter wird, aber es werden "
          let text = summary + Math.round(data.hourly.data[hour].temperature) + " Grad."
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        }
      })
      renderer.showVoiceOverlay(false)
    },
    'Wie wird das Wetter morgen': () => {
      console.log(1)
      getWeather((err, data) => {
        console.log(err)
        console.log(data)
        if (err)
          voiceErrorDE()
        else {
          let summary
          if (parseIcon[data.daily.data[1].icon])
            summary = parseIcon[data.daily.data[1].icon].textStartDE + 'morgen' + parseIcon[data.daily.data[1].icon].textEndDE
          else
            summary = 'Ich kann dir nicht sagen wie das Wetter wird, aber es werden '
          let text = summary + Math.round(data.daily.data[1].temperatureMin) + ' bis ' + Math.round(data.daily.data[1].temperatureMax) + ' Grad.'
          console.log(text)
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        }
      })
    },
    'Wie ist das Wetter in *city': (city) => {
      const settings = renderer.getSettings()
      $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+city+'&key='+settings.googleAPIKey)
      .then(loc => {
        if (loc.status != 'OK')
          return voiceErrorDE()
        const lat = loc.results[0].geometry.location.lat
        const lon = loc.results[0].geometry.location.lng
        loadWeather(lat, lon, (err, data) => {
          if (err)
            return voiceErrorDE()
          let summary
          if (parseIcon[data.currently.icon])
            summary = parseIcon[data.currently.icon].textStartDE + 'zur Zeit in ' + loc.results[0].formatted_address + parseIcon[data.currently.icon].textEndDE
          else
            summary = 'Ich kann dir nicht sagen wie das Wetter in ' + loc.results[0].formatted_address + ' ist, aber es sind '
          let text = summary + Math.round(data.currently.temperature) + " Grad."
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        })
      }, () => {
        voiceErrorDE()
      })
      renderer.showVoiceOverlay(false)
    },
    'Wie wird das Wetter nächste Woche': () => {
      getWeather((err, data) => {
        if (err)
          voiceErrorDE()
        else {
          let summary
          if (parseIcon[data.daily.data[7].icon])
            summary = parseIcon[data.daily.data[7].icon].textStartDE + 'nächste Woche' + parseIcon[data.daily.data[7].icon].textEndDE
          else
            summary = 'Ich kann dir nicht sagen wie das Wetter wird, aber es werden '
          let text = summary + Math.round(data.daily.data[7].temperatureMin) + ' bis ' + Math.round(data.daily.data[7].temperatureMax) + ' Grad.'
          responsiveVoice.speak(text, "Deutsch Female", {onend: () => {
            renderer.showVoiceOverlay(false)
          }})
        }
      })
    }
  })

}

const speech = require('../../speech/recognition')

module.exports = function (getWeather, loadWeather, parseIcon) {

  const voiceErrorEN = () => {
    responsiveVoice.speak("I'm sorry, there was an error.", 'UK English Male', {onend: () => {
      require('../../renderer').showVoiceOverlay(false)
    }})
  }

  speech.addCommands({
    "What's the weather (like)": () => {
      getWeather((err, data) => {
        if (err)
          voiceErrorEN()
        else {
          let text = 'The current weather condition is ' +
              data.currently.summary +
              ' at a temperature of ' +
              data.currently.temperature +
              ' degrees.'
          responsiveVoice.speak(text, "UK English Male", {onend: () => {
            require('../../renderer').showVoiceOverlay(false)
          }})
        }
      })
    }
  })

}

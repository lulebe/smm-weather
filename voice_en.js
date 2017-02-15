const speech = require('../../speech/recognition')
const speak = require('../../speech/speak').speak

module.exports = function (getWeather, loadWeather, parseIcon) {

  const voiceErrorEN = () => {
    speak("I'm sorry, there was an error.", 'EN', () => {
      require('../../renderer').showVoiceOverlay(false)
    })
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
              Math.round(data.currently.temperature) +
              ' degrees.'
          speak(text, 'EN', () => {
            require('../../renderer').showVoiceOverlay(false)
          })
        }
      })
    }
  })

}

const schedule = require('./schedule')

schedule
  .groups
  .lessons('ІС-41')
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.error(err)
  })

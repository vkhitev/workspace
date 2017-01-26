const days = require('./days')

// days
//   .getLessonsList('ІС-41')
//   .then((data) => {
//     console.log(data)
//   })

// days
//   .getLessonsTimetable('ІС-41')
//   .then((data) => {
//     console.log(data)
//   })

days
  .getLessonsDates('ІС-41', '13.02.2017', '18.06.2017', [{
    lessonWeek: 1,
    dayNumber: 5,
    lessonNumber: 3
  }, {
    lessonWeek: 2,
    dayNumber: 5,
    lessonNumber: 3
  }])
  .then((data) => {
    console.log(data)
  })

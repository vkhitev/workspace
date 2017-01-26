const moment = require('moment')
const R = require('ramda')
const schedule = require('./schedule')

moment.locale('ru')

function parseMoment (date) {
  if (typeof date === 'string') {
    return moment(date, 'DD.MM.YYYY')
  }
  if (date instanceof moment) {
    return date
  }
  throw new Error('Unexpected type of argument ' + date)
}

function parseTime (time) {
  return moment(time, 'hh:mm:ss')
}

function lessonDatesReducer (start, end, lessons) {
  return lessons.reduce((dates, lesson) => {
    const dayNumber = parseInt(lesson['day_number'], 10)
    const weekNumber = parseInt(lesson['lesson_week'], 10)
    const timeStart = parseTime(lesson['time_start'])
    const timeEnd = parseTime(lesson['time_end'])

    let m = moment(start)
    m.set('day', dayNumber)
    if (weekNumber === 2) {
      m.add(1, 'weeks')
    }
    if (dayNumber < start.get('day')) {
      m.add(2, 'weeks') // Test this
    }
    while (m <= end) {
      const s = moment(m)
      s.set('hour', timeStart.get('hour'))
      s.set('minute', timeStart.get('minute'))
      s.set('second', timeStart.get('second'))

      const e = moment(m)
      e.set('hour', timeEnd.get('hour'))
      e.set('minute', timeEnd.get('minute'))
      e.set('second', timeEnd.get('second'))

      dates.push({ start: s, end: e })

      m = m.add(2, 'weeks')
    }
    return dates
  }, [])
    .sort((a, b) => a.start - b.start)
}

const getLessonsList = R.pipe(
  R.map(R.prop('lesson_full_name')),
  R.uniq
)

const getLessonsTimetable = R.pipe(
  R.groupBy(R.prop(['lesson_full_name'])),
  R.map(R.project([
    'lesson_week',
    'day_number',
    'time_start',
    'time_end'
  ]))
)

const lessonDatesBetween = R.curry((start, end) =>
  R.pipe(
    getLessonsTimetable,
    R.map(R.partial(lessonDatesReducer, [start, end]))
  )
)

function getLessons (groupName, startDate, endDate) {
  const start = parseMoment(startDate)
  const end = parseMoment(endDate)
  const getLessonsDates = lessonDatesBetween(start, end)

  schedule
    .groups
    .lessons(groupName)
    .then((data) => {
      const lessonsList = getLessonsList(data)
      const timetable = getLessonsTimetable(data)
      getLessonsDates(data)['Економіка та бізнес.'].forEach((item) => {
        console.log(item.start.format('lll') + ' - ' + item.end.format('lll'))
      })
    })
    .catch((err) => {
      console.error(err)
    })
}

getLessons('ІС-41', '13.02.2017', '18.06.2017')

// schedule
//   .groups
//   .lessons('ІС-41')
//   .then((data) => {
//     console.log(data)
//   })
//   .catch((err) => {
//     console.error(err)
//   })

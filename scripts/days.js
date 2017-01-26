const moment = require('moment')
const R = require('ramda')

const schedule = require('./schedule')

function parseMoment (date, format = 'DD.MM.YYYY') {
  if (typeof date === 'string') {
    return moment(date, format)
  }
  if (date instanceof moment) {
    return date
  }
  throw new Error('Unexpected type of argument ' + date)
}

function parseTime (time, format = 'hh:mm:ss') {
  return moment(time, format)
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

function getListOfLessonDates (start, end, dates, lesson) {
  const dayNumber = parseInt(lesson['day_number'], 10)
  const weekNumber = parseInt(lesson['lesson_week'], 10)
  const timeStart = parseTime(lesson['time_start'], 'hh:mm:ss')
  const timeEnd = parseTime(lesson['time_end'], 'hh:mm:ss')

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
}

const lessonDatesBetween = R.curry((start, end) =>
  R.map(R.pipe(
    list => R.reduce(
      R.partial(
        getListOfLessonDates,
        [start, end]
      ), [], list
    ),
    R.sort((a, b) => a.start - b.start)
  ))
)

const program = (...list) =>
  (acc) =>
    R.flatten(list).reduce((acc, fn) => acc.then(fn), Promise.resolve(acc))

const transformScheduleData = (postFetch) =>
  program(schedule.groups.lessons, postFetch)

exports.getLessonsList = transformScheduleData(getLessonsList)
exports.getLessonsTimetable = transformScheduleData(getLessonsTimetable)

exports.getLessonsDates = function (groupName, startDate, endDate) {
  const getLessonsDates = R.pipe(
    getLessonsTimetable,
    lessonDatesBetween(
      parseMoment(startDate),
      parseMoment(endDate)
    )
  )
  return schedule.groups.lessons(groupName).then(getLessonsDates)
}

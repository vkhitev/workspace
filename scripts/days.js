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
    'lesson_number',
    'lesson_type'
  ]))
)

function getListOfLessons (start, end, dates, lesson) {
  const dayNumber = parseInt(lesson['day_number'], 10)
  const weekNumber = parseInt(lesson['lesson_week'], 10)
  const lessonNumber = parseInt(lesson['lesson_number'], 10)
  const lessonType = lesson['lesson_type']

  let m = moment(start)
  m.set('day', dayNumber)
  if (weekNumber === 2) {
    m.add(1, 'weeks')
  }
  if (dayNumber < start.get('day')) {
    m.add(2, 'weeks')
  }
  while (m <= end) {
    dates.push({
      lessonNumber,
      lessonType,
      date: moment(m)
    })
    m = m.add(2, 'weeks')
  }
  return dates
}

const lessonDatesBetween = R.curry((start, end) =>
  R.map(R.pipe(
    list => R.reduce(
      R.partial(
        getListOfLessons,
        [start, end]
      ), [], list
    ),
    R.sort((a, b) => a.date - b.date)
  ))
)

const filterNotVisited = R.curry((notVisited, currentLesson) => (
  notVisited.some(lesson => (
    lesson.lessonWeek !== parseInt(currentLesson['lesson_week'], 10) &&
    lesson.dayNumber !== parseInt(currentLesson['day_number'], 10) &&
    lesson.lessonNumber !== parseInt(currentLesson['lesson_number'], 10)
  ))
))

const getLessonsDates = R.curry((start, end, notVisited) =>
  R.pipe(
    getLessonsTimetable,
    R.unless(
      R.always(R.isEmpty(notVisited)),
      R.map(R.filter(filterNotVisited(notVisited)))
    ),
    lessonDatesBetween(
      parseMoment(start),
      parseMoment(end)
    )
  )
)

const program = (...list) =>
  (acc) =>
    R.flatten(list).reduce((acc, fn) =>
      acc.then(fn), Promise.resolve(acc))

const transformScheduleData = (postFetch) =>
  program(schedule.groups.lessons, postFetch)

exports.getLessonsList = transformScheduleData(getLessonsList)
exports.getLessonsTimetable = transformScheduleData(getLessonsTimetable)
exports.getLessonsDates = (groupName, startDate, endDate, notVisited = []) =>
  transformScheduleData(getLessonsDates(startDate, endDate, notVisited))(groupName)

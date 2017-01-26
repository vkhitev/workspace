const request = require('request')

function get (url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, res, body) => {
      if (err) {
        reject(err)
      }
      if (res.statusCode !== 200) {
        reject(res.statusMessage)
      }
      resolve(JSON.parse(body).data)
    })
  })
}

function objToQueryString (obj) {
  return '?' + Object.keys(obj).map((key) => (
    key + '=' + JSON.stringify(obj[key])
  )).join('&')
}

function constructURL (base, path, query) {
  let stringQuery = null
  if (query) {
    if (typeof query !== 'object') {
      throw new Error('Query must be an object: ' + query)
    }
    stringQuery = objToQueryString(query)
  }
  return encodeURI([base, path, stringQuery].join('/').replace(/([^:]\/)\/+/g, '$1'))
}

function getSchedule (path, query) {
  return get(constructURL('http://api.rozklad.org.ua/v2', path, query))
}

module.exports = {
  week: () => getSchedule('weeks'),
  teachers: {
    all: (query) => getSchedule('teachers', query),
    one: (teacherId, query) => getSchedule('teacher/' + teacherId, query),
    lessons: (teacherId, query) => getSchedule('teacher/' + teacherId + '/lessons', query)
  },
  groups: {
    all: (query) => getSchedule('groups', query),
    one: (groupId, query) => getSchedule('groups/' + groupId, query),
    lessons: (groupId, query) => getSchedule('groups/' + groupId + '/lessons', query),
    teachers: (groupId, query) => getSchedule('groups/' + groupId + '/teachers', query),
    timetable: (groupId, query) => getSchedule('groups/' + groupId + '/timetable', query)
  }
}

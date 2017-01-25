'use strict'
const Hapi = require('hapi')

const server = new Hapi.Server()

server.connection({
  host: 'localhost',
  port: 8000
})

server.route({
  method: 'GET',
  path: '/',
  handler: function (res, reply) {
    reply('Hello, world!')
  }
})

server.route({
  method: 'GET',
  path: '/{name}',
  handler: function (request, reply) {
    reply('Hello, ' + encodeURIComponent(request.params.name) + '!')
  }
})

server.register(require('inert'), (err) => {
  if (err) {
    throw err
  }
  server.route({
    method: 'GET',
    path: '/hello',
    handler: (request, reply) => {
      reply.file('./package.json')
    }
  })
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log('Server running at', server.info.uri)
})

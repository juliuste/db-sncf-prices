'use strict'

const so = require('so')

const SNCForDB = require('./sncf-or-db')
const withDB = require('./with-db')
const withSNCF = require('./with-sncf')
const query = require('./index')

const when = new Date('2017-01-08T10:00:00.000Z')



Promise.all([
	SNCForDB('Le Mans'),
	SNCForDB('Berlin'),
	// SNCForDB('Toulouse'),
	// SNCForDB('Paris'),
])
.then(so(function* ([from, to]) {
	console.log('DB only')
	console.log(yield withDB(from, to, when))
	console.log('SNCF only')
	console.log(yield withSNCF(from, to, when))

	return query(from, to, when)
}))
.then((routes) => {
	for (let route of routes) {
		console.log('----------------------------')
		console.log(route[0].from.name, '--->', route[1].to.name, 'via', route[0].to.name, 'for', route[0].price + route[1].price)
		for (let part of route) console.log(part)
	}
})
.catch(console.error)

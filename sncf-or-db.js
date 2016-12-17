'use strict'

const locations = require('db-hafas/lib/locations')
const places = require('sncf/places')

const networkOf = require('./network-of')

const DB = (name) =>
	locations(name, {
		results: 1,
		addresses: false,
		poi: false
	})
	.then((results) => {
		if (results.length === 0) throw new Error('No station found.')
		return results[0].id
	})

const SNCF = (name) =>
	places(name)
	.then((results) => {
		if (results.length === 0) throw new Error('No station found.')
		return results[0].id
	})

const both = (name) =>
	Promise.all([DB(name), SNCF(name)])
	.then(([db, sncf]) => {
		return networkOf(db)
		.then((network) => ({network, db, sncf}))
	})

module.exports = both

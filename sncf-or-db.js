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
		return {id: results[0].id, name: results[0].name}
	})

const SNCF = (name) =>
	places(name)
	.then((results) => {
		if (results.length === 0) throw new Error('No station found.')
		return {id: results[0].id, name: results[0].name}
	})

const both = (name) =>
	Promise.all([DB(name), SNCF(name)])
	.then(([db, sncf]) => {
		return networkOf(db.id)
		.then((network) => ({network, db: db.id, sncf: sncf.id, name: db.name || sncf.name}))
	})

module.exports = both

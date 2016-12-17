'use strict'

const db = require('db-prices')
// const db2 = require('db-hafas/lib/routes')

const parse = (d) => ({
	from: d.trips[0].from,
	to: d.trips[d.trips.length-1].to,
	departure: d.trips[0].start,
	arrival: d.trips[d.trips.length-1].end,
	price: parseFloat(d.offer.price)
})

const withDB = (from, to, when) =>
	// db2(from.db, to.db, {when: new Date(when)})
	db(from.db, to.db, new Date(when))
	.then((rs) => rs.map(parse))

module.exports = withDB

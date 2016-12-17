'use strict'

const sncf = require('sncf').routes

const parse = (s) => ({
	from: s.segments[0].from,
	to: s.segments[s.segments.length-1].to,
	departure: s.segments[0].departure,
	arrival: s.segments[s.segments.length-1].arrival,
	price: parseFloat(s.price)
})

const withSNCF = (from, to, when) =>
	sncf(from.sncf, to.sncf, new Date(when))
	.then((rs) => rs.map(parse))

module.exports = withSNCF

'use strict'

// const inside = require('@turf/inside')

// const germany = require('./germany.geo.json')

// const isPointInGermany = (lat, lon) => inside({
// 	type: 'Feature',
// 	geometry: {type: 'Point', coordinates: [lon, lat]},
// 	properties: {}
// }, germany)

// const networkOf = (s) => {
// }

// console.log('Berlin HBF', isPointInGermany(52.5, 13.4))
// console.log('Paris HBF', isPointInGermany(48.8, 2.3))

const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

const networkOf = (id) => new Promise((yay, nay) => {
	fs.createReadStream(path.join(__dirname, 'stations.csv'))
	.pipe(csv({separator: ';'}))
	.on('data', (s) => {
		if (s.sncf_id === id || +s.db_id === id)
			yay(s.country.toLowerCase() === 'fr' ? 'sncf' : 'db')
	})
	.on('end', () => nay(new Error('No station found')))
})

module.exports = networkOf

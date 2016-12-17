'use strict'

const equal = require('deep-eql')
const db = require('db-prices')
const sncf = require('sncf').routes
const filter = require('lodash.filter')
const sortBy = require('lodash.sortby')
const first = require('array-first')
const interchanges = require('./interchanges')

const changeTime = 60*60*1000

const parseDB = (d) => ({
	from: d.trips[0].from,
	to: d.trips[d.trips.length-1].to,
	departure: d.trips[0].start,
	arrival: d.trips[d.trips.length-1].end,
	price: d.offer.price
})

const parseSNCF = (s) => ({
	from: s.segments[0].from,
	to: s.segments[s.segments.length-1].to,
	departure: s.segments[0].departure,
	arrival: s.segments[s.segments.length-1].arrival,
	price: s.price
})

const pair = (connections1, connections2) => {
	const pairs = []
	for(let c1 of connections1){
		for(let c2 of connections2){
			pairs.push([c1, c2])
		}
	}
	return pairs
}

const changePossible = (pair, changeTime) => (+pair[0].arrival+changeTime <= +pair[1].departure)

const parseTuple = (tuple) => filter(pair(tuple[0], tuple[1]), (p) => changePossible(p, changeTime) && p[0].price && p[1].price)

const merge = (lists) => [].concat(...lists)

const main = (from, to, date, options) => {
	const tuples = []
	for(let interchange of interchanges){
		if(!equal(interchange, from) && !equal(interchange, to)){
			if(from.network==='sncf'){
				tuples.push(Promise.all([
					sncf(from.sncf, interchange.sncf, date).then((s) => s.map(parseSNCF)),
					db(interchange.db, to.db, date).then((d) => d.map(parseDB))
				]))
			}
			else if(from.network==='db'){
				tuples.push(Promise.all([
					db(from.db, interchange.db, date).then((d) => d.map(parseDB)),
					sncf(interchange.sncf, to.sncf, date).then((s) => s.map(parseSNCF))
				]))
			}
			else{
				throw new Error('Unsupported network: '+from.network)
			}
		}
	}

	return Promise.all(tuples)
	.then((tuples) => tuples.map(parseTuple))
	.then(merge)
	// .then((list) => sortBy(list, (pair) => +pair[0].price+pair[1].price))
	// .then((list) => first(list, 5))
}



main({ // Toulouse
	network: 'sncf', sncf: 'FRTLS', db: 8700065
}, { // Berlin
	network: 'db', sncf: 'DEHBF', db: 8096003
}, new Date((1496278800+60*60*7)*1000))
.then(console.log)
.catch(console.error)

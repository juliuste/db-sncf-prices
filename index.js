'use strict'

const filter = require('lodash.filter')
const sortBy = require('lodash.sortby')
const first = require('array-first')

const withDB = require('./with-db')
const withSNCF = require('./with-sncf')
const interchanges = require('./interchanges')

const changeTime = 60*60*1000



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

const query = (from, to, when) => {
	const tasks = []

	for (let interchange of interchanges) {
		if(interchange.db === from.db || interchange.sncf === from.sncf
		|| interchange.db === to.db || interchange.sncf === to.sncf) continue

		if (from.network === 'sncf') {
			tasks.push(Promise.all([
				withSNCF(from, interchange, when),
				withDB(interchange, to, when)
			]))
		} else if (from.network === 'db') {
			tasks.push(Promise.all([
				withDB(from, interchange, when),
				withSNCF(interchange, to, when)
			]))
		} else throw new Error('Unsupported network: '+from.network)
	}

	return Promise.all(tasks)
	.then((tuples) => tuples.map(parseTuple))
	.then(merge)
	.then((list) => sortBy(list, (pair) => pair[0].price + pair[1].price))
	.then((list) => first(list, 5))
}

module.exports = query

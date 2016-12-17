'use strict'

const query = require('./index')

query({ // Le Mans
	network: 'sncf', sncf: 'FRAET', db: 8700435
}, { // Berlin
	network: 'db', sncf: 'DEHBF', db: 8096003
}, new Date('2017-01-08T10:00:00.000Z'))
.then((routes) => {
	for (let route of routes) {
		console.log('----------------------------')
		console.log(route[0].from.name, '--->', route[1].to.name, 'via', route[0].to.name, 'for', route[0].price + route[1].price)
		for (let part of route) console.log(part)
	}
})
.catch(console.error)

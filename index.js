const express = require('express'),
	morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let topMovies = [
	{
		title: 'The Rock',
		director: 'Michael Bay',
		releaseYear: '1996',
	},
	{
		title: 'The Great Escape',
		director: 'John Sturges',
		releaseYear: '1963',
	},
	{
		title: 'Top Gun',
		director: 'Tony Scott',
		releaseYear: '1986',
	},
];

// GET Requests

app.get('/', (req, res) => {
	res.send(
		'Are you ready to have your mind BLOWN by some of the best action movies of all time?'
	);
});

app.get('/movies', (req, res) => {
	res.json(topMovies);
});

// STATIC

app.use(express.static('public'));

// Logging
app.listen(8080, () => {
	console.log('This app is listening on port 8080.');
});
// Error Handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).sned('You have a problem, friend');
});

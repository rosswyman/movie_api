const express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

let topMovies = [
	{
		title: 'The Rock',
		director: 'Michael Bay',
		description:
			'A mild-mannered chemist and an ex-con must lead the counterstrike when a rogue group of military men, led by a renegade general, threaten a nerve gas attack from Alcatraz against San Francisco.',
		imageURL: 'https://www.imdb.com/title/tt0117500/mediaviewer/rm2777683456/',
		genre: 'Action',
		isFeatured: 'Yes',
	},
	{
		title: 'The Great Escape',
		director: 'John Sturges',
		description:
			'Allied prisoners of war plan for several hundred of their number to escape from a German camp during World War II.',
		imageURL: 'https://www.imdb.com/title/tt0057115/mediaviewer/rm4173733632/',
		genre: 'Thriller',
		isFeatured: 'No',
	},
	{
		title: 'Top Gun',
		director: 'Tony Scott',
		description:
			"As students at the United States Navy's elite fighter weapons school compete to be best in the class, one daring young pilot learns a few things from a civilian instructor that are not taught in the classroom.",
		imageURL: 'https://www.imdb.com/title/tt0092099/mediaviewer/rm2145457920/',
		genre: 'Action',
		isFeatured: 'No',
	},
	{
		title: 'Die Hard',
		director: 'John McTiernan',
		description:
			'An NYPD officer tries to save his wife and several others taken hostage by German terrorists during a Christmas party at the Nakatomi Plaza in Los Angeles.',
		imageURL: 'https://www.imdb.com/title/tt0095016/mediaviewer/rm270892032/',
		genre: 'Action',
		isFeatured: 'No',
	},
	{
		title: 'Predator',
		director: 'John McTiernan',
		description:
			'A team of commandos on a mission in a Central American jungle find themselves hunted by an extraterrestrial warrior.',
		imageURL: 'https://www.imdb.com/title/tt0093773/mediaviewer/rm35588864/',
		genre: 'Action',
		isFeatured: 'No',
	},
];

let directors = [
	{
		name: 'Michael Bay',
		bio: 'Know and Michael "Boom-Boom" Bay...',
		birthYear: '1965',
		deathYear: 'NA',
	},
	{
		name: 'John Sturges',
		bio: 'Famous for his western movies...',
		birthYear: '1910',
		deathYear: '1992',
	},
];

let users = [];

// Requests

app.get('/', (req, res) => {
	res.send(
		'Are you ready to have your mind BLOWN by some of the best action movies of all time?'
	);
});

// Returns all movies

app.get('/movies', (req, res) => {
	res.json(topMovies);
});

// Returns information on a specific movie

app.get('/movies/:title', (req, res) => {
	res.json(
		topMovies.find((movie) => {
			return movie.title === req.params.title;
		})
	);
});

// // Returns a list of movies matching a specified genre

app.get('/movies/genres/:genre', (req, res) => {
	res.json(
		topMovies.filter((movie) => {
			return movie.genre === req.params.genre;
		})
	);
});

// Returns all directors

app.get('/directors', (req, res) => {
	res.json(directors);
});

// Returns details on a specific director

app.get('/directors/:name', (req, res) => {
	res.json(
		directors.find((director) => {
			return director.name === req.params.name;
		})
	);
});

// Get list of all users

app.get('/users', (req, res) => {
	res.json(users);
});

// Adds a new user

app.post('/users', (req, res) => {
	let newUser = req.body;

	if (!newUser.name || !newUser.email || !newUser.username) {
		const message = 'Missing name, email, or username in request body';
		res.status(400).send(message);
	} else {
		users.push(newUser);
		res.status(201).send('A new user has been created.');
	}
});

// Changes user name

app.put('/users/:name/:username', (req, res) => {
	let user = users.find((user) => {
		return user.name === req.params.name;
	});
	if (user) {
		user.username = req.params.username;
		res.send(
			'User with the name ' +
				req.params.name +
				' now has the username ' +
				req.params.username
		);
	} else {
		res
			.status(404)
			.send('User with the name ' + req.params.name + ' was not found');
	}
});

// Add movie to user's favorite list

app.put('/users/:name/favoriteList/:movie', (req, res) => {
	let favoriteList = [];
	let user = users.find((user) => {
		return user.name === req.params.name;
	});
	if (user) {
		res.send(
			'User with the name ' +
				req.params.name +
				' has added the movie ' +
				req.params.movie +
				' to his or her favorites list, but I do not know how to manage that list yet.'
		);
		console.log(favoriteList);
	} else {
		res
			.status(404)
			.send('User with the name ' + req.params.name + ' was not found');
	}
});

// Get user's favorite list

app.get('/users/:name/favoriteList/', (req, res) => {
	res.json(
		users.find((user) => {
			return user.name === req.params.name;
		})
	);
});

// Deletes a movie from favorites list

app.delete('/users/:name/favoriteList/:movie', (req, res) => {
	let user = users.find((user) => {
		return user.name === req.params.name;
	});

	if (user) {
		res
			.status(201)
			.send(
				'Movie title ' +
					req.params.movie +
					' was deleted from the favorite list.'
			);
	}
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
	res.status(500).send('You have a problem, friend');
});

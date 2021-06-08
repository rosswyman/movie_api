const express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Models = require('./models/models.js');

const app = express();
app.use(bodyParser.json());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

app.use(morgan('common'));

mongoose.connect('mongodb://localhost:27017/movieBoomDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

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
	Movies.find()
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Returns information on a specific movie

app.get('/movies/:Title', (req, res) => {
	Movies.findOne({ Title: req.params.Title })
		.then((movie) => {
			res.json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// // Returns a list of movies matching a specified genre

app.get('/movies/genres/:genre', (req, res) => {
	Movies.find({ 'Genre.Name': req.params.genre })
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Returns details on a specific director

app.get('/directors/:director', (req, res) => {
	Movies.findOne({ 'Director.Name': req.params.director })
		.then((director) => {
			res.status(201).json(director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Get list of all users

app.get('/users', (req, res) => {
	Users.find()
		.then((users) => {
			res.status(201).json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Adds a new user

/* User to be submitted in JSON format
{
	ID: Integer,
	Username: String,
	Password: String,
	Email: String,
	Birthday: Date
  }*/

app.post('/users', (req, res) => {
	Users.findOne({ Username: req.body.Username })
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + ' already exists');
			} else {
				Users.create({
					Username: req.body.Username,
					Password: req.body.Password,
					Email: req.body.Email,
					Birthday: req.body.Birthday,
				})
					.then((user) => {
						res.status(201).json(user);
					})
					.catch((error) => {
						console.error(error);
						res.status(500).send('Error: ' + error);
					});
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Get details on user by username

app.get('/users/:Username', (req, res) => {
	Users.findOne({ Username: req.params.Username })
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Deletes a user

app.delete('/users/:Username', (req, res) => {
	Users.findOneAndRemove({ Username: req.params.Username })
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.Username + ' was not found');
			} else {
				res.status(200).send(req.params.Username + ' was deleted.');
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Changes user info

/* User to be submitted in JSON format
{
	Username: String, (required)
	Password: String, (required)
	Email: String, (required)
	Birthday: Date
  }*/

app.put('/users/:Username', (req, res) => {
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$set: {
				Username: req.body.Username,
				Password: req.body.Password,
				Email: req.body.Email,
				Birthday: req.body.Birthday,
			},
		},
		{ new: true }, // This line makes sure that the updated document is returned
		(err, updatedUser) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else {
				res.json(updatedUser);
			}
		}
	);
});

// Add movie to user's favorite list

app.post('/users/:Username/Movies/:MovieID', (req, res) => {
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$push: { FavoriteMovies: req.params.MovieID },
		},
		{ new: true }, // This line makes sure that the updated document is returned
		(err, updatedUser) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else {
				// res.json(updatedUser);
				res.send('Movie added to favorites.');
			}
		}
	);
});

// Deletes a movie from favorites list

app.post('/users/:Username/Movies/remove/:MovieID', (req, res) => {
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$pull: { FavoriteMovies: req.params.MovieID },
		},
		{ new: true }, // This line makes sure that the updated document is returned
		(err, updatedUser) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else {
				// res.json(updatedUser);
				res.send('Movie was removed from favorites list.');
			}
		}
	);
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

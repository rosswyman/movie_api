const express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Models = require('./models/models.js'),
	Movies = Models.Movie,
	Users = Models.User,
	cors = require('cors'),
	passport = require('passport');

const { check, validationResult } = require('express-validator');
require('./passport');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // This would allow requests from all domains
let auth = require('./auth')(app);
app.use(morgan('common'));
// mongoose.connect('mongodb://localhost:27017/movieBoomDB', {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });
mongoose.connect(process.env.CONNECTION_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Requests

// app.all('/', function (req, res, next) {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
// 	next();
// });

app.get('/', (req, res) => {
	res.send(
		'Are you ready to have your mind BLOWN by some of the best action movies of all time?'
	);
});

/**
 * Returns all movies
 * @method get
 * @param {string} endpoint Endpoint to fetch all movies details: url/movies
 * @returns {json} A JSON object holding information about all the movies in the database
 */

app.get(
	'/movies',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');

		Movies.find()
			.then((movies) => {
				res.status(201).json(movies);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);
// 2021_0629 - Replaced above request with this one temporarily to work on front-end client
// BEGIN TEMPORARY NEW REQUEST
// app.get('/movies', function (req, res) {
// 	Movies.find()
// 		.then(function (movies) {
// 			res.status(201).json(movies);
// 		})
// 		.catch(function (error) {
// 			console.error(error);
// 			res.status(500).send('Error: ' + error);
// 		});
// });
// END TEMPORARY NEW REQUEST

/**
 * Returns a specific movie
 * @method get
 * @param {string} endpoint Endpoint to fetch single movie details: url/movies/[TITLE]
 * @param {string} title Title of movie to get more information on
 * @returns {json} 	A JSON object holding information about a single movie, containing description, genre, director, image URL, whether it???s featured or not
 */

app.get(
	'/movies/:Title',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ Title: req.params.Title })
			.then((movie) => {
				res.json(movie);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/**
 * Returns information about a given genre
 * @method get
 * @param {string} endpoint Endpoint to fetch information about a given genre: url/movies/genres/[GENRE]
 * @param {string} genre Name of movie genre
 * @returns {json} 	A JSON object holding information about the specified genre
 */

app.get(
	'/movies/genres/:genre',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.find({ 'Genre.Name': req.params.genre })
			.then((movies) => {
				res.status(201).json(movies);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

/**
 * Returns information about a given director
 * @method get
 * @param {string} endpoint Endpoint to fetch information about a given director: url/directors/[DIRECTOR]
 * @param {string} director Name of director
 * @returns {json} 		A JSON object holding information about a specified director
 */

app.get(
	'/directors/:director',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		Movies.findOne({ 'Director.Name': req.params.director })
			.then((director) => {
				res.status(201).json(director);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

// Get list of all users - for use in testing/debugging
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

/**
 * Allow users to register
 * @method post
 * @param {string} endpoint Endpoint to register new user: url/users
 * @param {json} userinfo A JSON object holding data about the user, structured like (NOTE CAPITALIZATION):
 * {
 * "Username": "theGreatGomez",
 * "Password": "abc123",
 * "Email": "pgomez@gmail.com",
 * "Birthday": "01/02/03",
 * }
 * @returns {string} A text message confirming the user's new account details
 */

app.post(
	'/users',
	[
		check('Username', 'Username is required').isLength({ min: 5 }),
		check(
			'Username',
			'Username contains non alphanumeric characrers - that is not allowed.'
		).isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	(req, res) => {
		// check the validation object for errors
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOne({ Username: req.body.Username })
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.Username + ' already exists');
				} else {
					Users.create({
						Username: req.body.Username,
						Password: hashedPassword,
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
	}
);

/**
 * Gets details on user by username
 * @method get
 * @param {string} endpoint Endpoint to fetch information about a given user: url/users/[USERNAME]
 * @returns {json} 		A JSON object holding information about the user
 */

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

/**
 * Deletes a user by username
 * @method delete
 * @param {string} endpoint Endpoint to fetch information about a given director: url/users/[USERNAME]
 * @param {string} username Username of user to be deleted
 * @returns {json} 		A JSON object holding information about the user
 */

app.delete(
	'/users/:Username',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

/**
 * Allow users to register
 * @method put
 * @param {string} endpoint Endpoint to register new user: url/users/[USERNAME]
 * @param {json} userinfo A JSON object holding data about the user, structured like (NOTE CAPITALIZATION):
 * {
 * "Username": "theGreatGomez",
 * "Password": "abc123",
 * "Email": "pgomez@gmail.com",
 * "Birthday": "01/02/03",
 * }
 * @returns {string} A text message confirming the user's account has been updated
 */

app.put(
	'/users/:Username',
	[
		check('Username', 'Username is required').isLength({ min: 5 }),
		check(
			'Username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid').isEmail(),
	],
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		// check the validation object for errors
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		let hashedPassword = Users.hashPassword(req.body.Password);
		Users.findOneAndUpdate(
			{ Username: req.params.Username },
			{
				$set: {
					Username: req.body.Username,
					Password: hashedPassword,
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
	}
);

/**
 * Adds a movie to a user's favorite list
 * @method post
 * @param {string} endpoint Endpoint to register new user: url/users/[USERNAME]/movies/[MovieID]
 * @param {string} username User modifying favorite list
 * @param {string} movieID Movie to add to favorite list
 * @returns {string} A text message confirming the movie has been added to the user's favorite list
 */

app.post(
	'/users/:Username/Movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

/**
 * Removes a movie to a user's favorite list
 * @method post
 * @param {string} endpoint Endpoint to register new user: url/users/[USERNAME]/Movies/remove/[MovieID]
 * @param {string} username User modifying favorite list
 * @param {string} movieID Movie to remove from favorite list
 * @returns {string} A text message confirming the movie has been removed from the user's favorite list
 */

app.post(
	'/users/:Username/Movies/remove/:MovieID',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

// STATIC
app.use(express.static('public'));

// Logging
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});

// Error Handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('You have a problem, friend');
});

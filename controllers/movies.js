const Movie = require('../models/movie');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    // Чтобы получить всю информацию об авторе фильма,
    // нужно вызвать метод populate, передав ему имя поля 'owner'
    .populate('owner')
    .then((movies) => {
      const userMovies = movies.filter(
        (movie) => movie.owner.id === req.user._id,
      );
      res.send({ data: userMovies });
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  // в модели фильма есть поле owner, в котором
  // должен быть идентификатор фильма пользователя - ownerId
  // Теперь этот идентификатор нужно записывать в поле owner
  // при создании нового фильма
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => Movie.findById(movie._id).populate('owner'))
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные фильма'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм с таким id не найден'));
      }
      if (movie.owner.toString() !== req.user._id) {
        return next(
          new ForbiddenError('Вы не можете удалить фильм, добавленный другим пользователем'),
        );
      }
      return Movie.findByIdAndDelete(req.params.movieId).then(() => res.send({ data: movie }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Некорректно введены данные фильма'));
      }
      return next(err);
    });
};

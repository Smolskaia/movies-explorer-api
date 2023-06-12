const movieRouter = require('express').Router();
// подключаем контроллеры
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
// подключаем валидацию
const {
  validationCreateMovie,
  validationMovieId,
} = require('../utils/validation');

movieRouter.get('/', getMovies); // возвращает все сохранённые текущим пользователем фильмы
movieRouter.post('/', validationCreateMovie, createMovie); // создаёт фильм
movieRouter.delete('/:movieId', validationMovieId, deleteMovie); // удаляет сохранённый фильм по id

module.exports = movieRouter;

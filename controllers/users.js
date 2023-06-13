const bcrypt = require('bcryptjs'); // импортируем bcrypt для хеширования пароля
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const BadRequestError = require('../errors/badRequestError');
const ConflictError = require('../errors/conflictError');
const { JWT_SECRET } = require('../config');

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      // метод модели create принимает
      // на вход объект с данными, которые нужно записать в базу
      User.create({
        name, email, password: hash,
      })
      /* Метод create может быть промисом —
      ему можно добавить обработчики then и catch, чтобы
      вернуть клиенту данные или ошибку */

      // вернём записанные в базу данные
        .then((user) => res.status(201).send({
          data: {
            name: user.name,
            email: user.email,
          },
        }))// если данные не записались
        .catch((err) => {
          if (err.code === 11000) {
            return next(new ConflictError('Этот пользователь уже зарегистрирован'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Некорректные данные пользователя'));
          }
          return next(err);
        });
    });
};

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с таким id не найден'));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Некорректные данные пользователя'));
      }
      return next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError('Пользователь с таким id не найден'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
    // аутентификация успешна! пользователь в переменной user
    // создадим токен сроком на неделю.
    // В пейлоуд токена записываем только свойство _id,
    // которое содержит идентификатор пользователя
      const token = jwt.sign({ _id: user._id }, process.env.NODE_ENV !== 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token }); // отправка токена в теле ответа
    })
    .catch(next);
};

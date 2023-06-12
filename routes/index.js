const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const { validationSignin, validationSignup } = require('../utils/validation');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/notFoundError');

const userRouter = require('./users');
const movieRouter = require('./movies');

// сначала вызовется auth, а затем,
// если авторизация успешна, createCard или userRouter
// т е роуты защищены авторизацией
router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.post('/signin', validationSignin, login);
router.post('/signup', validationSignup, createUser);

router.use('/*', auth, (req, res, next) => {
  next(new NotFoundError('404: Страница не найдена'));
});

module.exports = router;

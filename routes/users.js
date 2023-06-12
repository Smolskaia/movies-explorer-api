const userRouter = require('express').Router();
// подключаем контроллеры
const {
  getUser,
  updateProfile,
} = require('../controllers/users');
// подключаем валидацию
const {
  validationUpdateProfile
} = require('../utils/validation');

userRouter.get('/me', getUser); // возвращает информацию о текущем пользователе (email и имя)
userRouter.patch('/me', validationUpdateProfile, updateProfile); // обновляет информацию о пользователе (email и имя)

module.exports = userRouter;

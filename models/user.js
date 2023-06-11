const mongoose = require('mongoose');
const validator = require('validator');


// Опишем схему:
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // Так по умолчанию хеш пароля пользователя не будет возвращаться из базы
  },
}, { versionKey: false });

// добавим метод findUserByCredentials схеме пользователя
// у него будет два параметра — почта и пароль
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }) // this — это модель User
    .select('+password')
    .then((user) => {
      // получаем объект пользователя, если почта и пароль подошли
      // не нашёлся — отклоняем промис
      if (!user) {
        return Promise.reject(
          new UnauthorizedError('Incorrect email or password'),
        );
      }
      // нашёлся — сравниваем хеши
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // отклоняем промис
            return Promise.reject(
              new UnauthorizedError('Incorrect email or password'),
            );
          }
          return user;
        });
    });
};

// создаём модель и экспортируем её
// передаем методу mongoose.model два аргумента:
// имя модели и схему
module.exports = mongoose.model('user', userSchema);
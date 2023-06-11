const express = require('express');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

// создаем инстанс сервера
const app = express();



// запускаем сервер на порте 300
app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
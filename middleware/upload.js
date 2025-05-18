const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Проверяем и создаем директории для загрузки
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища для multer - сохраняем файлы на диск
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Директория для сохранения файлов
  },
  filename: function (req, file, cb) {
    // Создаем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  // Принимаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения!'), false);
  }
};

// Настройка загрузки
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware для загрузки аватара пользователя
const uploadUserAvatar = upload.single('avatar');

// Middleware для загрузки обложки игры
const uploadGameCover = upload.single('cover_image');

module.exports = {
  uploadUserAvatar,
  uploadGameCover
}; 
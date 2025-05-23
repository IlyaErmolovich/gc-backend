const Game = require('../models/game');
const fs = require('fs');
const path = require('path');

// Получение всех игр с фильтрацией
exports.getAllGames = async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      genre: req.query.genre,
      platform: req.query.platform,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };

    const games = await Game.getAll(filters);
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение игры по ID
exports.getGameById = async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.getById(gameId);
    
    res.json(game);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Создание новой игры (только для админов)
exports.createGame = async (req, res) => {
  try {
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    // Проверка наличия обязательных полей
    if (!title || !developer || !publisher || !release_date) {
      return res.status(400).json({ message: 'Необходимо указать название, разработчика, издателя и дату выхода' });
    }

    let cover_image = null;
    
    // Проверка на наличие файла
    if (req.file) {
      // Если файл загружен, сохраняем путь к нему
      cover_image = `/uploads/${req.file.filename}`;
      console.log('Файл загружен на сервер:', cover_image);
    } else {
      return res.status(400).json({ message: 'Обложка игры обязательна' });
    }

    // Преобразуем строки в массивы, если они пришли в виде строк
    const gameGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const gamePlatforms = typeof platforms === 'string' ? platforms.split(',') : platforms;

    // Создаем игру
    const game = await Game.create({
      title,
      developer,
      publisher,
      release_date,
      cover_image,
      genres: gameGenres,
      platforms: gamePlatforms
    });
    
    res.status(201).json({
      message: 'Игра успешно создана',
      game
    });
  } catch (error) {
    console.error('Ошибка при создании игры:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновление игры (только для админов)
exports.updateGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    // Получаем текущие данные игры
    const currentGame = await Game.getById(gameId);
    let cover_image = currentGame.cover_image; // Сохраняем текущую обложку
    
    // Если загружена новая обложка
    if (req.file) {
      cover_image = `/uploads/${req.file.filename}`;
      console.log('Новый файл загружен на сервер:', cover_image);
    }

    // Преобразуем строки в массивы, если они пришли в виде строк
    const gameGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const gamePlatforms = typeof platforms === 'string' ? platforms.split(',') : platforms;

    // Обновляем игру
    const game = await Game.update(gameId, {
      title,
      developer,
      publisher,
      release_date,
      cover_image,
      genres: gameGenres,
      platforms: gamePlatforms
    });
    
    res.json({
      message: 'Игра успешно обновлена',
      game
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление игры (только для админов)
exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // Получаем игру, чтобы удалить файл обложки
    const game = await Game.getById(gameId);
    
    // Удаляем игру из базы данных
    await Game.delete(gameId);
    
    // Если у игры была обложка, удаляем файл
    if (game.cover_image) {
      const coverPath = path.join(__dirname, '..', game.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    res.json({ message: 'Игра успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение всех жанров
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Game.getAllGenres();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение всех платформ
exports.getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Game.getAllPlatforms();
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение обложки игры
exports.getGameCover = async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.getById(gameId);
    
    if (!game || !game.cover_image) {
      return res.status(404).json({ message: 'Обложка не найдена' });
    }
    
    // Проверяем путь к файлу
    const coverPath = path.join(__dirname, '..', game.cover_image);
    
    if (fs.existsSync(coverPath)) {
      // Если файл существует, отправляем его
      res.sendFile(coverPath);
    } else {
      // Если файла нет, возвращаем 404
      res.status(404).json({ message: 'Файл обложки не найден' });
    }
  } catch (error) {
    console.error('Ошибка получения обложки:', error);
    res.status(500).json({ message: error.message });
  }
}; 
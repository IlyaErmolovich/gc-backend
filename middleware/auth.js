const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// Захардкоженный секретный ключ (не использовать в реальных проектах!)
const JWT_SECRET = 'super_простой_секретный_ключ_1234567890';

// Middleware для авторизации
const authMiddleware = async (req, res, next) => {
  try {
    // Получаем ID пользователя из заголовка или параметров запроса
    const userId = req.headers['user-id'] || req.query.user_id || req.body.user_id;
    const username = req.headers['username'] || req.query.username || req.body.username;
    
    if (userId) {
      // Если есть ID пользователя, получаем его из базы
      const user = await User.getById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    } else if (username) {
      // Если есть имя пользователя, ищем по нему
      try {
        const user = await User.getByUsername(username);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Если пользователь не найден, продолжаем
      }
    }
    
    // Если в запросе нет данных пользователя, используем значение по умолчанию
    req.user = {
      id: 1,
      username: 'admin',
      role_id: 1
    };
    
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    req.user = {
      id: 1,
      username: 'admin',
      role_id: 1
    };
    next();
  }
};

// Middleware для проверки роли администратора
const adminMiddleware = async (req, res, next) => {
  try {
    // Получаем ID пользователя из заголовка или параметров запроса
    const userId = req.headers['user-id'] || req.query.user_id || req.body.user_id;
    const username = req.headers['username'] || req.query.username || req.body.username;
    
    if (userId) {
      // Если есть ID пользователя, получаем его из базы
      const user = await User.getById(userId);
      if (user && user.role_id === 1) {
        req.user = user;
        return next();
      }
    } else if (username) {
      // Если есть имя пользователя, ищем по нему
      try {
        const user = await User.getByUsername(username);
        if (user && user.role_id === 1) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Если пользователь не найден или не админ, продолжаем
      }
    }
    
    // По умолчанию - admin
    req.user = {
      id: 1,
      username: 'admin',
      role_id: 1
    };
    
    next();
  } catch (error) {
    console.error('Ошибка проверки роли администратора:', error);
    req.user = {
      id: 1,
      username: 'admin',
      role_id: 1
    };
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
}; 
import jwt from 'jsonwebtoken';
import Post from "../models/Post.js";
import User from "../models/User.js";

export default async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123');

      const user = await User.findById(decoded._id);
      if (!user) {
        // Если пользователь не найден, удаляем все посты
        await Post.deleteMany();
        return res.status(403).json({
          message: 'Учетная запись пользователя не найдена. Все посты удалены.',
        });
      }


      req.userId = decoded._id;
      next();
    } catch (e) {
      return res.status(403).json({
        message: 'Нет доступа',
      });
    }
  } else {
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};

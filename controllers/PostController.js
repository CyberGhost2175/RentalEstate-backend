import PostModel from '../models/Post.js';
import Post from "../models/Post.js";



export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};


export const getByType= async (req, res) => {
  try {
    const { typeOfProperty } = req.query;
    const posts = await Post.find({ typeOfProperty });
    res.json(posts);
  } catch (error) {
    console.error('Не удалось вернуть статью по типу недвижемости ', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const create = async (req, res) => {
  try {
    console.log('Received post data:', req.body);
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      typeOfPost: req.body.typeOfPost,
      typeOfProperty: req.body.typeOfProperty,
      user: req.userId,
      countOfRooms: req.body.countOfRooms,
      yearOfConstruction: req.body.yearOfConstruction,
      totalArea: req.body.totalArea,
      price: req.body.price,
    });

    console.log('Created document:', doc);
    const post = await doc.save();
    console.log('Saved post:', post);

    res.json(post);
  } catch (err) {
    console.log('Error creating post:', err);
    res.status(500).json({
      message: 'Не удалось создать статью',
      error: err.message
    });
  }
};
export  const getByUserId=async (req, res) => {
  const userId = req.params.id; // Получаем id текущего авторизованного пользователя
  try {
    const posts = await Post.find({ user: userId });
    res.json(posts);
  } catch (error) {
    console.error('Ошибка при получении постов пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении постов пользователя' });
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        countOfRooms:req.body.countOfRooms,
        yearOfConstruction:req.body.yearOfConstruction,
        typeOfPost:req.body.typeOfPost,
        typeOfProperty:req.body.typeOfProperty,
        totalArea:req.body.totalArea,
        price:req.body.price,
        user: req.userId,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};


export const like = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    post.likesCount += 1;
    await post.save();

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось поставить лайк',
    });
  }
};

import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';


import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';
import User from "./models/User.js";
import Post from "./models/Post.js";
import {sendRegistrationEmail} from "./mailer.js";

mongoose
  .connect('mongodb+srv://Dev:Dev2175@cluster1.yvcic9w.mongodb.net/RentalEstate?retryWrites=true&w=majority\n' +
      'JW')
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const userCount = await User.countDocuments();
if (userCount === 0) {
  // Если нет ни одного пользователя, удаляем все посты
  await Post.deleteMany();
  console.log('All posts deleted');
}

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post('/upload-avatar', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
app.get(
    '/users/me',
    checkAuth,
    handleValidationErrors,
    UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts/:id/like', checkAuth, PostController.like);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);

app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);


app.patch('/users/me', checkAuth, async (req, res) => {
  const { fullName, email, phoneNumber } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { fullName, email, phoneNumber },
        { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля пользователя' });
  }
});



app.post('/send-registration-email', async (req, res) => {
  const { email } = req.body;
try{

  res.json({ message: 'Письмо отправлено на указанный адрес' });
}catch (err){
  console.error('Ошибка при отправке письма на почту:', err);
  res.status(500).json({ message: 'Ошибка при отправке письма' });
}

});




app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});

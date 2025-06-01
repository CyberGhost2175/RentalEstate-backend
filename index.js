import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';
import User from "./models/User.js";
import Post from "./models/Post.js";
import {sendRegistrationEmail} from "./mailer.js";
//коментарий для проверки
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // CPU, память, uptime и др.


const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Длительность HTTP-запроса в секундах',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 5] // Варианты длительности
});

// Middleware для мониторинга
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.route?.path || req.path, code: res.statusCode, method: req.method });
  });
  next();
});

// Отдаем метрики на /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});






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

// Function to create default images
const createDefaultImages = async () => {
  const defaultImages = [
    { name: 'apartment1.jpg', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' },
    { name: 'penthouse1.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c' },
    { name: 'house1.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' },
    { name: 'default-avatar.jpg', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }
  ];

  for (const image of defaultImages) {
    const imagePath = `uploads/${image.name}`;
    if (!fs.existsSync(imagePath)) {
      try {
        const response = await fetch(image.url);
        const buffer = await response.buffer();
        fs.writeFileSync(imagePath, buffer);
        console.log(`Created default image: ${image.name}`);
      } catch (error) {
        console.error(`Error creating default image ${image.name}:`, error);
      }
    }
  }
};

const upload = multer({ storage });

const userCount = await User.countDocuments();
if (userCount === 0) {
  // Create default images first
  await createDefaultImages();
  
  // Create a mock user first
  const mockUser = new User({
    fullName: 'Demo User',
    email: 'demo@example.com',
    phoneNumber: '+1234567890',
    passwordHash: 'mockpassword',
    imageUrl: '/uploads/default-avatar.jpg'
  });
  await mockUser.save();
  console.log('Mock user created');

  // Create mock posts
  const mockPosts = [
    {
      title: 'Modern Apartment in City Center',
      text: 'Beautiful modern apartment located in the heart of the city. Recently renovated with high-quality materials. Features include a fully equipped kitchen, spacious living room, and a cozy bedroom.',
      typeOfPost: 'Sale',
      typeOfProperty: 'Flat',
      viewsCount: 0,
      price: 250000,
      countOfRooms: 2,
      yearOfConstruction: 2015,
      totalArea: 75,
      likesCount: 0,
      user: mockUser._id,
      imageUrl: '/uploads/apartment1.jpg'
    },
    {
      title: 'Luxury Penthouse with Sea View',
      text: 'Stunning penthouse with panoramic sea views. Features include a private terrace, modern appliances, and premium finishes throughout. Perfect for those seeking luxury living.',
      typeOfPost: 'Rent',
      typeOfProperty: 'Penthouse',
      viewsCount: 0,
      price: 5000,
      countOfRooms: 3,
      yearOfConstruction: 2020,
      totalArea: 150,
      likesCount: 0,
      user: mockUser._id,
      imageUrl: '/uploads/penthouse1.jpg'
    },
    {
      title: 'Family House with Garden',
      text: 'Spacious family house with a beautiful garden. Located in a quiet neighborhood. Features include a large kitchen, multiple bedrooms, and a backyard perfect for family gatherings.',
      typeOfPost: 'Sale',
      typeOfProperty: 'House',
      viewsCount: 0,
      price: 450000,
      countOfRooms: 4,
      yearOfConstruction: 2018,
      totalArea: 200,
      likesCount: 0,
      user: mockUser._id,
      imageUrl: '/uploads/house1.jpg'
    }
  ];

  await Post.insertMany(mockPosts);
  console.log('Mock posts created');
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
app.post('/send-registration-gmail', async (req, res) => {
  const { gmail } = req.body;
  try{

    res.json({ message: 'Письмо отправлено на указанный адрес g-mail' });
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

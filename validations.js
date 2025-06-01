import {body} from 'express-validator';

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
];

export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('phoneNumber', 'Неверный формат номера').isMobilePhone(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min: 5}),
    body('fullName', 'Укажите имя').isLength({min: 3}),
    body('imageUrl', 'Укажите аватар').optional().isString(),

];

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({min: 3}).isString(),
    body('text', 'Введите текст статьи').isLength({min: 3}).isString(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
    body('typeOfPost', 'указан неверный тип обьявления').optional().isString(),
    body('typeOfProperty', 'указан неверный тип собственности').optional().isString(),
    body('totalArea', 'указана неверная площадь').optional().isNumeric(),
    body('countOfRooms', 'указано неверное кол-во комнат').optional().isNumeric(),
    body('price', 'указана неверное цена').optional().isNumeric(),
    body('yearOfConstruction', 'указан неверный год постройки').optional().isNumeric(),



];

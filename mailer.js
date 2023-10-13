import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // Настройки SMTP-сервера для отправки писем
    // Укажите соответствующие данные для вашего SMTP-сервера
    host: 'smtp.mail.ru',
    port: 465 ,
    secure: true,
    auth: {
        user: 'asanali.itstep@mail.ru',
        pass: 'mZccNhHb9qY5gSZKT9iQ', //DevProgrammer200
    },
});

export const sendRegistrationEmail = async (email) => {
    try {
        const mailOptions = {
            from: 'asanali.itstep@mail.ru',
            to: email,
            subject: 'Регистрация на сайте Rental Estate',
            text: 'Добро пожаловать на  Rental Estate!',

            html: '<h1>Добро пожаловать на наш сайт!</h1>,' +
                '<h1>Спасибо что выбрали нашу компанию!</h1>',
        };

        await transporter.sendMail(mailOptions);
        console.log('Регистрационное письмо отправлено успешно');
    } catch (error) {
        console.error('Ошибка при отправке регистрационного письма:', error);
    }
};

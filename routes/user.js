const express = require('express')
const { check } = require('express-validator')
const User = require('../controllers/user')
const router = express()

const userTag = require('./userTag')

router.get('/', User.get)
router.put('/', [
    check('password', 'Пароль не может быть короче 8 символов').isLength({ min: 8, max: 100 }),
    check('password', 'Пароль должен состоять хотя бы из одной заглавной и строчной буквы, одной цифры.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
    check('email', 'Проверьте валидность указанной почты').isEmail(),
    check('nickname', 'Укажите свой ник').notEmpty()
], User.put)
router.delete('/', User.delete)

router.use('/tag', userTag)

module.exports = router
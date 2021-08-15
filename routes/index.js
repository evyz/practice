const express = require('express')
const router = express()

const { MainPage, SignIn, Login, RefreshToken } = require('../controllers')
const { check } = require('express-validator')

const authorization = require('../middleware/authorization')

const user = require('./user')
const tag = require('./tag')

router.get('/', MainPage)
router.post('/signin', [
    check('password', 'Пароль не может быть короче 8 символов').isLength({ min: 8, max: 100 }),
    check('password', 'Пароль должен состоять хотя бы из одной заглавной и строчной буквы, одной цифры.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
    check('email', 'Проверьте валидность указанной почты').isEmail(),
    check('nickname', 'Укажите свой ник').notEmpty()
], SignIn)
router.post('/login', Login)
router.post('/refresh', authorization, RefreshToken)

router.use('/user', authorization, user)
router.use('/tag', authorization, tag)


module.exports = router
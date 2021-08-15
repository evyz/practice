const db = require('../models/db')
const uuid = require('uuid')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

const ApiError = require('../error/ApiError')
const { generateJwt, decodeJwt } = require('../service/user-token')

class MainController {
    async MainPage(req, res, next) {
        return res.json("Main Page")
    }

    async SignIn(req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Error", errors })
        }
        const { email, password, nickname } = req.body

        const check = await db.query('SELECT * FROM "user" WHERE email = ($1)', [email])
        if (check.rows.length >= 1) {
            return res.json('Упс)')
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const id = uuid.v1()

        const create = await db.query('INSERT INTO "user" (uid,email,password,nickname) values($1,$2,$3,$4)', [id, email, hashPassword, nickname])

        const token = generateJwt(id, email)
        const info = decodeJwt(token)
        const expiresIn = info.exp

        return res.json({ token, expiresIn })
    }

    async Login(req, res, next) {
        const { email, password } = req.body

        const check = await db.query('SELECT * FROM "user" WHERE email = ($1)', [email])

        if (check.rows <= 0) {
            return next(ApiError.forbidden('Пользователя с данной почтой не существует'))
        }

        const syncPassword = bcrypt.compareSync(password, check.rows[0].password)
        if (!syncPassword) {
            return next(ApiError.forbidden('Неверный пароль'))
        }

        const token = generateJwt(check.rows[0].uid, check.rows[0].email)
        const info = decodeJwt(token)
        const expiresIn = info.exp

        return res.json({ token, expiresIn })
    }

    async RefreshToken(req, res, next) {
        const uid = req.user.uid

        const user = await db.query('SELECT * FROM "user" WHERE uid = ($1)', [uid])

        const token = generateJwt(user.rows[0].uid, user.rows[0].email)

        const info = decodeJwt(token)
        const expiresIn = info.exp

        return res.json({ token, expiresIn })
    }

}

module.exports = new MainController()
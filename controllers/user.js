const { validationResult } = require('express-validator');
const ApiError = require('../error/ApiError');
const db = require('../models/db')
const bcrypt = require('bcrypt');
const { generateJwt, decodeJwt } = require('../service/user-token');

class User {
    async get(req, res, next) {
        const uid = req.user.uid

        let user = await db.query('SELECT email, nickname, "tag".id, name, sortorder FROM "userTag" INNER JOIN "user" ON "user".uid = userId INNER JOIN "tag" ON "tag".id = tagId WHERE uid = ($1)', [uid])

        let email, nickname;

        if (user.rows.length == 0) {
            user = await db.query('SELECT  * FROM "user" where uid = ($1)', [uid])
            if (user.rows.length == 0) {
                return next(ApiError.badRequest('Данного пользователя не существует'))
            }
            email = user.rows[0].email;
            nickname = user.rows[0].nickname;
            let tags = 'Tags in not empty.';
            return res.json({ email, nickname, tags })
        }

        email = user.rows[0].email;
        nickname = user.rows[0].nickname;
        let tags = [];

        for (let i = 0; i < user.rows.length; i++) {
            let obj = {
                "id": user.rows[i].id,
                "name": user.rows[i].name,
                "sortOrder": user.rows[i].sortorder
            };
            tags.push(obj)
        }

        return res.json({ email, nickname, tags })
    }

    async put(req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Error", errors })
        }

        const userEmail = req.user.email

        const { email, password, nickname } = req.body

        const checkEmail = await db.query('SELECT * FROM "user" WHERE email = ($1)', [email])
        if (checkEmail.rows.length > 0) {
            return next(ApiError.badRequest('Данная почта уже зарегистрирована'))
        }

        const checkNick = await db.query('SELECT * FROM "user" WHERE nickname = ($1)', [nickname])
        if (checkNick.rows.length > 0) {
            return next(ApiError.badRequest('Данная почта уже зарегистрирована'))
        }

        const hashPassword = await bcrypt.hash(password, 5)

        const candidate = await db.query('SELECT * FROM "user" WHERE email = ($1)', [userEmail])
        let candidateEmail = candidate.rows[0].email

        const update = await db.query('UPDATE "user" SET (email, password,nickname) = ($1,$2,$3) WHERE email = ($4) RETURNING *', [email, hashPassword, nickname, candidateEmail])

        const token = generateJwt(update.rows[0].uid, update.rows[0].email)
        const info = decodeJwt(token)
        const expiresIn = info.exp

        return res.json({ token, expiresIn })
    }

    async delete(req, res, next) {
        const email = req.user.email

        const user = await db.query('SELECT *  FROM "user" WHERE email = ($1)', [email])

        const userId = user.rows[0].uid

        const userTag = await db.query('SELECT * FROM "userTag" WHERE userId = ($1)', [userId])

        if (userTag.rows.length == 0) {
            let drop = await db.query('DELETE FROM "user" WHERE email = ($1)', [email])
            return res.json(drop)
        }

        drop = await db.query('DELETE * FROM "userTag" WHERE userId = ($1)', [userId])
        drop = await db.query('DELETE FROM "user" WHERE email = ($1)', [email])
        delete req.headers;

        return res.json(drop)
    }
}

module.exports = new User()
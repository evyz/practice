const ApiError = require('../error/ApiError')
const db = require('../models/db')

class UserTag {
    async post(req, res, next) {
        const { tags } = req.body
        const uid = req.user.uid

        let result, check;

        Promise.all(tags.map(async tag => {
            check = await db.query('SELECT * FROM "tag" where id = ($1)', [tag])
            if (check.rows.length == 0) {
                return res.json(ApiError.badRequest('Нет такого айди'))
            }
        }))

        Promise.all(tags.map(async tag => {
            check = await db.query('SELECT * FROM "userTag" WHERE userid = ($1) AND tagid = ($2)', [uid, tag])
            if (check.rows.length > 0) {
                return res.json(ApiError.badRequest('Данная запись уже существует!'))
            }
            result = await db.query('INSERT INTO "userTag" (userId, tagId) values($1, $2)', [uid, tag])
        }))

        return res.json(result)
    }

    async delete(req, res, next) {
        const { id } = req.params
        const uid = req.user.uid

        const drop = await db.query('DELETE FROM "userTag" WHERE tagid = ($1) AND userid = ($2)', [id, uid])

        return res.json(drop)
    }


    async get(req, res, next) {
        const uid = req.user.uid

        let tags = [];

        const result = await db.query('SELECT * FROM "userTag" INNER JOIN "user" ON "user".uid = userId INNER JOIN "tag" ON "tag".id = tagId WHERE creator = ($1)', [uid]).then(data => {
            data.rows.map(row => {
                tags.push({ "id": row.id, "name": row.name, "sortOrder": row.sortorder })
            })
        })

        if (tags.length == 0) {
            return next(ApiError.badRequest('У вас нет своих тегов'))
        }

        return res.json({ tags })
    }
}

module.exports = new UserTag()
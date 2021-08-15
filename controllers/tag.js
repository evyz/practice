const db = require('../models/db')
const ApiError = require('../error/ApiError')

class Tag {
    async create(req, res, next) {
        const { name, sortOrder } = req.body

        const uid = req.user.uid

        const check = await db.query('SELECT * FROM "tag" where name = ($1)', [name])

        if (check.rows.length > 0) {
            return next(ApiError.badRequest('Данное название уже существует.'))
        }

        let create = await db.query('INSERT INTO "tag" (creator,name,sortorder) values ($1,$2,$3) RETURNING *', [uid, name, sortOrder])

        const id = create.rows[0].id

        const connect = await db.query('INSERT INTO "userTag" (userId,tagId) values ($1,$2) RETURNING *', [uid, id])

        return res.json(connect.rows[0])
    }

    async get(req, res, next) {
        const { sortByOrder, sortByName, offset, length } = req.query

        let data = [], creator = {}, obj = {}, quantity, meta = {}, tags;


        if (sortByOrder === '' && sortByName === '' && offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder, "tag".name) LIMIT ($1) OFFSET ($2) `, [length, offset])
        }

        // --- Один элемент

        if (!sortByOrder && sortByName === '' && offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".name) LIMIT ($1) OFFSET ($2) `, [length, offset])
        }
        if (sortByOrder === '' && !sortByName && offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder) LIMIT ($1) OFFSET ($2) `, [length, offset])
        }
        if (sortByOrder === '' && sortByName === '' && !offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder) LIMIT ($1) `, [length])
        }
        if (sortByOrder === '' && sortByName === '' && offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder, "tag".name) OFFSET ($1) `, [offset])
        }

        // --- Два элемента

        if (!sortByOrder && !sortByName && offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid LIMIT ($1) OFFSET ($2) `, [length, offset])
        }
        if (sortByOrder === '' && sortByName === '' && !offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder, "tag".name) `)
        }
        if (!sortByOrder && sortByName === '' && !offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ( "tag".name) LIMIT ($1) `, [length])
        }
        if (!sortByOrder && sortByName === '' && offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ( "tag".name) OFFSET ($1) `, [offset])
        }
        if (sortByOrder === '' && !sortByName && !offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder) LIMIT ($1) `, [length])
        }
        if (sortByOrder === '' && !sortByName && offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder)  OFFSET ($1) `, [offset])
        }

        // --- Три элемента

        if (sortByOrder === '' && !sortByName && !offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ("tag".sortorder) `)
        }
        if (!sortByOrder && sortByName === '' && !offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid ORDER BY ( "tag".name) `, [length, offset])
        }
        if (!sortByOrder && !sortByName && offset && !length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid OFFSET ($1) `, [offset])
        }
        if (!sortByOrder && !sortByName && !offset && length) {
            tags = await db.query(`SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid LIMIT ($1) `, [length])
        }

        if (!sortByOrder && !sortByName && !offset && !length) {
            tags = await db.query(`SELECT * FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid`)
        }

        tags.rows.map(tag => {
            creator = { "nickname": tag.nickname, "uid": tag.uid }
            data.push(obj = { creator, "name": tag.name, "sortOrder": tag.sortorder })
        })
        quantity = tags.rowCount
        meta = { offset, length, quantity }

        return res.json({ data, meta })
    }

    async getOne(req, res, next) {
        const { id } = req.params

        let check, creator = {}, name, sortOrder;

        check = await db.query('SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid WHERE "tag".id = ($1)', [id])

        if (check.rows.length == 0) {
            return next(ApiError.badRequest('Неверный айди у тега'))
        }

        name = check.rows[0].name;
        sortOrder = check.rows[0].sortorder;

        creator['nickname'] = check.rows[0].nickname;
        creator['uid'] = check.rows[0].uid;

        return res.json({ creator, name, sortOrder })
    }

    async put(req, res, next) {
        const uid = req.user.uid
        let { name, sortOrder } = req.body
        const { id } = req.params

        let creator = {};

        const tag = await db.query('SELECT * FROM "tag" INNER JOIN "userTag" ON "userTag".tagId = "tag".id INNER JOIN "user" ON "userTag".userId = "user".uid WHERE "tag".id = ($1)', [id])

        if (tag.rows[0].uid !== uid) {
            return next(ApiError.forbidden('У вас нет доступа для редакции этого тега'))
        }

        const check = await db.query('SELECT * FROM "tag" WHERE name = ($1)', [name])
        if (check.rows.length > 0) {
            return next(ApiError.badRequest("Данное название для тега уже занято"))
        }

        const change = await db.query('UPDATE "tag" SET name = ($1), sortorder = ($2) WHERE "tag".id = ($3) RETURNING *', [name, sortOrder, id])

        const result = await db.query('SELECT "user".nickname,"user".uid,"tag".name,"tag".sortorder FROM "tag" INNER JOIN "userTag" ON "tag".id = tagId INNER JOIN "user" ON "userTag".userId = "user".uid WHERE "tag".id = ($1)', [change.rows[0].id])
        name = result.rows[0].name;
        sortOrder = result.rows[0].sortorder;

        creator['nickname'] = result.rows[0].nickname;
        creator['uid'] = result.rows[0].uid;

        return res.json({ creator, name, sortOrder })
    }

    async delete(req, res, next) {
        const uid = req.user.uid
        const { id } = req.params

        const check = await db.query('SELECT * FROM "tag" INNER JOIN "userTag" ON "userTag".tagId = "tag".id INNER JOIN "user" ON "userTag".userId = "user".uid WHERE "tag".id = ($1) AND "user".uid = ($2)', [id, uid])
        if (check.rows.length == 0) {
            return next(ApiError.forbidden('У вас нет доступа для редакции этого тега'))
        }

        const userTag = await db.query('SELECT * FROM "userTag" WHERE tagId = ($1)', [check.rows[0].id])

        const drop = await db.query('DELETE FROM "tag" WHERE id = ($1) ', [check.rows[0].id])
        const dropConnections = await db.query('DELETE FROM "userTag" WHERE tagId = ($1)', [check.rows[0].id])

        return res.json('deleted')
    }

}

module.exports = new Tag()
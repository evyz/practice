const ApiError = require('../error/ApiError')
const db = require('../models/db')

class UserTag {
    checkQuery = async (id) => {
        let result = await db.query('SELECT * FROM "tag" WHERE id = ($1)', [id])
        return result
    }
}

module.exports = new UserTag()
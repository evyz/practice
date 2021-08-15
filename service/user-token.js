const jwt = require('jsonwebtoken')

class UserToken {
    generateJwt = (uid, email) => {
        return jwt.sign(
            { uid, email },
            process.env.SECRET_KEY,
            { expiresIn: "30m" }
        )
    }
    decodeJwt = (token) => {
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        return decode;
    }
}

module.exports = new UserToken()
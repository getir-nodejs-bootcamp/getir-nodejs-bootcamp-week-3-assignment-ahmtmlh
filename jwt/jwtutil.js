const jwt = require('jsonwebtoken')

class JwtTokenUtil{
    static #SECRET = 'GETIRBIMUTLULUK'
    static #PREFIX = 'Bearer '
    
    // Token validation enums
    static TOKEN_OK = 0
    static NO_TOKEN = 1
    static INVALID_TOKEN = 2

    static createToken(id) {
        let token = jwt.sign({uniqueId: id}, JwtTokenUtil.#SECRET, {expiresIn: '5d'})
        return JwtTokenUtil.#PREFIX + token
    }

    static verifyToken(token) {

        let returnValue = {
            tokenStatus: null,
            tokenData: null
        }

        if (!token) {
            returnValue.tokenStatus = JwtTokenUtil.NO_TOKEN            
        } else {
            try {
                if (!token.startsWith(JwtTokenUtil.#PREFIX))
                    throw new Error('Token doesnt start with prefix!')

                let rawToken = token.substring(JwtTokenUtil.#PREFIX.length)
                const decodedToken = jwt.verify(rawToken, JwtTokenUtil.#SECRET)
                returnValue.tokenStatus = JwtTokenUtil.TOKEN_OK
                returnValue.tokenData = decodedToken
            } catch (err) {
                returnValue.tokenStatus = JwtTokenUtil.INVALID_TOKEN
            }
        }

        return returnValue
    }
}


module.exports = JwtTokenUtil
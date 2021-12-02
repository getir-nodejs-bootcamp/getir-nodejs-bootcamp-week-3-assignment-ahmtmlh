const jwt = require('jsonwebtoken')

class JwtTokenUtil{
    static #SECRET = 'GETIRBIMUTLULUK'
    
    // Token validation enums
    static TOKEN_OK = 0
    static NO_TOKEN = 1
    static INVALID_TOKEN = 2

    static createToken(id) {
        let token = jwt.sign({unique_id: id}, JwtTokenUtil.#SECRET, {expiresIn: '5d'})
        return token
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
                const decodedToken = jwt.verify(token, JwtTokenUtil.#SECRET)
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
const express = require('express')
const lodash = require('lodash')
const JwtTokenUtil = require('../jwt/jwtutil')
const logging = require('../log/log')


const movieDB = []
const app = express()

app.use(logging)
app.use(express.json())

function createPseudoDB() {
    // Movie 1
    movieDB.push({
        id: 0,
        name: 'The Space Between Us',
        director: 'Peter Chelsom',
        year: 2017,
        duration: 121,
        cast: ['Asa Butterfield', 'Britt Robertson', 'Carla Gugino'],
        imdbScore: 6.7
    })
    // Movie 2
    movieDB.push({
        id: 1,
        name: 'Batman Begins',
        director: 'Christoper Nolan',
        year: 2005,
        duration: 140,
        cast: ['Christian Bale', 'Cillian Murphy', 'Michael Caine'],
        imdbScore: 8.2
    })
    // Movie 3
    movieDB.push({
        id: 2,
        name: 'Catch Me If You Can',
        director: 'Steven Spielberg',
        year: 2002,
        duration: 141,
        cast: ['Leonardo DiCaprio', 'Tom Hanks', 'Amy Adams'],
        imdbScore: 8.1
    })
    // Movie 4
    movieDB.push({
        id: 3,
        name: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        duration: 148,
        cast: ['Leonardo DiCaprio', 'Tom Hardy', 'Joseph Gordon-Levitt'],
        imdbScore: 8.8
    })
    // Movie 5
    movieDB.push({
        id: 4,
        name: 'Limitless',
        director: 'Neil Burger',
        year: 2011,
        duration: 105,
        cast: ['Bardley Cooper', 'Abbie Cornish', 'Robert De Niro'],
        imdbScore: 7.4
    })

}

//#region Verify Token callback

function verifyAuth(req, res, next) {
    const token = req.body.token;
    const continueRoute = false
    let tokenValidityCheck = JwtTokenUtil.verifyToken(token)

    switch (tokenValidityCheck.tokenStatus) {
        case JwtTokenUtil.INVALID_TOKEN:
            res.status(401).send('Token is unidentified!')
            break;
        case JwtTokenUtil.NO_TOKEN:
            res.status(403).send('I dont know who you are, please tell me who you are via TOKEN')
            break;
        case JwtTokenUtil.TOKEN_OK:
            req.userData = tokenValidityCheck.tokenData
            continueRoute = true
            break;
    }
    
    if (continueRoute)
        return next();
}

//#endregion

//#region App routes
app.post("/requestToken", (req, res) => {

});

app.get('/movie/:movieId', verifyAuth, (req, res) => {
    let movieId = req.params.movieId
    const foundMovie = lodash.find(movieDB, (item)=>{return item.id == movieId})

    if (foundMovie) {
        res.status(200).json(foundMovie)    
    } else {
        res.status(404).send('Movie was not found')
    }
})

app.get('/movie', (req, res) => {
    res.status(200).json(movieDB)
})


//#endregion

// App start point
createPseudoDB()
app.listen(8080)
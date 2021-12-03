const express = require('express')
const lodash = require('lodash')
const JwtTokenUtil = require('../jwt/jwtutil')
const logging = require('../log/log')


const movieDB = []
const app = express()

app.use(logging)
app.use(express.json())

function checkTypeString(value){
    return typeof value == 'string'
}

function checkTypeNumber(value){
    return typeof value == 'number'
}

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
    movieDB.push({
        id: 1,
        name: 'Batman Begins',
        director: 'Christoper Nolan',
        year: 2005,
        duration: 140,
        cast: ['Christian Bale', 'Cillian Murphy', 'Michael Caine'],
        imdbScore: 8.2
    }) 
    movieDB.push({
        id: 2,
        name: 'Catch Me If You Can',
        director: 'Steven Spielberg',
        year: 2002,
        duration: 141,
        cast: ['Leonardo DiCaprio', 'Tom Hanks', 'Amy Adams'],
        imdbScore: 8.1
    })
    movieDB.push({
        id: 3,
        name: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        duration: 148,
        cast: ['Leonardo DiCaprio', 'Tom Hardy', 'Joseph Gordon-Levitt'],
        imdbScore: 8.8
    })
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
    const token = req.body.token || req.header('Authorization');
    let continueRoute = false
    let tokenValidityCheck = JwtTokenUtil.verifyToken(token)

    switch (tokenValidityCheck.tokenStatus) {
        case JwtTokenUtil.INVALID_TOKEN:
            res.status(401).json({
                success: false,
                status: 401,
                message: 'Token is unidentified!'
            })
            break;
        case JwtTokenUtil.NO_TOKEN:
            res.status(403).json({
                success: false,
                status: 403,
                message: 'I dont know who you are, please tell me who you are via TOKEN'
            })
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

function updateField(obj, fieldName, newValue, additionalValidation=undefined){
    if (newValue && (additionalValidation ? additionalValidation(newValue) : true)){
        obj[fieldName] = newValue            
    }
}

//#region App routes
//#region Public routes
app.post("/requestToken", (req, res) => {
    let uniqueId = req.body.id || req.body.uniqueId

    if (!uniqueId) {
        res.status(400).json({
            success: false,
            status: 400,
            message: 'UniqueID is required as a request body!'
        })
        return
    }

    let token = JwtTokenUtil.createToken(uniqueId)

    res.status(201).json({
        success: true,
        status: 201,
        token: token
    })
});

app.get('/movies', (req, res) => {
    res.status(200).json({
        success: true,
        status: 200,
        movies: movieDB
    })
})

//#endregion Public routes

//#region Private routes

app.get('/movie/:movieId', verifyAuth, (req, res) => {
    let movieId = req.params.movieId
    const foundMovie = lodash.find(movieDB, (item) => { return item.id == movieId })

    if (foundMovie) {
        res.status(200).json({
            success: true,
            status: 200,
            movie: foundMovie
        })    
    } else {
        res.status(404).json({
            success: false,
            status: 404,
            message: 'Movie was not found'
        })
    }
})

app.put('/movie/add', verifyAuth, (req, res) => {
    let movie = req.body.movie
    let lastMovieId = movieDB[movieDB.length - 1].id

    if (!movie){
        res.status(400).json({
            success: false,
            status: 400,
            message: 'You need to specify a movie to add!'
        })
        return
    }

    if (!Array.isArray(movie.cast)){
        res.status(400).json({
            success: false,
            status: 400,
            message: 'Cast of a movie is invalid!'
        })
        return
    }

    let newMovie = {
        id: lastMovieId + 1,
        name: movie.name,
        director: movie.director,
        year: movie.year,
        duration: movie.duration,
        cast: movie.cast,
        imdbScore: movie.imdbScore
    }

    movieDB.push(newMovie)

    res.status(201).json({
        success: true,
        status: 201,
        newMovie: newMovie
    })
})


app.patch('/movie/modify/:movieId', verifyAuth, (req, res) => {
    let movieId = req.params.movieId
    let movie = req.body.movie

    if (!movie){
        res.status(400).json({
            success: false,
            status: 400,
            message: 'A movie-like object is needed to update movie'
        })
        return
    }
    
    const foundMovie = lodash.find(movieDB, (item) => { return item.id == movieId })
    
    if (!foundMovie){
        res.status(404).json({
            success: false,
            status: 404,
            message: 'Movie not found!'
        })
        return
    }

    updateField(foundMovie, 'name', movie.name, additionalValidation=checkTypeString)
    updateField(foundMovie, 'director', movie.director, additionalValidation=checkTypeString)
    updateField(foundMovie, 'year', movie.year, additionalValidation=checkTypeNumber)
    updateField(foundMovie, 'duration', movie.duration, additionalValidation=checkTypeNumber)
    updateField(foundMovie, 'cast', movie.cast, additionalValidation=Array.isArray)
    updateField(foundMovie, 'imdbScore', movie.imdbScore, additionalValidation=checkTypeNumber)

    res.status(200).json({
        success: true,
        status: 200,
        updateMovie: foundMovie
    })
})

app.delete('/movie/:movieId', verifyAuth, (req, res) => {
    let movieId = req.params.movieId
    const foundMovieIndex = lodash.findIndex(movieDB, (item) => { return item.id == movieId })

    if (foundMovieIndex == -1){
        res.status(404).json({
            success: false,
            status: 404,
            message: `No movie found for id: ${movieId}`
        })
    } else {
        let movie = movieDB[foundMovieIndex]
        movieDB.splice(foundMovieIndex, 1)
        res.status(200).json({
            success: true,
            status: 200,
            deletedMovie: movie
        })
    }

})

//#endregion

//#region Not found 404 error handler
app.use('*', function(req, res){
    res.status(404).json({
        success: false,
        status: 404,
        message: 'Unknown URL'
    })
})

//#endregion
//#endregion

createPseudoDB()

module.exports = app
const fs = require('fs')
const os = require('os')
const path = require('path')
const RWLock = require('rwlock')

//#region Request logging

const logFileName = path.join(__dirname, '..', 'logfile.log')
console.log("Logs will be saved to file: ", logFileName)
const logFileLock = new RWLock()

function logRequest(request, response) {
    
    let requestInfo = {
        sender: request.headers['user-agent'],
        url: request.url,
        responseStatus: response.statusCode,
    }

    let dump = JSON.stringify(requestInfo) + os.EOL

    // In case of multiple writes to the same file by different connections
    // log file could corrupt since each 'thread' will have a different cursor and file descriptor
    // This lock ensures that only one 'thread' at a time can access to file
    logFileLock.writeLock(function (release) {

        fs.appendFile(logFileName, dump, 'utf-8', function (err) {
            if (err)
                console.log('Critical FS error')
            
            release()
        })
    })
}

const loggingMiddleware = (req, res, next) => {
    res.on('finish', function(){
        logRequest(req, res)
    })

    next()
}

//#endregion

module.exports = loggingMiddleware
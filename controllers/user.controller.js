const {
    response
} = require('express');

const {
    uploadFile,
    getFileStream
} = require('../s3');

const config = require('../config/jwt');

const jwt = require('jsonwebtoken');
var msg = require('../helpers/messages')

const bcrypt = require('bcrypt');
const saltRounds = 10;


/**
 * [Function that uploads a file to an AWS S3 bucket]
 * @param request
 * @param response/error 
 */
module.exports.UPLOAD = async (req, response) => {
    // Buscamos usuario
    let token = req.headers['x-access-token'];

    const file = req.file
    console.log(req.file, req.body)

    const result = await uploadFile(file)

    response.json({
        mensaje: "AWS upload",
        token: token,
        results: result
    })
}

/**
 * [Function that returns an user from system]
 * @param request.body.username
 * @param response/error 
 */
module.exports.GET = (request, response) => {
    // Buscamos usuario
    let token = request.headers['x-access-token'];

    /* Sample user to avoid db */
    const sample_user = {
        "usertag": "DRAG010803MDFRVNA7",
        "birth": "03-08-2001:4500",
        "parent_usertag": "",
        "password": "$2a$10$EYzb8objNwuUoCHMwgQbQekCN6psiRQiMKKd7V0PmIBnKzl.qBHu2" // coco, 10 rounds
    }

    response.json({
        mensaje: "Get protegido",
        token: token,
        results: sample_user
    })
}

/**
 * [Function that returns an user from system]
 * @param request.body.username
 * @param response/error 
 */
module.exports.GET_FILE = (request, response) => {
    // Buscamos usuario
    let token = request.headers['x-access-token'];
    console.log('params: ', request.params)
    console.log('body: ', request.body)
    console.log('token: ', token)

    const key = request.body.key
    const readStream = getFileStream(key)

    console.log('readStream: ', readStream)

    // Front direct image load
    readStream.pipe(response)

    /*
    response.json({
        mensaje: "Get protegido",
        token: token,
        results: request.body.key
    })*/
}



/**
 * [Function that authenticates an user into the system]
 * @param request.body.username
 * @param request.body.password 
 * @param response/error 
 */
module.exports.LOGIN = async (request, response) => {
    let bod = request.body;

    /* Sample user to avoid db */
    const sample_user = {
        "usertag": "DRAG010803MDFRVNA7",
        "birth": "03-08-2001:4500",
        "parent_usertag": "",
        "password": "$2a$10$EYzb8objNwuUoCHMwgQbQekCN6psiRQiMKKd7V0PmIBnKzl.qBHu2" // coco, 10 rounds
    }
    
    let error = false; // Error debe ser el resultado de encontrar o no un usuario
    if(error){
        response.status(500).send(error);
    } else {
        var isMatch = await (bcrypt.compare(bod.password, sample_user.password)) // Comparing bcrypt pwd
        if (isMatch) { // Successfull login
            const payload = {
                usertag: bod.usertag,
                birth: bod.birth,
                parent_usertag: bod.parent_usertag
            }
            let token = jwt.sign(payload, config.key, {
                expiresIn: 14400 // 4 hour token
            })
            response.json({
                mensaje: msg.loginSuccessfully,
                token: token,
                results: sample_user
            })
        } else response.status(403).json("Incorrect password"); // Incorrect password
    }
}

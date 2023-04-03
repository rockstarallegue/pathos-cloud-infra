require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

// Traemos las variables del .env 
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_BUCKET_ACCESS_KEY
const secretAccessKey = process.env.AWS_BUCKET_SECRET_KEY

// Instancia desde mi cosa
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// Uploads a file to s3
function uploadFile(file) {
    // Readstream
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: "filex"+file.filename
    }

    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile

// Downlads a file from s3
function getFileStream(filekey) {
    const downloadParams = {
        Key: filekey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream
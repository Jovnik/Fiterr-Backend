const AWS = require('aws-sdk');

const uploadImage = async(image, id) => {
    
    const s3credentials = new AWS.S3({
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY
    });

    const uniqueTimeValue = (Date.now()).toString();
    const name = image[0].originalname + image[0].size + id + uniqueTimeValue;

    const fileParams = {
        Bucket: process.env.BUCKET,
        Body: image[0].buffer,
        Key: name,
        ACL: 'public-read',
        ContentType: image[0].mimetype
    }

    const data = await s3credentials.upload(fileParams).promise();
    imageUrl = data.Location;
    // console.log(imageUrl);
    return imageUrl;

}

module.exports = uploadImage;
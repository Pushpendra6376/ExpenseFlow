const AWS = require("aws-sdk");
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (data, fileName) => {
    const isExcel = fileName.endsWith('.xlsx');

    const key = `reports/${fileName}`;

    await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: data,
        ContentType: isExcel
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv"
    }).promise();

    // 🔥 Signed URL (valid for 5 minutes)
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Expires: 60 * 5
    });

    return signedUrl;
};

const AWS = require("aws-sdk");
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (data, fileName) => {
    // Extension check karke ContentType set karenge
    const isExcel = fileName.endsWith('.xlsx');
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `reports/${fileName}`, // Reports folder me save hoga
        Body: data,
        //ACL: 'public-read', // Taaki user link se download kar sake
        ContentType: isExcel 
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
            : "text/csv",
    };

    const result = await s3.upload(params).promise();
    return result.Location; // Ye URL return karega
};
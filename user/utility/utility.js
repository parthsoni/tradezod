'use strict';

const jwt = require('jsonwebtoken');
const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const { v4: uuidv4 } = require('uuid');

module.exports = class Utility {
    s3_bucket_name = "name";
    constructor() {
        
    }

    sendSMS(mobile, otp) {
        console.log(otp)
        return true
    }
    // Function to validate email addresses
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to generate a random string of specified length
    static generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Function to handle errors and send error responses
    static handleError(res, statusCode, message) {
        res.status(statusCode).json({error: message});
    }

    // Function to handle success responses
    static handleSuccess(res, statusCode, data) {
        res.status(statusCode).json(data);
    }
    

    static uploadFile() {
        const storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, './uploads');
          },
          filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
          }
        });
        const upload = multer({ storage: storage });
        return upload;
      }
    
      // Function for converting JSON to image using sharp
      static async jsonToImage(jsonData) {
        const buffer = Buffer.from(JSON.stringify(jsonData));
        const resizedBuffer = await sharp(buffer)
          .resize({ width: 500, height: 500 })
          .png()
          .toBuffer();
        return resizedBuffer;
      }
    
      // Function for compressing image using sharp
      static async compressImage(imageBuffer) {
        const compressedBuffer = await sharp(imageBuffer)
          .resize({ width: 500, height: 500 })
          .jpeg({ quality: 80 })
          .toBuffer();
        return compressedBuffer;
      }
    
      // Function for pushing file to Amazon S3
      static async pushToS3(file) {
        const fileContent = fs.readFileSync(file.path);
        const params = {
          Bucket: this.s3_bucket_name,
          Key: uuidv4(),
          Body: fileContent
        };
        const result = await s3.upload(params).promise();
        return result.Location;
      }
    
      // Function for getting file from Amazon S3
      static async getFromS3(key) {
        const params = {
          Bucket: this.s3_bucket_name,
          Key: key
        };
        const result = await s3.getObject(params).promise();
        return result.Body;
      }
    
      // Function for creating folder in Amazon S3
      static async createFolderInS3(folderName) {
        const params = {
          Bucket: this.s3_bucket_name,
          Key: folderName + '/'
        };
        const result = await s3.putObject(params).promise();
        return result;
      }
    
      // Function for uploading file to server and then pushing it to Amazon S3
      static async uploadFileToS3(req, folderName) {
        const upload = this.uploadFile().single('file');
        return new Promise((resolve, reject) => {
          upload(req, null, async (err) => {
            if (err) {
              reject(err);
            } else {
              const file = req.file;
              const filePath = './uploads/' + file.filename;
              const fileContent = fs.readFileSync(filePath);
              const params = {
                Bucket: this.s3_bucket_name,
                Key: folderName + '/' + file.originalname,
                Body: fileContent
              };
              const result = await s3.upload(params).promise();
              fs.unlinkSync(filePath);
              resolve(result.Location);
            }
          });
        });
      }

}

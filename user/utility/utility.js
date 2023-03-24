'use strict';

module.exports = class Utility {
    constructor() {}

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

}

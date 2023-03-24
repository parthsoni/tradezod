// userController.js
// Import user model
User = require("../models/user.model");
Otp = require("../models/otp.model");
const speakeasy = require('speakeasy');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// Handle index actions

const environment = require("../config/environment");
const Utility = require("../utility/utility");
var userFilter = {password:1, mobile:1, email:1, firstName:1, lastName:1, userType:1, roleType:1, token:1, createDate:1}
exports.index = function (req, res) {
    User.find({}, {
        password: 0
    }, function (err, users) {
        if (err) {
            res.status(200).json({status: "error", error: "Bad Request."});
        }
        res.json({status: "success", message: "Users retrieved successfully", data: users});
    });
};
// Handle create user actions
exports.new = function (req, res) {
    User.find({
        $or: [
            {
                mobile: req.body.mobile.trim()
            }, {
                email: req.body.email.trim()
            }
        ]
    }, {
        password: 0
    }, function (err, users) {
        if (err) {
            res.status(200).json({status: "error", message: err});
        }
        if (users && users.length > 0) {
            res.status(200).send({
                status: "success",
                type: "ALREADY_TAKEN",
                message: req.body.mobile + " is already taken",
                data: users
            });
        } else {
            var user = new User();
            user.email = req.body.email;
            user.mobile = req.body.mobile;
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 10);
            }
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            // save the user and check for errors
            user.save(function (err) {
                if (err) {
                    res.status(200).json({status: "error", message:err, error: err});
                }
                user=user.toObject();
                delete user.password
                res.json({ status: "success", message: "New user created!", data: user});
            });
        }
    });
};
// Handle view user info
exports.view = function (req, res) {
    User.findById(req.params.user_id, {
        password: 0
    }, function (err, user) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }
        res.json({message: "User details loading..", data: user});
    });
};
// Handle update user info
exports.update = function (req, res) {
    User.findByIdAndUpdate(req.params.user_id, req.body, {
        new: true
    }, function (err, user) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }

        res.json({message: "User Info updated", data: user});
    });
};
// Handle delete user
exports.delete = function (req, res) {
    User.remove({
        _id: req.params.user_id
    }, function (err, user) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }
        res.json({status: "success", message: "User deleted"});
    });
};


exports.sendOtp = async function (req, res) {
    response = await generateOtp(req)
    if (response && response.status == "error") {
        res.status(200).json(response);
    } else {
        res.status(200).json(response);
    }
}

async function generateOtp(req) {
    response = {
        status: "error",
        message: ""
    }
    if (! req.body.otp_type || ! req.body.operation_type || ! req.body.type_value) {
        return {status: "error", message: "otp_type or type_value or operation_type missing"}
    }

    otp = await Otp.findOne({"status": "ACTIVE", type_value: req.body.type_value});
    if (otp) {
        return {status: "success", message: "OTP sent successfully.", data: otp}
    } else {
        const secret = speakeasy.generateSecret({length: 20});
        // Generate the OTP token based on the secret key
        const token = speakeasy.totp({secret: secret.base32, encoding: 'base32', digits: 6, window: 1});
        var otp = new Otp();
        otp.otp_value = token;
        otp.otp_type = req.body.otp_type;
        otp.operation_type = req.body.operation_type;
        otp.type_value = req.body.type_value;
        // save the otp and check for errors
        otp.save(function (err) {
            if (err) {
                response = {
                    status: "error",
                    error: err
                }
            }
        });

        /*** send otp using sms */
        new Utility().sendSMS(otp.type_value, otp.otp_value)
        response = {
            status: "success",
            message: "OTP sent successfully.",
            data: otp
        }
    }

    return response

}

async function verifyOtp(type_value, otp_value) {
    const update = {
        "status": "INACTIVE"
    };
    const otp = await Otp.findOneAndUpdate({
        "status": "ACTIVE",
        type_value: type_value,
        otp_value: otp_value
    }, update, {new: true});
    console.log(otp)
    return otp
}

exports.validateToken = function (req, res) {
    token = req.header.token
    if (token) {}

}

exports.authenticate = async function (req, res) {
    mobile_no = ""
    email_id = ""
    type_value = ""

    if (req.body.mobile) {
        type_value = mobile_no = req.body.mobile

    } else if (req.body.email) {
        type_value = email_id = req.body.email
    }

    User.findOne({
        $or: [
            {
                mobile: mobile_no
            }, {
                email: email_id
            }
        ]
    }, async function (err, user) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }
        password = req.body.password
        if (user) {
            console.log(user)

            if (bcrypt.compareSync(password, user.password)) { // authentication successful
                user.token = jwt.sign({
                    user: user
                }, environment.secret, {algorithm: "HS256"});
                user = user.toObject();
                delete user.password
                res.json({status: "success", message: "Users logged in successfully", data: user});
            } else { // authentication failed
                const update = {
                    "status": "INACTIVE"
                }
                user = user.toObject();
                delete user.password
                otp = await verifyOtp(type_value, password)
                if (otp && otp.status == "INACTIVE") {
                    res.json({status: "success", message: "Users logged in successfully", data: user});
                } else {
                    res.status(200).send({status: "error", message: "User name or password/otp is invalid."});
                }
            }
        } else {
            res.status(200).send({status: "error", message: "User name or password/otp is invalid."});
        }
    }).select(userFilter);
};

exports.changePassword = function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }

        if (user && bcrypt.compareSync(req.body.oldPassword, user.password)) { // authentication successful
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 10);
            }
            user.save(function (err) {
                if (err) 
                    res.json(err);
                

                res.status(202).send({status: "success", message: "Password Updated successfully"});
            });
        } else { // authentication failed
            res.status(401).send({status: "error", message: "Old password is wrong."});
        }
    });
};

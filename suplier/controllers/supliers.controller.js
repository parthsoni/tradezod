// suplierController.js
// Import suplier model
Suplier = require("../models/suplier.model");
// Handle index actions
const environment = require("../config/environment");
const request = require('request');
const axios = require('axios');


exports.index = function (req, res) {
    Suplier.find({}, function (err, supliers) {
        if (err) {
            res.status(200).json({status: "error", error: "Bad Request."});
        }
        res.json({status: "success", message: "Supliers retrieved successfully", data: supliers});
    });
};

// Handle create suplier actions
exports.new = function (req, res) {
    Suplier.find({
        $or: [
            {
                mobile: req.body.mobile.trim()
            }, {
                email: req.body.email.trim()
            }
        ]
    }, async function (err, supliers) {
        if (err) {
            res.status(200).json({status: "error", message: err});
        }
        if (supliers && supliers.length > 0) {
            response = await axios.get('http://user:3001/api/users/'+supliers[0].userId).then(function (response) { 
            supliers=supliers[0].toObject();               
            supliers.user =  response.data.data
                res.status(200).send({
                    status: "success",
                    message: req.body.mobile + " is already taken",
                    data: supliers
                });
            }).catch(function (error) {
                res.status(200).json({status: "error", error: error});
                console.log("failed");
              });
           
        } else {
            var suplier = new Suplier();
            suplier.email = req.body.email;
            suplier.mobile = req.body.mobile;
            suplier.firstName = req.body.firstName;
            suplier.lastName = req.body.lastName;
            password = req.body.lastName;
            var response;
            /** Create user */
             response = await axios.post('http://user:3001/api/users', 
                {email:suplier.email,mobile:suplier.mobile,firstName:suplier.firstName,lastName:suplier.lastName, password:password }
                 ).then(function (response) {
                    if(response.data.status=="error") {
                        res.status(200).json(response.data)
                    }
                    suplier.userId = response.data.data._id
                    // save the suplier and check for errors
                    suplier.save(function (err) {
                        if (err) {
                            res.status(200).json({status: "error", error: err});
                        }
                    suplier=suplier.toObject();
                    suplier.user = response.data.data;
                        res.json({message: "New suplier created!", data: suplier});
                    });
                  })
                  .catch(function (error) {
                    res.status(200).json({status: "error", error: error});
                    console.log("failed");
                  });
                
              
            
            
        }
        })


        }
// Handle view suplier info
exports.view = function (req, res) {
    Suplier.findById(req.params.suplier_id, function (err, suplier) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }
        res.json({message: "Suplier details loading..", data: suplier});
    });
};
// Handle update suplier info
exports.update = function (req, res) {
    Suplier.findByIdAndUpdate(req.params.suplier_id, req.body, {
        new: true
    }, function (err, suplier) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }

        res.json({message: "Suplier Info updated", data: suplier});
    });
};
// Handle delete suplier
exports.delete = function (req, res) {
    Suplier.remove({
        _id: req.params.suplier_id
    }, function (err, suplier) {
        if (err) {
            res.status(200).json({status: "error", error: err});
        }
        res.json({status: "success", message: "Suplier deleted"});
    });
};



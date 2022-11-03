const jwt = require('jsonwebtoken')
require('dotenv').config()
const commonFunction = require("../common/common")
const mongoose = require("mongoose");
const centerDb = require("../model/center.model");

exports.verifyJwtToken = async (req, res, next) => {
    let token = req.headers["x-access-token"];
    try {
        if (!token) {
            throw new Error("Permission denied")
        }
        let decoded = await jwt.verify(token, commonFunction.tokenDetails.TOKENSECRET)
        req.center_obj_id = decoded._id
        console.log(req.center_obj_id)
        if (req.center_obj_id) {
            let findCriteria = {
                _id: mongoose.Types.ObjectId(req.center_obj_id),
            }
            let centerDetails = await centerDb.find(findCriteria)
            if (centerDetails && Array.isArray(centerDetails) && centerDetails.length) {
                req.centerDetails = centerDetails[0]
                let isDisabled = req.centerDetails.disabled_for?.login_into_application || false

                if (isDisabled) {
                    throw new Error("Your account has been disabled to login, contact admin")
                }
        
                next();
            } else {
                throw new Error("User not found")
            }
        } else {
            throw new Error("Token is invalid")
        }

    } catch (err) {
        console.log(err)
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }

}
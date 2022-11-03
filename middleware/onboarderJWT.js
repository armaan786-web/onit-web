const jwt = require('jsonwebtoken')
require('dotenv').config()
const commonFunction = require("../common/common")
const mongoose = require("mongoose");
const centerDb = require("../model/center.model");
const centerOnBoarding = require("../model/centerobording.model");

exports.verifyJwtToken = async (req, res, next) => {
    let token = req.headers["x-access-token"];
    try {
        if (!token) {
            throw new Error("Permission denied")
        }
        let decoded = await jwt.verify(token, commonFunction.tokenDetails.TOKENSECRET)
        req.center_obbaording_id = decoded._id
        if (req.center_obbaording_id) {
            let findCriteria = {
                _id: mongoose.Types.ObjectId(req.center_obbaording_id),
            }
            let centerOnBoarderDetails = await centerOnBoarding.find(findCriteria)
            if (centerOnBoarderDetails && Array.isArray(centerOnBoarderDetails) && centerOnBoarderDetails.length) {
                req.centerOnBoarderDetails = centerOnBoarderDetails[0]
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
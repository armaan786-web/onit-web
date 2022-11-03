const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
const centerOnboardingDb = require('../../model/centerobording.model')
const commonFolder = require('../../common/common')
const centerServices = require('../center/center_services');
const counterHelper = require('../../helpers/dbHelper')
const commonFunctionForAuth = require('../../helpers/common');
const { sequence_generator, engagementType, profileCreatedBy } = require('../../common/const');

const centerDb = require('../../model/center.model');
const verificationDb = require('../../model/otpVerificationModel')
const technicianDb = require('../../model/technician.model')

let msg = ""


exports.verifyOtpLogin = async (req, res, next) => {
    try {
        let { country_code, mobile_number, otp } = req.body
        let findCri = {
            "phone_details.country_code": country_code,
            "phone_details.mobile_number": mobile_number,
            "otpDetails.is_otp_verfied": true
        }

        let doesUserExists = await centerOnboardingDb.findOne(findCri)

        if (!doesUserExists) {
            throw new Error("User doesnt exists")
        }


        // if (!(doesUserExists.otp_login.otp_expires < Date.now())) {
        //     throw new Error("Otp has been expired")
        // }

        if (doesUserExists.otp_login.otp !== otp) {
            throw new Error("Otp mismatch")
        }

        let updateCri = {
            "otp_login.otp": 0,
            "otp_login.otp_expires": 0

        }

        let latest_details = await centerOnboardingDb.findOneAndUpdate(findCri, updateCri, { new: true })

        let tokenEmbed = {
            _id: latest_details._id,
        }

        let token = commonFunctionForAuth.generateAccessToken(tokenEmbed)


        msg = "Login successfull"
        let resData = { token, latest_details }
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.login = async (req, res, next) => {
    try {
        let { country_code, mobile_number } = req.body

        let findCri = {
            "phone_details.country_code": country_code,
            "phone_details.mobile_number": mobile_number,
            "otpDetails.is_otp_verfied": true
        }

        let doesUserExists = await centerOnboardingDb.findOne(findCri)

        if (!doesUserExists) {
            throw new Error("User doesnt exists")
        }

        let otp = commonFolder.getOtpCreation()

        let updateCri = {
            "otp_login.otp": otp.otp,
            "otp_login.otp_expires": otp.expires_in,
        }

        await centerOnboardingDb.findOneAndUpdate(findCri, updateCri, { new: true })


        msg = "otp has sent successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllCenter = async (req, res, next) => {
    try {

        let { skip, limit } = req.query
        let payload = req.query
        let centerOnBoarderDetails = req.centerOnBoarderDetails

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {
            onboarded_by: centerOnBoarderDetails._id
        }

        if (payload.start_date) {
            crit.createdAt = {
                $gte: payload.start_date
            }
        }
        if (payload.end_date) {
            crit = {
                ...crit,
                createdAt: {
                    ...crit.createdAt,
                    $lte: payload.end_date
                }
            }
        }

        if (payload.start_date) {
            crit.createdAt = {
                $gte: payload.start_date
            }
        }
        if (payload.end_date) {
            crit = {
                ...crit,
                createdAt: {
                    ...crit.createdAt,
                    $lte: payload.end_date
                }
            }
        }

        payload.center_obj_id ? crit['_id'] = payload.center_obj_id : ""
        payload.is_active ? crit['is_active'] = payload.is_active : ''
        payload.profile_created_by ? crit['profile_created_by'] = payload.profile_created_by : ''
        payload.role_based_on_no_of_technicians ? crit['role_based_on_no_of_technicians'] = payload.role_based_on_no_of_technicians : ''
        payload.center_name ? crit['center_name'] = {
            $regex: payload.center_name,
            $options: 'i'
        } : ''
        payload.primary_services ? crit['services.primary_services'] = {
            $in: payload.primary_services
        } : ''
        payload.secondary_services ? crit['services.secondary_services.secondary_services_id'] = {
            $in: payload.secondary_services
        } : ''
        payload.pincode ? crit['address_details.pincode'] = payload.pincode : ''

        let results = await centerDb.find(crit).populate("services.primary_services")
            .populate("services.secondary_services.secondary_services_id").populate("clients_ids_list").sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await centerDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.createCenter = async (req, res, next) => {
    try {

        let { personal_details, center_name, primary_services,
            secondary_services,
            address_details,
            no_of_technicians,
            automate_qr_code,
            qr_code
        } = req.body

        let { phone } = personal_details
        let { country_code, mobile_number } = phone
        let centerOnBoarderDetails = req.centerOnBoarderDetails

        await centerServices.checkIfCenterDoesNotExists(country_code, mobile_number)

        await centerServices.checkIFTheOtpIsVerifiedForThisNumber(country_code, mobile_number)

        let sequenceForCenter = null

        if (automate_qr_code) {
            sequenceForCenter = await counterHelper.getNextSequenceValue(sequence_generator.CENTER)
        } else {
            if (!qr_code) {
                throw new Error("Qr code required")
            }
            sequenceForCenter = qr_code
        }
        let insertObj = {
            personal_details,
            address_details,
            services: {
                primary_services: primary_services,
                secondary_services: secondary_services
            },
            center_name,
            no_of_technicians,
            qr_details: {
                qr_id: "INA" + sequenceForCenter
            },
            onboarded_by: centerOnBoarderDetails._id
        }

        insertObj = centerServices.getInsertObjBasedOnNoOfTechnicain(insertObj, no_of_technicians)

        insertObj.profile_created_by = profileCreatedBy.SUPER_ADMIN


        let inserttObjReult = await new centerDb(insertObj).save()


        if (no_of_technicians == 1) {
            let insertObjTechnician = {
                personal_details,
                center_id: [inserttObjReult._id],
                services: {
                    primary_services: primary_services,
                    secondary_services: secondary_services
                },
                address_details_permanent: address_details,
                profile_created_by: profileCreatedBy.CENTER,
                engagement_type: engagementType.SELF_EMPLOYED
            }

            const technicianCreated = await new technicianDb(insertObjTechnician).save()
            console.log(technicianCreated, "technicianCreated")

        }


        await verificationDb.deleteMany({ country_code, mobile_number })

        msg = "Center has been created successfully";
        let resData = {};
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.registerOn = async (req, res, next) => {
    try {

        let { uniqueId, otp } = req.body

        let findCri = {
            _id: uniqueId,
        }

        let isAldreadyExists = await centerOnboardingDb.findOne(findCri)

        if (!isAldreadyExists) {
            throw new Error("Cant find User")
        }

        if (isAldreadyExists.otpDetails.is_otp_verfied) {
            throw new Error("User already verified otp login")
        }

        // if (!(isAldreadyExists.otpDetails.otp_expires < Date.now())) {
        //     throw new Error("Otp has been expired")
        // }

        if (isAldreadyExists.otpDetails.otp !== otp) {
            throw new Error("Otp mismatch")
        }

        let updateCri = {
            "otpDetails.otp": 0,
            "otpDetails.is_otp_verfied": true,
            "otpDetails.otp_expires": 0

        }

        let latest_details = await centerOnboardingDb.findOneAndUpdate(findCri, updateCri, { new: true })

        let tokenEmbed = {
            _id: uniqueId,
        }

        let token = commonFunctionForAuth.generateAccessToken(tokenEmbed)


        msg = "Registration successfull"
        let resData = { token, latest_details }
        actionCompleteResponse(res, resData, msg);


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.registerOnBoarder = async (req, res, next) => {
    try {

        let { name, country_code, mobile_number, allowed_cities, allowed_states, primary_services, secondary_services } = req.body

        let findCri = {
            "phone_details.country_code": country_code,
            "phone_details.mobile_number": mobile_number,
        }

        let isAldreadyExists = await centerOnboardingDb.findOne(findCri)

        let uniqueId = ""

        if (isAldreadyExists) {
            if (isAldreadyExists.otpDetails.is_otp_verfied) {
                throw new Error("The account is aldready registerd")
            }

            let otp = commonFolder.getOtpCreation()

            let updateCri = {
                "otpDetails.otp": otp.otp,
                "otpDetails.otp_expires": otp.expires_in,
                services: {
                    primary_services: primary_services,
                    secondary_services: secondary_services
                },
                allowed_states,
                allowed_cities
            }

            uniqueId = await centerOnboardingDb.findOneAndUpdate(findCri, updateCri, { new: true })
            uniqueId = uniqueId._id

        } else {

            let otp = commonFolder.getOtpCreation()
            let sequenceForCenterOnboarder = await counterHelper.getNextSequenceValue(sequence_generator.CENTER_ONBOARDER_ID)

            let insertObj = {
                center_onboarder_id: "CO" + "_" + sequenceForCenterOnboarder,
                name,
                phone_details: {
                    country_code,
                    mobile_number
                },
                services: {
                    primary_services: primary_services,
                    secondary_services: secondary_services
                },
                allowed_states,
                allowed_cities,
                otpDetails: {
                    otp: otp.otp,
                    otp_expires: otp.expires_in
                }

            }

            uniqueId = await new centerOnboardingDb(insertObj).save()
            uniqueId = uniqueId._id

        }


        msg = "Otp sent successfully"
        let data = { uniqueId }
        actionCompleteResponse(res, data, msg);



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}
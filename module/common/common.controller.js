
const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');

const feedBackDb = require('../../model/feedback')
const centerDb = require('../../model/center.model')
const centerOnboardingDb = require('../../model/centerobording.model')
const ticketDb = require('../../model/ticket.model')
const BroadCastDb = require('../../model/broadcast.model')


exports.getBroadcastedListTicket = async (req, res, next) => {
    try {
        let payload = req.query
        let crit = {
            ticket_id: payload.ticketId
        };

        let ticketDetails = await ticketDb.findOne(crit)

        if (!ticketDetails) {
            throw new Error("Invalid ticket id")
        }


        let broadcastedList = await BroadCastDb.find({
            ticket_obj_id: ticketDetails._id
        }).populate('center_obj_id')

        
        let responseObj = {
            broadcastedList
        }
        return actionCompleteResponse(res, responseObj)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.getCenterOnboarderObjectId = async (req, res, next) => {
    try {
        let payload = req.query

        let crit = {};
        payload.center_onboarder_id ? crit['center_onboarder_id'] = payload.center_onboarder_id : ""

        let results = await centerOnboardingDb.find(crit, { _id: 1, center_onboarder_id: 1, name: 1 })

        let totalCount = await centerOnboardingDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.uploadFile = async (req, res, next) => {
    try {
        // console.log("request is ", req);
        console.log(req.files, "   ", req.file)
        let responseObj = {
            fileSavedUrl: req.file.location,
            destination: req.file.location,
            fileName: req.file.originalname
        }
        return actionCompleteResponse(res, responseObj)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllCenterMatchingSkill = async (req, res, next) => {
    try {
        let { skills, pincode } = req.query

        let findCri = {
            $and: [
                {
                    "address_details.pincode": pincode
                },
                {
                    $or: [
                        { "services.primary_services": { "$in": [skills] } },
                        { "services.secondary_services.secondary_services_id": { "$in": [skills] } }
                    ]
                }
            ]
        }

        let centersList = await centerDb.find(findCri)
        return actionCompleteResponse(res, centersList)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.checkFeedbackLink = async (req, res, next) => {
    try {
        let { token } = req.query

        let findCri = {
            token,
        }

        let isFeedBackExists = await feedBackDb.findOne(findCri)

        let invalidFeedBackLink = false
        let isFeedBackAlreadySubmitted = false
        let submitFeedBack = false
        let is_link_expired = false

        console.log(isFeedBackExists, "isFeedBackExists")

        if (!isFeedBackExists) {
            invalidFeedBackLink = true
        } else {

            if (isFeedBackExists.is_already_submitted) {
                isFeedBackAlreadySubmitted = true
            } else {
                submitFeedBack = true
            }

            if (!(isFeedBackExists.expires_in > Date.now())) {
                is_link_expired = true
            }
        }


        let response = {
            invalidFeedBackLink,
            isFeedBackAlreadySubmitted,
            submitFeedBack,
            is_link_expired,
            isFeedBackExists
        }

        return actionCompleteResponse(res, response)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.submitFeedback = async (req, res, next) => {
    try {

        let { token, feedBackResponse } = req.body

        let findCri = {
            token,
            expires_in: {
                $gte: Date.now()
            }
        }

        let isFeedBackExists = await feedBackDb.findOne(findCri)

        if (!isFeedBackExists) {
            throw new Error('invalid link or link expired')
        }

        // if (isFeedBackExists.is_already_submitted) {
        //     throw new Error("FeedBack already submitted")
        // }

        let updateCri = {
            is_already_submitted: true,
            feedBackResponse: feedBackResponse
        }

        console.log(feedBackResponse, "feedBackResponse")

        let sum = 0
        let overAllRating = feedBackResponse.map((ite) => sum += Number(ite.answer))

        let average = sum / feedBackResponse.length

        if (overAllRating) {
            updateCri = {
                ...updateCri,
                over_all_rating: average
            }
        }
        let feedBackSubmitted = await feedBackDb.findOneAndUpdate(findCri, updateCri, { new: true })

        return actionCompleteResponse(res, feedBackSubmitted)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}
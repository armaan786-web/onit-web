const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
const adminDb = require('../../model/admin.model')
const centerDb = require('../../model/center.model');
const verificationDb = require('../../model/otpVerificationModel')
const technicianDb = require('../../model/technician.model')
const ticketDb = require('../../model/ticket.model')
const servicesDb = require('../../model/primaryServices.model')
const FeedBackDb = require('../../model/feedback')
const clientDb = require('../../model/client.model');
const BroadCastDb = require('../../model/broadcast.model')
const counterHelper = require('../../helpers/dbHelper')
const RolesDb = require('../../model/role.model')
const uploadModule = require('../../helpers/helper')

const centerOnBoarder = require('../../model/centerobording.model')

const commonFolder = require('../../common/common')

const adminServices = require('./admin_services')
const centerServices = require('../center/center_services');

const commonFunctionForAuth = require('../../helpers/common');
const { sequence_generator, availableTimePreference, ticketCreatedBy, rolesBasedOnNumberOfTechnician, engagementType, profileCreatedBy, TicketAssignType, broadCastStatus, ticketStatus } = require('../../common/const');

let msg = ""

exports.uploadCsvTicket = async (req, res, next) => {
    try {
        if (!req.files || !req.files.length || !req.files[0].path) {
            throw new Error("not file is attached")
        }
        var filePath = req.files[0].path.toString();

        var fileData = await uploadModule.fetchDataFromExcel(filePath);
        if (!(fileData && Array.isArray(fileData) && fileData.length)) {
            throw new Error("excel is not having any sheet after parsed")
        }
        let excelDataInJson = fileData[0].data
        let headerValues = excelDataInJson[0]

        let headerValuesToBeExisiting = {
            A: 'CenterQr',
            B: 'Client Id',
            C: 'Service provided for',
            D: 'Specific requirement',
            E: 'Client ticket id',
            F: 'Country code',
            G: 'Mobile number',
            H: 'Customer name',
            I: 'House number',
            J: 'Locality',
            K: 'City',
            L: 'State',
            M: 'Pincode',
            N: 'Additional Pincode',
            O: 'Country',
            P: 'Time preference type',
            Q: 'Specific date and time',
            R: 'Ticket price',
            S: 'Offer code',
            T: 'Is paid ticket'
        }

        if (!(JSON.stringify(headerValues) === JSON.stringify(headerValuesToBeExisiting))) {
            throw new Error("header value mismatch with the redefined values" + JSON.stringify(headerValues) + JSON.stringify(headerValuesToBeExisiting))
        }

        excelDataInJson = excelDataInJson.slice(1, excelDataInJson.length)

        if (!(excelDataInJson && Array.isArray(excelDataInJson) && excelDataInJson.length)) {
            throw new Error("empty records found")
        }
        let row = 0;
        let errorRowWise = {}
        let doesErrorExists = false
        let insertObjs = []
        for (let ticket of excelDataInJson) {
            row++

            let centerQr = ticket.A
            let client_id = ticket.B
            let service_provided_for = ticket.C
            let specific_requirement = ticket.D
            let client_ticket_id = ticket.E
            let country_code = ticket.F
            let mobile_number = ticket.G;
            let customer_name = ticket.H
            let house_number = ticket.I;
            let locality = ticket.J;
            let city = ticket.K;
            let state = ticket.L;
            let pincode = ticket.M;
            let additionalPincode = ticket.N;
            let country = ticket.O;
            let time_preference_type = ticket.P;
            let specific_date_time = ticket.Q;
            let ticket_price = ticket.R;
            let offer_code = ticket.S;
            let is_paid_ticket = ticket.T;


            let insertTicketObj = {
                specific_requirement: specific_requirement,
                client_ticket_id,
                personal_details: {
                    primary_phone: {
                        country_code: country_code,
                        mobile_number: mobile_number,
                    },
                    alternate_phone: {
                        country_code: "",
                        mobile_number: "",
                    },
                    name: customer_name
                },
                address_details: {
                    city: city,
                    state: state,
                    pincode: pincode,
                    additional_pincode: additionalPincode,
                    country: country,
                    house_number,
                    locality
                },
                time_preference: {
                    time_preference_type: time_preference_type,
                    specific_date_time: specific_date_time,
                },
                ticket_price: ticket_price,
                ticket_created_by: ticketCreatedBy.IMPORT_VIA_EXCEL,

                offers_applied: {
                    offer_code: offer_code
                }
            }

            let errors = []

            if (!["Yes", "No"].includes(is_paid_ticket)) {
                errors.push("Invalid feild for is_paid_ticket")
            }
            is_paid_ticket = is_paid_ticket == "Yes" ? true : false
            insertTicketObj = {
                ...insertTicketObj,
                admin_setting: {
                    is_paid: is_paid_ticket
                },
            }
            if (!availableTimePreference.includes(time_preference_type)) {
                errors.push("Invalid feild for time_preference_type")
            }

            let findCriService = {
                service_name: service_provided_for
            }

            let doesSeriveExists = await servicesDb.findOne(findCriService)

            if (!doesSeriveExists) {
                errors.push("The service u provided doesnt exists")
            } else {


                insertTicketObj = {
                    ...insertTicketObj,
                    service_provided_for: doesSeriveExists._id
                }
            }

            let findCriClient = {
                client_id
            }


            let doesClientExists = await clientDb.findOne(findCriClient)

            if (!doesClientExists) {
                errors.push("The client u provided does not exist")
            }


            if (centerQr) {
                let findCriCenter = {
                    "qr_details.qr_id": centerQr
                }

                let doesCenterExists = await centerDb.findOne(findCriCenter)

                if (!doesCenterExists) {
                    errors.push("The center does not exists with this qr")
                } else {
                    insertTicketObj = {
                        ...insertTicketObj,
                        "assigned_ids.assigned_center_id": doesCenterExists._id
                    }
                }

            }

            errorRowWise[row] = errors
            if (errors.length > 0) {
                doesErrorExists = true
            } else {
                let sequenceForTicket = await counterHelper.getNextSequenceValue(sequence_generator.TICKET)
                var dateObj = new Date();
                var month = dateObj.getUTCMonth() + 1;
                var day = dateObj.getUTCDate();
                var year = dateObj.getUTCFullYear();

                let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

                let shortCode = doesClientExists.short_code || ""

                newdate = "T" + shortCode + '' + newdate

                insertTicketObj = {
                    ...insertTicketObj,
                    ticket_id: newdate
                }
            }

            insertObjs.push(insertTicketObj)

        }

        if (doesErrorExists) {
            msg = "File has some errors"
            let resData = {
                doesErrorExists,
                errorRowWise
            }
            actionCompleteResponse(res, resData, msg)

            return

        }


        let ticketsUploaded = await ticketDb.insertMany(insertObjs)
        msg = "File has been uploaded successfully"
        let resData = {
            doesErrorExists,
            ticketsUploaded,
            errorRowWise
        }
        actionCompleteResponse(res, resData, msg)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}


exports.updateCenterOnBoarder = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails
        let { name, phone_details, center_onboarder_id, primary_services, secondary_services, allowed_states, allowed_cities } = req.body


        let findCri = {
            _id: center_onboarder_id
        }

        let updateCri = {}

        name ? updateCri['name'] = name : ''
        phone_details.country_code ? updateCri['phone_details.country_code'] = phone_details.country_code : ''
        phone_details.mobile_number ? updateCri['phone_details.mobile_number'] = phone_details.mobile_number : ''
        primary_services ? updateCri['services.primary_services'] = primary_services : ''
        secondary_services ? updateCri['services.secondary_services'] = secondary_services : ''
        allowed_states ? updateCri['allowed_states'] = allowed_states : ''
        allowed_cities ? updateCri['allowed_cities'] = allowed_cities : ''

        await centerOnBoarder.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Center onboarder updated successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.createCenterOnBoarder = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails
        let { name, phone_details, primary_services, secondary_services, allowed_states, allowed_cities } = req.body

        let sequenceForCenterOnboarder = await counterHelper.getNextSequenceValue(sequence_generator.CENTER_ONBOARDER_ID)

        let insertObj = {
            center_onboarder_id: "CO" + "_" + sequenceForCenterOnboarder,
            name,
            phone_details,
            services: [],
            allowed_states: [],
            allowed_cities: [],
            otpDetails: {
                is_otp_verfied: true,
            }
        }

        await new centerOnBoarder(insertObj).save()

        msg = "Center onboarder created successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllCenterOnBoarder = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails
        let { skip, limit } = req.query
        let payload = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {};
        payload.center_onboarder_id ? crit['_id'] = payload.center_onboarder_id : ""

        let results = await centerOnBoarder.find(crit).populate("services.primary_services")
            .sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await centerOnBoarder.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllAvailableRoles = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails
        let { skip, limit } = req.query
        let payload = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}

        payload.role_obj_id ? crit['_id'] = payload.role_obj_id : ""

        let results = await RolesDb.find(crit)
            .sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await RolesDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.addMinAddRole = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails

        let { role_name, permissions, role_created_user } = req.body

        let insert_obj = {
            role_created_user,
            role_name: role_name,
            permissions: permissions
        }

        await RolesDb(insert_obj).save()

        msg = "Roles created successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminUpdateRole = async (req, res, next) => {
    try {
        let adminDetails = req.adminDetails

        let { role_obj_id, role_name, permissions, role_created_user } = req.body

        let findCri = {
            _id: role_obj_id,
        }

        let updateCri = {}

        role_name ? updateCri['role_name'] = role_name : ''
        permissions?.add_center == false || permissions?.add_center ? updateCri['permissions.add_center'] = permissions?.add_center : ''
        permissions?.update_center?.view_pincode == false || permissions?.update_center?.view_pincode ? updateCri['permissions.update_center.full_access'] = permissions?.update_center?.full_access : ''
        permissions?.delete_center == false || permissions?.delete_center ? updateCri['permissions.delete_center'] = permissions?.delete_center : ''
        permissions?.view_center_details?.full_access == false || permissions?.view_center_details?.full_access ? updateCri['permissions.view_center_details.full_access'] = permissions?.view_center_details?.full_access : ''
        permissions?.view_center_details?.view_pincode == false || permissions?.view_center_details?.view_pincode ? updateCri['permissions.view_center_details.view_pincode'] = permissions?.view_center_details?.view_pincode : ''
        permissions?.add_technician == false || permissions?.add_technician ? updateCri['permissions.add_technician'] = permissions?.add_technician : ''
        permissions?.update_technician?.full_access == false || permissions?.update_technician?.full_access ? updateCri['permissions.update_technician.full_access'] = permissions?.update_technician?.full_access : ''
        permissions?.delete_technician == false || permissions?.delete_technician ? updateCri['permissions.delete_technician'] = permissions?.delete_technician : ''
        permissions?.view_technician_details?.full_access == false || permissions?.view_technician_details?.full_access ? updateCri['permissions.view_technician_details.full_access'] = permissions?.view_technician_details?.full_access : ''
        permissions?.view_technician_details?.technician_phone == false || permissions?.view_technician_details?.technician_phone ? updateCri['permissions.view_technician_details.technician_phone'] = permissions?.view_technician_details?.technician_phone : ''
        permissions?.view_dashboard_full_access == false || permissions?.view_dashboard_full_access ? updateCri['permissions.view_dashboard_full_access'] = permissions?.view_dashboard_full_access : ''
        permissions?.add_new_services == false || permissions?.add_new_services ? updateCri['permissions.add_new_services'] = permissions?.add_new_services : ''
        permissions?.update_services?.full_access == false || permissions?.update_services?.full_access ? updateCri['permissions.update_services.full_access'] = permissions?.update_services?.full_access : ''
        permissions?.inactive_active == false || permissions?.inactive_active ? updateCri['permissions.inactive_active'] = permissions?.inactive_active : ''
        permissions?.view_services_list?.full_access == false || permissions?.view_services_list?.full_access ? updateCri['permissions.view_services_list.full_access'] = permissions?.view_services_list?.full_access : ''
        permissions?.add_ticket == false || permissions?.add_ticket ? updateCri['permissions.add_ticket'] = permissions?.add_ticket : ''
        permissions?.edit_ticket?.full_access == false || permissions?.edit_ticket?.full_access ? updateCri['permissions.edit_ticket.full_access'] = permissions?.edit_ticket?.full_access : ''
        permissions?.delete_ticket == false || permissions?.delete_ticket ? updateCri['permissions.delete_ticket'] = permissions?.delete_ticket : ''
        permissions?.view_ticket?.full_access == false || permissions?.view_ticket?.full_access ? updateCri['permissions.view_ticket.full_access'] = permissions?.view_ticket?.full_access : ''
        permissions?.add_clients == false || permissions?.add_clients ? updateCri['permissions.add_clients'] = permissions?.add_clients : ''
        permissions?.edit_clients?.full_access == false || permissions?.edit_clients?.full_access ? updateCri['permissions.edit_clients.full_access'] = permissions?.edit_clients?.full_access : ''
        permissions?.view_clients?.full_access == false || permissions?.view_clients?.full_access ? updateCri['permissions.view_clients.full_access'] = permissions?.view_clients?.full_access : ''
        permissions?.view_broadcastedList == false || permissions?.view_broadcastedList ? updateCri['permissions.view_broadcastedList'] = permissions?.view_broadcastedList : ''
        permissions?.add_role == false || permissions?.add_role ? updateCri['permissions.add_role'] = permissions?.add_role : ''
        permissions?.edit_role_permissions?.full_access == false || permissions?.edit_role_permissions?.full_access ? updateCri['permissions.edit_role_permissions.full_access'] = permissions?.edit_role_permissions?.full_access : ''
        permissions?.delete_role == false || permissions?.delete_role ? updateCri['permissions.delete_role'] = permissions?.delete_role : ''
        permissions?.view_role?.full_access == false || permissions?.view_role?.full_access ? updateCri['permissions.view_role.full_access'] = permissions?.view_role?.full_access : ''

        await RolesDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Role has been updated successfully"
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminGetAllBroadCastedTicket = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}


        let results = await BroadCastDb.find(crit)
            .populate({
                path: 'ticket_obj_id',
                populate: {
                    path: 'assigned_ids.assigned_technician_id'
                }
            })
            .populate('center_obj_id')
            .sort({ _id: -1 })

            .skip(skipp).limit(limitt)
        let totalCount = await BroadCastDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }

}

exports.adminGetAllFeedBacks = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}


        let results = await FeedBackDb.find(crit)
            .populate({
                path: 'ticket_obj_id',
                populate: {
                    path: 'assigned_ids.assigned_technician_id'
                }
            })
            .populate('center_obj_id')
            .sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await FeedBackDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }

}

exports.adminBroadCast = async (req, res, next) => {
    try {
        let { ticket_obj_id } = req.body

        let findCri = {
            _id: ticket_obj_id,
        }

        let isTicketFound = await ticketDb.findOne(findCri)

        if (!isTicketFound) {
            throw new Error("No ticket exists with this id")
        }
        if (isTicketFound.ticket_status == ticketStatus.CLOSED) {
            throw new Error("Ticket is closed , cant assign technician")
        }

        if (!(isTicketFound.broadcast_status == broadCastStatus.NO_MATCH_FOUND)) {
            throw new Error("Broad cast status is not in no match found cant broadcast")
        }

        await adminServices.broadCastAllTicketsV1("", isTicketFound)

        msg = "SuccessFully broadcasted again"
        let resData = {}
        actionCompleteResponse(res, resData, msg)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminGetServices = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}


        let results = await servicesDb.find(crit)
            .skip(skipp).limit(limitt)
        let totalCount = await servicesDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminGetActiveServices = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {
            is_active: 1
        }

        let results = await servicesDb.find(crit)
            .skip(skipp).limit(limitt)
        let totalCount = await servicesDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.createServices = async (req, res, next) => {
    try {
        let { service_name, pin_code } = req.body

        await adminServices.checkIfServiceAlreadyExists(service_name);

        let insertObj = {
            service_name, pin_code
        }

        await new servicesDb(insertObj).save()

        msg = "Services created successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminDeleteService = async (req, res, next) => {
    try {
        let { serviceId } = req.body;


        let deleteObj = {
            _id: serviceId
        }

        await servicesDb.deleteOne(deleteObj);

        msg = "Service deleted successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.login = async (req, res, next) => {
    try {
        let { user_name, password } = req.body

        let findCriteria = {
            user_name: user_name
        }

        let isAdminFound = await adminDb.findOne(findCriteria).populate("role_id")

        if (!isAdminFound) {
            throw new Error("Admin does not exist with this user name")
        }

        let hashedPassword = isAdminFound.password

        const match = await adminServices.comparePassword(password, hashedPassword)

        if (!match) {
            throw new Error("Please enter the correct password")
        }


        let tokenEmbed = {
            _id: isAdminFound._id,
        }

        let token = commonFunctionForAuth.generateAccessToken(tokenEmbed)

        msg = "Loged in successfully"
        let resData = { token, adminDetails: isAdminFound }
        actionCompleteResponse(res, resData, msg)




    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        let { skip, limit } = req.query
        let payload = req.query
        let findCri = {}

        let crit = {};
        payload.user_obj_id ? crit['_id'] = payload.role_obj_id : ""

        let allUsers = await adminDb.find(crit).populate('role_id').skip(skip).limit(limit)
        let totalCount = await adminDb.countDocuments(crit)
        msg = "All users retrived"
        actionCompleteResponse(res, { allUsers, totalCount }, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.removeUsers = async (req, res, next) => {
    try {
        let { user_object_id } = req.body

        await adminDb.findOneAndDelete({ _id: user_object_id })

        let resData = {};
        msg = "User deleted successfully"
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.createUsers = async (req, res, next) => {
    try {
        let { user_name, password, role_id } = req.body

        let { phone_number, country_code } = req.body

        await adminServices.checkIfAdminAlreadyExists(user_name)

        let hashedPassword = await adminServices.returnHashPassword(password)

        let insertObj = {
            user_name,
            password: hashedPassword,
            phone: {
                country_code: country_code,
                mobile_number: phone_number
            },
            role_id
        }

        let resData = await new adminDb(insertObj).save()

        msg = "Admin created successfully"
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.createAdmin = async (req, res, next) => {
    try {
        let { user_name, password, phone } = req.body

        let { country_code, mobile_number } = phone

        await adminServices.checkIfAdminAlreadyExists(user_name)

        let hashedPassword = await adminServices.returnHashPassword(password)

        let insertObj = {
            user_name,
            password: hashedPassword,
            phone
        }

        let resData = await new adminDb(insertObj).save()

        msg = "Admin created successfully"
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminUpdateCenter = async (req, res, next) => {
    try {
        let { personal_details, center_name, primary_services,
            secondary_services,
            address_details,
            no_of_technicians,
            clients_ids_list,
            center_obj_id,
            login_into_application,
            accepting_broadcast_ticket,
            upi_id
        } = req.body

        let findCri = {
            _id: center_obj_id,
        }

        let updateCri = {}

        personal_details?.phone ? updateCri['personal_details.phone'] = personal_details?.phone : ''
        personal_details?.email ? updateCri['personal_details.email'] = personal_details?.email : ''
        personal_details?.name ? updateCri['personal_details.name'] = personal_details?.name : ''
        personal_details?.user_name ? updateCri['personal_details.user_name'] = personal_details?.user_name : ''
        personal_details?.about ? updateCri['personal_details.about'] = personal_details?.about : ''

        primary_services ? updateCri['services.primary_services'] = primary_services : ''
        secondary_services ? updateCri['services.secondary_services'] = secondary_services : ''
        center_name ? updateCri['center_name'] = center_name : ''

        address_details?.address_line ? updateCri['address_details.address_line'] = address_details?.address_line : ''
        address_details?.city ? updateCri['address_details.city'] = address_details?.city : ''
        address_details?.state ? updateCri['address_details.state'] = address_details?.state : ''
        address_details?.pincode ? updateCri['address_details.pincode'] = address_details?.pincode : ''
        address_details?.additional_pincode ? updateCri['address_details.additional_pincode'] = address_details?.additional_pincode : ''
        address_details?.country ? updateCri['address_details.country'] = address_details?.country : ''
        address_details?.google_geo_location ? updateCri['address_details.google_geo_location'] = address_details?.google_geo_location : ''

        no_of_technicians ? updateCri['no_of_technicians'] = no_of_technicians : ''
        upi_id ? updateCri['payment_details.upi_id'] = upi_id : ''

        login_into_application ? updateCri['disabled_for.login_into_application'] = login_into_application : ''
        accepting_broadcast_ticket ? updateCri['disabled_for.accepting_broadcast_ticket'] = accepting_broadcast_ticket : ''


        clients_ids_list ? updateCri['clients_ids_list'] = clients_ids_list : ''

        await centerDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Center has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminUpdateTechnician = async (req, res, next) => {
    try {
        let { personal_details, primary_services, secondary_services, service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, emergency_details,
            document_details, referenceDetails, center_obj_id, clients_ids_list, technician_obj_id
        } = req.body

        let findCri = {
            _id: technician_obj_id,
        }

        let updateCri = {}

        //todo make the array data as operation types
        center_obj_id ? updateCri['center_id'] = center_obj_id : ''

        personal_details?.phone ? updateCri['personal_details.phone'] = personal_details?.phone : ''
        personal_details?.email ? updateCri['personal_details.email'] = personal_details?.email : ''
        personal_details?.name ? updateCri['personal_details.name'] = personal_details?.name : ''
        personal_details?.user_name ? updateCri['personal_details.user_name'] = personal_details?.user_name : ''
        personal_details?.about ? updateCri['personal_details.about'] = personal_details?.about : ''

        primary_services ? updateCri['services.primary_services'] = primary_services : ''
        secondary_services ? updateCri['services.secondary_services'] = secondary_services : ''

        service_area_main_pincode ? updateCri['service_area_main_pincode'] = service_area_main_pincode : ''
        service_area_secondary_pincode ? updateCri['service_area_secondary_pincode'] = service_area_secondary_pincode : ''


        address_details_permanent?.address_line ? updateCri['address_details_permanent.address_line'] = address_details_permanent?.address_line : ''
        address_details_permanent?.city ? updateCri['address_details_permanent.city'] = address_details_permanent?.city : ''
        address_details_permanent?.state ? updateCri['address_details_permanent.state'] = address_details_permanent?.state : ''
        address_details_permanent?.pincode ? updateCri['address_details_permanent.pincode'] = address_details_permanent?.pincode : ''
        address_details_permanent?.additional_pincode ? updateCri['address_details_permanent.additional_pincode'] = address_details_permanent?.additional_pincode : ''
        address_details_permanent?.short_code_for_place ? updateCri['address_details_permanent.short_code_for_place'] = address_details_permanent?.short_code_for_place : ''
        address_details_permanent?.country ? updateCri['address_details_permanent.country'] = address_details_permanent?.country : ''
        address_details_permanent?.google_geo_location ? updateCri['address_details_permanent.google_geo_location'] = address_details_permanent?.google_geo_location : ''

        address_details_temporary?.address_line ? updateCri['address_details_temporary.address_line'] = address_details_temporary?.address_line : ''
        address_details_temporary?.city ? updateCri['address_details_temporary.city'] = address_details_temporary?.city : ''
        address_details_temporary?.state ? updateCri['address_details_temporary.state'] = address_details_temporary?.state : ''
        address_details_temporary?.pincode ? updateCri['address_details_temporary.pincode'] = address_details_temporary?.pincode : ''
        address_details_temporary?.additional_pincode ? updateCri['address_details_temporary.additional_pincode'] = address_details_temporary?.additional_pincode : ''
        address_details_temporary?.short_code_for_place ? updateCri['address_details_temporary.short_code_for_place'] = address_details_temporary?.short_code_for_place : ''
        address_details_temporary?.country ? updateCri['address_details_temporary.country'] = address_details_temporary?.country : ''
        address_details_temporary?.google_geo_location ? updateCri['address_details_temporary.google_geo_location'] = address_details_temporary?.google_geo_location : ''

        engagement_type ? updateCri['engagement_type'] = engagement_type : ''

        document_details?.pan_card_document ? updateCri['document_details.pan_card_document'] = document_details?.pan_card_document : ''
        document_details?.pan_number ? updateCri['document_details.pan_number'] = document_details?.pan_number : ''
        document_details?.aadhar_card_document?.front_side ? updateCri['document_details.aadhar_card_document.front_side'] = document_details?.aadhar_card_document?.front_side : ''
        document_details?.aadhar_card_document.back_side ? updateCri['document_details.aadhar_card_document.back_side'] = document_details?.aadhar_card_document?.back_side : ''
        document_details?.aadhar_number ? updateCri['document_details.aadhar_number'] = document_details?.aadhar_number : ''
        document_details?.gstin_number ? updateCri['document_details.gstin_number'] = document_details?.gstin_number : ''

        referenceDetails?.reference_person_name ? updateCri['referenceDetails.reference_person_name'] = referenceDetails?.reference_person_name : ''
        referenceDetails?.reference_person_mobile ? updateCri['referenceDetails.reference_person_mobile'] = referenceDetails?.reference_person_mobile : ''

        emergency_details?.emergency_person_name ? updateCri['emergency_details.emergency_person_name'] = emergency_details?.emergency_person_name : ''
        emergency_details?.emergency_person_phone ? updateCri['emergency_details.emergency_person_phone'] = emergency_details?.emergency_person_phone : ''

        clients_ids_list ? updateCri['clients_ids_list'] = clients_ids_list : ''

        await technicianDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Technician has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminUpdateTicket = async (req, res, next) => {
    try {
        let { service_provided_for, specific_requirement, personal_details, address_details
            , assigned_ids, time_preference, closing_ticket_price, offers_applied, ticket_status, ticket_obj_id, admin_remarks
        } = req.body

        let findCri = {
            _id: ticket_obj_id,
        }

        let ticketObjectBeforeUpdate = await ticketDb.findOne(findCri);

        if (!ticketObjectBeforeUpdate) {
            throw new Error("Ticket not found, can't update");
        }

        let updateCri = {}

        service_provided_for ? updateCri['service_provided_for'] = service_provided_for : ''
        specific_requirement ? updateCri['specific_requirement'] = specific_requirement : ''

        personal_details?.primary_phone ? updateCri['personal_details.primary_phone'] = personal_details?.primary_phone : ''
        personal_details?.alternate_phone ? updateCri['personal_details.alternate_phone'] = personal_details?.alternate_phone : ''
        personal_details?.name ? updateCri['personal_details.name'] = personal_details?.name : ''

        address_details?.house_number ? updateCri['address_details.house_number'] = address_details?.house_number : ''
        address_details?.locality ? updateCri['address_details.locality'] = address_details?.locality : ''
        address_details?.city ? updateCri['address_details.city'] = address_details?.city : ''
        address_details?.state ? updateCri['address_details.state'] = address_details?.state : ''
        address_details?.pincode ? updateCri['address_details.pincode'] = address_details?.pincode : ''
        address_details?.additional_pincode ? updateCri['address_details.additional_pincode'] = address_details?.additional_pincode : ''
        address_details?.short_code_for_place ? updateCri['address_details.short_code_for_place'] = address_details?.short_code_for_place : ''
        address_details?.country ? updateCri['address_details.country'] = address_details?.country : ''
        address_details?.google_geo_location ? updateCri['address_details.google_geo_location'] = address_details?.google_geo_location : ''

        time_preference?.time_preference_type ? updateCri['time_preference.time_preference_type'] = time_preference?.time_preference_type : ''
        time_preference?.specific_date_time ? updateCri['time_preference.specific_date_time'] = time_preference?.specific_date_time : ''
        time_preference?.specific_date_time_time_stamp ? updateCri['time_preference.specific_date_time_time_stamp'] = time_preference?.specific_date_time_time_stamp : ''


        assigned_ids?.assigned_technician_id ? updateCri['assigned_ids.assigned_technician_id'] = assigned_ids?.assigned_technician_id : ''
        assigned_ids?.assigned_center_id ? updateCri['assigned_ids.assigned_center_id'] = assigned_ids?.assigned_center_id : ''
        // assigned_ids?.assign_type ? updateCri['assigned_ids.assign_type'] = assigned_ids?.assign_type : ''

        ticket_status ? updateCri['ticket_status'] = ticket_status : ''
        closing_ticket_price ? updateCri['closing_ticket_price'] = closing_ticket_price : ''
        admin_remarks ? updateCri['remarks.admin_remarks'] = admin_remarks : ''

        let ticketUpdateResponse = await ticketDb.findOneAndUpdate(findCri, updateCri, { new: true });

        if (ticketUpdateResponse) {
            await adminServices.reBroadcastTicket(ticketObjectBeforeUpdate, ticketUpdateResponse);
        }

        msg = "Ticket has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminCreateCenter = async (req, res, next) => {
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
            }
        }

        insertObj = centerServices.getInsertObjBasedOnNoOfTechnicain(insertObj, no_of_technicians)

        insertObj.profile_created_by = profileCreatedBy.SUPER_ADMIN


        let inserttObjReult = await new centerDb(insertObj).save()

        if (!personal_details.name) {
            center_name ? insertObjTechnician['personal_details.name'] = center_name : '';
        }

        let insertObjTechnician = {
            personal_details,
            center_id: [inserttObjReult._id],
            services: {
                primary_services: primary_services,
                secondary_services: secondary_services
            },
            is_technician_admin: true,
            address_details_permanent: address_details,
            profile_created_by: profileCreatedBy.CENTER,
            engagement_type: engagementType.SELF_EMPLOYED
        }

        const technicianCreated = await new technicianDb(insertObjTechnician).save()
        console.log(technicianCreated, "technicianCreated")



        await verificationDb.deleteMany({ country_code, mobile_number })

        msg = "Center has been created successfully";
        let resData = {};
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminCreateTechnician = async (req, res, next) => {
    try {
        let { personal_details, primary_services, secondary_services, service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, emergency_details,
            document_details, referenceDetails, center_obj_id } = req.body


        let { phone } = personal_details
        let { country_code, mobile_number } = phone

        await centerServices.checkIfTechnicianAlreadyExists(country_code, mobile_number)

        let insertObj = {
            personal_details,
            services: {
                primary_services,
                secondary_services
            },
            service_area_main_pincode,
            service_area_secondary_pincode, address_details_permanent,
            address_details_temporary, engagement_type, document_details, referenceDetails,
            center_id: [center_obj_id],
            profile_created_by: profileCreatedBy?.SUPER_ADMIN,
            emergency_details
        }

        let resData = await new technicianDb(insertObj).save()

        msg = "Technician created successfully"
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminCreateTicket = async (req, res, next) => {
    try {
        let { service_provided_for, specific_requirement, personal_details, address_details
            , time_preference, offers_applied, center_obj_id, authorized_client_id, is_paid } = req.body

        let insertObj = {
            service_provided_for,
            specific_requirement,
            personal_details,
            time_preference,
            offers_applied,
            address_details,
            admin_setting: {
                is_paid
            }
        }

        let sequenceForTicket = await counterHelper.getNextSequenceValue(sequence_generator.TICKET)

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        let newdate = year + "" + month + "" + day + "" + sequenceForTicket;

        let doesClientExists = await clientDb.findOne({ _id: authorized_client_id })

        if (doesClientExists) {
            let shortCode = doesClientExists.short_code || ""

            newdate = "T" + shortCode + '' + newdate
        } else {
            newdate = "T" + "IN" + '' + newdate

        }

        if (authorized_client_id) {
            insertObj["authorized_client_id"] = authorized_client_id
        }

        newdate ? insertObj['ticket_id'] = newdate : ''

        if (center_obj_id) {
            insertObj = {
                ...insertObj,
                assigned_ids: {
                    assigned_center_id: center_obj_id,
                    assign_type: TicketAssignType.CENTER
                }
            }

        }

        insertObj.ticket_created_by = ticketCreatedBy.SUPER_ADMIN

        let resData = await new ticketDb(insertObj).save()

        resData = JSON.parse(JSON.stringify(resData))

        await adminServices.broadCastAllTicketsV1("", resData)

        msg = "Ticket created successfully"
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminGetAllCenter = async (req, res, next) => {
    try {

        let { skip, limit } = req.query
        let payload = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}

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
            .populate("services.secondary_services.secondary_services_id").populate("clients_ids_list").populate("onboarded_by").sort({ _id: -1 })
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

exports.adminGetAllTechnician = async (req, res, next) => {
    try {

        let { skip, limit } = req.query
        let payload = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}

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


        payload.primary_services ? crit['services.primary_services'] = {
            $in: payload.primary_services
        } : ''
        payload.secondary_services ? crit['services.secondary_services.secondary_services_id'] = {
            $in: payload.secondary_services
        } : ''
        payload.pincode ? crit['address_details.pincode'] = payload.pincode : ''
        payload.is_active ? crit['is_active'] = payload.is_active : ''
        payload.center_id ? crit['center_id'] = payload.center_id : ''
        payload.engagement_type ? crit['engagement_type'] = payload.engagement_type : ''
        payload.service_area_main_pincode ? crit['service_area_main_pincode'] = payload.service_area_main_pincode : ''

        let results = await technicianDb.find(crit).populate("clients_ids_list").populate('center_id')
            .skip(skipp).limit(limitt)
        let totalCount = await technicianDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)


    } catch (err) {

        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminGetSingleTickets = async (req, res, next) => {
    try {
        let { ticket_obj_id } = req.query


        let results = await ticketDb.find({ _id: ticket_obj_id }).populate("service_provided_for")
            .populate('assigned_ids.assigned_technician_id')
            .populate('assigned_ids.assigned_center_id')


        let feedBackList = await FeedBackDb.find({ ticket_obj_id: ticket_obj_id })

        let broadCastList = await BroadCastDb.find({ ticket_obj_id: ticket_obj_id }).populate({
            path: 'ticket_obj_id',
            populate: {
                path: 'assigned_ids.assigned_technician_id'
            }
        })
            .populate('center_obj_id')
            .sort({ _id: -1 })

        msg = "Ticket details fetched successfully"
        let resData = {
            results,
            feedBackList,
            broadCastList
        }
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminGetAllTickets = async (req, res, next) => {
    try {
        let { skip, limit } = req.query
        let payload = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}

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

        payload.ticket_obj_id ? crit['_id'] = payload.ticket_obj_id : ""
        payload.is_active ? crit['is_active'] = payload.is_active : ''
        payload.ticket_status ? crit['ticket_status'] = payload.ticket_status : ''
        payload.broadcast_status ? crit['broadcast_status'] = payload.broadcast_status : ''
        payload.time_preference_type ? crit['time_preference.time_preference_type'] = payload.time_preference_type : ''
        payload.pincode ? crit['address_details.pincode'] = payload.pincode : ''
        payload.service_provided_for ? crit['service_provided_for'] = payload.service_provided_for : ''
        payload.assigned_technician_id ? crit['assigned_ids.assigned_technician_id'] = payload.assigned_technician_id : ''
        payload.assigned_center_id ? crit['assigned_ids.assigned_center_id'] = payload.assigned_center_id : ''
        payload.assign_type ? crit['assigned_ids.assign_type'] = payload.assign_type : ''

        let results = await ticketDb.find(crit).populate("service_provided_for")
            .populate('assigned_ids.assigned_technician_id')
            .populate('assigned_ids.assigned_center_id').sort({ _id: -1 })
            .skip(skipp).limit(limitt)
        let totalCount = await ticketDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminAddClient = async (req, res, next) => {
    try {
        let { client_name, short_code, official_email, client_poc, address_details, gst_number } = req.body

        // await adminServices.checkIfServiceAlreadyExists(service_name);


        let isGstNumberValid = await commonFunctionForAuth.checkGstNumberIsValid(gst_number);

        if (!isGstNumberValid) {
            throw new Error("Please provide valid GST Number");
        }

        let insertObj = {
            client_name,
            official_email,
            client_poc,
            address_details,
            gst_number,
            short_code
        }


        let sequenceForTicket = await counterHelper.getNextSequenceValue(sequence_generator.CLIENT_ID)

        insertObj.client_id = "CL" + "-" + sequenceForTicket
        if (!short_code) {
            insertObj.short_code = client_name.substring(0, 2)
        }


        await new clientDb(insertObj).save()

        msg = "Client created successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminGetClients = async (req, res, next) => {
    try {
        let { skip, limit } = req.query

        let skipp = Number(skip) || 0
        let limitt = Number(limit) || 0

        let crit = {}


        let results = await clientDb.find(crit).sort({ _id: -1 })

            .skip(skipp).limit(limitt)
        let totalCount = await clientDb.countDocuments(crit)

        msg = "Data retrived Successfully"
        let data = results
        actionCompleteResponsePagination(res, data, msg, totalCount)



    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminDeleteClient = async (req, res, next) => {
    try {
        let { clientId } = req.body;


        let deleteObj = {
            _id: clientId
        }

        await clientDb.deleteOne(deleteObj);

        msg = "Client deleted successfully"
        let resData = {}
        actionCompleteResponse(res, resData, msg)

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}

exports.adminUpdateService = async (req, res, next) => {
    try {
        let { service_object_id, service_name, pin_code
        } = req.body

        let findCri = {
            _id: service_object_id,
        }

        let updateCri = {}

        service_name ? updateCri['service_name'] = service_name : ''
        pin_code ? updateCri['pin_code'] = pin_code : ''

        await servicesDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Service has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}

exports.adminUpdateServiceStatus = async (req, res, next) => {
    try {
        let { service_object_id, is_active } = req.body

        let findCri = {
            _id: service_object_id,
        }

        let updateCri = {
            is_active: is_active
        }

        await servicesDb.findOneAndUpdate(findCri, updateCri, { new: true })

        msg = "Service status has been updated successfully";
        let resData = {
            updateCri
        };
        actionCompleteResponse(res, resData, msg);

    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)
    }
}
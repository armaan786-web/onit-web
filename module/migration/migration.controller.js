
const { authenticationFailed, sendActionFailedResponse, actionCompleteResponse, actionCompleteResponsePagination } = require('../../common/common');
const centerDb = require('../../model/center.model');
const verificationDb = require('../../model/otpVerificationModel')
const technicianDb = require('../../model/technician.model')
const ticketDb = require('../../model/ticket.model')
const broadCastDb = require('../../model/broadcast.model')
const orderDb = require('../../model/order.model')
const centerMappingDb = require('../../model/migration/center_mapping.model')
const serviceDb = require('../../model/primaryServices.model')

const uploadModule = require('../../helpers/helper')
const migrationService = require('./migration.services')

exports.migrateCenter = async (req, res, next) => {
    try {


        await centerDb.deleteMany({})
        await centerMappingDb.deleteMany({})

        console.log(req.files)
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
            A: 'id',
            B: 'RoleId',
            C: 'name',
            D: 'dob',
            E: 'phone',
            F: 'email',
            G: 'primarySkill code',
            H: 'secondarySkill',
            I: 'Technican address',
            J: 'country',
            K: 'state',
            L: 'city',
            M: 'primaryPin',
            N: 'secondaryPinCode',
            O: 'experience',
            P: 'gst',
            Q: 'centerRef',
            R: 'idProof',
            S: 'idProofBack',
            T: 'panNumber',
            U: 'panCard',
            V: 'upi',
            W: 'technicianCount',
            X: 'authorization',
            Y: 'custom',
            Z: 'turnover',
            AA: 'username',
            AB: 'hash',
            AC: 'qrId',
            AD: 'about',
            AE: 'referenceFirstPerson',
            AF: 'referenceSecondPerson',
            AG: 'firstPersonPhoneNumber',
            AH: 'secondPersonPhoneNumber',
            AI: 'approved',
            AJ: 'status',
            AK: 'createdBy',
            AL: 'updatedBy',
            AM: 'deletedBy',
            AN: 'createdAt',
            AO: 'updatedAt',
            AP: 'skill'
        }

        console.log(headerValuesToBeExisiting, "headerValues", headerValues)

        if (!(JSON.stringify(headerValues) === JSON.stringify(headerValuesToBeExisiting))) {
            throw new Error("header value mismatch with the redefined values" + JSON.stringify(headerValues) + JSON.stringify(headerValuesToBeExisiting))
        }


        excelDataInJson = excelDataInJson.slice(2, excelDataInJson.length)

        if (!(excelDataInJson && Array.isArray(excelDataInJson) && excelDataInJson.length)) {
            throw new Error("empty records found")
        }

        let insertObjArr = []

        // let oldServiceMapping = {
        //     1: "Heating/Cooling(AC)",
        //     2: "General Electrician (Fan, Tube, Switches etc.)",
        //     3: "Kitchen Appliances (Water Purifier etc.)",
        //     4: "Appliance - Large",
        //     5: "Appliance - Small",
        //     6: "Home Entertainment",
        //     7: "Digital Device",
        //     8: "Furniture / Carpenter",
        //     9: "Plumbing Service",
        //     10: "Masonry Service",
        //     11: "Paint and whitewash",
        //     12: "Cleaning and disinfection",
        //     13: "Automobile Repair and Maintenance",
        //     14: "Pick and Drop",
        //     15: "Cycle and Fitness Equipment",
        // }

        let oldServiceMapping = {
            1: 'Cooling / Heating Appliances - Air Conditioner, Refrigerator, Geyser Etc',
            2: 'General Electrician - Wiring, MCB, Meter, Fuse, Inverter etc',
            3: 'Kitchen Appliances - Chimney, Water Purifier, MWO, Geyser, Hob/Hood etc',
            4: 'Appliance (Large) - Washing Machine, Refrigerator, Drier, Air Cooler, Geyser etc',
            5: 'Appliance (Small) - Toaster, Mixie, Fan, Heater, Press, Inverter etc',
            6: 'Home Entertainment - TV, Music System etc',
            7: 'Digital Devices - CCTV, Laptop, Printer etc',
            8: 'Furniture / Carpenter - Assembly/Fittings, Door/Window, Furniture Repair etc',
            9: 'Plumbing Service - Shower, Tap, Mixer, Cistern and Seat, overhead tank Fitting etc',
            10: 'Masonry Service - Tiles and Marble/Stone, Repair, Small alteration etc',
            11: 'Paint and Whitewash - Full / Portion of house whitewash / Texture Paint',
            12: 'Cleaning and Disinfection - Kitchen, Bathroom, Car, Sofa, Home Cleaning',
            13: 'Automobiles Repair & Maintenance - Car, Bike, e Bike repairs',
            14: 'Pick and Drop - point ot point rickshaw',
            15: 'Exercise and Fitness - Bicycle, Treadmill, massager etc'
        }
        
        for (let center of excelDataInJson) {
            let mysql_center_id = center.A;
            let name = center.C
            let dob = center.D
            let phone = center.E
            let email = center.F
            let primaryService = center.G;
            console.log(center.H, "center.H")
            let secondaryServce = JSON.parse(center.H == "NULL" ? '[]' : center.H);
            console.log(secondaryServce, "secondaryServce")
            let addresLine = center.I;
            let country = center.J;
            let state = center.K;
            let city = center.L;
            let primaryPin = center.M;
            let secondaryPinCode = center.N;
            let experience = center.O;
            let gst = center.P;
            let centerRef = center.Q;
            let idProof = center.R;
            let idProofBack = center.S;
            let panNumber = center.T;
            let panCard = center.U;
            let upi = center.V;
            let technicianCount = parseInt(center.W);
            let authorization = center.X;
            let turnover = center.Z;
            let username = center.AA;
            let hash = center.AB;
            let qrId = center.AC;
            let about = center.AD;
            let referenceFirstPerson = center.AE;
            let referenceSecondPerson = center.AF;
            let firstPersonPhoneNumber = center.AG;
            let secondPersonPhoneNumber = center.AH;
            let createdAt = center.AN;
            let updatedAt = center.AO;


            primaryService = oldServiceMapping[primaryService]

            let cri = {
                service_name: primaryService.toUpperCase(),
            }

            let serviceFound = await serviceDb.findOne(cri)
            console.log(serviceFound , "serviceFound")
            if (serviceFound) {
                primaryService = serviceFound._id
            }else{
                primaryService = null
            }

            let mongoSecondaryService = []

            if (secondaryServce.length) {

                secondaryServce.map(async ite => {
                    service = oldServiceMapping[Number(ite)]
                    let cri = {
                        service_name: service.toUpperCase(),
                    }
                    let serviceFound = await serviceDb.findOne(cri)
                    if (serviceFound) {
                        mongoSecondaryService.push({
                            secondary_services_id: serviceFound._id
                        })
                    }
                })
            }

            let insertObjCenter = {
                center_name: name,
                services: {
                    primary_services: primaryService,
                    secondary_services: mongoSecondaryService
                },
                address_details: {
                    address_line: addresLine,
                    city: city,
                    state: state,
                    pincode: primaryPin,
                    additional_pincode: secondaryPinCode,
                },
                no_of_technicians: technicianCount,

                personal_details: {
                    phone: {
                        mobile_number: phone
                    },
                    email: email,
                    name: name,
                    user_name: username,
                    about: about
                },

                document_details: {
                    pan_number: panNumber,

                    aadhar_card_document: {
                        front_side: idProof,
                        back_side: idProofBack
                    },
                    gstin_number: gst

                },
                referenceDetails: {
                    reference_person_name: referenceFirstPerson,
                    reference_person_mobile: firstPersonPhoneNumber,
                },

                emergency_details: {
                    emergency_person_name: referenceSecondPerson,
                    emergency_person_phone: secondPersonPhoneNumber
                },

                payment_details: {
                    upi_id: upi
                },

                qr_details: {
                    qr_id: qrId
                },

            }

            console.log(technicianCount, "technicianCount")

            let newInsertObj = migrationService.getInsertObjBasedOnNoOfTechnicain(insertObjCenter, technicianCount)

            console.log(insertObjCenter.services.primary_services , "insertObjCenter.services.primary_services")
            let insertObjResult = await new centerDb(newInsertObj).save()

            let migratedInsertObj = {
                sql_center_id: mysql_center_id,
                mongo_center_id: insertObjResult._id
            }

            await new centerMappingDb(migratedInsertObj).save()
        }

        msg = "uploading done"
        let data = {}
        actionCompleteResponse(res, data, msg)


    } catch (err) {
        console.log(err)
        sendActionFailedResponse(res, {}, err.message)

    }
}
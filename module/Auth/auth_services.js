
// const driverDb = require('../../model/driver.model.js');
// const companyNewDb = require('../../model/company_new.model');
// const verificationDb = require('../../model/verificationForDriver.model');

const bcrypt = require("bcrypt");
const saltRounds = require('../../common/common').saltRoundForPasswordHash;

module.exports.checkIfTheDriverPhoneNumberAlreadyExists = async (country_code, phone_number) => {
    try {

        let findCriteria = {
            "mobile_details.country_code_normal_phone": country_code,
            "mobile_details.mobile_number": phone_number,
        }


        let isDriverFound = await driverDb.find(findCriteria).limit(1).exec()
        if (isDriverFound && Array.isArray(isDriverFound) && isDriverFound.length) {
            throw new Error("Driver already exists with this phone number")
        }

    } catch (err) {
        throw new Error(err.message)
    }
}

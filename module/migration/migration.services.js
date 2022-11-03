const { rolesBasedOnNumberOfTechnician } = require("../../common/const");

exports.getInsertObjBasedOnNoOfTechnicain = (insertObj, no_of_technicians) => {

    if (no_of_technicians > 1) {
        insertObj = {
            ...insertObj,
            role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.CENTER
        }
        return insertObj

    }
    switch (no_of_technicians) {
        case 0: {
            insertObj = {
                ...insertObj,
                role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.DEALER
            }

        }
            break;
        case 1: {
            insertObj = {
                ...insertObj,
                role_based_on_no_of_technicians: rolesBasedOnNumberOfTechnician.FREELANCER
            }

        }
            break;
        default: {
            throw new Error("Invalid number of technician")
        }

    }
    return insertObj

}

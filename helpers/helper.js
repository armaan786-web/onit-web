
var xls = require("node-xlsx");
exports.fetchDataFromExcel = function (filePath) {

    return new Promise((resolve, reject) => {
        try {
            var excelData = xls.parse(filePath, {
                header: "A",
                blankrows: false,
                defval: null,
                raw: true,
            });
            return resolve(excelData);
        } catch (e) {
            return reject(new Error('Corrupted Excel File'));
        }
    });
}
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.authentication = require("./src/authentication/authentication");
exports.createUserName = require("./src/userSettings/createUserName");
exports.updateUserName = require("./src/userSettings/updateUserName");
exports.verifyTransaction = require("./src/payAccess/verifyTransaction");

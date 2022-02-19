const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.testFunction = require("./src/testFunction/testFunction");
exports.solanaTrans = require("./src/testFunction/solanaTransaction");

const functions = require("firebase-functions");

exports.testFunction = functions.https.onCall(async (data) => {
  return {
    // New user he can signin
    info: "hello",
    message: data,
  };
});

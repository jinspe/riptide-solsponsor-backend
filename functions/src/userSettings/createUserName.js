const functions = require("firebase-functions");
const admin = require("firebase-admin");

const USERNAMEMAXLENGTH = 40;
const USERNAMEMINLENGTH = 2;

exports.createUserName = functions.https.onCall(async (data, context) => {
  const newUserName = data;
  // userName not valid string
  if (!(typeof newUserName === "string" || newUserName instanceof String)) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a string newUserName"
    );
  }

  // user not auth when calling the function
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  // userName wrong size or value
  if (
    newUserName.length < USERNAMEMINLENGTH ||
    (newUserName.length > USERNAMEMAXLENGTH && newUserName !== context.auth.uid)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `The userName must be between ${USERNAMEMINLENGTH} and ${USERNAMEMAXLENGTH} or be the Publickey`
    );
  }

  if (!/^[0-9a-zA-Z_.-]+$/.test(newUserName)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Only letters, numbers, - and _ are allowed"
    );
  }

  const creatorRef = admin
    .firestore()
    .collection("creators")
    .doc(context.auth.uid);

  userNameRef = admin
    .firestore()
    .collection("creatorRef")
    .where("userName", "==", newUserName);

  try {
    const userNameQuery = await userNameRef.get();
    if (userNameQuery.docs.length !== 0) {
      throw new Error(`The userName ${newUserName} is taken`);
    }
  } catch (error) {
    throw new functions.https.HttpsError("unavailable", `${error?.message}`);
  }

  // Changing userName
  try {
    await creatorRef.set({ userName: newUserName }, { merge: true });
    return {
      info: "userName changed successfully",
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      "unavailable",
      `userName not changed successfully ${error?.message}`
    );
  }
});

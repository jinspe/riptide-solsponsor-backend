const functions = require("firebase-functions");
const solana = require("@solana/web3.js");
const admin = require("firebase-admin");

// const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const PRICEMARGINERROR = 1000;
const ONEDAYTIMESTAMP = 86400000;

exports.verifyTransaction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }
  const uid = context.auth.uid;
  const signature = data.signature;

  const connection = new solana.Connection(
    solana.clusterApiUrl("devnet"),
    "confirmed"
  );
  const parsedSignature = await connection.getParsedTransaction(signature);
  const transactionInfo =
    parsedSignature.transaction.message.instructions[0].parsed.info;

  const buyer = String(transactionInfo.source);

  if (buyer !== uid) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The source of the transaction doesn't match the user"
    );
  }
  const creator = String(transactionInfo.destination);

  const membershipRef = admin.firestore().collection("memberships").doc(uid);
  const membershipDoc = await membershipRef.get();

  // signature = "poyyyyoopooo";
  if (
    membershipDoc.exists &&
    membershipDoc.data()[creator] !== undefined &&
    membershipDoc.data()[creator].includes(signature)
  ) {
    console.log("duplicate error");
    throw new functions.https.HttpsError(
      "already-exists",
      "Signature already registered"
    );
  }

  // Calculate time added
  const transacTimestamp = parsedSignature.blockTime;
  const payedAmount = transactionInfo.lamports;
  const creatorRef = admin.firestore().collection("creators").doc(creator);
  const creatorDoc = await creatorRef.get();
  const priceLamports = creatorDoc.data().tierPrice * solana.LAMPORTS_PER_SOL;

  // javascript float lack of trust
  if (payedAmount < priceLamports - PRICEMARGINERROR) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Memberships should at least be 30 days"
    );
  }

  const currentDate = new Date();
  let membershipStartTime = currentDate.getTime();
  const timeAdded =
    payedAmount * (30 / priceLamports) * ONEDAYTIMESTAMP -
    (membershipStartTime - transacTimestamp * 1000);

  const userInfo = await admin.auth().getUser(uid);
  let newCustomClaims = { [creator]: membershipStartTime + timeAdded };

  if (userInfo?.customClaims !== undefined) {
    if (userInfo.customClaims[creator] !== undefined) {
      const prevTime = userInfo.customClaims[creator];
      if (prevTime > membershipStartTime) {
        membershipStartTime = prevTime;
      }
    }
    newCustomClaims = userInfo.customClaims;
    newCustomClaims[creator] = membershipStartTime + timeAdded;
  }

  await admin.auth().setCustomUserClaims(uid, newCustomClaims);

  membershipRef.set(
    {
      [creator]: admin.firestore.FieldValue.arrayUnion(signature),
    },
    { merge: true }
  );

  return {
    info: "Profile updated",
  };
});

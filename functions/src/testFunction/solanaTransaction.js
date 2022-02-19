const functions = require("firebase-functions");
const solana = require("@solana/web3.js");

exports.checkTransaction = functions.https.onCall(async (data) => {
  const signature = data.signature;
  const connection = new solana.Connection("https://api.devnet.solana.com");
  const info = await connection.getParsedTransaction(signature);

  return {
    // New user he can signin
    info: "hello",
    message: info,
  };
});

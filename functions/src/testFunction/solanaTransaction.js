const functions = require("firebase-functions");
const solana = require("@solana/web3.js");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

exports.checkTransaction = functions.https.onCall(async (data) => {
  // const signature = data.signature;
  // const connection = new solana.Connection("https://api.devnet.solana.com");
  // const info = await connection.getParsedTransaction(signature);
  const client = new SecretManagerServiceClient();
  const connection = new solana.Connection(
    solana.clusterApiUrl("devnet"),
    "confirmed"
  );

  const [accessResponse] = await client.accessSecretVersion({
    name: "projects/1066154527331/secrets/wKeyPair/versions/latest",
  });
  const myKeyPair = JSON.parse(accessResponse.payload.data.toString("utf8"));

  const myPublicKey = new solana.PublicKey(myKeyPair.publicKey);
  const mySecretKey = new Uint8Array(myKeyPair.secretKey);

  const signers = [{ publicKey: myPublicKey, secretKey: mySecretKey }];
  const transaction = new solana.Transaction().add(
    solana.SystemProgram.transfer({
      fromPubkey: myPublicKey,
      toPubkey: new solana.PublicKey(
        "FRvXcz7BLbc8KMyuZ9F5kgMCwuF4DJzCQSsGHc6WBLzJ"
      ),
      lamports: 99999,
    })
  );
  // Hni3vbpzJhggAhKte5AuaiRFNBhCX1VGzymroTt3rcDP
  transaction.add(
    solana.SystemProgram.transfer({
      fromPubkey: myPublicKey,
      toPubkey: new solana.PublicKey(
        "Hni3vbpzJhggAhKte5AuaiRFNBhCX1VGzymroTt3rcDP"
      ),
      lamports: 6666,
    })
  );

  const signature = await solana.sendAndConfirmTransaction(
    connection,
    transaction,
    signers
  );

  return {
    info: "hello",
    signature,
  };
});

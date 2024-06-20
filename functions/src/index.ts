import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {onSchedule} from "firebase-functions/lib/v2/providers/scheduler";
import * as admin from "firebase-admin";
import {defineSecret} from "firebase-functions/params";
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction, Keypair,
} from "@solana/web3.js";

const privateKeyEnv = defineSecret("ContractPrivateKey");
const contractAddress = "33r88B7LJhBBYtYgGKeP8KKNC4S2u7LjGsACVMGy31vU";

export const adminApp = admin.apps[0] || admin.initializeApp();

exports.scheduledFunctionCrontab = onSchedule("0 0 1 * *", async (event) => {
    const users = await adminApp.firestore().collection("users").get();

});

async function sendTransaction(methodName: string, params: any[]) {
    try {
        const privateKey = JSON.parse(privateKeyEnv.value());
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const keypair = Keypair.fromSecretKey(new Uint8Array(privateKey));
        const publicKey = keypair.publicKey;
        const programId = new PublicKey(contractAddress);
        const data = Buffer.from(methodName + JSON.stringify(params), "utf-8");
        const transaction = new Transaction().add({
            keys: [
                {pubkey: publicKey, isSigner: true, isWritable: false},
            ],
            programId,
            data,
        });

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair],
            {commitment: "confirmed"}
        );
        console.log("Transaction confirmed. Signature:", signature);
    } catch (error) {
        console.error("Error sending transaction:", error);
    }
}

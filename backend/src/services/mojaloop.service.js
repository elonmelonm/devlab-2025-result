const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const SENDER_DISPLAY_NAME = process.env.SENDER_DISPLAY_NAME;
const SENDER_ID_TYPE = process.env.SENDER_ID_TYPE;
const SENDER_ID_VALUE = process.env.SENDER_ID_VALUE;
const MOJALOOP_BASE_URL = process.env.MOJALOOP_BASE_URL || "http://localhost:4001";

module.exports = {
    async sendPayment(tx) {

        const payload = {
            from: {
                displayName: SENDER_DISPLAY_NAME,
                idType: SENDER_ID_TYPE,
                idValue: SENDER_ID_VALUE
            },
            to: {
                idType: tx.type_id || "MSISDN",
                idValue: tx.valeur_id
            },
            amountType: "SEND",
            currency: tx.devise,
            amount: tx.montant.toString(),
            transactionType: "TRANSFER",
            note: `Pension pour ${tx.nom_complet}`,
            homeTransactionId: uuidv4()
        };

        console.log(">>> Payload envoyé à Mojaloop :", payload);

        try {
            const response = await axios.post(
                `${MOJALOOP_BASE_URL}/transfers`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            return response.data;

        } catch (err) {
            console.error("Erreur Mojaloop :", err.response?.data || err.message);
            throw new Error(JSON.stringify(err.response?.data || err.message));
        }
    }
};

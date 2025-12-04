const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const csvUtil = require('../utils/csv.util.js');
const mojaloop = require('./mojaloop.service.js');


module.exports = {
    async createBatch(file) {
        const batchId = uuidv4();

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        fs.mkdirSync(batchDir);

        const csvPath = path.join(batchDir, file.name);
        await file.mv(csvPath);

        const parsed = await csvUtil.parseCsv(csvPath);

        const batchJsonPath = path.join(batchDir, 'batch.json');

        const initialBatch = {
            batchId,
            createdAt: new Date().toISOString(),
            status: "PENDING",
            inputFileName: file.name,
            summary: {},
            transactions: parsed.map((item, index) => ({
                txId: `tx-${String(index + 1).padStart(5, '0')}`,
                ...item,
                status: "PENDING",
            }))
        };

        fs.writeFileSync(batchJsonPath, JSON.stringify(initialBatch, null, 2));

        // Lancer le traitement asynchrone
        setTimeout(() => { 
            console.log(">>> PROCESSBATCH déclenché"); 
            this.processBatch(batchId)
        }, 50);

        return { batchId, status: "PENDING" };
    },

    async listBatches() {
        const basePath = path.join(__dirname, '../data/reports');
        const dirs = fs.readdirSync(basePath);

        return dirs.map(dir => {
            const batch = JSON.parse(fs.readFileSync(path.join(basePath, dir, 'batch.json')));
            return {
                batchId: batch.batchId,
                createdAt: batch.createdAt,
                status: batch.status
            }
        });
    },

    async getBatch(batchId) {
        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const batchJson = JSON.parse(
            fs.readFileSync(path.join(batchDir, 'batch.json'))
        );
        return batchJson;
    },

    async processBatch(batchId) {
        console.log(">>> DÉMARRAGE DU BATCH :", batchId);

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const batchPath = path.join(batchDir, 'batch.json');

        let batch = JSON.parse(fs.readFileSync(batchPath));

        batch.status = "RUNNING";
        fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));

        const transactions = batch.transactions;

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];

            try {
                const response = await mojaloop.sendPayment(tx);

                tx.status = "SUCCESS";
                tx.processedAt = new Date().toISOString();
                tx.mojaloop = {
                    transferId: response.transferId,
                    status: "SUCCESS",
                    rawResponse: response
                };

            } catch (err) {
                tx.status = "FAILED";
                tx.processedAt = new Date().toISOString();
                tx.mojaloop = {
                    status: "FAILED",
                    errorDescription: err.message
                };
            }

            fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));
        }

        batch.summary = {
            totalTransactions: transactions.length,
            successful: transactions.filter(t => t.status === "SUCCESS").length,
            failed: transactions.filter(t => t.status === "FAILED").length,
            totalAmount: transactions.reduce((s, t) => s + (t.montant || 0), 0),
            currency: transactions[0]?.devise || null
        };

        batch.status =
            batch.summary.failed > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED";

        fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));

        return batch;
    },

    async retryFailed(batchId) {
        // À implémenter plus tard
    },

    async getReport(batchId, format) {
        // À implémenter plus tard
    }
};

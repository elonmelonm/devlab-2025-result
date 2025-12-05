// batches.controller.js
const batchService = require('../services/batch.service.js');

module.exports = {
    createBatch: async (req, res) => {
        try {
            if (!req.files || !req.files.csv) {
                return res.status(400).json({ error: "CSV file missing" });
            }

            const file = req.files.csv;

            const result = await batchService.createBatch(file);

            console.log("CSV upload reçu :", file.name);
            console.log("Taille du fichier :", file.size, "octets");

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    listBatches: async (req, res) => {
        const list = await batchService.listBatches();
        res.json(list);
    },

    getBatch: async (req, res) => {
        const batch = await batchService.getBatch(req.params.batchId);
        res.json(batch);
    },

    getReport: async (req, res) => {
        try {
            const { batchId, format } = req.params;
            const report = await batchService.getReport(batchId, format);

            if (format === "json") {
                return res.json(report);
            }

            if (report.path) {
                return res.download(report.path);
            }

            res.status(400).json({ error: "Format de rapport inconnu." });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur lors de la génération du rapport." });
        }
    },

    retryFailed: async (req, res) => {
        const retryInfo = await batchService.retryFailed(req.params.batchId);
        res.json(retryInfo);
    }
};

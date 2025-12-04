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
        const file = await batchService.getReport(
            req.params.batchId,
            req.query.format
        );

        res.sendFile(file);
    },

    retryFailed: async (req, res) => {
        const retryInfo = await batchService.retryFailed(req.params.batchId);
        res.json(retryInfo);
    }
};

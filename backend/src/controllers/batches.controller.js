// batches.controller.js
const path = require('path');
const fs = require('fs');
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
        try {
            const list = await batchService.listBatches();
            res.json(list);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getBatch: async (req, res) => {
        try {
            const { batchId } = req.params;

            // ✅ CORRECTION : Utiliser le même chemin que batch.service.js
            const batchDir = path.join(__dirname, '../data/reports', batchId);
            const resultPath = path.join(batchDir, 'batch.result.json');
            const initialPath = path.join(batchDir, 'batch.initial.json');
            const progressPath = path.join(batchDir, 'batch.progress.json');

            console.log('🔍 Recherche du batch:', batchId);
            console.log('📁 Chemin:', batchDir);
            console.log('📄 Existe?', fs.existsSync(batchDir));

            if (!fs.existsSync(batchDir)) {
                console.error('❌ Dossier batch introuvable:', batchDir);
                return res.status(404).json({ error: "Batch not found" });
            }

            let batch;

            // Vérifier si le traitement est terminé
            if (fs.existsSync(resultPath)) {
                console.log('✅ Fichier result trouvé');
                const data = fs.readFileSync(resultPath, 'utf8');
                batch = JSON.parse(data);

                if (batch.status === 'COMPLETED' || batch.status === 'COMPLETED_WITH_ERRORS') {
                    batch.reportUrl = `/api/batches/${batchId}/report`;
                }
            }
            // Vérifier si le traitement est en cours
            else if (fs.existsSync(progressPath)) {
                console.log('⏳ Fichier progress trouvé');
                const data = fs.readFileSync(progressPath, 'utf8');
                batch = JSON.parse(data);
                batch.status = 'RUNNING';
            }
            // Sinon, récupérer le batch initial
            else if (fs.existsSync(initialPath)) {
                console.log('📋 Fichier initial trouvé');
                const data = fs.readFileSync(initialPath, 'utf8');
                batch = JSON.parse(data);
            }
            else {
                console.error('❌ Aucun fichier de données trouvé');
                return res.status(404).json({ error: "Batch data not found" });
            }

            console.log('✅ Batch trouvé, statut:', batch.status);
            return res.json(batch);

        } catch (error) {
            console.error('❌ Error in getBatch:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    },

    downloadReport: async (req, res) => {
        try {
            const { batchId, filename } = req.params;
            const filePath = path.join(__dirname, '../data/reports', batchId, filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "Report not found" });
            }

            res.download(filePath);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    // batches.controller.js
    getReport: async (req, res) => {
        try {
            const { batchId, format } = req.params;

            console.log('📊 Génération du rapport:', batchId, format);

            const report = await batchService.getReport(batchId, format);

            if (format === "json") {
                return res.json(report);
            }

            if (report.path && fs.existsSync(report.path)) {
                // ✅ Configuration correcte pour le téléchargement
                const filename = `rapport-${batchId}.${format}`;

                // Définir les bons headers
                res.setHeader('Content-Type',
                    format === 'pdf' ? 'application/pdf' :
                        format === 'csv' ? 'text/csv' :
                            'application/octet-stream'
                );
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                // Envoyer le fichier
                return res.sendFile(report.path);
            }

            res.status(404).json({ error: "Rapport non trouvé." });
        } catch (err) {
            console.error('❌ Erreur:', err);
            res.status(500).json({ error: "Erreur lors de la génération du rapport." });
        }
    },

    retryFailed: async (req, res) => {
        try {
            const { batchId } = req.params;
            const retryInfo = await batchService.retryFailed(batchId);
            res.json(retryInfo);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur lors du retry" });
        }
    }
};
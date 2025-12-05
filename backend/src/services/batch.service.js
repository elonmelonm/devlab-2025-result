// batch.service.js - Version avec validation complète
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const csvUtil = require('../utils/csv.util.js');
const mojaloop = require('./mojaloop.service.js');
const { Parser } = require('json2csv');
const PDFDocument = require("pdfkit-table");

// ════════════════════════════════════════════════════════════
// RÈGLES DE VALIDATION
// ════════════════════════════════════════════════════════════
const VALIDATION_RULES = {
    type_id: {
        required: true,
        exactValue: "PERSONAL_ID",
        errorMessage: "type_id doit être exactement 'PERSONAL_ID'"
    },
    valeur_id: {
        required: true,
        pattern: /^\d{10}$/,
        errorMessage: "valeur_id doit contenir exactement 10 chiffres numériques"
    },
    devise: {
        required: true,
        exactValue: "XOF",
        errorMessage: "devise doit être 'XOF'"
    },
    montant: {
        required: true,
        type: "number",
        min: 0,
        errorMessage: "montant doit être un nombre positif"
    },
    nom_complet: {
        required: true,
        type: "string",
        minLength: 1,
        errorMessage: "nom_complet ne peut pas être vide"
    }
};

// ════════════════════════════════════════════════════════════
// FONCTIONS DE VALIDATION
// ════════════════════════════════════════════════════════════

/**
 * Valide une seule transaction selon les règles définies
 * @param {Object} row - Ligne de données à valider
 * @param {number} lineNumber - Numéro de ligne dans le CSV
 * @returns {Object} - { valid: boolean, errors: string[], data: Object }
 */
function validateTransaction(row, lineNumber) {
    const errors = [];
    const cleanedData = {};

    // Validation type_id
    if (!row.type_id || row.type_id.trim() === '') {
        errors.push(VALIDATION_RULES.type_id.errorMessage);
    } else if (row.type_id.trim() !== VALIDATION_RULES.type_id.exactValue) {
        errors.push(VALIDATION_RULES.type_id.errorMessage);
    } else {
        cleanedData.type_id = row.type_id.trim();
    }

    // Validation valeur_id
    if (!row.valeur_id || row.valeur_id.trim() === '') {
        errors.push(VALIDATION_RULES.valeur_id.errorMessage);
    } else if (!VALIDATION_RULES.valeur_id.pattern.test(row.valeur_id.trim())) {
        errors.push(VALIDATION_RULES.valeur_id.errorMessage);
    } else {
        cleanedData.valeur_id = row.valeur_id.trim();
    }

    // Validation devise
    if (!row.devise || row.devise.trim() === '') {
        errors.push(VALIDATION_RULES.devise.errorMessage);
    } else if (row.devise.trim() !== VALIDATION_RULES.devise.exactValue) {
        errors.push(VALIDATION_RULES.devise.errorMessage);
    } else {
        cleanedData.devise = row.devise.trim();
    }

    // Validation montant
    const montantNum = Number(row.montant);
    if (!row.montant || row.montant === '' || isNaN(montantNum)) {
        errors.push(VALIDATION_RULES.montant.errorMessage);
    } else if (montantNum < VALIDATION_RULES.montant.min) {
        errors.push(VALIDATION_RULES.montant.errorMessage);
    } else {
        cleanedData.montant = montantNum;
    }

    // Validation nom_complet
    if (!row.nom_complet || typeof row.nom_complet !== 'string' || row.nom_complet.trim() === '') {
        errors.push(VALIDATION_RULES.nom_complet.errorMessage);
    } else {
        cleanedData.nom_complet = row.nom_complet.trim();
    }

    return {
        valid: errors.length === 0,
        errors,
        data: cleanedData,
        lineNumber
    };
}

// Cache pour suivre l'état des batches
const batchStatusCache = new Map();

// Mettre à jour l'état d'un batch dans le cache
function updateBatchStatus(batchId, status, progress = 0, message = '') {
    batchStatusCache.set(batchId, {
        batchId,
        status,
        progress,
        timestamp: new Date().toISOString(),
        message
    });
}

// Vérifier l'état d'un batch
async function checkBatchStatus(batchId) {
    const batchDir = path.join(__dirname, '../data/reports', batchId);
    
    // Vérifier si le dossier du batch existe
    if (!fs.existsSync(batchDir)) {
        throw new Error('Batch non trouvé');
    }

    // Vérifier les fichiers d'état
    const initialPath = path.join(batchDir, 'batch.initial.json');
    const cleanedPath = path.join(batchDir, 'batch.cleaned.json');
    const resultPath = path.join(batchDir, 'batch.result.json');

    let status = 'UNKNOWN';
    let progress = 0;
    let message = '';
    let processed = 0;
    let total = 0;

    if (fs.existsSync(initialPath)) {
        const initialData = JSON.parse(fs.readFileSync(initialPath, 'utf8'));
        total = initialData.transactions?.length || 0;
        
        if (fs.existsSync(cleanedPath)) {
            const cleanedData = JSON.parse(fs.readFileSync(cleanedPath, 'utf8'));
            const validCount = cleanedData.transactions?.length || 0;
            
            if (fs.existsSync(resultPath)) {
                const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                const successCount = resultData.transactions?.filter(t => t.status === 'SUCCESS').length || 0;
                const failedCount = resultData.transactions?.filter(t => t.status === 'FAILED').length || 0;
                
                processed = successCount + failedCount;
                progress = total > 0 ? Math.round((processed / total) * 100) : 0;
                
                if (resultData.status === 'COMPLETED') {
                    status = 'COMPLETED';
                    message = `Traitement terminé : ${successCount} succès, ${failedCount} échecs`;
                } else if (resultData.status === 'PARTIALLY_COMPLETED') {
                    status = 'PARTIALLY_COMPLETED';
                    message = `Traitement partiel : ${successCount} succès, ${failedCount} échecs`;
                } else {
                    status = 'PROCESSING';
                    message = `Traitement en cours : ${processed}/${total} (${progress}%)`;
                }
            } else {
                status = 'VALIDATED';
                progress = 30; // Validation terminée, en attente de traitement
                message = `Validation terminée : ${validCount} transactions valides`;
                processed = validCount;
            }
        } else {
            status = 'VALIDATING';
            progress = 10; // Début de la validation
            message = 'Validation du fichier en cours...';
        }
    } else {
        status = 'UPLOADED';
        progress = 5; // Fichier uploadé, validation pas encore commencée
        message = 'Fichier reçu, en attente de validation...';
    }

    // Mettre à jour le cache
    const statusData = {
        batchId,
        status,
        progress,
        processed,
        total,
        message,
        timestamp: new Date().toISOString()
    };
    
    batchStatusCache.set(batchId, statusData);
    return statusData;
}

module.exports = {

    // ════════════════════════════════════════════════════════════
    // 1. CREATE BATCH (Étape 1 - Upload CSV)
    // ════════════════════════════════════════════════════════════
    async createBatch(file) {
        const batchId = uuidv4();
        const batchDir = path.join(__dirname, '../data/reports', batchId);

        // Créer le répertoire du batch
        fs.mkdirSync(batchDir, { recursive: true });

        // Sauvegarder le CSV original
        const csvPath = path.join(batchDir, file.name);
        await file.mv(csvPath);

        // Parser le CSV
        const parsed = await csvUtil.parseCsv(csvPath);

        // Créer batch.initial.json (données brutes)
        const initialBatchPath = path.join(batchDir, 'batch.initial.json');
        const initialBatch = {
            batchId,
            createdAt: new Date().toISOString(),
            status: "UPLOADED",
            inputFileName: file.name,
            totalRows: parsed.length,
            transactions: parsed.map((item, index) => ({
                lineNumber: index + 1,
                ...item
            }))
        };

        fs.writeFileSync(initialBatchPath, JSON.stringify(initialBatch, null, 2));

        // Déclencher la validation après un court délai
        setTimeout(() => {
            console.log(">>> VALIDATION déclenchée pour batch:", batchId);
            module.exports.validateBatch(batchId);
        }, 100);

        return {
            batchId,
            status: "UPLOADED",
            message: "Fichier téléchargé, validation en cours..."
        };
    },

    // ════════════════════════════════════════════════════════════
    // 2. VALIDATE BATCH (Étape 2 - Validation)
    // ════════════════════════════════════════════════════════════
    async validateBatch(batchId) {
        console.log(">>> DÉBUT DE LA VALIDATION:", batchId);

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const initialBatchPath = path.join(batchDir, 'batch.initial.json');

        if (!fs.existsSync(initialBatchPath)) {
            throw new Error("batch.initial.json introuvable");
        }

        const initialBatch = JSON.parse(fs.readFileSync(initialBatchPath));

        const validTransactions = [];
        const rejectedTransactions = [];

        // Valider chaque transaction
        initialBatch.transactions.forEach((row, index) => {
            const validation = validateTransaction(row, index + 1);

            if (validation.valid) {
                validTransactions.push({
                    txId: `tx-${String(index + 1).padStart(5, '0')}`,
                    ...validation.data,
                    status: "PENDING"
                });
            } else {
                rejectedTransactions.push({
                    lineNumber: validation.lineNumber,
                    rejected: true,
                    reasons: validation.errors,
                    rawData: row
                });
            }
        });

        // Mettre à jour le statut de validation
        const validationStatus = validTransactions.length > 0 ? "VALIDATED" : "ALL_REJECTED";
        updateBatchStatus(batchId, validationStatus, 30, 
            validationStatus === "VALIDATED" 
                ? `${validTransactions.length} transactions valides`
                : 'Aucune transaction valide');

        // Sauvegarder batch.cleaned.json (transactions valides)
        const cleanedBatch = {
            batchId,
            createdAt: initialBatch.createdAt,
            validatedAt: new Date().toISOString(),
            status: validationStatus,
            inputFileName: initialBatch.inputFileName,
            summary: {
                totalRows: initialBatch.totalRows,
                validRows: validTransactions.length,
                rejectedRows: rejectedTransactions.length,
                validationRate: ((validTransactions.length / initialBatch.totalRows) * 100).toFixed(2) + '%'
            },
            transactions: validTransactions
        };

        const cleanedPath = path.join(batchDir, 'batch.cleaned.json');
        fs.writeFileSync(cleanedPath, JSON.stringify(cleanedBatch, null, 2));

        // Sauvegarder batch.rejected.json (transactions rejetées)
        const rejectedBatch = {
            batchId,
            rejectedAt: new Date().toISOString(),
            totalRejected: rejectedTransactions.length,
            rejectedTransactions
        };

        const rejectedPath = path.join(batchDir, 'batch.rejected.json');
        fs.writeFileSync(rejectedPath, JSON.stringify(rejectedBatch, null, 2));

        console.log(`>>> VALIDATION TERMINÉE: ${validTransactions.length} valides, ${rejectedTransactions.length} rejetées`);

        // Si des transactions valides existent, déclencher le traitement
        if (validTransactions.length > 0) {
            setTimeout(() => {
                console.log(">>> TRAITEMENT démarré pour batch:", batchId);
                module.exports.processBatch(batchId);
            }, 100);
        }

        return cleanedBatch;
    },

    // ════════════════════════════════════════════════════════════
    // 3. PROCESS BATCH (Étape 3 - Traitement Mojaloop)
    // ════════════════════════════════════════════════════════════
    async processBatch(batchId) {
        console.log(">>> DÉMARRAGE DU TRAITEMENT:", batchId);

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const cleanedPath = path.join(batchDir, 'batch.cleaned.json');

        if (!fs.existsSync(cleanedPath)) {
            throw new Error("batch.cleaned.json introuvable - validation requise");
        }

        let batch = JSON.parse(fs.readFileSync(cleanedPath));
        batch.status = "RUNNING";
        batch.processingStartedAt = new Date().toISOString();

        const transactions = batch.transactions;

        // Traitement des transactions via Mojaloop
        for (const tx of transactions) {
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
        }

        // Calcul du total (uniquement transactions réussies)
        const totalAmount = transactions
            .filter(t => t.status === "SUCCESS")
            .reduce((sum, t) => sum + Number(t.montant), 0);

        // Mise à jour du résumé
        batch.summary = {
            ...batch.summary,
            successful: transactions.filter(t => t.status === "SUCCESS").length,
            failed: transactions.filter(t => t.status === "FAILED").length,
            totalAmount,
            currency: "XOF"
        };

        const finalStatus = batch.summary.failed > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED";
        batch.status = finalStatus;
        
        // Mettre à jour le cache avec le statut final
        updateBatchStatus(batchId, finalStatus, 100, 
            `Traitement terminé : ${batch.summary.successful} succès, ${batch.summary.failed} échecs`);
        batch.processingCompletedAt = new Date().toISOString();

        // Sauvegarder batch.result.json
        const resultPath = path.join(batchDir, 'batch.result.json');
        fs.writeFileSync(resultPath, JSON.stringify(batch, null, 2));

        // Générer le rapport PDF
        const reportFilename = `rapport-${batchId}.pdf`;
        const reportPath = path.join(batchDir, reportFilename);
        await this.generateReportPdf(batch, reportPath, batchId);

        batch.reportUrl = `/api/batches/${batchId}/report/${reportFilename}`;

        console.log(">>> TRAITEMENT TERMINÉ:", batchId);
        return batch;
    },

    // ════════════════════════════════════════════════════════════
    // 4. LIST BATCHES
    // ════════════════════════════════════════════════════════════
    async listBatches() {
        const basePath = path.join(__dirname, '../data/reports');

        if (!fs.existsSync(basePath)) {
            return [];
        }

        const dirs = fs.readdirSync(basePath);

        return dirs.map(dir => {
            const batchDir = path.join(basePath, dir);

            // Essayer de lire les différents fichiers dans l'ordre
            const resultPath = path.join(batchDir, 'batch.result.json');
            const cleanedPath = path.join(batchDir, 'batch.cleaned.json');
            const initialPath = path.join(batchDir, 'batch.initial.json');

            let batchData;
            let status = "UNKNOWN";

            if (fs.existsSync(resultPath)) {
                batchData = JSON.parse(fs.readFileSync(resultPath));
                status = batchData.status;
            } else if (fs.existsSync(cleanedPath)) {
                batchData = JSON.parse(fs.readFileSync(cleanedPath));
                status = "VALIDATED";
            } else if (fs.existsSync(initialPath)) {
                batchData = JSON.parse(fs.readFileSync(initialPath));
                status = "UPLOADED";
            }

            return {
                batchId: batchData?.batchId || dir,
                createdAt: batchData?.createdAt || null,
                status
            };
        });
    },

    // ════════════════════════════════════════════════════════════
    // 5. GET BATCH
    // ════════════════════════════════════════════════════════════
    async getBatch(batchId) {
        const batchDir = path.join(__dirname, '../data/reports', batchId);

        const resultPath = path.join(batchDir, 'batch.result.json');
        const cleanedPath = path.join(batchDir, 'batch.cleaned.json');
        const rejectedPath = path.join(batchDir, 'batch.rejected.json');
        const initialPath = path.join(batchDir, 'batch.initial.json');

        let batchData = {};

        // Charger les données selon la disponibilité
        if (fs.existsSync(resultPath)) {
            batchData = JSON.parse(fs.readFileSync(resultPath));
        } else if (fs.existsSync(cleanedPath)) {
            batchData = JSON.parse(fs.readFileSync(cleanedPath));
        } else if (fs.existsSync(initialPath)) {
            batchData = JSON.parse(fs.readFileSync(initialPath));
        }

        // Ajouter les transactions rejetées si disponibles
        if (fs.existsSync(rejectedPath)) {
            const rejectedData = JSON.parse(fs.readFileSync(rejectedPath));
            batchData.rejectedTransactions = rejectedData.rejectedTransactions;
        }

        return batchData;
    },

    // ════════════════════════════════════════════════════════════
    // 6. RETRY FAILED
    // ════════════════════════════════════════════════════════════
    async retryFailed(batchId) {
        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const resultPath = path.join(batchDir, 'batch.result.json');

        if (!fs.existsSync(resultPath)) {
            throw new Error("Impossible d'effectuer un retry : batch.result.json absent.");
        }

        let batch = JSON.parse(fs.readFileSync(resultPath));
        const failed = batch.transactions.filter(t => t.status === "FAILED");

        if (failed.length === 0) {
            return { message: "Aucune transaction échouée à retenter." };
        }

        // Réessayer les transactions échouées
        for (const tx of failed) {
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
        }

        // Recalculer le résumé
        batch.summary.successful = batch.transactions.filter(t => t.status === "SUCCESS").length;
        batch.summary.failed = batch.transactions.filter(t => t.status === "FAILED").length;

        const totalAmount = batch.transactions
            .filter(t => t.status === "SUCCESS")
            .reduce((sum, t) => sum + Number(t.montant), 0);

        batch.summary.totalAmount = totalAmount;

        // Sauvegarder
        const retryPath = path.join(batchDir, 'batch.retry.json');
        fs.writeFileSync(retryPath, JSON.stringify(batch, null, 2));
        fs.writeFileSync(resultPath, JSON.stringify(batch, null, 2));

        return batch;
    },

    // ════════════════════════════════════════════════════════════
    // 7. GENERATE REPORT PDF
    // ════════════════════════════════════════════════════════════
    async generateReportPdf(batch, outputPath, batchId) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 40, size: "A4" });
                const stream = fs.createWriteStream(outputPath);

                doc.pipe(stream);

                // En-tête
                doc.rect(0, 0, doc.page.width, 60).fill("#0057D9");
                doc.fontSize(22).fillColor("#FFFFFF")
                    .text("Rapport de Paiement - DEVLAB 2025", 40, 18);

                doc.moveDown(2.5);
                doc.fillColor("black");

                // Résumé
                const summaryBoxY = doc.y;
                const summaryBoxHeight = 95;

                doc.roundedRect(30, summaryBoxY, doc.page.width - 60, summaryBoxHeight, 12)
                    .strokeColor("#0057D9").lineWidth(2).stroke();

                const summaryY = summaryBoxY + 12;
                doc.fontSize(13).fillColor("#0057D9").text("Résumé du batch", 45, summaryY);
                doc.fontSize(10).fillColor("black");

                doc.text(`Batch ID : ${batch.batchId}`, 45, summaryY + 25);
                doc.text(`Date : ${batch.createdAt}`, 45, summaryY + 42);
                doc.text(`Total lignes CSV : ${batch.summary.totalRows}`, 45, summaryY + 59);

                doc.text(`Lignes valides : ${batch.summary.validRows}`, 320, summaryY + 25);
                doc.text(`Lignes rejetées : ${batch.summary.rejectedRows}`, 320, summaryY + 42);
                doc.text(`Montant total : ${batch.summary.totalAmount} XOF`, 320, summaryY + 59);

                doc.y = summaryBoxY + summaryBoxHeight + 20;

                // Tableau des transactions
                doc.fontSize(14).fillColor("#0057D9").font('Helvetica-Bold')
                    .text("Détails des transactions", 40, doc.y);
                doc.font('Helvetica');

                doc.moveDown();

                const transactionsTable = {
                    headers: ['Tx ID', 'Nom complet', 'Montant', 'Statut'],
                    rows: batch.transactions.map(tx => [
                        tx.txId,
                        tx.nom_complet || 'N/A',
                        `${tx.montant} XOF`,
                        tx.status === 'SUCCESS' ? '✅ Succès' : '❌ Échec'
                    ])
                };

                doc.table(transactionsTable, {
                    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
                    prepareRow: () => doc.font('Helvetica').fontSize(8)
                });

                // Footer
                const footerY = doc.page.height - 60;
                doc.fontSize(9).fillColor("gray");
                doc.text("Généré automatiquement par la plateforme DEVLAB 2025", 40, footerY);

                doc.end();
                stream.on('finish', resolve);
                stream.on('error', reject);

            } catch (error) {
                console.error('Erreur génération PDF:', error);
                reject(error);
            }
        });
    },

    // ════════════════════════════════════════════════════════════
    // 8. CHECK BATCH STATUS
    // ════════════════════════════════════════════════════════════
    checkBatchStatus,

    // 9. GET REPORT (JSON / CSV / PDF)
    // ════════════════════════════════════════════════════════════
    async getReport(batchId, format) {
        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const resultPath = path.join(batchDir, 'batch.result.json');

        if (!fs.existsSync(resultPath)) {
            throw new Error("Aucun rapport disponible : batch.result.json introuvable.");
        }

        const batch = JSON.parse(fs.readFileSync(resultPath));

        switch (format) {
            case "json":
                return batch;

            case "csv": {
                const csvPath = path.join(batchDir, 'report.csv');
                const fields = [
                    "txId", "nom_complet", "valeur_id", "montant",
                    "devise", "status", "processedAt"
                ];
                const parser = new Parser({ fields });
                const csv = parser.parse(batch.transactions);
                fs.writeFileSync(csvPath, csv);
                return { path: csvPath };
            }

            case "pdf": {
                const pdfPath = path.join(batchDir, 'report.pdf');
                await this.generateReportPdf(batch, pdfPath, batchId);
                return { path: pdfPath };
            }

            default:
                throw new Error("Format non supporté. Utilisez: json, csv ou pdf");
        }
    }
};
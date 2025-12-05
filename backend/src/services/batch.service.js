// batch.service.js
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const csvUtil = require('../utils/csv.util.js');
const mojaloop = require('./mojaloop.service.js');
const { Parser } = require('json2csv');
const PDFDocument = require("pdfkit-table");

module.exports = {

    // ────────────────────────────────────────────────
    // 1. CREATE BATCH
    // ────────────────────────────────────────────────
    async createBatch(file) {
        const batchId = uuidv4();

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        fs.mkdirSync(batchDir);

        // Save original CSV
        const csvPath = path.join(batchDir, file.name);
        await file.mv(csvPath);

        // Parse CSV
        const parsed = await csvUtil.parseCsv(csvPath);

        const initialBatchPath = path.join(batchDir, 'batch.initial.json');
        const initialBatch = {
            batchId,
            createdAt: new Date().toISOString(),
            status: "PENDING",
            inputFileName: file.name,
            summary: {},
            transactions: parsed.map((item, index) => ({
                txId: `tx-${String(index + 1).padStart(5, '0')}`,
                ...item,
                status: "PENDING"
            }))
        };

        fs.writeFileSync(initialBatchPath, JSON.stringify(initialBatch, null, 2));

        setTimeout(() => {
            console.log(">>> PROCESSBATCH déclenché");
            module.exports.processBatch(batchId);
        }, 100);

        return { batchId, status: "PENDING" };
    },

    // ────────────────────────────────────────────────
    // 2. LIST BATCHES
    // ────────────────────────────────────────────────
    async listBatches() {
        const basePath = path.join(__dirname, '../data/reports');
        const dirs = fs.readdirSync(basePath);

        return dirs.map(dir => {
            const initial = JSON.parse(fs.readFileSync(path.join(basePath, dir, 'batch.initial.json')));
            const resultPath = path.join(basePath, dir, 'batch.result.json');
            let status = "PENDING";

            if (fs.existsSync(resultPath)) {
                const result = JSON.parse(fs.readFileSync(resultPath));
                status = result.status;
            }

            return {
                batchId: initial.batchId,
                createdAt: initial.createdAt,
                status
            };
        });
    },

    // ────────────────────────────────────────────────
    // 3. GET BATCH
    // ────────────────────────────────────────────────
    async getBatch(batchId) {
        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const resultPath = path.join(batchDir, 'batch.result.json');
        const initialPath = path.join(batchDir, 'batch.initial.json');

        if (fs.existsSync(resultPath)) return JSON.parse(fs.readFileSync(resultPath));
        return JSON.parse(fs.readFileSync(initialPath));
    },

    // ────────────────────────────────────────────────
    // 4. PROCESS BATCH
    // ────────────────────────────────────────────────
    async processBatch(batchId) {
        console.log(">>> DÉMARRAGE DU BATCH :", batchId);

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const initialBatchPath = path.join(batchDir, 'batch.initial.json');

        let batch = JSON.parse(fs.readFileSync(initialBatchPath));
        batch.status = "RUNNING";

        const transactions = batch.transactions;

        // EXECUTION DES TRANSACTIONS
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

        // ───────────────────────────────
        // CALCUL DU TOTAL + MONTANTS IGNORÉS
        // ───────────────────────────────

        // Devise dominante
        const mainCurrency = transactions.find(t =>
            t.status === "SUCCESS" &&
            typeof t.devise === "string" &&
            t.devise.trim() !== ""
        )?.devise || null;

        const ignored = [];

        const totalAmount = transactions.reduce((sum, t) => {
            const isSuccess = t.status === "SUCCESS";
            const validAmount = !isNaN(Number(t.montant));
            const sameCurrency = t.devise === mainCurrency;

            if (isSuccess && validAmount && sameCurrency) {
                return sum + Number(t.montant);
            }

            ignored.push({
                txId: t.txId,
                nom_complet: t.nom_complet,
                montant: t.montant,
                devise: t.devise,
                status: t.status,
                reason: !isSuccess
                    ? "FAILED"
                    : !validAmount
                        ? "INVALID_AMOUNT"
                        : !sameCurrency
                            ? "DIFFERENT_CURRENCY"
                            : "UNKNOWN"
            });

            return sum;
        }, 0);

        batch.summary = {
            totalTransactions: transactions.length,
            successful: transactions.filter(t => t.status === "SUCCESS").length,
            failed: transactions.filter(t => t.status === "FAILED").length,
            totalAmount,
            currency: mainCurrency,
            ignoredTotals: ignored
        };

        batch.status = batch.summary.failed > 0
            ? "COMPLETED_WITH_ERRORS"
            : "COMPLETED";

        // Save RESULTS
        const resultPath = path.join(batchDir, 'batch.result.json');
        fs.writeFileSync(resultPath, JSON.stringify(batch, null, 2));

        console.log(">>> BATCH TERMINÉ :", batchId);
        return batch;
    },

    // ────────────────────────────────────────────────
    // 5. RETRY FAILED
    // ────────────────────────────────────────────────
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

        // Mise à jour du résumé après retry
        batch.summary.successful = batch.transactions.filter(t => t.status === "SUCCESS").length;
        batch.summary.failed = batch.transactions.filter(t => t.status === "FAILED").length;

        const retryPath = path.join(batchDir, 'batch.retry.json');
        fs.writeFileSync(retryPath, JSON.stringify(batch, null, 2));

        return batch;
    },

    // ────────────────────────────────────────────────
    // 6. GET REPORT (JSON / CSV / PDF)
    // ────────────────────────────────────────────────
    async getReport(batchId, format) {

        const batchDir = path.join(__dirname, '../data/reports', batchId);
        const resultPath = path.join(batchDir, 'batch.result.json');

        if (!fs.existsSync(resultPath)) {
            throw new Error("Aucun rapport disponible : batch.result.json introuvable.");
        }

        const batch = JSON.parse(fs.readFileSync(resultPath));

        switch (format) {

            // JSON → retourner l'objet
            case "json":
                return batch;

            // CSV → tableau exporté
            case "csv": {
                const csvPath = path.join(batchDir, 'report.csv');

                const fields = [
                    "txId",
                    "nom_complet",
                    "valeur_id",
                    "montant",
                    "devise",
                    "status",
                    "processedAt",
                    "mojaloop.transferId",
                    "mojaloop.errorDescription"
                ];

                const parser = new Parser({ fields });
                const csv = parser.parse(batch.transactions);

                fs.writeFileSync(csvPath, csv);
                return { path: csvPath };
            }

            case "pdf": {
                const pdfPath = path.join(batchDir, 'report.pdf');

                const doc = new PDFDocument({
                    margin: 40,
                    size: "A4"
                });

                const fsStream = fs.createWriteStream(pdfPath);
                doc.pipe(fsStream);

                // Variable pour suivre le numéro de page
                let pageNumber = 1;

                // ───────────────────────────────
                //  HEADER PREMIUM
                // ───────────────────────────────
                doc
                    .rect(0, 0, doc.page.width, 60)
                    .fill("#0057D9");

                doc
                    .fontSize(22)
                    .fillColor("#FFFFFF")
                    .text("Rapport de Paiement - DEVLAB 2025", 40, 18);

                doc.moveDown(2.5);
                doc.fillColor("black");

                // ───────────────────────────────
                // CADRE RÉSUMÉ (PLUS COMPACT)
                // ───────────────────────────────
                const summaryBoxY = doc.y;
                const summaryBoxHeight = 95; // Réduit de 110 à 95

                doc.roundedRect(30, summaryBoxY, doc.page.width - 60, summaryBoxHeight, 12)
                    .strokeColor("#0057D9")
                    .lineWidth(2)
                    .stroke();

                const summaryY = summaryBoxY + 12;

                doc.fontSize(13).fillColor("#0057D9")
                    .text("Résumé du batch", 45, summaryY);

                doc.fontSize(10).fillColor("black"); // Réduit de 11 à 10

                // Colonne gauche
                doc.text(`Batch ID : ${batch.batchId}`, 45, summaryY + 25);
                doc.text(`Date : ${batch.createdAt}`, 45, summaryY + 42);
                doc.text(`Total transactions : ${batch.summary.totalTransactions}`, 45, summaryY + 59);

                // Colonne droite
                doc.text(`Succès : ${batch.summary.successful}`, 320, summaryY + 25);
                doc.text(`Échecs : ${batch.summary.failed}`, 320, summaryY + 42);
                doc.text(`Montant total : ${batch.summary.totalAmount} ${batch.summary.currency}`, 320, summaryY + 59);

                // Position après le cadre avec espace réduit
                doc.y = summaryBoxY + summaryBoxHeight + 20; // Réduit de 30 à 20

                // ───────────────────────────────
                // TABLEAU DES TRANSACTIONS
                // ───────────────────────────────
                let currentY = doc.y;

                doc.fontSize(14).fillColor("#0057D9").font('Helvetica-Bold')
                    .text("Détails des transactions", 40, currentY);
                doc.font('Helvetica');

                currentY += 22; // Réduit de 30 à 22
                doc.y = currentY;

                // Configuration du tableau
                const startX = 40;
                currentY = doc.y;
                const rowHeight = 20; // Réduit de 24 à 20
                const colWidths = [70, 130, 80, 60, 95];
                const headers = ["Tx ID", "Nom complet", "Montant", "Devise", "Statut"];
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);

                // Fonction pour ajouter un header simple sur nouvelle page
                const addSimpleHeader = () => {
                    doc.fontSize(12).fillColor("#0057D9")
                        .text("Rapport de Paiement - DEVLAB 2025", 40, 20);
                    currentY = 50;
                    doc.y = currentY;
                };

                // Fonction pour vérifier si on a besoin d'une nouvelle page
                const checkNewPage = (neededHeight) => {
                    if (currentY + neededHeight > doc.page.height - 60) {
                        doc.addPage();
                        pageNumber++;
                        addSimpleHeader();
                        drawTableHeader();
                        return true;
                    }
                    return false;
                };

                // Fonction pour dessiner l'en-tête du tableau
                const drawTableHeader = () => {
                    doc.rect(startX, currentY, tableWidth, rowHeight)
                        .fill("#0057D9");

                    doc.fontSize(10).fillColor("#FFFFFF").font('Helvetica-Bold');
                    let xPos = startX;
                    headers.forEach((header, i) => {
                        const align = (i === 2 || i === 3) ? "center" : "left";

                        doc.text(header, xPos + 5, currentY + 6, {
                            width: colWidths[i] - 10,
                            align: align
                        });
                        xPos += colWidths[i];
                    });

                    doc.font('Helvetica');
                    currentY += rowHeight;
                };

                // Dessiner l'en-tête du tableau
                drawTableHeader();

                // Dessiner les lignes de données
                batch.transactions.forEach((t, index) => {
                    checkNewPage(rowHeight);

                    // Alterner les couleurs de fond
                    if (index % 2 === 0) {
                        doc.rect(startX, currentY, tableWidth, rowHeight)
                            .fill("#F9F9F9");
                    }

                    const data = [
                        t.txId || '',
                        t.nom_complet || 'N/A',
                        t.montant ? String(t.montant) : 'N/A',
                        t.devise || 'N/A',
                        t.status === "SUCCESS" ? "SUCCESS" : "FAILED"
                    ];

                    let xPos = startX;
                    doc.fontSize(8); // Réduit de 9 à 8

                    data.forEach((cell, i) => {
                        let align = "left";
                        if (i === 2 || i === 3) {
                            align = "center";
                        }

                        if (i === 4) {
                            doc.fillColor(t.status === "SUCCESS" ? "#008000" : "#FF0000");
                        } else {
                            doc.fillColor("#000000");
                        }

                        doc.text(String(cell), xPos + 5, currentY + 5, {
                            width: colWidths[i] - 10,
                            align: align,
                            lineBreak: false
                        });

                        if (i < data.length - 1) {
                            doc.strokeColor("#E0E0E0")
                                .lineWidth(0.5)
                                .moveTo(xPos + colWidths[i], currentY)
                                .lineTo(xPos + colWidths[i], currentY + rowHeight)
                                .stroke();
                        }

                        xPos += colWidths[i];
                    });

                    doc.strokeColor("#E0E0E0")
                        .lineWidth(0.5)
                        .moveTo(startX, currentY + rowHeight)
                        .lineTo(startX + tableWidth, currentY + rowHeight)
                        .stroke();

                    currentY += rowHeight;
                });

                // Bordure extérieure du tableau
                const tableStartY = currentY - (rowHeight * batch.transactions.length);
                doc.rect(startX, tableStartY - rowHeight, tableWidth, rowHeight * (batch.transactions.length + 1))
                    .strokeColor("#0057D9")
                    .lineWidth(1.5)
                    .stroke();

                doc.fillColor("#000000");
                currentY += 20; // Réduit de 30 à 20
                doc.y = currentY;

                // ───────────────────────────────
                // TRANSACTIONS IGNORÉES
                // ───────────────────────────────
                const ignoredList = batch.summary.ignoredTotals || [];

                // Calculer l'espace nécessaire pour les transactions ignorées
                const ignoredHeaderHeight = 22;
                const ignoredRowHeight = 18; // Réduit de 22 à 18
                const ignoredTotalHeight = ignoredHeaderHeight + (ignoredList.length + 1) * ignoredRowHeight + 20;

                // Vérifier si on a assez d'espace sur la page actuelle
                if (currentY + ignoredTotalHeight > doc.page.height - 60) {
                    doc.addPage();
                    pageNumber++;
                    addSimpleHeader();
                }

                currentY = doc.y;

                doc.fontSize(14).fillColor("#FF6600").font('Helvetica-Bold')
                    .text("Transactions ignorées du calcul", 40, currentY);
                doc.font('Helvetica');

                currentY += 22; // Réduit de 30 à 22
                doc.y = currentY;

                if (ignoredList.length === 0) {
                    doc.fontSize(9).fillColor("gray")
                        .text("Aucune transaction ignorée.", 40, currentY);
                } else {
                    // Configuration du tableau ignoré
                    const ignoredColWidths = [80, 140, 90, 125];
                    const ignoredHeaders = ["Tx ID", "Nom complet", "Montant", "Raison"];
                    const ignoredTableWidth = ignoredColWidths.reduce((a, b) => a + b, 0);

                    // En-tête du tableau ignoré
                    doc.rect(startX, currentY, ignoredTableWidth, ignoredRowHeight)
                        .fill("#FF6600");

                    doc.fontSize(10).fillColor("#FFFFFF").font('Helvetica-Bold');
                    let xPos = startX;
                    ignoredHeaders.forEach((header, i) => {
                        doc.text(header, xPos + 5, currentY + 5, {
                            width: ignoredColWidths[i] - 10,
                            align: "left"
                        });
                        xPos += ignoredColWidths[i];
                    });

                    doc.font('Helvetica');
                    currentY += ignoredRowHeight;

                    // Lignes des transactions ignorées
                    ignoredList.forEach((item, idx) => {
                        // Vérifier si on doit passer à une nouvelle page
                        if (currentY + ignoredRowHeight > doc.page.height - 60) {
                            // Finaliser le tableau actuel avec bordure
                            const partialTableStartY = doc.y - (ignoredRowHeight * (idx + 1));
                            doc.rect(startX, partialTableStartY - ignoredRowHeight, ignoredTableWidth, ignoredRowHeight * (idx + 1))
                                .strokeColor("#FF6600")
                                .lineWidth(1.5)
                                .stroke();

                            doc.addPage();
                            pageNumber++;
                            addSimpleHeader();

                            // Titre de continuation
                            doc.fontSize(14).fillColor("#FF6600").font('Helvetica-Bold')
                                .text("Transactions ignorées (suite)", 40, currentY);
                            doc.font('Helvetica');
                            currentY += 22;

                            // Redessiner l'en-tête
                            doc.rect(startX, currentY, ignoredTableWidth, ignoredRowHeight)
                                .fill("#FF6600");

                            doc.fontSize(10).fillColor("#FFFFFF").font('Helvetica-Bold');
                            xPos = startX;
                            ignoredHeaders.forEach((header, i) => {
                                doc.text(header, xPos + 5, currentY + 5, {
                                    width: ignoredColWidths[i] - 10,
                                    align: "left"
                                });
                                xPos += ignoredColWidths[i];
                            });

                            doc.font('Helvetica');
                            currentY += ignoredRowHeight;
                        }

                        // Fond alterné
                        if (idx % 2 === 0) {
                            doc.rect(startX, currentY, ignoredTableWidth, ignoredRowHeight)
                                .fill("#FFF5F0");
                        }

                        const ignoredData = [
                            item.txId || '',
                            item.nom_complet || 'N/A',
                            `${item.montant || 'N/A'} ${item.devise || ''}`.trim(),
                            item.reason || ''
                        ];

                        xPos = startX;
                        doc.fontSize(8).fillColor("#000000");

                        ignoredData.forEach((cell, i) => {
                            doc.text(String(cell), xPos + 5, currentY + 5, {
                                width: ignoredColWidths[i] - 10,
                                align: "left",
                                lineBreak: false
                            });

                            if (i < ignoredData.length - 1) {
                                doc.strokeColor("#FFD0B0")
                                    .lineWidth(0.5)
                                    .moveTo(xPos + ignoredColWidths[i], currentY)
                                    .lineTo(xPos + ignoredColWidths[i], currentY + ignoredRowHeight)
                                    .stroke();
                            }

                            xPos += ignoredColWidths[i];
                        });

                        doc.strokeColor("#FFD0B0")
                            .lineWidth(0.5)
                            .moveTo(startX, currentY + ignoredRowHeight)
                            .lineTo(startX + ignoredTableWidth, currentY + ignoredRowHeight)
                            .stroke();

                        currentY += ignoredRowHeight;
                    });

                    // Bordure extérieure du tableau ignoré
                    const ignoredTableStartY = currentY - (ignoredRowHeight * ignoredList.length);
                    doc.rect(startX, ignoredTableStartY - ignoredRowHeight, ignoredTableWidth, ignoredRowHeight * (ignoredList.length + 1))
                        .strokeColor("#FF6600")
                        .lineWidth(1.5)
                        .stroke();
                }

                doc.fillColor("#000000");

                // ───────────────────────────────
                // FOOTER PREMIUM + PAGINATION
                // ───────────────────────────────
                const addFooter = (pageNum) => {
                    const footerY = doc.page.height - 60;

                    doc.fontSize(9).fillColor("gray");

                    // Texte à gauche
                    doc.text(
                        "Généré automatiquement par la plateforme DEVLAB 2025",
                        40,
                        footerY,
                        { align: "left", width: 250, continued: false }
                    );

                    // Numéro de page à droite (même ligne)
                    doc.text(
                        `Page ${pageNum}`,
                        doc.page.width - 100,
                        footerY,
                        { align: "right", width: 60 }
                    );
                };

                // Ajouter le footer sur toutes les pages existantes
                const addFooterToAllPages = () => {
                    const range = doc.bufferedPageRange();
                    for (let i = 0; i < range.count; i++) {
                        doc.switchToPage(i + range.start);
                        addFooter(i + 1);
                    }
                };

                // Ajouter les footers à la fin
                addFooterToAllPages();

                // Fin du PDF
                doc.end();

                // Attendre que le stream soit fermé
                return new Promise((resolve, reject) => {
                    fsStream.on('finish', () => {
                        resolve({ path: pdfPath });
                    });
                    fsStream.on('error', reject);
                });
            }


            default:
                throw new Error("Format non supporté.");
        }
    }
};

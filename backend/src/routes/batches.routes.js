const router = require('express').Router();
const controller = require('../controllers/batches.controller.js');

/**
 * @swagger
 * tags:
 *   name: Batches
 *   description: Gestion des lots de traitement
 */

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Créer un nouveau lot de traitement
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier à traiter
 *     responses:
 *       201:
 *         description: Lot créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', controller.createBatch);

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Lister tous les lots
 *     tags: [Batches]
 *     responses:
 *       200:
 *         description: Liste des lots récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Batch'
 */
router.get('/', controller.listBatches);

/**
 * @swagger
 * /api/batches/{batchId}:
 *   get:
 *     summary: Obtenir les détails d'un lot spécifique
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du lot
 *     responses:
 *       200:
 *         description: Détails du lot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       404:
 *         description: Lot non trouvé
 */
router.get('/:batchId', controller.getBatch);

/**
 * @swagger
 * /api/batches/{batchId}/report:
 *   get:
 *     summary: Générer un rapport pour un lot
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du lot
 *     responses:
 *       200:
 *         description: Rapport généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Lot non trouvé
 */
router.get('/:batchId/report/:format', controller.getReport);

/**
 * @swagger
 * /api/batches/{batchId}/retry-failed:
 *   post:
 *     summary: Relancer les traitements en échec d'un lot
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du lot
 *     responses:
 *       200:
 *         description: Relance des traitements en échec initiée
 *       404:
 *         description: Lot non trouvé
 */
router.post('/:batchId/retry-failed', controller.retryFailed);

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du lot
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: État actuel du lot
 *         totalItems:
 *           type: integer
 *           description: Nombre total d'éléments dans le lot
 *         processedItems:
 *           type: integer
 *           description: Nombre d'éléments traités
 *         failedItems:
 *           type: integer
 *           description: Nombre d'éléments en échec
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du lot
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Dernière mise à jour du lot
 */

module.exports = router;

const fs = require('fs');
const csv = require('csv-parser');

module.exports = {
    async parseCsv(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];

            // Détection automatique du séparateur
            const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
            let separator = ';';
            if (firstLine.includes(',')) separator = ',';
            if (firstLine.includes('\t')) separator = '\t';
            if (firstLine.includes('|')) separator = '|';

            fs.createReadStream(filePath)
                .pipe(csv({ separator }))
                .on('data', (raw) => {
                    // Normalisation des clés
                    const row = {};

                    for (const key in raw) {
                        const cleanKey = key.trim().toLowerCase();

                        row[cleanKey] = raw[key].trim();
                    }

                    // Mappage intelligent
                    const parsed = {
                        type_id:
                            row.type_id ||
                            row.typeid ||
                            row["type id"] ||
                            row["type"] ||
                            null,

                        valeur_id:
                            row.valeur_id ||
                            row.valeurid ||
                            row["valeur id"] ||
                            row.id ||
                            row.identifiant ||
                            null,

                        devise:
                            row.devise ||
                            row.currency ||
                            row.monnaie ||
                            null,

                        montant: row.montant ? parseFloat(row.montant.replace(',', '.')) : null,

                        nom_complet:
                            row.nom_complet ||
                            row["nom complet"] ||
                            row.fullname ||
                            row.full_name ||
                            null
                    };

                    results.push(parsed);
                })
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }
};

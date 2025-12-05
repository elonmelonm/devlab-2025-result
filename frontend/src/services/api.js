import axios from 'axios';

// Création d'une instance axios avec une configuration de base
const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:9000/api',
    timeout: 10000, // Timeout de 10 secondes
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
    (config) => {
        // Vous pouvez ajouter un token d'authentification ici si nécessaire
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Gestion des erreurs globales
        if (error.response) {
            // Erreurs 4xx/5xx
            console.error('Erreur API:', {
                status: error.response.status,
                message: error.response.data?.message || 'Erreur inconnue',
                url: error.config.url
            });
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Pas de réponse du serveur:', error.request);
        } else {
            // Erreur lors de la configuration de la requête
            console.error('Erreur de configuration de la requête:', error.message);
        }
        return Promise.reject(error);
    }
);

// Méthodes API
export default {
    // Batch
    getBatches() {
        return api.get('/batches');
    },

    getBatch(batchId) {
        return api.get(`/batches/${batchId}`);
    },
    
    downloadReport(batchId, format) {
        return api.get(`/batches/${batchId}/report/${format}`, {
            responseType: 'blob', // Important pour les téléchargements de fichiers binaires
            headers: {
                'Accept': format === 'pdf' ? 'application/pdf' :
                    format === 'csv' ? 'text/csv' :
                        'application/json'
            }
        });
    },

    createBatch(data) {
        return api.post('/batches', data);
    },

    // Fichiers
    uploadFile(file, onUploadProgress = null) {
        const formData = new FormData();
        formData.append('csv', file);  // Le backend attend un champ 'csv'

        return api.post('/batches', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        });
    }
};
<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <button class="modal-close" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="modal-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h2>Importer un fichier de paiement</h2>
          <p>Téléchargez votre fichier Excel ou CSV contenant les informations de paiement</p>
        </div>

        <div class="modal-body">
          <!-- État de chargement -->
          <div v-if="loading && !transferCompleted" class="upload-loading">
            <div class="loading-content">
              <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
              </div>
              <h3>Analyse du fichier en cours...</h3>
              <p>Veuillez patienter pendant que nous traitons votre fichier.</p>
              
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ uploadProgress }}%</span>
            </div>
          </div>

          <!-- Écran de succès -->
          <div v-else-if="transferCompleted" class="success-screen">
            <div class="success-animation">
              <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <h3>Transfert terminé avec succès !</h3>
              <p>Votre fichier a été traité avec succès.</p>
              
              <div v-if="reportUrl" class="download-options">
                <div class="format-selector">
                  <label for="report-format">Format :</label>
                  <select id="report-format" v-model="selectedFormat" class="format-dropdown">
                    <option v-for="format in availableFormats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>
                
                <button @click="downloadReport" class="download-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="download-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Télécharger le rapport (.{{ selectedFormat }})
                </button>
              </div>
              
              <button @click="closeModal" class="close-btn">Fermer</button>
            </div>
          </div>

          <!-- Zone de drag & drop -->
          <div 
            v-else-if="!loading && !transferCompleted"
            class="upload-zone"
            :class="{ 'drag-over': isDragging, 'has-file': selectedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              @change="handleFileSelect"
              hidden
            />

            <div v-if="!selectedFile" class="upload-placeholder">
              <div class="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3>Glissez votre fichier ici</h3>
              <p>ou cliquez pour parcourir</p>
              <span class="file-types">Formats acceptés: .xlsx, .xls, .csv</span>
            </div>

            <div v-else class="file-preview">
              <div class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <div class="file-info">
                <h4>{{ selectedFile.name }}</h4>
                <p>{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button class="remove-file" @click.stop="removeFile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Informations sur le format -->
          <!-- <div class="format-info">
            <div class="info-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Format attendu du fichier</span>
            </div>
            <div class="format-columns">
              <div class="column-item">
                <span class="column-badge">1</span>
                <span>Nom complet</span>
              </div>
              <div class="column-item">
                <span class="column-badge">2</span>
                <span>Montant</span>
              </div>
              <div class="column-item">
                <span class="column-badge">3</span>
                <span>Devise</span>
              </div>
              <div class="column-item">
                <span class="column-badge">4</span>
                <span>ID/Référence</span>
              </div>
            </div>
          </div> -->

          <!-- Barre de progression -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-header">
              <span>Traitement du fichier...</span>
              <span class="progress-percentage">{{ uploadProgress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal" :disabled="uploading">
            Annuler
          </button>
          <button class="btn-primary" @click="uploadFile" :disabled="!selectedFile || uploading">
            <svg v-if="!uploading" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-else>Envoi en cours...</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'FileUploadModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'upload-complete', 'upload-success', 'upload-error'],
  data() {
    return {
      selectedFile: null,
      uploadProgress: 0,
      isDragging: false,
      loading: false,
      uploading: false,
      transferCompleted: false,
      batchId: null,
      reportUrl: null,
      uploadError: null,
      showError: false,
      selectedFormat: 'pdf',
      availableFormats: [
        { value: 'pdf', label: 'PDF' },
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' }
      ]
    }
  },
  methods: {
    closeModal() {
      if (!this.uploading) {
        this.$emit('close')
      }
    },
    downloadReport() {
      if (!this.reportUrl) {
        console.error('Aucune URL de rapport disponible');
        return;
      }

      // Utiliser l'URL relative car l'instance d'API gère déjà la base URL
      const reportUrl = `http://localhost:9000/api/batches/${this.batchId}/report/${this.selectedFormat}`;
      
      // Ouvrir directement l'URL dans un nouvel onglet
      window.open(reportUrl, '_blank');
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
      }
    },
    handleFileDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file && this.isValidFileType(file)) {
        this.selectedFile = file
      } else {
        alert('Format de fichier non supporté. Veuillez utiliser .xlsx, .xls ou .csv')
      }
    },
    isValidFileType(file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]
      return validTypes.includes(file.type) || 
             file.name.endsWith('.xlsx') || 
             file.name.endsWith('.xls') || 
             file.name.endsWith('.csv')
    },
    removeFile() {
      this.selectedFile = null
      this.$refs.fileInput.value = ''
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    async uploadFile() {
      if (!this.selectedFile) {
        this.showError = true;
        this.uploadError = 'Veuillez sélectionner un fichier';
        return;
      }

      this.uploading = true;
      this.loading = true;
      this.uploadProgress = 0;
      this.showError = false;
      this.uploadError = '';

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const onUploadProgress = (progressEvent) => {
          this.uploadProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        };

        // Appel au service API pour uploader le fichier
        const response = await api.uploadFile(this.selectedFile, onUploadProgress);
        
        // Si l'upload est réussi
        if (response && response.data) {
          this.batchId = response.data.batchId || response.data.id;
          
          // Si le backend indique que le traitement est en cours
          if (response.data.message && response.data.message.includes('en cours')) {
            this.loading = true;
            this.pollBatchStatus();
          } else if (response.data.success) {
            this.$emit('upload-success', response.data);
            this.transferCompleted = true;
          } else {
            throw new Error(response.data.message || 'Réponse inattendue du serveur');
          }
        } else {
          throw new Error('Réponse invalide du serveur');
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
        this.$emit('upload-error', error.message || 'Une erreur est survenue')
      } finally {
        this.uploading = false
      }
    },
    async pollBatchStatus() {
      if (!this.batchId) {
        this.loading = false;
        return;
      }
      
      try {
        const checkStatus = async () => {
          try {
            const response = await api.getBatch(this.batchId);
            
            // Mettre à jour la progression en fonction du statut
            this.updateProgressFromStatus(response.data?.status || response.status);
            
            // Si le traitement est terminé
            const status = response.data?.status || response.status;
            if (['COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'VALIDATED', 'PROCESSED'].includes(status)) {
              this.loading = false;
              this.transferCompleted = true;
              
              // Mettre à jour l'URL du rapport si disponible dans la réponse
              if (response.data?.reportUrl || response.reportUrl) {
                this.reportUrl = response.data?.reportUrl || response.reportUrl;
              }
              
              // Émettre l'événement avec les données de la réponse
              this.$emit('upload-complete', response.data?.payments || response.payments || []);
              
              return;
            }
            
            // Si le statut indique que le traitement est toujours en cours
            if (this.loading) {
              setTimeout(checkStatus, 2000);
            }
          } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            this.loading = false;
            this.showError = true;
            this.uploadError = 'Erreur lors de la vérification du statut du traitement';
            this.$emit('upload-error', this.uploadError);
          }
        };
        
        // Démarrer la vérification du statut
        checkStatus();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du suivi:', error);
        this.loading = false;
        this.showError = true;
        this.uploadError = 'Erreur lors du démarrage du suivi du traitement';
        this.$emit('upload-error', this.uploadError);
      }
    },
    
    updateProgressFromStatus(status) {
      // Mettre à jour la barre de progression en fonction du statut
      const statusProgress = {
        'PENDING': 10,
        'PROCESSING': 30,
        'EXTRACTING': 50,
        'TRANSFORMING': 70,
        'LOADING': 90,
        'COMPLETED': 100,
        'COMPLETED_WITH_ERRORS': 100,
        'FAILED': 100
      }
      
      this.uploadProgress = statusProgress[status] || this.uploadProgress
    },
    
    processFile() {
      // Ancienne méthode conservée pour compatibilité
      const mockData = this.generateMockPayments()
      this.$emit('upload-complete', mockData)
      this.uploading = false
      this.uploadProgress = 0
      this.selectedFile = null
      this.$emit('close')
    },
    generateMockPayments() {
      // Génère des données de paiement fictives
      const names = [
        'Jean Dupont', 'Marie Martin', 'Pierre Dubois', 'Sophie Laurent',
        'Luc Bernard', 'Emma Petit', 'Thomas Robert', 'Julie Moreau',
        'Antoine Simon', 'Camille Michel', 'Nicolas Leroy', 'Sarah Garnier'
      ]
      
      const currencies = ['XAF', 'EUR', 'USD']
      const count = Math.floor(Math.random() * 8) + 5 // Entre 5 et 12 paiements

      return Array.from({ length: count }, (_, index) => ({
        id: `PAY-${Date.now()}-${index + 1}`,
        fullName: names[Math.floor(Math.random() * names.length)],
        amount: Math.floor(Math.random() * 900000) + 100000, // Entre 100k et 1M
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        status: 'pending',
        date: new Date().toISOString()
      }))
    }
  }
}
</script>

<style scoped>
/* Animation de succès */
.success-screen {
  text-align: center;
  padding: 2rem;
  animation: fadeIn 0.5s ease-in-out;
}

.success-animation {
  max-width: 400px;
  margin: 0 auto;
}

.checkmark {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #4CAF50;
  stroke-miterlimit: 10;
  margin: 0 auto 1.5rem;
  box-shadow: inset 0 0 0 #4CAF50;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #4CAF50;
  fill: none;
  animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
}

.download-options {
  margin: 20px 0;
  text-align: center;
}

.format-selector {
  margin-bottom: 15px;
}

.format-selector label {
  margin-right: 10px;
  font-size: 14px;
  color: #4a5568;
}

.format-dropdown {
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #2d3748;
  cursor: pointer;
  transition: border-color 0.2s;
}

.format-dropdown:hover {
  border-color: #a0aec0;
}

.format-dropdown:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.success-screen .download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  width: 100%;
  max-width: 300px;
}

.success-screen .download-btn:hover {
  background-color: #0052a3;
}

.download-btn, .close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px 5px;
  font-size: 14px;
}

.download-btn {
  background-color: #4CAF50;
  color: white;
  border: 2px solid #4CAF50;
}

.download-btn:hover {
  background-color: #3e8e41;
  border-color: #3e8e41;
}

.download-icon {
  margin-right: 8px;
}

.close-btn {
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}

@keyframes scale {
  0%, 100% { transform: none; }
  50% { transform: scale3d(1.1, 1.1, 1); }
}

@keyframes fill {
  100% { box-shadow: inset 0 0 0 100px rgba(76, 175, 80, 0.1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Styles pour l'état de chargement */
.upload-loading {
  text-align: center;
  padding: 2rem;
}

.loading-content {
  max-width: 400px;
  margin: 0 auto;
}

.spinner {
  width: 60px;
  height: 60px;
  position: relative;
  margin: 0 auto 1.5rem;
}

.double-bounce1, .double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #4CAF50;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1.0s;
}

@keyframes sk-bounce {
  0%, 100% { 
    transform: scale(0.0);
  } 50% { 
    transform: scale(1.0);
  }
}

.upload-loading h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.upload-loading p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

/* Barre de progression */
.progress-container {
  width: 100%;
  height: 10px;
  background-color: #f1f1f1;
  border-radius: 5px;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  width: 0%;
  transition: width 0.3s ease;
  border-radius: 5px;
}

.progress-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #FFFFFF;
  border-radius: 24px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  /* position: relative; */
}

.modal-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border: none;
  background: #F5F5F5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 1;
}

.modal-close:hover {
  background: #E0E0E0;
  transform: rotate(90deg);
}

.modal-close svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #000000;
}

.modal-header {
  text-align: center;
  padding: 30px 25px 20px;
  border-bottom: 1px solid #E0E0E0;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00478F 0%, #0066CC 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 24px rgba(0, 71, 143, 0.3);
}

.header-icon svg {
  width: 36px;
  height: 36px;
  stroke-width: 2;
  color: #FFFFFF;
}

.modal-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px 0;
}

.modal-header p {
  font-size: 15px;
  color: #666666;
  margin: 0;
  line-height: 1.5;
}

.modal-body {
  padding: 20px;
  /* margin-bottom: 80px; */
}

/* Zone d'upload */
.upload-zone {
  border: 3px dashed #E0E0E0;
  border-radius: 16px;
  padding: 30px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #FAFAFA;
  margin-bottom: 30px;
}

.upload-zone:hover {
  border-color: #00478F;
  background: #F0F7FF;
}

.upload-zone.drag-over {
  border-color: #EAC435;
  background: #FFFEF0;
  transform: scale(1.02);
}

.upload-zone.has-file {
  border-color: #00478F;
  background: #F0F7FF;
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 80px;
  height: 80px;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.upload-icon svg {
  width: 36px;
  height: 36px;
  stroke-width: 2;
  color: #00478F;
}

.upload-placeholder h3 {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.upload-placeholder p {
  font-size: 15px;
  color: #666666;
  margin: 0;
}

.file-types {
  font-size: 13px;
  color: #999999;
  margin-top: 8px;
}

/* Aperçu du fichier */
.file-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 12px;
}

.file-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00478F 0%, #0066CC 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon svg {
  width: 30px;
  height: 30px;
  stroke-width: 2;
  color: #FFFFFF;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info p {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.remove-file {
  width: 40px;
  height: 40px;
  border: none;
  background: #FEE;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.remove-file:hover {
  background: #FCC;
  transform: scale(1.1);
}

.remove-file svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #C33;
}

/* Informations sur le format */
.format-info {
  background: #F0F7FF;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.info-header svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #00478F;
  flex-shrink: 0;
}

.info-header span {
  font-size: 14px;
  font-weight: 600;
  color: #00478F;
}

.format-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #FFFFFF;
  border-radius: 8px;
}

.column-badge {
  width: 28px;
  height: 28px;
  background: #00478F;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.column-item span:last-child {
  font-size: 13px;
  color: #000000;
  font-weight: 500;
}

/* Barre de progression */
.upload-progress {
  background: #F5F5F5;
  border-radius: 12px;
  padding: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header span {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.progress-percentage {
  color: #00478F !important;
}

.progress-bar {
  height: 8px;
  background: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00478F 0%, #0066CC 50%, #EAC435 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Footer */
.modal-footer {
  /* position: fixed;
  bottom: 20px;
  right: 400px; */
  padding: 24px 40px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: #F5F5F5;
  color: #000000;
}

.btn-secondary:hover:not(:disabled) {
  background: #E0E0E0;
}

.btn-primary {
  background: linear-gradient(135deg, #00478F 0%, #0066CC 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 15px rgba(0, 71, 143, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 71, 143, 0.4);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    border-radius: 20px;
  }

  .modal-header {
    padding: 40px 24px 24px;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    padding: 20px 24px;
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .format-columns {
    grid-template-columns: 1fr;
  }

  .upload-zone {
    padding: 40px 20px;
  }
}
</style>

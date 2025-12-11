<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <button class="modal-close" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="modal-header">
          <div class="header-icon" :class="statusClass">
            <svg v-if="isRejected" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg v-else-if="isFailed" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="isCompleted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                 <polyline points="20 6 9 17 4 12" />
            </svg>
             <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2>Détails de la transaction</h2>
          <p class="transaction-id">ID: {{ transaction.id }}</p>
        </div>

        <div class="modal-body">
          <div class="details-grid">
            <div class="detail-item full-width amount-box" :class="statusClass">
              <span class="detail-label">Montant</span>
              <span class="detail-value amount">{{ formatCurrency(transaction.amount) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Bénéficiaire</span>
              <span class="detail-value">{{ transaction.fullName }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Date</span>
              <span class="detail-value">{{ formatDate(transaction.date) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Statut</span>
              <span class="status-badge" :class="statusClass">
                {{ statusText }}
              </span>
            </div>

            <div class="detail-item">
               <span class="detail-label">Devise</span>
               <span class="detail-value">{{ transaction.currency }}</span>
            </div>
            
            <div class="detail-item full-width" v-if="transaction.batchId">
               <span class="detail-label">ID du Batch</span>
               <span class="detail-value batch-id">{{ transaction.batchId }}</span>
            </div>

            <div class="detail-item full-width error-box" v-if="isRejected || isFailed">
              <span class="detail-label">Motif {{ isRejected ? 'du rejet' : 'de l\'échec' }}</span>
              <p class="error-message">
                {{ transaction.rejectionReasons || transaction.errorDescription || 'Aucun détail supplémentaire disponible.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="close">Fermer</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "TransactionDetailsModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    transaction: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["close"],
  mounted() {
    console.log("🛠️ TransactionDetailsModal monté !");
  },
  computed: {
    isRejected() {
      return this.transaction.status === "rejected";
    },
    isFailed() {
      return this.transaction.status === "failed";
    },
    isCompleted() {
        return this.transaction.status === "completed" || this.transaction.status === "success";
    },
    statusClass() {
      if (this.isRejected) return "rejected";
      if (this.isFailed) return "failed";
      if (this.isCompleted) return "completed";
      return "pending";
    },
    statusText() {
        const map = {
            rejected: "Rejeté",
            failed: "Échoué",
            completed: "Complété",
            success: "Complété",
            pending: "En attente"
        }
        return map[this.transaction.status] || this.transaction.status;
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    formatCurrency(amount) {
      if (!amount && amount !== 0) return "-";
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
      }).format(amount);
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-close svg {
  width: 24px;
  height: 24px;
}

.modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.header-icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 2;
}

/* Status variants for header icon */
.header-icon.rejected {
  background: #ffedd5;
  color: #ea580c;
}

.header-icon.failed {
  background: #fee2e2;
  color: #ef4444;
}

.header-icon.completed {
  background: #d1fae5;
  color: #10b981;
}

.header-icon.pending {
  background: #fef3c7;
  color: #f59e0b;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.transaction-id {
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

/* Amount Box */
.amount-box {
  text-align: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.amount-box.rejected {
  background: #fff7ed;
  border: 1px solid #ffedd5;
}
.amount-box.failed {
    background: #fef2f2;
    border: 1px solid #fee2e2;
}
.amount-box.completed {
    background: #ecfdf5;
    border: 1px solid #d1fae5;
}
.amount-box.pending {
    background: #fffbeb;
    border: 1px solid #fef3c7;
}

.amount-box .detail-label {
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
    opacity: 0.7;
}

.amount-box .detail-value {
    font-size: 24px;
    font-weight: 700;
}

.amount-box.rejected .detail-value { color: #ea580c; }
.amount-box.failed .detail-value { color: #ef4444; }
.amount-box.completed .detail-value { color: #059669; }
.amount-box.pending .detail-value { color: #d97706; }

.detail-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 15px;
  color: #111827;
  font-weight: 600;
}

.batch-id {
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.status-badge.rejected {
  background: #ffedd5;
  color: #ea580c;
}
.status-badge.failed {
    background: #fee2e2;
    color: #ef4444;
}
.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}
.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

/* Error Box */
.error-box {
  margin-top: 8px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 12px;
}

.error-message {
  font-size: 14px;
  color: #b91c1c;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #00478f;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #003366;
}

/* Animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>

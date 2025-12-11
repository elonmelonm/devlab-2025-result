<template>
  <div class="history-page">
    <div class="page-header">
      <div class="header-left">
        <h1>Historique des transactions</h1>
        <div v-if="batchFilterActive" class="batch-filter-tag">
          <span>Filtre : Batch #{{ batchId }}</span>
          <button @click="resetFilters" class="clear-filter-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div class="header-actions">
        <button 
          class="btn btn-primary" 
          @click="$router.push('/dashboard')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour au tableau de bord
        </button>
      </div>
    </div>

    <!-- Section: Liste des rapports (Batches) -->
    <div v-if="!batchFilterActive" class="batches-container">
       <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des rapports...</p>
      </div>
      
      <div v-else-if="batches.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
           <polyline points="14 2 14 8 20 8" />
           <line x1="16" y1="13" x2="8" y2="13" />
           <line x1="16" y1="17" x2="8" y2="17" />
           <polyline points="10 9 9 9 8 9" />
        </svg>
        <h3>Aucun rapport trouvé</h3>
        <p>Aucun fichier n'a été traité pour le moment.</p>
      </div>

      <div v-else class="transactions-table-wrapper">
         <table class="transactions-table">
            <thead>
              <tr>
                <th>ID du Rapport</th>
                <th>Date</th>
                <th>Fichier source</th>
                <th>Transactions</th>
                <th>Montant Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="batch in batches" :key="batch.batchId" @click="selectBatch(batch.batchId)" class="clickable-row">
                 <td class="id-cell">#{{ batch.batchId.substring(0, 8) }}...</td>
                 <td>{{ formatDate(batch.createdAt) }}</td>
                 <td>{{ batch.inputFileName || 'N/A' }}</td>
                 <td>
                    <div class="batch-stats">
                        <span class="success-count" title="Validées">{{ batch.transactions?.length || 0 }}</span> / 
                        <span class="rejected-count" title="Rejetées">{{ batch.rejectedTransactions?.length || 0 }}</span>
                    </div>
                 </td>
                 <td>
                    <strong>{{ formatCurrency(getBatchTotal(batch)) }}</strong>
                 </td>
                 <td>
                    <span class="status-badge" :class="getBatchStatusClass(batch.status)">
                        {{ getBatchStatusText(batch.status) }}
                    </span>
                 </td>
                 <td class="actions-cell">
                    <button class="btn-icon" @click.stop="selectBatch(batch.batchId)" title="Voir les transactions">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                           <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                 </td>
              </tr>
            </tbody>
         </table>
      </div>
    </div>

    <!-- Section: Liste des transactions (Filtres et Tableau existants) -->
    <div v-else class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher une transaction..."
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="completed">Complété</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
          <option value="rejected">Rejeté</option>
        </select>

        <select v-model="filterCurrency" class="filter-select">
          <option value="">Toutes les devises</option>
          <option value="XOF">XOF</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>

        <button class="btn btn-secondary" @click="resetFilters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Réinitialiser le filtre
        </button>
      </div>
    </div>

    <div v-if="batchFilterActive" class="transactions-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des transactions...</p>
      </div>

      <div v-else-if="filteredPayments.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 10H3M21 6H3M21 14H3M21 18H3" stroke-width="2" stroke-linecap="round" />
        </svg>
        <h3>Aucune transaction trouvée</h3>
        <p>Aucune transaction ne correspond à vos critères de recherche.</p>
      </div>

      <div v-else class="transactions-list">
        <div class="transactions-summary">
          <div class="summary-item">
            <span>Total des transactions</span>
            <strong>{{ filteredPayments.length }}</strong>
          </div>
          <div class="summary-item">
            <span>Montant total</span>
            <strong>{{ formatCurrency(filteredTotalAmount) }}</strong>
          </div>
          <div class="summary-item">
            <span>Taux de succès</span>
            <strong>{{ successRate }}%</strong>
          </div>
        </div>

        <div class="transactions-table-wrapper">
          <table class="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bénéficiaire</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in paginatedPayments" :key="payment.id" :class="`status-${payment.status}`">
                <td class="id-cell">
                  <span class="id-prefix">#{{ payment.id?.toString().substring(0, 8) }}</span>
                </td>
                <td class="recipient-cell">
                  <div class="recipient-avatar">
                    {{ getInitials(payment.fullName || payment.recipient || 'Unknown') }}
                  </div>
                  <div class="recipient-info">
                    <div class="recipient-name">{{ payment.fullName || payment.recipient }}</div>
                  </div>
                </td>
                <td>
                  <span class="amount">{{ formatCurrency(payment.amount) }}</span>
                  <span class="currency">{{ payment.currency }}</span>
                </td>
                <td>{{ formatDate(payment.date) }}</td>
                <td>
                  <span class="status-badge" :class="payment.status">
                    {{ getStatusText(payment.status) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon" @click="viewDetails(payment)" title="Voir les détails">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredPayments.length > 0" class="pagination">
          <div class="pagination-info">
            Affichage {{ paginationStart }} - {{ paginationEnd }} sur {{ filteredPayments.length }}
          </div>
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Précédent
            </button>
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: currentPage === page }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </div>
            <button 
              class="pagination-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Suivant
            </button>
          </div>
          <div class="items-per-page">
            <span>Afficher</span>
            <select v-model="itemsPerPage" class="items-per-page-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entrées</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Details -->
    <TransactionDetailsModal
      :show="showDetailsModal"
      :transaction="selectedTransaction || {}"
      @close="showDetailsModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import TransactionDetailsModal from "@/components/TransactionDetailsModal.vue";

export default {
  name: 'HistoryPage',
  components: {
    TransactionDetailsModal
  },
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // État réactif
    const batches = ref([]);
    const payments = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const filterStatus = ref('');
    const filterCurrency = ref('');
    const filterPeriod = ref('');
    const selectedPayments = ref([]);
    const selectAll = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const batchId = ref(route.query.batchId || '');
    const batchFilterActive = ref(!!route.query.batchId);

    // Modal
    const showDetailsModal = ref(false);
    const selectedTransaction = ref(null);

    // Charger les données (Batches ou Paiements d'un batch)
    const loadData = async () => {
      try {
        loading.value = true;
        
        if (batchId.value) {
          // Charger un batch spécifique
          const batch = await api.getBatch(batchId.value);
          
          if (batch) {
             // Mapper les transactions validées
             const validTxns = (batch.transactions || []).map((tx, index) => ({
                id: tx.txId || tx.transferId || `TXN-${index}`,
                // Essayer plusieurs chemins pour trouver le nom (priorité aux champs francisés du backend)
                fullName: tx.nom_complet || tx.metadata?.nom_complet || tx.payee?.partyIdInfo?.partyIdentifier || tx.firstName || 'Inconnu',
                // Montant peut être un objet ou une valeur directe
                amount: parseFloat(tx.montant || tx.amount?.amount || tx.amount || 0),
                currency: tx.devise || tx.amount?.currency || tx.currency || 'XOF',
                status: (() => {
                    const s = (tx.status || '').toString().toLowerCase();
                    if (s === 'completed' || s === 'success') return 'completed';
                    if (s === 'failed' || s === 'failure') return 'failed';
                    if (s === 'rejected') return 'rejected';
                    if (s === 'pending') return 'pending';
                    return tx.status || 'unknown'; // Retourne le statut brut si non reconnu
                })(),
                date: tx.processedAt || tx.completedTimestamp || batch.createdAt,
                batchId: batch.batchId,
                // Conserver d'autres infos utiles pour le modal
                rejectionReasons: tx.errorDescription || null,
                ...tx
             }));

             // Mapper les transactions rejetées
             const rejectedTxns = (batch.rejectedTransactions || []).map((t, index) => ({
                id: `REJ-${batch.batchId?.substring(0,4)}-${t.lineNumber || index}`,
                fullName: t.rawData?.nom_complet || 'Inconnu',
                amount: parseFloat(t.rawData?.montant || 0),
                currency: t.rawData?.devise || 'N/A',
                date: batch.createdAt,
                status: 'rejected',
                rejectionReasons: t.reasons ? t.reasons.join(', ') : 'Raison inconnue',
                batchId: batch.batchId
             }));
             
             payments.value = [...validTxns, ...rejectedTxns];
          }
        } else {
          // Charger la liste des batches pour l'historique par rapport
          const data = await api.getBatches();
          if (data) {
             batches.value = data;
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const selectBatch = (id) => {
        router.push({ name: 'History', query: { batchId: id } });
    };

    const viewDetails = (payment) => {
        selectedTransaction.value = payment;
        showDetailsModal.value = true;
    };
    
    // --- Utils pour Batches ---
    const getBatchTotal = (batch) => {
        // Priorité au résumé calculé par le backend
        if (batch.summary && batch.summary.totalAmount !== undefined) {
            return parseFloat(batch.summary.totalAmount);
        }
        // Sinon calcul manuel sur les transactions validées
        return (batch.transactions || []).reduce((sum, t) => {
            const val = parseFloat(t.montant || t.amount?.amount || t.amount || 0);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    };

    const getBatchStatusText = (status) => {
        const map = {
            'COMPLETED': 'Terminé',
            'COMPLETED_WITH_ERRORS': 'Terminé avec erreurs',
            'RUNNING': 'En cours',
            'UPLOADED': 'Téléchargé',
            'VALIDATED': 'Validé'
        };
        return map[status] || status;
    };

    const getBatchStatusClass = (status) => {
         return status === 'COMPLETED' ? 'completed' : 
                status === 'COMPLETED_WITH_ERRORS' ? 'warning' : 
                status === 'RUNNING' ? 'pending' : 'failed';
    };
    
    // Réinitialiser les filtres et recharger les données
    const resetFilters = () => {
      searchQuery.value = '';
      filterStatus.value = '';
      filterCurrency.value = '';
      filterPeriod.value = '';
      currentPage.value = 1;
      
      // Si on était en mode filtre par batch, on revient à la vue complète (Liste des rapports)
      if (batchFilterActive.value) {
        batchId.value = '';
        batchFilterActive.value = false;
        router.push({ name: 'History' });
      } else {
        loadData();
      }
    };

    // Computed properties
    const filteredPayments = computed(() => {
      return payments.value.filter(payment => {
        const matchesSearch = !searchQuery.value || 
          payment.recipient.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          payment.reference?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          payment.id.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesStatus = !filterStatus.value || payment.status === filterStatus.value;
        const matchesCurrency = !filterCurrency.value || payment.currency === filterCurrency.value;
        
        // Filtre par période
        let matchesPeriod = true;
        if (filterPeriod.value) {
          const now = new Date();
          const paymentDate = new Date(payment.date);
          
          if (filterPeriod.value === 'today') {
            matchesPeriod = paymentDate.toDateString() === now.toDateString();
          } else if (filterPeriod.value === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            matchesPeriod = paymentDate >= weekAgo;
          } else if (filterPeriod.value === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            matchesPeriod = paymentDate >= monthAgo;
          }
        }
        
        return matchesSearch && matchesStatus && matchesCurrency && matchesPeriod;
      });
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredPayments.value.length / itemsPerPage.value);
    });

    const paginatedPayments = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredPayments.value.slice(start, end);
    });

    const paginationStart = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const paginationEnd = computed(() => {
      return Math.min(currentPage.value * itemsPerPage.value, filteredPayments.value.length);
    });

    // Méthodes
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedPayments.value = [...paginatedPayments.value.map(p => p.id)];
      } else {
        selectedPayments.value = [];
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatCurrency = (amount, currency = 'XOF') => {
      if (amount === undefined || amount === null) return '';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'completed':
          return 'status-completed';
        case 'pending':
          return 'status-pending';
        case 'failed':
          return 'status-failed';
        default:
          return '';
      }
    };


    // Surveiller les changements de paramètres d'URL
    watch(() => route.query, (newQuery) => {
      if (newQuery.batchId && newQuery.batchId !== batchId.value) {
        batchId.value = newQuery.batchId;
        batchFilterActive.value = true;
        loadData();
      } else if (!newQuery.batchId && batchFilterActive.value) {
        batchId.value = '';
        batchFilterActive.value = false;
        loadData();
      }
    });

    // Lifecycle hooks
    onMounted(() => {
      // Si un batchId est présent dans l'URL, charger ce batch spécifique
      if (route.query.batchId) {
        batchId.value = route.query.batchId;
        batchFilterActive.value = true;
      }
      loadData();
    });

    // Retourner toutes les propriétés et méthodes nécessaires au template
    return {
      payments,
      loading,
      searchQuery,
      filterStatus,
      filterCurrency,
      filterPeriod,
      selectedPayments,
      selectAll,
      currentPage,
      itemsPerPage,
      filteredPayments,
      totalPages,
      paginatedPayments,
      paginationStart,
      paginationEnd,
      batchFilterActive,
      toggleSelectAll,
      formatDate,
      formatCurrency,
      getStatusClass,
      resetFilters,
      successRate: computed(() => {
        if (filteredPayments.value.length === 0) return 0;
        const completed = filteredPayments.value.filter(p => p.status === 'completed').length;
        return Math.round((completed / filteredPayments.value.length) * 100);
      }),
      totalAmount: computed(() => {
        return filteredPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0);
      }),
      filteredTotalAmount: computed(() => {
        return filteredPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0);
      }),
      batches,
      selectBatch,
      getBatchTotal,
      getBatchStatusText,
      getBatchStatusClass,
      showDetailsModal,
      selectedTransaction,
      viewDetails,
      getInitials: (name) => {
          if (!name) return '?';
          return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      },
      getStatusText: (status) => {
        const map = {
            'completed': 'Complété',
            'success': 'Complété',
            'pending': 'En attente',
            'failed': 'Échoué',
            'rejected': 'Rejeté'
        };
        return map[status] || status;
      },
    };
  }
};
</script>

<style scoped>
.history-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.batch-filter-tag {
  display: flex;
  align-items: center;
  background-color: #eef2ff;
  color: #4f46e5;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #4f46e5;
  margin-left: 0.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.clear-filter-btn:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

.clear-filter-btn svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2.5;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Styles pour les filtres */
.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  max-width: 400px;
  margin-bottom: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
}

/* Styles pour le tableau */
.transactions-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.transactions-summary {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item span {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-item strong {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.transactions-table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

tbody tr:hover {
  background-color: #f9fafb;
}

.id-cell {
  font-family: 'Courier New', monospace;
  color: #6b7280;
}

.recipient-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.recipient-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.recipient-info {
  display: flex;
  flex-direction: column;
}

.recipient-name {
  font-weight: 500;
  color: #111827;
}

.recipient-reference {
  font-size: 0.75rem;
  color: #6b7280;
}

.amount {
  font-weight: 500;
  color: #111827;
  margin-right: 0.25rem;
}

.currency {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.completed,
.status-badge.success,
.status-badge.SUCCESS {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.unknown {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.status-badge.warning {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-badge.pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.rejected {
  background-color: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.btn-icon svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f3f4f6;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover:not(.active) {
  background-color: #f3f4f6;
}

.page-number.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.items-per-page-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
}

/* États de chargement et vides */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state svg,
.empty-state svg {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #9ca3af;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .history-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .filters-section {
    padding: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .items-per-page {
    justify-content: center;
  }
}
</style>

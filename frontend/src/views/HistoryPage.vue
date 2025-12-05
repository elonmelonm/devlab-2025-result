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

    <div class="filters-section">
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
        </select>

        <select v-model="filterCurrency" class="filter-select">
          <option value="">Toutes les devises</option>
          <option value="XOF">XOF</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>

        <select v-model="filterPeriod" class="filter-select">
          <option value="">Toutes les périodes</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>

        <button class="btn btn-secondary" @click="resetFilters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Réinitialiser
        </button>
      </div>
    </div>

    <div class="transactions-container">
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
            <strong>{{ formatCurrency(totalAmount) }}</strong>
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
                <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
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
                <td><input type="checkbox" v-model="selectedPayments" :value="payment.id" /></td>
                <td class="id-cell">
                  <span class="id-prefix">#{{ payment.id.toString().substring(0, 8) }}</span>
                </td>
                <td class="recipient-cell">
                  <div class="recipient-avatar">
                    {{ getInitials(payment.recipient) }}
                  </div>
                  <div class="recipient-info">
                    <div class="recipient-name">{{ payment.recipient }}</div>
                    <div class="recipient-reference">{{ payment.reference || 'Sans référence' }}</div>
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
                  <button class="btn-icon" @click="downloadReceipt(payment)" title="Télécharger le reçu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'HistoryPage',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // État réactif
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

    // Charger les paiements depuis l'API
    const loadPayments = async () => {
      try {
        loading.value = true;
        
        if (batchId.value) {
          // Charger un batch spécifique
          const response = await api.get(`/api/batches/${batchId.value}`);
          if (response.data && response.data.payments) {
            payments.value = response.data.payments;
          }
        } else {
          // Charger tous les paiements
          const response = await api.get('/api/batches');
          // Aplatir tous les paiements de tous les batches
          payments.value = response.data.reduce((acc, batch) => {
            return [...acc, ...(batch.payments || [])];
          }, []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des transactions:', error);
        // En cas d'erreur, charger des données de démonstration
        payments.value = [
          {
            id: 'txn_12345678',
            recipient: 'John Doe',
            reference: 'FACT-2023-001',
            amount: 150000,
            currency: 'XOF',
            date: '2023-11-15T10:30:00Z',
            status: 'completed',
            batchId: batchId.value || 'batch_123'
          },
        ];
      } finally {
        loading.value = false;
      }
    };
    
    // Réinitialiser les filtres et recharger les données
    const resetFilters = () => {
      searchQuery.value = '';
      filterStatus.value = '';
      filterCurrency.value = '';
      filterPeriod.value = '';
      currentPage.value = 1;
      
      // Si on était en mode filtre par batch, on revient à la vue complète
      if (batchFilterActive.value) {
        batchFilterActive.value = false;
        batchId.value = '';
        router.push({ name: 'History' });
      } else {
        loadPayments();
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
        loadPayments();
      } else if (!newQuery.batchId && batchFilterActive.value) {
        batchId.value = '';
        batchFilterActive.value = false;
        loadPayments();
      }
    });

    // Lifecycle hooks
    onMounted(() => {
      // Si un batchId est présent dans l'URL, charger ce batch spécifique
      if (route.query.batchId) {
        batchId.value = route.query.batchId;
        batchFilterActive.value = true;
      }
      loadPayments();
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

.status-badge.completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #991b1b;
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

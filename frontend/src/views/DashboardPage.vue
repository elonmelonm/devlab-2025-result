<template>
  <div class="dashboard-page">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-mini">
          <svg viewBox="0 0 100 100">
            <path
              d="M30 50 L45 65 L70 40"
              stroke="#FFFFFF"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#EAC435"
              stroke-width="4"
              fill="none"
            />
          </svg>
        </div>
        <div class="header-info">
          <h1>Open<span class="highlight">Pay</span></h1>
          <p>Tableau de bord</p>
        </div>
      </div>

      <div class="header-right">
        <button class="btn-upload" @click="showUploadModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Nouveau fichier
        </button>

        <div class="user-menu">
          <button class="user-button" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>{{ userEmail }}</span>
            <svg
              class="chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <transition name="dropdown">
            <div v-if="showUserMenu" class="user-dropdown">
              <a href="#" class="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Mon profil
              </a>
              <a href="#" class="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
                </svg>
                Paramètres
              </a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item danger" @click.prevent="logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Déconnexion
              </a>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="dashboard-main">
      <!-- Carte de solde -->
      <div class="balance-section">
        <div class="balance-card">
          <div class="balance-card1">
            <div class="balance-header">
              <div class="balance-icon">
                <span class="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
              <div class="balance-info">
                <!-- <span class="balance-label">Solde disponible</span> -->
                <h2 class="balance-amount">
                  {{ formatCurrency(balance) }}
                  <span class="currency">XOF</span>
                </h2>
              </div>
            </div>

            <div class="balance-stats">
              <div class="stat-item">
                <div class="stat-icon success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div class="stat-details">
                  <span class="stat-value"
                    >+{{ formatCurrency(monthlyIncrease) }}</span
                  >
                  <span class="stat-label">Ce mois</span>
                </div>
              </div>

              <div class="stat-divider"></div>

              <div class="stat-item">
                <div class="stat-icon warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div class="stat-details">
                  <span class="stat-value">{{ pendingCount }}</span>
                  <span class="stat-label">En attente</span>
                </div>
              </div>
            </div>
          </div>
          <div class="balance-card2">
            <div class="icon-container">
              <!-- Icône 1: Elderly Woman -->
              <span ref="icon1" class="material-symbols-outlined morph-icon">
                elderly_woman
              </span>

              <!-- Icône 2: Credit Score -->
              <span ref="icon2" class="material-symbols-outlined morph-icon">
                credit_score
              </span>

              <span ref="icon3" class="material-symbols-outlined morph-icon">
                heart_smile
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              />
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ totalPayments }}</span>
            <span class="stat-card-label">Paiements totaux</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ successRate }}%</span>
            <span class="stat-card-label">Taux de réussite</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{
              formatCurrency(totalAmount)
            }}</span>
            <span class="stat-card-label">Montant traité</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-card-value">{{ uniqueRecipients }}</span>
            <span class="stat-card-label">Bénéficiaires</span>
          </div>
        </div>
      </div>

      <!-- Section historique -->
      <div class="history-section">
        <div class="section-header">
          <div class="section-title">
            <h3>Historique des transactions</h3>
            <span class="transaction-count"
              >{{ payments.length }} transaction{{
                payments.length > 1 ? "s" : ""
              }}</span
            >
          </div>
          <div v-if="payments.length > 0" class="section-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                v-model="searchQuery"
              />
            </div>
            <button class="btn-filter" @click="showFilters = !showFilters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtrer
            </button>
            <button class="btn-report" @click="generateReport">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Rapport
            </button>
          </div>
        </div>
        <!-- Table des transactions -->
        <div class="transactions-container">
          <div v-if="filteredPayments.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h4>Aucune transaction trouvée</h4>
            <p>Commencez par importer un fichier de paiement</p>
            <button class="btn-empty-action" @click="showUploadModal = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Importer un fichier
            </button>
          </div>

          <!-- ✅ État vide initial -->
        <div v-if="payments.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h3>Aucune transaction</h3>
          <p>Importez un fichier pour commencer à traiter des paiements</p>
          <button class="btn-upload-empty" @click="showUploadModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importer un fichier
          </button>
        </div>

          <div v-else class="transactions-table-wrapper">
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      class="checkbox-all"
                      v-model="selectAll"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th>Bénéficiaire</th>
                  <th>Montant</th>
                  <th>Devise</th>
                  <th>ID Transaction</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="payment in paginatedPayments"
                  :key="payment.id"
                  :class="{ selected: selectedPayments.includes(payment.id) }"
                >
                  <td>
                    <input
                      type="checkbox"
                      class="checkbox-row"
                      :value="payment.id"
                      v-model="selectedPayments"
                    />
                  </td>
                  <td>
                    <div class="recipient-cell">
                      <div class="recipient-avatar">
                        {{ getInitials(payment.fullName) }}
                      </div>
                      <span class="recipient-name">{{ payment.fullName }}</span>
                    </div>
                  </td>
                  <td class="amount-cell">
                    {{ formatCurrency(payment.amount) }}
                  </td>
                  <td>
                    <span
                      class="currency-badge"
                      :class="payment.currency.toLowerCase()"
                    >
                      {{ payment.currency }}
                    </span>
                  </td>
                  <td class="id-cell">
                    <code>{{ payment.id }}</code>
                    <button
                      class="btn-copy"
                      @click="copyToClipboard(payment.id)"
                      title="Copier"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                        />
                      </svg>
                    </button>
                  </td>
                  <td class="date-cell">{{ formatDate(payment.date) }}</td>
                  <td>
                    <span class="status-badge" :class="payment.status">
                      <span class="status-dot"></span>
                      {{ getStatusText(payment.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        title="Voir détails"
                        @click="viewDetails(payment)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        class="btn-action"
                        title="Télécharger"
                        @click="downloadReceipt(payment)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredPayments.length > 0" class="pagination">
            <div class="pagination-info">
              Affichage {{ paginationStart }} - {{ paginationEnd }} sur
              {{ filteredPayments.length }}
            </div>
            <div class="pagination-controls">
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div class="pagination-pages">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="pagination-page"
                  :class="{ active: page === currentPage }"
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <PaymentStats :payments="payments" />

        <!-- Filtres -->
        <transition name="slide">
          <div v-if="showFilters" class="filters-panel">
            <div class="filter-group">
              <label>Statut</label>
              <select v-model="filterStatus">
                <option value="">Tous</option>
                <option value="completed">Complété</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Devise</label>
              <select v-model="filterCurrency">
                <option value="">Toutes</option>
                <option value="XOF">XOF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Période</label>
              <select v-model="filterPeriod">
                <option value="">Toutes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
            <button class="btn-reset-filters" @click="resetFilters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </transition>
      </div>
    </main>

    <!-- Modal d'upload -->
    <FileUploadModal
      :show="showUploadModal"
      @close="showUploadModal = false"
      @file-selected= "handleUploadComplete"
      @upload-complete="handleUploadComplete"
    />

    <!-- Toast de notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg
          v-if="toastType === 'success'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          v-else-if="toastType === 'error'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import FileUploadModal from "@/components/FileUploadModal.vue";
import PaymentStats from "@/components/PaymentStats.vue";
import { gsap } from "gsap";

export default {
  name: "DashboardPage",
  components: {
    FileUploadModal,
    PaymentStats,
  },
  data() {
    return {
      userEmail: localStorage.getItem("userEmail") || "utilisateur@email.com",
      showUserMenu: false,
      showUploadModal: false,
      showFilters: false,
      searchQuery: "",
      filterStatus: "",
      filterCurrency: "",
      filterPeriod: "",
      balance: 12500000,
      monthlyIncrease: 18500,
      payments: [],
      selectedPayments: [],
      selectAll: false,
      currentPage: 1,
      itemsPerPage: 10,
      showToast: false,
      toastMessage: "",
      toastType: "success",
    };
  },
  computed: {

    totalPayments() {
      return this.payments.length;
    },
    pendingCount() {
      return this.payments.filter((p) => p.status === "pending").length;
    },
    successRate() {
      if (this.payments.length === 0) return 0;
      const completed = this.payments.filter(
        (p) => p.status === "completed"
      ).length;
      return Math.round((completed / this.payments.length) * 100);
    },
    totalAmount() {
      return this.payments.reduce((sum, p) => sum + p.amount, 0);
    },
    uniqueRecipients() {
      return new Set(this.payments.map((p) => p.fullName)).size;
    },
    filteredPayments() {
      return this.payments.filter((payment) => {
        const matchesSearch =
          payment.fullName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          payment.id.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesStatus =
          !this.filterStatus || payment.status === this.filterStatus;
        const matchesCurrency =
          !this.filterCurrency || payment.currency === this.filterCurrency;

        return matchesSearch && matchesStatus && matchesCurrency;
      });
    },
    paginatedPayments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPayments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPayments.length / this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
    paginationStart() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.filteredPayments.length
      );
    },
  },
  mounted() {
    // Afficher le modal d'upload au premier chargement
    const shouldShowModal = localStorage.getItem("showUploadModal");
    if (shouldShowModal === "true") {
      setTimeout(() => {
        this.showUploadModal = true;
        localStorage.removeItem("showUploadModal");
      }, 500);
    }

    // Simuler des paiements en cours
    this.simulateOngoingPayments();

    // Fermer le menu utilisateur en cliquant ailleurs
    document.addEventListener("click", this.handleClickOutside);
    this.$nextTick(() => {
      // console.log("Diamond:", this.$refs.diamond);
      // console.log("Lightning:", this.$refs.lightning);

      if (this.$refs.icon1 && this.$refs.icon2 && this.$refs.icon3) {
        console.log("Les deux éléments sont trouvés ✅");
        this.startMorphAnimation();
      } else {
        console.error("❌ Élément manquant!");
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    gsap.killTweensOf(this.$refs.diamond);
  },
  methods: {
    startMorphAnimation() {
  const icon1 = this.$refs.icon1; // elderly_woman
  const icon2 = this.$refs.icon2; // credit_score
  const icon3 = this.$refs.icon3; // heart_smile

  if (!icon1 || !icon2 || !icon3) {
    console.error("Icônes non trouvées");
    return;
  }

  // 🔥 États initiaux: Seule icon1 est visible
  gsap.set(icon1, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    transformOrigin: "50% 50%",
  });

  gsap.set(icon2, {
    opacity: 0,
    scale: 0.8,
    rotation: -30,
    transformOrigin: "50% 50%",
  });

  gsap.set(icon3, {
    opacity: 0,
    scale: 0.8,
    rotation: -60,
    transformOrigin: "50% 50%",
  });

  // Timeline d'animation
  const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.3,
  });

  // 1️⃣ elderly_woman → credit_score
  tl.to(icon1, {
    opacity: 0,
    scale: 0.8,
    rotation: 180,
    duration: 1,
    ease: "expo.inOut",
  })
  .to(icon2, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 1,
    ease: "expo.inOut",
  }, "<")

  // Pause
  .to({}, { duration: 0.8 })

  // 2️⃣ credit_score → heart_smile
  .to(icon2, {
    opacity: 0,
    scale: 0.8,
    rotation: 180,
    duration: 1,
    ease: "expo.inOut",
  })
  .to(icon3, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 1,
    ease: "expo.inOut",
  }, "<")

  // Pause
  .to({}, { duration: 0.8 })

  // 3️⃣ heart_smile → elderly_woman (retour au début)
  .to(icon3, {
    opacity: 0,
    scale: 0.8,
    rotation: 180,
    duration: 1,
    ease: "expo.inOut",
  })
  .to(icon1, {
    opacity: 1,
    scale: 1,
    rotation: 360, // Tour complet
    duration: 1,
    ease: "expo.inOut",
  }, "<");
},

    handleClickOutside(event) {
      const userMenu = this.$el.querySelector(".user-menu");
      if (userMenu && !userMenu.contains(event.target)) {
        this.showUserMenu = false;
      }
    },
    logout() {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userEmail");
      this.$router.push("/");
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("fr-FR").format(amount);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },
    getStatusText(status) {
      const statusMap = {
        pending: "En attente",
        completed: "Complété",
        failed: "Échoué",
      };
      return statusMap[status] || status;
    },
    handleUploadComplete(newPayments) {
      this.payments = [...newPayments, ...this.payments];
      this.showToastNotification(
        "Fichier importé avec succès! Traitement en cours...",
        "success"
      );

      // Simuler le traitement des paiements
      this.processPayments(newPayments);
    },
    processPayments(newPayments) {
      newPayments.forEach((payment, index) => {
        setTimeout(() => {
          const paymentIndex = this.payments.findIndex(
            (p) => p.id === payment.id
          );
          if (paymentIndex !== -1) {
            // 80% de chances de succès
            const isSuccess = Math.random() > 0.2;
            this.payments[paymentIndex].status = isSuccess
              ? "completed"
              : "failed";

            if (index === newPayments.length - 1) {
              this.showToastNotification(
                "Tous les paiements ont été traités!",
                "success"
              );
            }
          }
        }, (index + 1) * 2000); // 2 secondes entre chaque
      });
    },
    simulateOngoingPayments() {
      // Créer quelques paiements déjà traités pour démonstration
      const mockPayments = [
        {
          id: "PAY-2024-001",
          fullName: "Alice Dupont",
          amount: 500000,
          currency: "XOF",
          status: "completed",
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "PAY-2024-002",
          fullName: "Bob Martin",
          amount: 750000,
          currency: "XOF",
          status: "completed",
          date: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "PAY-2024-003",
          fullName: "Claire Leroy",
          amount: 1200000,
          currency: "EUR",
          status: "failed",
          date: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      this.payments = mockPayments;
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedPayments = this.paginatedPayments.map((p) => p.id);
      } else {
        this.selectedPayments = [];
      }
    },
    resetFilters() {
      this.filterStatus = "";
      this.filterCurrency = "";
      this.filterPeriod = "";
      this.searchQuery = "";
    },
    generateReport() {
      this.showToastNotification("Génération du rapport en cours...", "info");

      setTimeout(() => {
        // Simuler la génération d'un rapport
        const reportData = this.filteredPayments.map((p) => ({
          ID: p.id,
          Bénéficiaire: p.fullName,
          Montant: p.amount,
          Devise: p.currency,
          Statut: this.getStatusText(p.status),
          Date: this.formatDate(p.date),
        }));

        // Créer un CSV
        const headers = Object.keys(reportData[0]).join(",");
        const rows = reportData
          .map((row) => Object.values(row).join(","))
          .join("\n");
        const csv = headers + "\n" + rows;

        // Télécharger
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rapport_paiements_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();

        this.showToastNotification(
          "Rapport téléchargé avec succès!",
          "success"
        );
      }, 1500);
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToastNotification("ID copié dans le presse-papier", "success");
      });
    },
    viewDetails(payment) {
      this.showToastNotification(`Détails de ${payment.fullName}`, "info");
    },
    downloadReceipt(payment) {
      this.showToastNotification(
        `Téléchargement du reçu pour ${payment.fullName}...`,
        "info"
      );
    },
    showToastNotification(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
/* ========== VARIABLES ========== */
.dashboard-page {
  --primary-blue: #00478f;
  --primary-blue-light: #0066cc;
  --accent-yellow: #eac435;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --text-dark: #1a1a1a;
  --text-gray: #6b7280;
  --bg-light: #f8f9fa;
  --white: #ffffff;
  --border-color: #e5e7eb;
}

/* ========== BASE ========== */
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-light);
}

/* ========== HEADER ========== */
.dashboard-header {
  background: linear-gradient(
    135deg,
    var(--primary-blue) 0%,
    var(--primary-blue-light) 50%
  );
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 71, 143, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-mini {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.logo-mini:hover {
  transform: scale(1.05);
}

.logo-mini svg {
  width: 32px;
  height: 32px;
}

.header-info h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--white);
  margin: 0;
  letter-spacing: -0.5px;
}

.header-info h1 .highlight {
  color: var(--accent-yellow);
}

.header-info p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 2px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-upload {
  background: var(--white);
  color: #000000;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(234, 196, 53, 0.3);
}

.btn-upload:hover {
  /* background: #d4b030; */
  transform: translateY(-2px);
  color: #d4b030;
  box-shadow: 0 6px 20px rgba(234, 196, 53, 0.4);
}

.btn-upload svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

/* Menu utilisateur */
.user-menu {
  position: relative;
}

.user-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--white);
  font-size: 14px;
  font-weight: 500;
}

.user-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.user-button:hover .chevron {
  transform: translateY(2px);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  padding: 8px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-dark);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: var(--bg-light);
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.dropdown-item.danger {
  color: var(--danger-red);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

/* ========== MAIN CONTENT ========== */
.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 40px;
}

/* Section solde */
.balance-section {
  margin-bottom: 30px;
  background: transparent;
  /* background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 1) 45%,
    rgba(212, 212, 212, 1) 66%,
    rgba(0, 90, 180, 1) 100%
  ); */
  height: 250px;
  border-radius: 40px;
}

.balance-card {
  border-radius: 24px;
  width: 100%;
  height: 100%;
  padding: 20px;
  color: var(--white);
  box-shadow: 0 10px 40px rgba(0, 71, 143, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
}

/* Image de fond avec opacité */
.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(@/assets/2.jpg);
  background-attachment: fixed;
  background-position: 45% 75%;
  background-size: 2036px 958px;
  background-repeat: no-repeat;
  opacity: 0.6; 
  z-index: 0;
}

/* Assurez-vous que le contenu soit au-dessus */
.balance-card > * {
  position: relative;
  z-index: 1;
}

/* .balance-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(234, 196, 53, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
} */

.balance-card1 {
  /* background-color: #10b981; */
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.balance-card2 {
  display: inline-block;
}

.icon-container {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.morph-icon {
  position: absolute;
  font-size: 180px;
  margin-left: 400px;

  /* Gradient coloré */
  background: linear-gradient(135deg, hsla(210, 100%, 40%, 1) 0%, hsla(273, 60%, 73%, 1) 78%, hsla(47, 81%, 56%, 1) 100%);
  /* background: linear-gradient(135deg, #ff8709 0%, #f7bdf8 100%); */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  /* Support pour les navigateurs qui ne supportent pas background-clip */
  color: #ff8709;
}

/* Style des icônes Material Symbols */
.material-symbols-outlined {
  font-variation-settings: "FILL" 1, /* Icône remplie */ "wght" 400,
    /* Épaisseur normale */ "GRAD" 0, /* Gradient normal */ "opsz" 48; /* Taille optique */
}
/* .balance-card2 img{
    width: 300px;
    height: 200px;
} */

.balance-header {
  width: 70%;
  height: 30%;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  color: #000000;
  /* background-color: #F3F5F8; */
}

.balance-icon {
  width: 60px;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variation-settings: "FILL" 1;
}

.balance-icon span {
  font-size: 50px;
  color: #ffffff;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  display: block;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 50px;
  font-weight: 700;
  /* margin: 0; */
  margin-bottom: 7px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.currency {
  font-size: 24px;
  font-weight: 600;
  opacity: 0.8;
}

.balance-stats {
  display: flex;
  gap: 30px;
  margin-left: 5px;
  position: relative;
  z-index: 1;
  color: #000000;
  /* background-color: #3b82f6; */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.success {
  background: rgba(16, 185, 129, 0.2);
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.2);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 10px;
}

/* Statistiques rapides */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-icon.blue {
  background: rgba(0, 102, 204, 0.1);
  color: var(--primary-blue-light);
}

.stat-card-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.stat-card-icon.purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-card-icon.orange {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-orange);
}

.stat-card-icon svg {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

.stat-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-card-label {
  font-size: 13px;
  color: var(--text-gray);
  font-weight: 500;
}

/* ========== SECTION HISTORIQUE ========== */
.history-section {
  background: var(--white);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.transaction-count {
  background: var(--bg-light);
  color: var(--text-gray);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 280px;
}

.search-box svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-gray);
  stroke-width: 2.5;
}

.search-box input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  background: var(--white);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-blue-light);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.btn-filter,
.btn-report {
  padding: 12px 20px;
  border: 1px solid var(--border-color);
  background: var(--white);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-dark);
}

.btn-filter:hover,
.btn-report:hover {
  background: var(--bg-light);
  border-color: var(--primary-blue-light);
  color: var(--primary-blue-light);
}

.btn-filter svg,
.btn-report svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

/* Filtres */
.filters-panel {
  background: var(--bg-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 180px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-gray);
}

.filter-group select {
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-blue-light);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.btn-reset-filters {
  padding: 10px 20px;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-gray);
}

.btn-reset-filters:hover {
  background: var(--danger-red);
  color: var(--white);
  border-color: var(--danger-red);
}

.btn-reset-filters svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

/* Table des transactions */
.transactions-container {
  margin-top: 24px;
}

.transactions-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
}

.transactions-table thead {
  background: var(--bg-light);
  border-bottom: 2px solid var(--border-color);
}

.transactions-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.transactions-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s;
}

.transactions-table tbody tr:hover {
  background: rgba(0, 102, 204, 0.02);
}

.transactions-table tbody tr.selected {
  background: rgba(0, 102, 204, 0.05);
}

.transactions-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: var(--text-dark);
}

/* Cellules spécifiques */
.recipient-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recipient-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(
    135deg,
    var(--primary-blue) 0%,
    var(--primary-blue-light) 100%
  );
  color: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.recipient-name {
  font-weight: 600;
  color: var(--text-dark);
}

.amount-cell {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-dark);
}

.currency-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.currency-badge.xof {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.currency-badge.eur {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.currency-badge.usd {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.id-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-cell code {
  font-family: "Monaco", "Courier New", monospace;
  font-size: 12px;
  color: var(--text-gray);
  background: var(--bg-light);
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-copy {
  padding: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-gray);
  transition: all 0.2s;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:hover {
  background: var(--bg-light);
  color: var(--primary-blue-light);
}

.btn-copy svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.date-cell {
  color: var(--text-gray);
  font-size: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-orange);
}

.status-badge.failed {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-red);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-gray);
}

.btn-action:hover {
  background: var(--primary-blue-light);
  color: var(--white);
  border-color: var(--primary-blue-light);
}

.btn-action svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

/* Checkboxes */
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-blue-light);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-light);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: var(--text-gray);
  stroke-width: 2;
}

.empty-state h4 {
  font-size: 20px;
  color: var(--text-dark);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-gray);
  margin: 0 0 24px 0;
}

.btn-empty-action {
  padding: 14px 28px;
  background: var(--primary-blue-light);
  color: var(--white);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-empty-action:hover {
  background: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 102, 204, 0.3);
}

.btn-empty-action svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

/* ========== PAGINATION ========== */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  font-size: 14px;
  color: var(--text-gray);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-dark);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-blue-light);
  color: var(--white);
  border-color: var(--primary-blue-light);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.pagination-pages {
  display: flex;
  gap: 6px;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  color: var(--text-dark);
}

.pagination-page:hover {
  background: var(--bg-light);
  border-color: var(--primary-blue-light);
}

.pagination-page.active {
  background: var(--primary-blue-light);
  color: var(--white);
  border-color: var(--primary-blue-light);
}

/* ========== TOAST ========== */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--white);
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  z-index: 1000;
  border-left: 4px solid;
}

.toast.success {
  border-left-color: var(--success-green);
}

.toast.error {
  border-left-color: var(--danger-red);
}

.toast.info {
  border-left-color: var(--primary-blue-light);
}

.toast svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
  flex-shrink: 0;
}

.toast.success svg {
  color: var(--success-green);
}

.toast.error svg {
  color: var(--danger-red);
}

.toast.info svg {
  color: var(--primary-blue-light);
}

.toast span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

/* ========== ANIMATIONS ========== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

#svg-stage {
  width: 60%;
  max-height: 60vh;
  max-width: 500px;
  overflow: visible;
}

#gradient {
  height: 0;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .dashboard-main {
    padding: 20px 24px;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .balance-amount {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 16px 20px;
  }

  .header-info h1 {
    font-size: 20px;
  }

  .header-info p {
    display: none;
  }

  .btn-upload span {
    display: none;
  }

  .user-button span {
    display: none;
  }

  .balance-card {
    padding: 24px;
  }

  .balance-amount {
    font-size: 32px;
  }

  .balance-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-divider {
    display: none;
  }

  .quick-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .history-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .btn-filter,
  .btn-report {
    width: 100%;
    justify-content: center;
  }

  .transactions-table-wrapper {
    overflow-x: scroll;
  }

  .transactions-table {
    min-width: 800px;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }

  .toast {
    left: 20px;
    right: 20px;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 16px;
  }

  .logo-mini {
    width: 40px;
    height: 40px;
  }

  .logo-mini svg {
    width: 24px;
    height: 24px;
  }

  .balance-card {
    padding: 20px;
  }

  .balance-amount {
    font-size: 28px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-card-value {
    font-size: 24px;
  }

  .history-section {
    padding: 16px;
  }
}
</style>

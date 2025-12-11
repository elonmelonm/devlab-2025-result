<template>
  <div class="payment-stats">
    <!-- En-tête des statistiques -->
    <!-- <div class="stats-header">
      <div class="header-content">
        <h3>Statistiques de paiement</h3>
        <p>Analyse détaillée de vos transactions</p>
      </div>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div> -->

    <!-- Grille des statistiques principales -->
    <!-- <div class="main-stats-grid">
      <div class="stat-box primary">
        <div class="stat-box-header">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-menu">
            <button class="menu-toggle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="stat-box-content">
          <span class="stat-label">Total des paiements</span>
          <h4 class="stat-value">{{ formatCurrency(totalAmount) }}</h4>
          <div class="stat-trend positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+{{ growthRate }}% vs période précédente</span>
          </div>
        </div>
        <div class="stat-sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline
              :points="generateSparkline(sparklineData1)"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <div class="stat-box success">
        <div class="stat-box-header">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
        </div>
        <div class="stat-box-content">
          <span class="stat-label">Volume de transactions</span>
          <h4 class="stat-value">{{ totalTransactions }}</h4>
          <div class="stat-trend positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+{{ transactionGrowth }}%</span>
          </div>
        </div>
        <div class="stat-sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline
              :points="generateSparkline(sparklineData2)"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <div class="stat-box warning">
        <div class="stat-box-header">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <div class="stat-box-content">
          <span class="stat-label">Montant moyen</span>
          <h4 class="stat-value">{{ formatCurrency(averageAmount) }}</h4>
          <div class="stat-trend neutral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Stable</span>
          </div>
        </div>
        <div class="stat-sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline
              :points="generateSparkline(sparklineData3)"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
      </div>

      <div class="stat-box info">
        <div class="stat-box-header">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
        <div class="stat-box-content">
          <span class="stat-label">Taux de réussite</span>
          <h4 class="stat-value">{{ successRate }}%</h4>
          <div class="stat-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: successRate + '%' }"></div>
            </div>
            <span class="progress-label">{{ successfulPayments }}/{{ totalTransactions }} réussis</span>
          </div>
        </div>
      </div>
    </div> -->

    <div class="status-breakdown">
      <h4>Répartition par statut</h4>
      <div class="status-grid">
        <div class="status-item completed">
          <div class="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="status-details">
            <span class="status-count">{{ successfulPayments }}</span>
            <span class="status-label">Complétés</span>
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: (successfulPayments / totalTransactions * 100) + '%' }"></div>
            </div>
          </div>
          <div class="status-percentage">{{ ((successfulPayments / totalTransactions) * 100).toFixed(1) }}%</div>
        </div>

        <div class="status-item pending">
          <div class="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="status-details">
            <span class="status-count">{{ pendingPayments }}</span>
            <span class="status-label">En attente</span>
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: (pendingPayments / totalTransactions * 100) + '%' }"></div>
            </div>
          </div>
          <div class="status-percentage">{{ ((pendingPayments / totalTransactions) * 100).toFixed(1) }}%</div>
        </div>

        <div class="status-item failed">
          <div class="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="status-details">
            <span class="status-count">{{ failedPayments }}</span>
            <span class="status-label">Échoués</span>
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: (failedPayments / totalTransactions * 100) + '%' }"></div>
            </div>
          </div>
          <div class="status-percentage">{{ ((failedPayments / totalTransactions) * 100).toFixed(1) }}%</div>
        </div>

        <div class="status-item rejected">
          <div class="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="status-details">
            <span class="status-count">{{ rejectedPayments }}</span>
            <span class="status-label">Rejetés</span>
            <div class="status-bar">
              <div class="status-bar-fill" :style="{ width: (rejectedPayments / totalTransactions * 100) + '%' }"></div>
            </div>
          </div>
          <div class="status-percentage">{{ ((rejectedPayments / totalTransactions) * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- <div class="currency-distribution">
      <h4>Distribution par devise</h4>
      <div class="currency-chart">
        <div
          v-for="currency in currencyStats"
          :key="currency.code"
          class="currency-segment"
        >
          <div class="currency-info">
            <div class="currency-badge" :class="currency.code.toLowerCase()">
              {{ currency.code }}
            </div>
            <div class="currency-details">
              <span class="currency-amount">{{ formatCurrency(currency.amount) }}</span>
              <span class="currency-count">{{ currency.count }} transactions</span>
            </div>
          </div>
          <div class="currency-bar">
            <div
              class="currency-bar-fill"
              :class="currency.code.toLowerCase()"
              :style="{ width: (currency.amount / totalAmount * 100) + '%' }"
            >
              <span class="currency-percentage">{{ ((currency.amount / totalAmount) * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Activité récente -->
    <!-- <div class="recent-activity">
      <div class="activity-header">
        <h4>Activité récente</h4>
        <button class="btn-view-all">
          Voir tout
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
      <div class="activity-timeline">
        <div
          v-for="(activity, index) in recentActivities"
          :key="index"
          class="activity-item"
        >
          <div class="activity-dot" :class="activity.type"></div>
          <div class="activity-content">
            <div class="activity-main">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
            <p class="activity-description">{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Graphique circulaire animé -->
    <div class="success-rate-visual">
      <h4>Performance globale</h4>
      <div class="circular-chart">
        <svg viewBox="0 0 200 200" class="chart-svg">
          <!-- Cercle de fond -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="20"
          />
          <!-- Cercle de progression -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#00478F"
            stroke-width="20"
            :stroke-dasharray="circleCircumference"
            :stroke-dashoffset="circleOffset"
            stroke-linecap="round"
            transform="rotate(-90 100 100)"
            class="progress-circle"
          />
        </svg>
        <div class="chart-center">
          <span class="chart-percentage">{{ successRate }}%</span>
          <span class="chart-label">Réussite</span>
        </div>
      </div>
      <div class="performance-indicators">
        <div class="indicator excellent">
          <div class="indicator-dot"></div>
          <span>Excellent</span>
        </div>
        <div class="indicator-range">
          <div class="range-marker" :style="{ left: successRate + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentStats',
  props: {
    payments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedPeriod: '7d',
      periods: [
        { label: '7J', value: '7d' },
        { label: '30J', value: '30d' },
        { label: '3M', value: '3m' },
        { label: '1A', value: '1y' }
      ],
      sparklineData1: [30, 45, 35, 50, 45, 60, 55, 70, 65, 75],
      sparklineData2: [20, 35, 30, 45, 50, 55, 60, 65, 70, 75],
      sparklineData3: [40, 42, 41, 43, 42, 44, 43, 45, 44, 46],
      recentActivities: [
        {
          type: 'success',
          title: 'Paiement de masse complété',
          description: '150 transactions traitées avec succès',
          time: 'Il y a 5 min'
        },
        {
          type: 'pending',
          title: 'Nouveau fichier importé',
          description: '75 paiements en cours de traitement',
          time: 'Il y a 15 min'
        },
        {
          type: 'warning',
          title: 'Solde faible détecté',
          description: 'Pensez à recharger votre compte',
          time: 'Il y a 1h'
        },
        {
          type: 'success',
          title: 'Rapport généré',
          description: 'Rapport mensuel disponible au téléchargement',
          time: 'Il y a 2h'
        }
      ]
    }
  },
  computed: {
    totalAmount() {
      return this.payments.reduce((sum, p) => sum + p.amount, 0)
    },
    totalTransactions() {
      return this.payments.length
    },
    successfulPayments() {
      return this.payments.filter(p => p.status === 'completed').length
    },
    pendingPayments() {
      return this.payments.filter(p => p.status === 'pending').length
    },
    failedPayments() {
      return this.payments.filter(p => p.status === 'failed').length
    },
    rejectedPayments() {
      return this.payments.filter(p => p.status === 'rejected').length
    },
    averageAmount() {
      return this.totalTransactions > 0 ? this.totalAmount / this.totalTransactions : 0
    },
    successRate() {
      return this.totalTransactions > 0
        ? ((this.successfulPayments / this.totalTransactions) * 100).toFixed(1)
        : 0
    },
    growthRate() {
      return 12.5 // Simulé
    },
    transactionGrowth() {
      return 8.3 // Simulé
    },
    currencyStats() {
      const stats = {}
      this.payments.forEach(p => {
        if (!stats[p.currency]) {
          stats[p.currency] = { code: p.currency, amount: 0, count: 0 }
        }
        stats[p.currency].amount += p.amount
        stats[p.currency].count++
      })
      return Object.values(stats).sort((a, b) => b.amount - a.amount)
    },
    circleCircumference() {
      const radius = 80
      return 2 * Math.PI * radius
    },
    circleOffset() {
      const percentage = this.successRate
      return this.circleCircumference - (percentage / 100) * this.circleCircumference
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' FCFA'
    },
    generateSparkline(data) {
      const width = 200
      const height = 60
      const max = Math.max(...data)
      const min = Math.min(...data)
      const range = max - min || 1
      
      return data
        .map((value, index) => {
          const x = (index / (data.length - 1)) * width
          const y = height - ((value - min) / range) * height
          return `${x},${y}`
        })
        .join(' ')
    }
  }
}
</script>

<style scoped>
.payment-stats {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ========== EN-TÊTE ========== */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 8px;
}

.header-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 4px 0;
}

.header-content p {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.period-selector {
  display: flex;
  gap: 8px;
  background: #F8F9FA;
  padding: 4px;
  border-radius: 12px;
}

.period-btn {
  background: transparent;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.3s;
}

.period-btn:hover {
  color: #000000;
}

.period-btn.active {
  background: #FFFFFF;
  color: #00478F;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ========== GRILLE DES STATISTIQUES ========== */
.main-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-box {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-box-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-box.primary .stat-icon {
  background: linear-gradient(135deg, #00478F 0%, #0066CC 100%);
}

.stat-box.success .stat-icon {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.stat-box.warning .stat-icon {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.stat-box.info .stat-icon {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
  color: #FFFFFF;
}

.stat-menu {
  position: relative;
}

.menu-toggle {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.menu-toggle:hover {
  background: #F8F9FA;
}

.menu-toggle svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: #9CA3AF;
}

.stat-box-content {
  position: relative;
  z-index: 2;
}

.stat-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px 0;
  line-height: 1;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.positive {
  background: #D1FAE5;
  color: #065F46;
}

.stat-trend.neutral {
  background: #FEF3C7;
  color: #92400E;
}

.stat-trend svg {
  width: 14px;
  height: 14px;
  stroke-width: 2.5;
}

.stat-progress {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00478F 0%, #0066CC 100%);
  border-radius: 4px;
  transition: width 1s ease;
}

.progress-label {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

.stat-sparkline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  opacity: 0.15;
  pointer-events: none;
}

.stat-box.primary .stat-sparkline {
  color: #00478F;
}

.stat-box.success .stat-sparkline {
  color: #10B981;
}

.stat-box.warning .stat-sparkline {
  color: #F59E0B;
}

.stat-box.info .stat-sparkline {
  color: #3B82F6;
}

.stat-sparkline svg {
  width: 100%;
  height: 100%;
}

/* ========== RÉPARTITION PAR STATUT ========== */
.status-breakdown {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-breakdown h4 {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 20px 0;
}

.status-grid {
  display: grid;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s;
}

.status-item.completed {
  background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%);
}

.status-item.pending {
  background: linear-gradient(135deg, #FEF3C7 0%, #FEF9E7 100%);
}

.status-item.failed {
  background: linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%);
}

.status-item.rejected {
  background: linear-gradient(135deg, #FFEDD5 0%, #FFF7ED 100%);
}

.status-item:hover {
  transform: translateX(8px);
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-item.completed .status-icon {
  background: #10B981;
}

.status-item.pending .status-icon {
  background: #F59E0B;
}

.status-item.failed .status-icon {
  background: #EF4444;
}

.status-item.rejected .status-icon {
  background: #EA580C;
}

.status-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
  color: #FFFFFF;
}

.status-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-count {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.status-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.status-item.completed .status-bar-fill {
  background: #10B981;
}

.status-item.rejected .status-bar-fill {
  background: #EA580C;
}

.status-item.pending .status-bar-fill {
  background: #F59E0B;
}

.status-item.failed .status-bar-fill {
  background: #EF4444;
}

.status-percentage {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
}

/* ========== DISTRIBUTION PAR DEVISE ========== */
.currency-distribution {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.currency-distribution h4 {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 20px 0;
}

.currency-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.currency-segment {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.currency-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}

.currency-badge.xaf {
  background: #E0F2FE;
  color: #0369A1;
}

.currency-badge.eur {
  background: #FEF3C7;
  color: #92400E;
}

.currency-badge.usd {
  background: #D1FAE5;
  color: #065F46;
}

.currency-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.currency-amount {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
}

.currency-count {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.currency-bar {
  width: 100%;
  height: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.currency-bar-fill {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  transition: width 1s ease;
  position: relative;
}

.currency-bar-fill.xaf {
  background: linear-gradient(90deg, #0369A1 0%, #0EA5E9 100%);
}

.currency-bar-fill.eur {
  background: linear-gradient(90deg, #F59E0B 0%, #EAC435 100%);
}

.currency-bar-fill.usd {
  background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
}

.currency-percentage {
  font-size: 11px;
  font-weight: 700;
  color: #FFFFFF;
  white-space: nowrap;
}

/* ========== ACTIVITÉ RÉCENTE ========== */
.recent-activity {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.btn-view-all {
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #00478F;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-all:hover {
  background: #F8F9FA;
  border-color: #00478F;
}

.btn-view-all svg {
  width: 14px;
  height: 14px;
  stroke-width: 2.5;
}

.activity-timeline {
  position: relative;
  padding-left: 32px;
}

.activity-timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #E5E7EB;
}

.activity-item {
  position: relative;
  padding-bottom: 24px;
  display: flex;
  gap: 16px;
}

.activity-item:last-child {
  padding-bottom: 0;
}

.activity-dot {
  position: absolute;
  left: -26px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #FFFFFF;
  box-shadow: 0 0 0 2px #E5E7EB;
  z-index: 1;
}

.activity-dot.success {
  background: #10B981;
  box-shadow: 0 0 0 2px #10B981;
}

.activity-dot.pending {
  background: #F59E0B;
  box-shadow: 0 0 0 2px #F59E0B;
  animation: pulse-dot 2s infinite;
}

.activity-dot.warning {
  background: #EF4444;
  box-shadow: 0 0 0 2px #EF4444;
}

@keyframes pulse-dot {
  0%, 100% {
    box-shadow: 0 0 0 2px #F59E0B;
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.3);
  }
}

.activity-content {
  flex: 1;
}

.activity-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-title {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

.activity-time {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.activity-description {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

/* ========== GRAPHIQUE CIRCULAIRE ========== */
.success-rate-visual {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.success-rate-visual h4 {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 24px 0;
}

.circular-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
}

.chart-svg {
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
}

.progress-circle {
  transition: stroke-dashoffset 2s ease;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-percentage {
  font-size: 48px;
  font-weight: 700;
  color: #00478F;
  line-height: 1;
}

.chart-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 600;
  margin-top: 4px;
}

.performance-indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.indicator.excellent {
  color: #10B981;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
}

.indicator-range {
  height: 8px;
  background: linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%);
  border-radius: 4px;
  position: relative;
}

.range-marker {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  background: #FFFFFF;
  border: 3px solid #00478F;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: left 1s ease;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .main-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .period-selector {
    width: 100%;
    justify-content: space-between;
  }

  .main-stats-grid {
    grid-template-columns: 1fr;
  }

  .status-item {
    flex-wrap: wrap;
  }

  .status-percentage {
    width: 100%;
    text-align: right;
  }

  .currency-info {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .status-breakdown,
  .currency-distribution,
  .recent-activity,
  .success-rate-visual {
    padding: 20px;
  }

  .stat-value {
    font-size: 28px;
  }

  .circular-chart {
    width: 160px;
    height: 160px;
  }

  .chart-percentage {
    font-size: 36px;
  }
}
</style>

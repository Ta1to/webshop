<template>
    <div class="admin-offers-view">
        <AdminPageHeader
            title="Angebote verwalten"
            description="Verwalten Sie hier alle Angebote in Ihrem Shop."
        >
        <template #actions>
            <button @click="openCreateOfferModal" class="btn-add">
                <Plus :size="20"/>
                Neues Angebot
            </button>
        </template>
        </AdminPageHeader>

        <!-- Loading State -->
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Angebote werden geladen...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-message">
            <p>{{ error }}</p>
            <button @click="loadData" class="btn-retry">Erneut versuchen</button>
        </div>

        <!-- Offers Table -->
        <div v-else class="offers-container">
            <div v-if="offers.length === 0" class="empty-state">
                <Package :size="64" />
                <h3>Keine Angebote vorhanden</h3>
                <p>Erstellen Sie Ihr erstes Angebot, um loszulegen.</p>
                <button @click="openCreateOfferModal" class="btn-primary">
                    <Plus :size="20" />
                    Erstes Angebot erstellen
                </button>
            </div>

            <div v-else class="table-container">
                <table class="offers-table">
                    <thead>
                        <tr>
                            <th>Produkt</th>
                            <th>Rabatt</th>
                            <th>Alter Preis</th>
                            <th>Neuer Preis</th>
                            <th>Zeitraum</th>
                            <th>Status</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="offer in offers" :key="offer.id">
                            <td>
                                <div class="product-cell">
                                    <img 
                                        v-if="getProductById(offer.productId)?.imageUrl" 
                                        :src="getProductById(offer.productId)?.imageUrl" 
                                        :alt="getProductById(offer.productId)?.name"
                                        class="product-thumbnail"
                                    />
                                    <div>
                                        <div class="product-name">{{ getProductById(offer.productId)?.name }}</div>
                                        <div class="product-category">{{ getProductById(offer.productId)?.category }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="discount-badge">-{{ offer.discountPercentage }}%</span>
                            </td>
                            <td>
                                <span class="old-price">{{ formatPrice(getProductById(offer.productId)?.price) }}</span>
                            </td>
                            <td>
                                <span class="new-price">{{ formatPrice(calculateDiscountedPrice(offer)) }}</span>
                            </td>
                            <td>
                                <div class="date-range">
                                    <div v-if="offer.startDate" class="date-item">
                                        Von: {{ formatDate(offer.startDate) }}
                                    </div>
                                    <div v-else class="date-item">Sofort</div>
                                    <div v-if="offer.endDate" class="date-item">
                                        Bis: {{ formatDate(offer.endDate) }}
                                    </div>
                                    <div v-else class="date-item">Unbegrenzt</div>
                                </div>
                            </td>
                            <td>
                                <span :class="['status-badge', getOfferStatus(offer)]">
                                    {{ getOfferStatusText(offer) }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button @click="editOffer(offer)" class="btn-icon" title="Bearbeiten">
                                        <Edit :size="18" />
                                    </button>
                                    <button @click="deleteOfferConfirm(offer)" class="btn-icon btn-delete" title="Löschen">
                                        <Trash :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Offer Modal -->
        <OfferModal
            :is-open="isOfferModalOpen"
            :mode="offerModalMode"
            :offer="selectedOffer"
            :products="products"
            @close="closeOfferModal"
            @submit="handleOfferSubmit"
            @open-product-modal="openProductModalFromOffer"
        />

        <!-- Product Modal -->
        <ProductModal
            :is-open="isProductModalOpen"
            mode="create"
            @close="closeProductModal"
            @submit="handleProductSubmit"
        />

        <!-- Confirm Delete Dialog -->
        <AlertDialog
            ref="confirmDialog"
            title="Angebot löschen"
            message="Möchten Sie dieses Angebot wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
            confirm-text="Löschen"
            cancel-text="Abbrechen"
            type="danger"
        />

        <!-- Success Dialog -->
        <AlertDialog
            ref="successDialog"
            type="success"
        />

        <!-- Error Dialog -->
        <AlertDialog
            ref="errorDialog"
            type="error"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Trash, Package } from 'lucide-vue-next'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import OfferModal from '../../components/modal/OfferModal.vue'
import ProductModal from '../../components/modal/ProductModal.vue'
import AlertDialog from '../../components/dialog/AlertDialog.vue'
import { 
    getAllOffers, 
    createOffer, 
    updateOffer, 
    deleteOffer
} from '../../services/business/offers'
import { calculateDiscountPrice } from '../../utils'
import { getAllProducts, createProduct } from '../../services/firebase/db'

// State
const loading = ref(true)
const error = ref(null)
const offers = ref([])
const products = ref([])

// Modal state
const isOfferModalOpen = ref(false)
const offerModalMode = ref('create')
const selectedOffer = ref(null)

// Product Modal state
const isProductModalOpen = ref(false)

// Dialog refs
const confirmDialog = ref(null)
const successDialog = ref(null)
const errorDialog = ref(null)

// Load data
const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
        const [offersData, productsData] = await Promise.all([
            getAllOffers(),
            getAllProducts()
        ])
        
        offers.value = offersData
        products.value = productsData
    } catch (err) {
        console.error('Error loading data:', err)
        error.value = 'Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.'
    } finally {
        loading.value = false
    }
}

// Get product by ID
const getProductById = (productId) => {
    return products.value.find(p => p.id === productId)
}

// Format price
const formatPrice = (price) => {
    if (!price) return '€0,00'
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price)
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

// Calculate discounted price
const calculateDiscountedPrice = (offer) => {
    const product = getProductById(offer.productId)
    if (!product) return 0
    return calculateDiscountPrice(product.price, offer.discountPercentage)
}

// Get offer status
const getOfferStatus = (offer) => {
    const now = new Date()
    const startDate = offer.startDate ? new Date(offer.startDate) : null
    const endDate = offer.endDate ? new Date(offer.endDate) : null
    
    if (startDate && startDate > now) return 'scheduled'
    if (endDate && endDate < now) return 'expired'
    return 'active'
}

// Get offer status text
const getOfferStatusText = (offer) => {
    const status = getOfferStatus(offer)
    const statusTexts = {
        active: 'Aktiv',
        scheduled: 'Geplant',
        expired: 'Abgelaufen'
    }
    return statusTexts[status] || 'Unbekannt'
}

// Open create offer modal
const openCreateOfferModal = () => {
    selectedOffer.value = null
    offerModalMode.value = 'create'
    isOfferModalOpen.value = true
}

// Edit offer
const editOffer = (offer) => {
    selectedOffer.value = { ...offer }
    offerModalMode.value = 'edit'
    isOfferModalOpen.value = true
}

// Close offer modal
const closeOfferModal = () => {
    isOfferModalOpen.value = false
    selectedOffer.value = null
}

// Open product modal from offer modal
const openProductModalFromOffer = () => {
    isProductModalOpen.value = true
}

// Close product modal
const closeProductModal = () => {
    isProductModalOpen.value = false
}

// Handle product submit
const handleProductSubmit = async (productData) => {
    try {
        await createProduct(productData)
        await successDialog.value?.show(
            'Produkt erstellt',
            'Das Produkt wurde erfolgreich erstellt und kann jetzt für Angebote verwendet werden.'
        )
        
        closeProductModal()
        // Reload products to update the dropdown in OfferModal
        await loadData()
    } catch (err) {
        console.error('Error saving product:', err)
        await errorDialog.value?.show(
            'Fehler',
            'Beim Speichern des Produkts ist ein Fehler aufgetreten.'
        )
    }
}

// Handle offer submit
const handleOfferSubmit = async (offerData) => {
    try {
        if (offerModalMode.value === 'create') {
            await createOffer(offerData)
            await successDialog.value?.show(
                'Angebot erstellt',
                'Das Angebot wurde erfolgreich erstellt.'
            )
        } else {
            await updateOffer(selectedOffer.value.id, offerData)
            await successDialog.value?.show(
                'Angebot aktualisiert',
                'Das Angebot wurde erfolgreich aktualisiert.'
            )
        }
        
        closeOfferModal()
        await loadData()
    } catch (err) {
        console.error('Error saving offer:', err)
        await errorDialog.value?.show(
            'Fehler',
            'Beim Speichern des Angebots ist ein Fehler aufgetreten.'
        )
    }
}

// Delete offer confirm
const deleteOfferConfirm = async (offer) => {
    const confirmed = await confirmDialog.value?.show()
    
    if (confirmed) {
        try {
            await deleteOffer(offer.id)
            await successDialog.value?.show(
                'Angebot gelöscht',
                'Das Angebot wurde erfolgreich gelöscht.'
            )
            await loadData()
        } catch (err) {
            console.error('Error deleting offer:', err)
            await errorDialog.value?.show(
                'Fehler',
                'Beim Löschen des Angebots ist ein Fehler aufgetreten.'
            )
        }
    }
}

// Load data on mount
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.admin-offers-view {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.loading,
.error-message {
    text-align: center;
    padding: 3rem 1rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--gray-200);
    border-top-color: var(--primary-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-message p {
    color: var(--error);
    margin-bottom: 1rem;
}

.btn-retry {
    padding: 0.75rem 1.5rem;
    background: var(--primary-green);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-retry:hover {
    background: var(--primary-green-dark);
}

.btn-add {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-green);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-add:hover {
    background: var(--primary-green-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--gray-50);
    border-radius: 12px;
    border: 2px dashed var(--gray-300);
}

.empty-state svg {
    color: var(--gray-400);
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-700);
    font-size: 1.5rem;
}

.empty-state p {
    margin: 0 0 2rem 0;
    color: var(--gray-600);
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    background: var(--primary-green);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: var(--primary-green-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

/* Table */
.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.offers-table {
    width: 100%;
    border-collapse: collapse;
}

.offers-table thead {
    background: var(--gray-50);
    border-bottom: 2px solid var(--gray-200);
}

.offers-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--gray-700);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.offers-table tbody tr {
    border-bottom: 1px solid var(--gray-200);
    transition: background 0.2s;
}

.offers-table tbody tr:hover {
    background: var(--gray-50);
}

.offers-table td {
    padding: 1rem;
    vertical-align: middle;
}

/* Product Cell */
.product-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.product-name {
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 0.25rem;
}

.product-category {
    font-size: 0.875rem;
    color: var(--gray-600);
}

/* Badges */
.discount-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background: var(--error);
    color: white;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.875rem;
}

.old-price {
    color: var(--gray-500);
    text-decoration: line-through;
    font-size: 0.875rem;
}

.new-price {
    color: var(--primary-green);
    font-weight: 700;
    font-size: 1rem;
}

/* Date Range */
.date-range {
    font-size: 0.875rem;
}

.date-item {
    color: var(--gray-600);
    margin-bottom: 0.25rem;
}

.date-item:last-child {
    margin-bottom: 0;
}

/* Status Badge */
.status-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
}

.status-badge.active {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary-green);
}

.status-badge.scheduled {
    background: rgba(59, 130, 246, 0.1);
    color: #3B82F6;
}

.status-badge.expired {
    background: rgba(107, 114, 128, 0.1);
    color: var(--gray-600);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    padding: 0.5rem;
    background: var(--gray-100);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-700);
    transition: all 0.2s;
}

.btn-icon:hover {
    background: var(--gray-200);
    color: var(--gray-900);
}

.btn-icon.btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
}

@media (max-width: 1024px) {
    .admin-offers-view {
        padding: 1rem;
    }
    
    .offers-table {
        font-size: 0.875rem;
    }
    
    .offers-table th,
    .offers-table td {
        padding: 0.75rem 0.5rem;
    }
}

@media (max-width: 768px) {
    .table-container {
        overflow-x: auto;
    }
    
    .offers-table {
        min-width: 800px;
    }
}
</style>

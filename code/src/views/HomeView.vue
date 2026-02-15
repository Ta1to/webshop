<template>
    <div class="home-view">
        <div class="home-container">
            <!-- Loading State -->
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <p>Produkte werden geladen...</p>
            </div>

            <!-- Main Content with Sidebar -->
            <div v-else class="content-wrapper">
                <!-- Sidebar Filter -->
                <aside class="sidebar">
                    <ProductFilter 
                        :categories="categories"
                        @filter-change="handleFilterChange"
                    />
                </aside>

                <!-- Products -->
                <main class="main-content">
                    <!-- Offers Section -->
                    <section v-if="productsWithOffers.length > 0" class="products-section offers-section">
                        <h2 class="section-title">Aktuelle Angebote</h2>
                        <div class="products-grid">
                            <ProductCard
                                v-for="product in productsWithOffers"
                                :key="product.id"
                                :product="product"
                            />
                        </div>
                    </section>

                    <!-- Featured Products -->
                    <section v-if="filteredFeaturedProducts.length > 0" class="products-section">
                        <h2 class="section-title">Beliebte Produkte</h2>
                        <div class="products-grid">
                            <ProductCard
                                v-for="product in filteredFeaturedProducts"
                                :key="product.id"
                                :product="product"
                            />
                        </div>
                    </section>

                    <!-- Recent Products -->
                    <section v-if="filteredRecentProducts.length > 0" class="products-section">
                        <h2 class="section-title">Neu im Sortiment</h2>
                        <div class="products-grid">
                            <ProductCard
                                v-for="product in filteredRecentProducts"
                                :key="product.id"
                                :product="product"
                            />
                        </div>
                    </section>

                    <!-- Empty State -->
                    <div v-if="filteredFeaturedProducts.length === 0 && filteredRecentProducts.length === 0 && productsWithOffers.length === 0" class="empty-state">
                        <p>Keine Produkte entsprechen den Filterkriterien</p>
                        <button @click="clearFilters" class="btn-clear">Filter zurücksetzen</button>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { getAllProducts } from '../services/firebase/db'
import { ProductCard, ProductFilter } from '../components'

export default {
    name: 'HomeView',
    components: {
        ProductCard,
        ProductFilter
    },
    setup() {
        const products = ref([])
        const loading = ref(false)
        const filters = ref({
            categories: [],
            priceRange: { min: null, max: null },
            inStockOnly: false,
            showNewOnly: false,
            sortBy: ''
        })

        const categories = computed(() => {
            const uniqueCategories = [...new Set(products.value.map(p => p.category))]
            return uniqueCategories.filter(c => c)
        })

        const applyFilters = (productList) => {
            let filtered = [...productList]

            // Category filter
            if (filters.value.categories.length > 0) {
                filtered = filtered.filter(p => filters.value.categories.includes(p.category))
            }

            // Price filter
            if (filters.value.priceRange.min !== null) {
                filtered = filtered.filter(p => p.price >= filters.value.priceRange.min)
            }
            if (filters.value.priceRange.max !== null) {
                filtered = filtered.filter(p => p.price <= filters.value.priceRange.max)
            }

            // Stock filter
            if (filters.value.inStockOnly) {
                filtered = filtered.filter(p => p.stock > 0)
            }

            // New products filter
            if (filters.value.showNewOnly) {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                filtered = filtered.filter(p => {
                    if (!p.createdAt) return false
                    const createdDate = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt)
                    return createdDate >= sevenDaysAgo
                })
            }

            // Sort
            if (filters.value.sortBy) {
                switch (filters.value.sortBy) {
                    case 'price-asc':
                        filtered.sort((a, b) => a.price - b.price)
                        break
                    case 'price-desc':
                        filtered.sort((a, b) => b.price - a.price)
                        break
                    case 'name-asc':
                        filtered.sort((a, b) => a.name.localeCompare(b.name))
                        break
                    case 'name-desc':
                        filtered.sort((a, b) => b.name.localeCompare(a.name))
                        break
                    case 'stock-desc':
                        filtered.sort((a, b) => b.stock - a.stock)
                        break
                }
            }

            return filtered
        }

        const filteredFeaturedProducts = computed(() => {
            const featured = products.value.filter(p => p.featured && !p.offer)
            return applyFilters(featured).slice(0, 6)
        })

        const filteredRecentProducts = computed(() => {
            const recent = products.value.filter(p => !p.featured && !p.offer)
            return applyFilters(recent).slice(0, 6)
        })
        
        const productsWithOffers = computed(() => {
            const withOffers = products.value.filter(p => p.offer)
            return applyFilters(withOffers).slice(0, 6)
        })

        const handleFilterChange = (newFilters) => {
            filters.value = newFilters
        }

        const clearFilters = () => {
            filters.value = {
                categories: [],
                priceRange: { min: null, max: null },
                inStockOnly: false,
                showNewOnly: false,
                sortBy: ''
            }
        }

        const loadProducts = async () => {
            loading.value = true
            const result = await getAllProducts()
            if (result.success) {
                // Import offers service and apply offers to products
                const { getProductsWithOffers } = await import('../services/offers')
                products.value = await getProductsWithOffers(result.data)
            }
            loading.value = false
        }

        onMounted(() => {
            loadProducts()
        })

        return {
            loading,
            categories,
            filteredFeaturedProducts,
            filteredRecentProducts,
            productsWithOffers,
            handleFilterChange,
            clearFilters
        }
    }
}
</script>

<style scoped>
.home-view {
    min-height: calc(100vh - 180px);
    padding: 2rem 0;
}

.home-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 1rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
}

.page-subtitle {
    text-align: center;
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 3rem;
}

.content-wrapper {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    align-items: start;
}

.sidebar {
    position: sticky;
    top: 1rem;
}

.main-content {
    min-width: 0;
}

.loading,
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #10b981;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.products-section {
    margin-bottom: 4rem;
}

.section-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #10b981;
}

.offers-section .section-title {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    border-bottom-color: #ef4444;
    font-size: 2rem;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.btn-clear {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-clear:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@media (max-width: 968px) {
    .content-wrapper {
        grid-template-columns: 1fr;
    }

    .sidebar {
        position: static;
    }

    .page-title {
        font-size: 2rem;
    }

    .products-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .section-title {
        font-size: 1.5rem;
    }
}
</style>

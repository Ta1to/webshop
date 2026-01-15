<template>
    <div class="wishlist">
        <h1 class="wishlist-title">Meine Wunschliste</h1>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Lade Wunschliste...</p>
        </div>

        <div v-else-if="wishlistItems.length === 0" class="empty-state">
            <div class="empty-icon">
                <HeartOffIcon :size="64" />
            </div>
            <h2>Deine Wunschliste ist leer</h2>
            <p>Füge Produkte zu deiner Wunschliste hinzu, um sie später anzusehen.</p>
            <router-link to="/categories" class="btn-primary">
                <ShoppingBagIcon :size="20" />
                Produkte entdecken
            </router-link>
        </div>

        <div v-else class="wishlist-content">
            <div class="wishlist-stats">
                <div class="stat-card">
                    <PackageIcon :size="24" />
                    <div>
                        <div class="stat-value">{{ wishlistItems.length }}</div>
                        <div class="stat-label">Produkte</div>
                    </div>
                </div>
                <div class="stat-card">
                    <TagIcon :size="24" />
                    <div>
                        <div class="stat-value">{{ totalValue.toFixed(2) }} €</div>
                        <div class="stat-label">Gesamtwert</div>
                    </div>
                </div>
            </div>

            <div class="wishlist-grid">
                <div v-for="item in wishlistItems" :key="item.productId" class="wishlist-card">
                    <button @click="handleRemoveFromWishlist(item.productId)" class="btn-remove-icon" title="Entfernen">
                        <XIcon :size="20" />
                    </button>
                    
                    <router-link :to="`/product/${item.productId}`" class="product-link">
                        <div class="product-image">
                            <img :src="item.imageUrl" :alt="item.name" />
                            <span v-if="isNew(item)" class="new-badge">Neu</span>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">{{ item.name }}</h3>
                            <p class="product-description">{{ truncateText(item.description, 80) }}</p>
                        </div>
                    </router-link>
                    
                    <div class="product-footer">
                        <div class="price-stock">
                            <div class="product-price">{{ formatPrice(item.price) }}</div>
                            <StockIndicator :stock="item.stock" />
                        </div>
                        <button 
                            @click="handleAddToCart(item.productId)" 
                            class="btn-add-cart"
                            :disabled="item.stock <= 0"
                        >
                            <ShoppingCartIcon :size="20" />
                            In den Warenkorb
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { 
    HeartIcon, 
    HeartOffIcon, 
    ShoppingBagIcon, 
    PackageIcon, 
    TagIcon, 
    XIcon, 
    ImageIcon, 
    EyeIcon, 
    ShoppingCartIcon 
} from 'lucide-vue-next'
import StockIndicator from '../../components/utility/StockIndicator.vue'
import { observeAuthState } from '../../services/auth'
import { useWishlistItems, updateWishlistItems } from '../../stores/wishlistStore'
import { removeFromWishlist as removeWishlistItem } from '../../services/wishlist'
import { addToCart } from '../../services/cart'
import { updateCartItems } from '../../stores/cartStore'

export default {
    name: 'WishlistView',
    components: {
        HeartIcon,
        HeartOffIcon,
        ShoppingBagIcon,
        PackageIcon,
        TagIcon,
        XIcon,
        ImageIcon,
        EyeIcon,
        ShoppingCartIcon,
        StockIndicator
    },
    setup() {
        const wishlistItems = useWishlistItems()
        const loading = ref(true)
        const user = ref(null)

        const totalValue = computed(() => {
            return wishlistItems.value.reduce((sum, item) => sum + item.price, 0)
        })

        const loadWishlist = async () => {
            loading.value = true
            try {
                await updateWishlistItems()
            } catch (error) {
                console.error('Error loading wishlist:', error)
            } finally {
                loading.value = false
            }
        }

        const handleRemoveFromWishlist = async (productId) => {
            try {
                const result = await removeWishlistItem(productId)
                if (result.success) {
                    await updateWishlistItems()
                } else {
                    console.error('Error removing from wishlist:', result.error)
                }
            } catch (error) {
                console.error('Error removing from wishlist:', error)
            }
        }

        const handleAddToCart = async (productId) => {
            try {
                const result = await addToCart(productId, 1)
                if (result.success) {
                    await updateCartItems()
                    // TODO Maybe remove the item from wishlist after adding to cart
                    // await 4(productId)
                } else {
                    console.error('Error adding to cart:', result.error)
                }
            } catch (error) {
                console.error('Error adding to cart:', error)
            }
        }

        const formatPrice = (price) => {
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
            }).format(price)
        }

        const truncateText = (text, maxLength) => {
            if (!text) return ''
            if (text.length <= maxLength) return text
            return text.substring(0, maxLength) + '...'
        }

        const isNew = (item) => {
            if (!item.createdAt) return false
            
            const now = new Date()
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            
            const createdDate = item.createdAt.toDate 
                ? item.createdAt.toDate() 
                : new Date(item.createdAt)
            
            return createdDate >= sevenDaysAgo
        }

        onMounted(() => {
            observeAuthState(async (authUser) => {
                user.value = authUser
                await loadWishlist()
            })
        })

        return {
            wishlistItems,
            loading,
            totalValue,
            handleRemoveFromWishlist,
            handleAddToCart,
            formatPrice,
            truncateText,
            isNew
        }
    }
}
</script>

<style scoped>
.wishlist {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.wishlist-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 2rem;
}

.header {
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    padding: 2.5rem;
    border-radius: 16px;
    color: var(--white);
    margin-bottom: 2rem;
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.header-content {
    max-width: 800px;
}

.header-icon {
    color: var(--white);
}

.header h1 {
    color: var(--white);
    font-size: 2rem;
    margin: 0;
}

.subtitle {
    opacity: 0.9;
    font-size: 1rem;
    margin: 0;
}

.loading {
    text-align: center;
    padding: 4rem 2rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--gray-200);
    border-top-color: var(--primary-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--white);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.empty-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
}

.empty-state h2 {
    color: var(--gray-900);
    margin-bottom: 1rem;
    font-size: 1.75rem;
}

.empty-state p {
    color: var(--gray-600);
    margin-bottom: 2rem;
    font-size: 1.125rem;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.wishlist-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.wishlist-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: var(--white);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card > svg {
    width: 48px;
    height: 48px;
    padding: 0.75rem;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
    border-radius: 10px;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--gray-600);
}

.wishlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.wishlist-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
}

.btn-remove-icon {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 15;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    padding: 0;
}

.btn-remove-icon:hover {
    background: #ef4444;
    color: white;
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.btn-remove-icon svg {
    stroke-width: 2.5px;
}

.wishlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-link {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.product-image {
    width: 100%;
    height: 240px;
    overflow: hidden;
    background-color: #f3f4f6;
    position: relative;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.wishlist-card:hover .product-image img {
    transform: scale(1.05);
}

.new-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 0.375rem 0.875rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    z-index: 10;
    letter-spacing: 0.5px;
}

.product-info {
    padding: 1.25rem;
    padding-bottom: 0.75rem;
    display: flex;
    flex-direction: column;
}

.product-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

.product-description {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0;
}

.product-footer {
    padding: 0 1.25rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.price-stock {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
}

.product-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #10b981;
}

.btn-add-cart {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
}

.btn-add-cart:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-add-cart:active:not(:disabled) {
    transform: scale(0.98);
}

.btn-add-cart:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .header {
        padding: 2rem 1.5rem;
    }

    .header h1 {
        font-size: 1.5rem;
    }

    .wishlist-grid {
        grid-template-columns: 1fr;
    }

    .product-actions {
        flex-direction: column;
    }

    .btn-view, .btn-add-cart {
        width: 100%;
    }
}
</style>
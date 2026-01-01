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
                    <button @click="handleRemoveFromWishlist(item.productId)" class="remove-btn" title="Entfernen">
                        <XIcon :size="24" />
                    </button>
                    
                    <div class="product-image">
                        <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                        <div v-else class="image-placeholder">
                            <ImageIcon :size="48" />
                        </div>
                    </div>

                    <div class="product-info">
                        <h3>{{ item.name }}</h3>
                        <div class="product-price">{{ item.price.toFixed(2) }} €</div>
                        
                        <div v-if="item.stock > 0" class="stock-status in-stock">
                            Auf Lager
                        </div>
                        <div v-else class="stock-status out-of-stock">
                            Nicht verfügbar
                        </div>
                        
                        <div class="product-actions">
                            <router-link :to="`/product/${item.productId}`" class="btn-view">
                                <EyeIcon :size="18" />
                                Ansehen
                            </router-link>
                            <button 
                                @click="handleAddToCart(item.productId)" 
                                class="btn-add-cart"
                                :disabled="item.stock <= 0"
                            >
                                <ShoppingCartIcon :size="18" />
                                In den Warenkorb
                            </button>
                        </div>
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
        ShoppingCartIcon
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
            handleAddToCart
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
    background: var(--white);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    position: relative;
}

.wishlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.remove-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
}


.product-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: var(--gray-100);
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
}

.product-info {
    padding: 1.25rem;
}

.product-info h3 {
    color: var(--gray-900);
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
}

.product-category {
    color: var(--gray-600);
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
}

.product-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-green);
    margin-bottom: 0.75rem;
}

.stock-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.stock-status.in-stock {
    background: var(--green-100);
    color: var(--green-700);
}

.stock-status.out-of-stock {
    background: var(--red-100);
    color: var(--red-700);
}

.product-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-view, .btn-add-cart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn-view {
    background: var(--gray-100);
    color: var(--gray-700);
}

.btn-view:hover {
    background: var(--gray-200);
}

.btn-add-cart {
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
}

.btn-add-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-add-cart:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.btn-add-cart:disabled:hover {
    transform: none;
    box-shadow: none;
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
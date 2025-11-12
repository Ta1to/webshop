import { getCurrentUser } from "./auth";
import { getDocument, getUserDocument, updateUserDocument } from "./db";
import Cookies from 'js-cookie'

const WISHLIST_COOKIE_NAME = 'webshop_wishlist';
const WISHLIST_COOKIE_DAYS = 30;


let updateStoreCallback = null;

/**
 * Register callback to update wishlist store
 */
export const registerWishlistUpdateCallback = (callback) => {
  updateStoreCallback = callback;
};

/**
 * Wishlist Service
 * Manages wishlist storage in cookies (guest) or Firestore (logged in users)
 * Wishlist items are stored as an array of product IDs
 */

// ==================== WISHLIST OPERATIONS ====================

/**
 * Get raw wishlist items (just IDs)
 * Returns wishlist from Firestore if user is logged in, otherwise from cookies
 */
const getRawWishlist = async () => {
  const user = getCurrentUser();

  if(user) {
    const result = await getUserDocument(user.uid);
    if(result.success && result.data.wishlist) {
        return result.data.wishlist;
        }
    return [];
    } else {
    const wishlistData = Cookies.get(WISHLIST_COOKIE_NAME)
    return wishlistData ? JSON.parse(wishlistData) : []
    }
};

/**
 * Get wishlist items with full product details
 * Fetches product data from Firestore based on IDs in wishlist
 */
export const getWishlistItems = async () => {
  const rawWishlist = await getRawWishlist();
  const wishlistWithDetails = [];

  for(const item of rawWishlist) {
    try {
        const productResult = await getDocument('products', item.productId);

        if(productResult.success && productResult.data) {
            wishlistWithDetails.push({
                productId: item.productId,
                addedAt: item.addedAt,
                // Product details
                name: productResult.data.name,
                price: productResult.data.price,
                imageUrl: productResult.data.imageUrl || productResult.data.image,
                stock: productResult.data.stock
            });
        }
    }
    catch(error) {
        console.warn(`Product ${item.productId} not found, skipping...`);
    }
  }
  return wishlistWithDetails;
};

/**
 * Save wishlist items
 */
const saveWishlist = async (wishlist) => {
  const user = getCurrentUser()
  
  if (user) {
    // Save to Firestore
    await updateUserDocument(user.uid, { wishlist })
  } else {
    // Save to cookies
    Cookies.set(WISHLIST_COOKIE_NAME, JSON.stringify(wishlist), { expires: WISHLIST_COOKIE_DAYS })
  }

  // Notify store of wishlist update
  if (updateStoreCallback) {
    await updateStoreCallback()
  }
}

/**
 * Add item to wishlist
 * @param {string} productId - Product ID
 */
export const addToWishlist = async (productId) => {
  try {
    const rawWishlist = await getRawWishlist();
    
    // Check if product already exists in wishlist
    const existingItem = rawWishlist.find(item => item.productId === productId);
    
    if (existingItem) {
      return { success: false, error: 'Item already in wishlist' };
    }
    
    // Add new item
    rawWishlist.push({
      productId,
      addedAt: new Date().toISOString()
    });
    
    await saveWishlist(rawWishlist);
    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from wishlist
 * @param {string} productId - Product ID
 */
export const removeFromWishlist = async (productId) => {
  try {
    const rawWishlist = await getRawWishlist();
    const filteredWishlist = rawWishlist.filter(item => item.productId !== productId);
    
    await saveWishlist(filteredWishlist);
    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if item is in wishlist
 * @param {string} productId - Product ID
 */
export const isInWishlist = async (productId) => {
  const rawWishlist = await getRawWishlist();
  return rawWishlist.some(item => item.productId === productId);
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async () => {
  try {
    await saveWishlist([]);
    return { success: true };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get wishlist item count
 */
export const getWishlistItemCount = async () => {
  const wishlist = await getRawWishlist();
  return wishlist.length;
};

/**
 * Merge guest wishlist into user wishlist after login
 * Should be called after successful login
 */
export const mergeGuestWishlist = async () => {
  const user = getCurrentUser();
  if (!user) return;
  
  const guestWishlistData = Cookies.get(WISHLIST_COOKIE_NAME)
  const guestWishlist = guestWishlistData ? JSON.parse(guestWishlistData) : []
  if (guestWishlist.length === 0) return;
  
  const userResult = await getUserDocument(user.uid);
  const userWishlist = (userResult.success && userResult.data.wishlist) ? userResult.data.wishlist : [];
  
  // Merge wishlists (avoid duplicates)
  guestWishlist.forEach(guestItem => {
    const existingItem = userWishlist.find(item => item.productId === guestItem.productId);
    
    if (!existingItem) {
      // Add new item
      userWishlist.push(guestItem);
    }
  });
  
  // Save merged wishlist to Firestore
  await updateUserDocument(user.uid, { wishlist: userWishlist });
  
  // Clear guest wishlist cookie
  Cookies.remove(WISHLIST_COOKIE_NAME);
  
  // Notify store of wishlist update
  if (updateStoreCallback) {
    await updateStoreCallback();
  }
};

/**
 * Offer Model
 */
export class Offer {
    constructor(data = {}) {
        this.id = data.id || null
        this.productId = data.productId || null
        this.discountPercentage = data.discountPercentage || 0
        this.startDate = data.startDate || null
        this.endDate = data.endDate || null
        this.createdAt = data.createdAt || null
        this.updatedAt = data.updatedAt || null
    }

    /**
     * Create Offer from Firestore document
     */
    static fromFirestore(doc) {
        const data = doc.data()
        
        // Convert Firestore Timestamps to ISO strings for easier handling
        const convertTimestamp = (timestamp) => {
            if (!timestamp) return null
            if (timestamp.toDate) return timestamp.toDate().toISOString()
            return timestamp
        }
        
        return new Offer({
            id: doc.id,
            productId: data.productId,
            discountPercentage: data.discountPercentage,
            startDate: convertTimestamp(data.startDate),
            endDate: convertTimestamp(data.endDate),
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt)
        })
    }

    /**
     * Convert to Firestore document data
     */
    toFirestore() {
        return {
            productId: this.productId,
            discountPercentage: this.discountPercentage,
            startDate: this.startDate,
            endDate: this.endDate,
            updatedAt: this.updatedAt
        }
    }

    /**
     * Check if the offer is currently active
     */
    isActive() {
        const now = new Date()
        const startDate = this.startDate ? new Date(this.startDate) : null
        const endDate = this.endDate ? new Date(this.endDate) : null
        
        const isStarted = !startDate || startDate <= now
        const isNotEnded = !endDate || endDate >= now
        
        return isStarted && isNotEnded
    }
}
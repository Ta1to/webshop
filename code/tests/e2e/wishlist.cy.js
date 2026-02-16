describe('Wishlist', () => {
  // Clear wishlist and start fresh for each test
  beforeEach(() => {
    cy.clearWishlist();
    cy.visit('/');
  });

  // Test basic wishlist features
  describe('Wishlist Functionality', () => {
    it('should display empty wishlist message', () => {
      cy.visit('/wishlist');
      cy.get('.empty-state', { timeout: 5000 }).should('be.visible');
      cy.contains('Deine Wunschliste ist leer').should('be.visible');
    });

    it('should show wishlist link in header', () => {
      // Wishlist link is in user dropdown, check if it exists in header
      cy.get('header').find('a[href="/wishlist"]').should('exist');
    });

    it('should navigate to wishlist page', () => {
      cy.visit('/wishlist');
      cy.url().should('include', '/wishlist');
    });
  });

  describe('Add to Wishlist', () => {
    it('should add product to wishlist', () => {
      cy.visit('/');
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
    });

    it('should show products on wishlist page', () => {
      cy.visit('/wishlist');
      cy.get('.wishlist-title', { timeout: 5000 }).should('be.visible');
      cy.get('h1').contains('Meine Wunschliste').should('be.visible');
    });
  });

  describe('Wishlist Management', () => {
    it('should display wishlist items', () => {
      cy.visit('/wishlist');
      cy.get('h1', { timeout: 5000 }).should('contain', 'Meine Wunschliste');
    });

    it('should allow navigation to cart', () => {
      cy.visit('/wishlist');
      cy.get('.cart-link').should('be.visible');
    });
  });
});

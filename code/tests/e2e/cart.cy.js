describe('Shopping Cart', () => {
  // Clear cart before each test to ensure clean state
  beforeEach(() => {
    cy.clearCart();
    cy.visit('/');
  });

  // Basic cart functionality tests
  describe('Cart Functionality', () => {
    it('should display empty cart message', () => {
      cy.visit('/cart');
      cy.contains('Warenkorb ist leer', { matchCase: false }).should('be.visible');
    });

    it('should show cart icon in header', () => {
      cy.get('.cart-link').should('be.visible');
    });

    it('should navigate to cart page', () => {
      cy.visit('/');
      cy.get('.cart-link').click();
      cy.url().should('include', '/cart');
    });
  });

  describe('Add to Cart', () => {
    it('should add product to cart from shop', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.contains('Zum Warenkorb hinzugefügt', { timeout: 5000 }).should('be.visible');
    });

    it('should update cart count after adding item', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.wait(500);
      cy.get('.cart-badge').should('contain', '1');
    });
  });

  // Test cart item management (update, remove)
  describe('Cart Management', () => {
    it('should update quantity in cart', () => {
      cy.visit('/');
      cy.acceptCookies();
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/cart');
      cy.get('.quantity-btn[aria-label="Menge erhöhen"]').first().click();
      cy.get('.quantity-display').first().should('contain', '2');
    });

    it('should remove item from cart', () => {
      cy.visit('/');
      cy.acceptCookies();
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/cart');
      cy.get('button[title="Entfernen"]', { timeout: 5000 }).click();
      // Confirm deletion in dialog
      cy.get('.alert-btn-confirm').click();
      cy.get('.empty-cart', { timeout: 5000 }).should('be.visible');
      cy.contains('Ihr Warenkorb ist leer').should('be.visible');
    });

    it('should display correct total price', () => {
      cy.visit('/');
      cy.wait(500);
      cy.acceptCookies();
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/cart');
      cy.wait(500);
      cy.get('.cart-summary').scrollIntoView();
      cy.get('.total-amount').should('be.visible');
    });
  });
});

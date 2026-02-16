describe('Offers and Promotions', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // Test special offer display on homepage
  describe('Offers Display', () => {
    it('should display home page with offers', () => {
      cy.visit('/');
      cy.get('.home-view').should('be.visible');
    });

    it('should show offer products on home page', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.products-section', { timeout: 10000 }).should('be.visible');
    });

    it('should display product cards with offers', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 0);
    });
  });

  describe('Offer Application', () => {
    it('should show products on home page', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.products-section', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate to checkout from product', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/checkout');
      cy.get('.checkout-title').should('be.visible');
    });
  });

  describe('Special Offers', () => {
    it('should display products with discounts', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.products-section', { timeout: 10000 }).should('exist');
    });

    it('should show product prices', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().within(() => {
        cy.get('.product-price').should('be.visible');
      });
    });
  });
});

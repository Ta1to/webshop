describe('Checkout and Orders', () => {
  // Ensure clean cart state before each test
  beforeEach(() => {
    cy.clearCart();
  });

  // Test the multi-step checkout flow
  describe('Checkout Process', () => {
    it('should navigate to checkout from cart', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/cart');
      cy.contains('Zur Kasse').click();
      cy.url().should('include', '/checkout');
    });

    it('should not allow checkout with empty cart', () => {
      cy.visit('/cart');
      cy.contains('Zur Kasse').should('not.exist');
    });

    it('should display checkout form', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/checkout');
      cy.get('input#firstName').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#street').should('be.visible');
    });
  });

  describe('Order Summary', () => {
    it('should display order summary in checkout', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/checkout');
      cy.get('.checkout-sidebar').should('be.visible');
      cy.get('.summary-total').scrollIntoView().should('be.visible');
    });
  });

  // Test payment method selection
  describe('Payment Information', () => {
    it('should display payment methods', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/checkout');
      // Fill out address form to progress to shipping step
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="phone"]').type('1234567890');
      cy.get('input[name="street"]').type('Test Street 123');
      cy.get('input[name="city"]').type('Test City');
      cy.get('input[name="zip"]').type('12345');
      cy.contains('Weiter zur Versandart').click();
      // Now click to payment step
      cy.contains('Weiter zur Zahlung').click();
      cy.get('.payment-options').should('be.visible');
    });
  });

  describe('Order Confirmation', () => {
    it('should show validation errors for incomplete form', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
      cy.contains('In den Warenkorb').click();
      cy.visit('/checkout');
      cy.get('button[type="submit"]').click();
      cy.get('input:invalid').should('exist');
    });
  });
});

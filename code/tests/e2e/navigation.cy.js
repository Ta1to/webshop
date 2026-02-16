describe('Navigation and UI', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // Test main header navigation elements
  describe('Header Navigation', () => {
    it('should display header with logo', () => {
      cy.get('header').should('be.visible');
      cy.get('.brand-link').should('be.visible');
    });

    it('should navigate to home from logo', () => {
      cy.visit('/categories');
      cy.get('.brand-link').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should display main navigation links', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Alle Kategorien').should('be.visible');
    });
  });

  describe('Footer', () => {
    it('should display footer', () => {
      cy.get('footer').should('be.visible');
    });

    it('should contain legal links', () => {
      cy.get('footer').within(() => {
        cy.contains('Datenschutz').should('be.visible');
        cy.contains('AGB').should('be.visible');
        cy.contains('Impressum').should('be.visible');
      });
    });

    it('should navigate to legal pages', () => {
      cy.get('footer').contains('Datenschutz').click();
      cy.url().should('include', '/privacy');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      cy.get('header').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      cy.get('header').should('be.visible');
    });
  });

  describe('Cookie Banner', () => {
    it('should display cookie banner on first visit', () => {
      cy.clearCookies();
      cy.visit('/');
      cy.get('.cookie-banner').should('be.visible');
    });

    it('should accept cookies', () => {
      cy.clearCookies();
      cy.visit('/');
      cy.get('.cookie-banner').within(() => {
        cy.contains('Akzeptieren').click();
      });
      cy.get('.cookie-banner').should('not.exist');
    });
  });

  describe('404 Page', () => {
    it('should display 404 page for invalid route', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
    });

    it('should navigate back to home from 404', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.contains('Home').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});

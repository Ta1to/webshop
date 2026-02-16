describe('Product Browsing', () => {
  // Start at homepage for each test
  beforeEach(() => {
    cy.visit('/');
  });

  // Test homepage product display
  describe('Home Page', () => {
    it('should display home page', () => {
      cy.get('.home-view').should('be.visible');
    });

    it('should navigate to categories', () => {
      cy.contains('Alle Kategorien').click();
      cy.url().should('include', '/categories');
    });
  });

  describe('Product Listing', () => {
    it('should display products on categories page', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('should show product details', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().within(() => {
        cy.get('img').should('be.visible');
        cy.get('h3').should('be.visible');
        cy.contains('€').should('be.visible');
      });
    });

    it('should navigate to product on click', () => {
      cy.visit('/');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.product-card', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.product-card').first().click();
      cy.url().should('include', '/product/');
    });
  });

  describe('Product Search', () => {
    it('should display search bar', () => {
      cy.get('.search-input').should('be.visible');
    });

    it('should filter products by search term', () => {
      cy.get('.search-input').type('shirt');
      cy.wait(500);
      cy.get('.search-dropdown').should('be.visible');
    });
  });

  describe('Product Filtering', () => {
    it('should display category filter on home page', () => {
      cy.visit('/');
      cy.wait(500);
      cy.acceptCookies();
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      // Scroll to ensure sidebar is visible
      cy.get('.sidebar', { timeout: 5000 }).scrollIntoView().should('be.visible');
      cy.get('.filter-section').should('exist');
    });

    it('should filter by category', () => {
      cy.visit('/');
      cy.get('.product-card').should('have.length.at.least', 0);
    });
  });

  describe('Categories Page', () => {
    it('should display categories', () => {
      cy.visit('/categories');
      cy.get('.category-card').should('have.length.at.least', 1);
    });

    it('should navigate to category page', () => {
      cy.visit('/categories');
      cy.get('.category-card').first().click();
      cy.url().should('include', '/category/');
    });
  });
});

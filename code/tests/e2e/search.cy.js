describe('Search Functionality', () => {
  // Navigate to homepage before each test
  beforeEach(() => {
    cy.visit('/');
  });

  // Test search bar interaction
  describe('Search Bar', () => {
    it('should display search bar in header', () => {
      cy.get('.search-input').should('be.visible');
    });

    it('should allow typing in search field', () => {
      cy.get('.search-input').type('shirt');
      cy.get('.search-input').should('have.value', 'shirt');
    });

    it('should show search results dropdown', () => {
      cy.get('.search-input').type('t-shirt');
      cy.wait(500);
      cy.get('.search-dropdown').should('be.visible');
    });
  });

  describe('Search Results', () => {
    it('should display matching products', () => {
      cy.get('.search-input').type('shirt');
      cy.wait(500);
      cy.get('.search-dropdown').should('be.visible');
    });

    it('should navigate to product from search', () => {
      cy.get('.search-input').type('shirt');
      cy.wait(500);
      cy.get('.search-dropdown', { timeout: 5000 }).should('be.visible');
      cy.get('.product-item', { timeout: 5000 }).should('have.length.at.least', 1);
      cy.get('.product-item').first().click();
      cy.url({ timeout: 10000 }).should('include', '/product/');
    });

    it('should handle no results', () => {
      cy.get('.search-input').type('xyznonexistent123');
      cy.wait(500);
      cy.get('.search-dropdown').should('not.exist');
    });
  });

  describe('Search on Categories Page', () => {
    it('should filter products on categories page', () => {
      cy.visit('/categories?search=shirt');
      cy.get('.spinner', { timeout: 10000 }).should('not.exist');
      cy.get('.search-results-grid', { timeout: 5000 }).should('be.visible');
    });

    it('should clear search filter', () => {
      cy.visit('/categories');
      cy.get('.search-input').type('shirt');
      cy.wait(500);
      cy.get('.clear-search').click();
      cy.get('.search-input').should('have.value', '');
    });
  });
});

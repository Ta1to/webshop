describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // Test registration form and validation
  describe('User Registration', () => {
    it('should display registration page', () => {
      cy.visit('/register');
      cy.contains('Erstelle dein Konto').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/register');
      cy.get('button[type="submit"]').click();
      cy.contains('E-Mail').should('be.visible');
    });

    it('should navigate to login page from register', () => {
      cy.visit('/register');
      cy.contains('Jetzt anmelden').click();
      cy.url().should('include', '/login');
    });
  });

  describe('User Login', () => {
    it('should display login page', () => {
      cy.visit('/login');
      cy.contains('Willkommen zurück').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();
      cy.contains('E-Mail').should('be.visible');
    });

    it('should navigate to register page from login', () => {
      cy.visit('/login');
      cy.contains('Jetzt registrieren').click();
      cy.url().should('include', '/register');
    });
  });

  describe('User Profile', () => {
    it('should not access profile when logged out', () => {
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });
  });
});

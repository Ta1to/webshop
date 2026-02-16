// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('.user-menu').click();
  cy.contains('Abmelden').click();
});

// Add item to cart
Cypress.Commands.add('addToCart', (productName) => {
  cy.contains(productName).parents('.product-card').find('button').contains('In den Warenkorb').click();
});

// Clear cart from localStorage
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('cart');
  });
});

// Clear wishlist from localStorage
Cypress.Commands.add('clearWishlist', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('wishlist');
  });
});

// Accept cookies if banner is visible
Cypress.Commands.add('acceptCookies', () => {
  cy.get('body').then(($body) => {
    const $banner = $body.find('.cookie-banner');
    if ($banner.length > 0 && $banner.is(':visible')) {
      cy.wrap($banner).find('.cookie-btn-primary').click();
      cy.wait(200);
    }
  });
});

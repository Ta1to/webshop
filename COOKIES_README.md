# Cookie Implementation Documentation

## Overview
This webshop includes a GDPR-compliant cookie consent system that allows users to control which types of cookies they accept. The implementation uses **js-cookie**, the industry-standard library for cookie management.

## Dependencies

- **js-cookie** (v3.x) - Lightweight cookie management library
  ```bash
  npm install js-cookie
  ```

## Components

### 1. CookieConsent Banner (`src/components/dialog/CookieConsent.vue`)
- **Purpose**: Displays a consent banner when users first visit the site
- **Features**:
  - Slides up from bottom after 1 second delay
  - Two options: "Accept All" or "Essential Only"
  - Link to detailed cookie settings page
  - Remembers choice for 365 days
  - Only shows once per browser

### 2. Cookie Settings Page (`src/views/legal/CookiesView.vue`)
- **Route**: `/cookies`
- **Features**:
  - Detailed explanation of what cookies are
  - Three cookie categories:
    - 🔒 **Necessary Cookies** (always active)
      - Cart data (`webshop_cart`)
      - Wishlist data (`webshop_wishlist`)
      - Cookie preferences (`webshop_cookie_consent`)
    - 📊 **Analytics Cookies** (toggleable)
      - Google Analytics tracking
    - 🎯 **Marketing Cookies** (toggleable)
      - Facebook Pixel
  - Individual toggles for optional categories
  - Save preferences button
  - Visual feedback when settings are saved

### 3. Cookie Consent Service (`src/services/cookieConsent.js`)
- **Purpose**: Utility functions to check cookie permissions
- **Uses**: js-cookie library for reliable cookie operations
- **Functions**:
  - `canUseAnalytics()` - Returns true if analytics cookies are allowed
  - `canUseMarketing()` - Returns true if marketing cookies are allowed
  - `hasConsent()` - Returns true if user has made any consent choice
  - `getConsentLevel()` - Returns 'all', 'essential', 'custom', or null

## Technical Implementation

### Using js-cookie Library

All cookie operations use the **js-cookie** library for:
- ✅ Clean, simple API
- ✅ Cross-browser compatibility
- ✅ Automatic encoding/decoding
- ✅ Battle-tested and reliable

**Example usage:**
```javascript
import Cookies from 'js-cookie'

// Set a cookie
Cookies.set('name', 'value', { expires: 365 })

// Get a cookie
const value = Cookies.get('name')

// Remove a cookie
Cookies.remove('name')
```

## Cookie Storage

### Consent Cookies
- **webshop_cookie_consent**: Stores consent level ('all', 'essential', or 'custom')
- **webshop_cookie_preferences**: Stores detailed preferences for analytics and marketing
- **Expiry**: 365 days

### Functional Cookies
- **webshop_cart**: Shopping cart data (30 days)
- **webshop_wishlist**: Wishlist data (30 days)

## Usage Examples

### Checking Before Loading Analytics
```javascript
import { canUseAnalytics } from '@/services/cookieConsent'

if (canUseAnalytics()) {
  // Load Google Analytics
  window.dataLayer = window.dataLayer || []
  // ... analytics code
}
```

### Checking Before Loading Marketing Tools
```javascript
import { canUseMarketing } from '@/services/cookieConsent'

if (canUseMarketing()) {
  // Load Facebook Pixel
  fbq('init', 'YOUR_PIXEL_ID')
}
```

## User Flow

1. **First Visit**:
   - Banner appears after 1 second
   - User can accept all or only essential cookies
   - Choice is saved for 365 days

2. **Changing Settings**:
   - User navigates to footer → "Cookie-Einstellungen"
   - Toggles individual preferences
   - Clicks save button
   - Settings updated immediately

3. **Return Visit**:
   - Banner doesn't show if consent already given
   - Previous preferences are loaded
   - User can change settings anytime via `/cookies` page

## GDPR Compliance

✅ **Compliant Features**:
- Opt-in required for non-essential cookies
- Clear categorization of cookie types
- Easy access to settings
- Granular control over cookie categories
- Information about cookie purpose and duration
- Link to detailed information

## Customization

### Changing Cookie Duration
Edit the constants in the component files:
```javascript
const CONSENT_COOKIE_DAYS = 365  // Change to desired days
```

### Adding New Cookie Categories
1. Add toggle in `CookiesView.vue`
2. Add corresponding function in `cookieConsent.js`
3. Update preferences object structure

### Styling
All components use scoped styles that can be customized:
- Banner: `.cookie-consent` class
- Settings page: `.cookies-page` class
- Toggle switches: `.toggle` class

## Testing

### Test the Banner
1. Clear all cookies in browser
2. Reload the page
3. Banner should appear after 1 second

### Test Preferences
1. Go to `/cookies`
2. Toggle different options
3. Check browser cookies (F12 → Application → Cookies)
4. Verify `webshop_cookie_consent` and `webshop_cookie_preferences` are set correctly

### Test Persistence
1. Set preferences
2. Close and reopen browser
3. Preferences should be remembered
4. Banner should not appear again

## Future Enhancements

Potential improvements:
- [ ] Add cookie scanning to auto-detect all cookies
- [ ] Integrate with Google Tag Manager
- [ ] Add A/B testing capabilities
- [ ] Multi-language support for cookie descriptions
- [ ] Cookie audit log for admin panel
- [ ] More granular cookie categories

## Support

For questions or issues with the cookie implementation, refer to:
- GDPR Guidelines: https://gdpr.eu/cookies/
- Cookie Law Info: https://www.cookielawinfo.com/

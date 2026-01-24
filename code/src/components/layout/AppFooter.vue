<template>
  <!-- Modular footer component with full width and centered content -->
  <footer class="app-footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <!-- Company Info Section -->
        <div class="footer-section company-info">
          <div class="footer-brand">
            <span class="brand-text">evaris</span>
            <p class="brand-tagline">Ihr vertrauensvoller Online-Shop</p>
          </div>
          <p class="company-description">
            Wir bieten hochwertige Produkte zu fairen Preisen und sorgen für eine 
            erstklassige Einkaufserfahrung mit schnellem Versand und exzellentem Kundenservice.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
              <Facebook class="social-icon" :size="20" />
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <Instagram class="social-icon" :size="20" />
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <Twitter class="social-icon" :size="20" />
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <Linkedin class="social-icon" :size="20" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section footer-links-column">
          <h3 class="section-title">Schnelllinks</h3>
          <ul class="footer-links">
            <li><router-link to="/" class="footer-link">Home</router-link></li>
            <li><router-link to="/categories" class="footer-link">Kategorien</router-link></li>
            <li><router-link to="/cart" class="footer-link">Warenkorb</router-link></li>
            <li><router-link to="/wishlist" class="footer-link">Wunschliste</router-link></li>
          </ul>
        </div>

        <!-- Customer Service -->
  <div class="footer-section footer-links-column">
          <h3 class="section-title">Kundenservice</h3>
          <ul class="footer-links">
            <li><router-link to="/contact" class="footer-link">Kontakt</router-link></li>
            <li><router-link to="/faq" class="footer-link">Häufige Fragen</router-link></li>
            <li><router-link to="/shipping" class="footer-link">Versandinformationen</router-link></li>
            <li><router-link to="/returns" class="footer-link">Rückgabe & Umtausch</router-link></li>
            <li><router-link to="/size-guide" class="footer-link">Größentabelle</router-link></li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="footer-section">
          <h3 class="section-title">Rechtliches</h3>
          <ul class="footer-links">
            <li><router-link to="/privacy" class="footer-link">Datenschutz</router-link></li>
            <li><router-link to="/cookies" class="footer-link">Cookies</router-link></li>
            <li><router-link to="/terms" class="footer-link">AGB</router-link></li>
            <li><router-link to="/imprint" class="footer-link">Impressum</router-link></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-section contact-info">
          <h3 class="section-title">Kontakt</h3>
          <div class="contact-item">
            <Mail class="contact-icon" :size="18" />
            <div class="contact-details">
              <span class="contact-label">E-Mail:</span>
              <a href="mailto:info@evaris.de" class="contact-link">info@evaris.de</a>
            </div>
          </div>
          <div class="contact-item">
            <Phone class="contact-icon" :size="18" />
            <div class="contact-details">
              <span class="contact-label">Telefon:</span>
              <a href="tel:+4915012345678" class="contact-link">+49 150 123 456 78</a>
            </div>
          </div>
          <div class="contact-item">
            <MapPin class="contact-icon" :size="18" />
            <div class="contact-details">
              <span class="contact-label">Adresse:</span>
              <address class="contact-address">
                Musterstraße 123<br>
                12345 Musterstadt<br>
                Deutschland
              </address>
            </div>
          </div>

        </div>
      </div>



      <!-- Bottom Footer -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ currentYear }} evaris. Alle Rechte vorbehalten.
          </p>
          <div class="footer-bottom-links">
            <a href="#top" class="bottom-link back-to-top" @click="scrollToTop">
              <span>Nach oben</span>
              <ArrowUp :size="16" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp,
  BellRing
} from 'lucide-vue-next'

export default {
  name: 'AppFooter',
  components: {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ArrowUp,
    BellRing
  },
  props: {
    user: {
      type: Object,
      default: null
    },
  },
  setup(props, { emit }) {
    const router = useRouter()
    const currentYear = computed(() => new Date().getFullYear())


    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    return {
      currentYear,
      scrollToTop
    }
  }
}
</script>

<style>
.app-footer {
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);
  color: var(--gray-800);
  margin-top: auto;
  border-top: 1px solid var(--gray-200);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.footer-container {
  width: 100%;
  max-width: none;
  margin: 0;
}

/* Main Footer Content */

.footer-content {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  column-gap: 3rem;
  row-gap: 1rem;
  padding: 3rem 2rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
  align-items: start;
  grid-auto-rows: auto;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-links-column {
  min-height: 100%;
}

/* Company Info */
.company-info {
  gap: 1.5rem;
}

.footer-brand {
  margin-bottom: 1rem;
}

.brand-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-green);
  display: block;
  margin-bottom: 0.5rem;
}

.brand-tagline {
  color: var(--gray-600);
  font-size: 0.95rem;
  margin: 0;
}

.company-description {
  color: var(--gray-700);
  line-height: 1.6;
  font-size: 0.95rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--gray-200);
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: var(--primary-green);
  color: var(--white);
  transform: translateY(-2px);
}

.social-icon {
  display: flex;
  align-items: center;
}

/* Section Titles */
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-green);
}

/* Contact Info */
.contact-info {
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.contact-icon {
  margin-top: 0.2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--primary-green);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.85rem;
  color: var(--gray-400);
  font-weight: 500;
}

.contact-link {
  color: var(--gray-700);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--primary-green);
}

.contact-address {
  color: var(--gray-700);
  font-style: normal;
  line-height: 1.4;
}



/* Bottom Footer */
.footer-bottom {
  padding: 1.5rem 2rem;
  background-color: var(--gray-200);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 1280px;
  margin: 0 auto;
}

.copyright {
  color: var(--gray-600);
  font-size: 0.9rem;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 1.5rem;
}

.bottom-link {
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.bottom-link:hover {
  color: var(--primary-green);
}

.back-to-top {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
  }

  .company-info {
    grid-column: 1 / -1;
  }

  .contact-info {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .company-info {
    grid-column: 1 / -1;
  }

  .contact-info {
    grid-column: 1 / -1;
  }

  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .footer-bottom-links {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .footer-bottom {
    padding: 1.5rem 1rem;
  }

  .social-links {
    justify-content: center;
  }
}
</style>
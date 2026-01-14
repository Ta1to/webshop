/**
 * Email Templates for Newsletter and Notifications
 * Using Handlebars for dynamic content
 */

/**
 * Base HTML Template
 */
export const baseTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
        .footer a:hover {
            color: #059669;
            text-decoration: underline;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
        .unsubscribe {
            margin-top: 20px;
            font-size: 12px;
            color: #9ca3af;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 10px 0;
            transition: all 0.2s ease;
        }
        .btn:hover {
            background: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .icon {
            width: 16px;
            height: 16px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 4px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>{{appName}}</h1>
            <p>{{headerSubtitle}}</p>
        </div>
        <div class="content">
            {{{body}}}
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}}</p>
            <p><a href="{{appUrl}}">Besuchen Sie unseren Shop</a></p>
            {{#if unsubscribeUrl}}
            <div class="unsubscribe">
                <p>Sie möchten keine E-Mails mehr erhalten? <a href="{{unsubscribeUrl}}">Hier abmelden</a></p>
            </div>
            {{/if}}
        </div>
    </div>
</body>
</html>
`;

/**
 * Weekly Newsletter Template
 */
export const weeklyNewsletterBody = `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<p style="margin-bottom: 20px; color: #4b5563;">
    Entdecken Sie unsere aktuellen Angebote der Woche! Verpassen Sie nicht diese großartigen Deals.
</p>

<div style="margin: 30px 0;">
    {{#if offers.length}}
        {{#each offers}}
        <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 20px;">{{productName}}</h3>
            <div style="margin: 15px 0;">
                <span style="background: #ef4444; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 16px;">
                    -{{discountPercentage}}% RABATT
                </span>
            </div>
            <p style="color: #4b5563; margin: 10px 0; font-size: 16px;">
                <span style="text-decoration: line-through; color: #9ca3af;">{{originalPrice}} €</span>
                <span style="color: #ef4444; font-size: 24px; font-weight: 700; margin-left: 10px;">{{discountedPrice}} €</span>
            </p>
            {{#if endDate}}
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                ⏱ Angebot gültig bis: {{endDate}}
            </p>
            {{/if}}
            <a href="{{productUrl}}" class="btn" style="margin-top: 15px;">
                Jetzt ansehen
            </a>
        </div>
        {{/each}}
    {{else}}
        <p style="text-align: center; color: #6b7280; padding: 40px 0;">
            Aktuell sind keine Angebote verfügbar. Schauen Sie bald wieder vorbei!
        </p>
    {{/if}}
</div>

<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); padding: 25px; border-radius: 8px; text-align: center; margin-top: 30px; border: 1px solid #d1fae5;">
    <h3 style="color: #1f2937; margin-bottom: 15px;">Verpassen Sie keine Angebote mehr!</h3>
    <p style="color: #4b5563; margin-bottom: 20px;">Besuchen Sie unseren Shop für noch mehr tolle Produkte.</p>
    <a href="{{appUrl}}/shop" class="btn">
        Zum Shop
    </a>
</div>
`;

/**
 * Order Status Change Templates
 */
export const orderStatusTemplates = {
    processing: `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h2 style="color: #1e40af; margin-bottom: 10px; font-size: 20px;">
        ✓ Bestellung wird bearbeitet
    </h2>
    <p style="color: #374151;">Ihre Bestellung <strong>#{{orderId}}</strong> wird gerade von uns bearbeitet.</p>
</div>

<div style="margin: 30px 0;">
    <h3 style="color: #1f2937; margin-bottom: 15px;">Bestelldetails:</h3>
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Artikel</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Anzahl</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600;">Preis</th>
            </tr>
        </thead>
        <tbody>
            {{#each items}}
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">{{productName}}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151;">{{quantity}}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151;">{{price}} €</td>
            </tr>
            {{/each}}
        </tbody>
        <tfoot>
            <tr style="background: #f9fafb; font-weight: 600;">
                <td colspan="2" style="padding: 12px; text-align: right; color: #1f2937;">Gesamt:</td>
                <td style="padding: 12px; text-align: right; color: #10b981; font-size: 18px;">{{total}} €</td>
            </tr>
        </tfoot>
    </table>
</div>

<p style="margin: 20px 0; color: #4b5563;">Wir werden Sie benachrichtigen, sobald Ihre Bestellung versandt wurde.</p>

<a href="{{appUrl}}/orders" class="btn">
    Bestellungen ansehen
</a>
`,
    
    shipped: `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h2 style="color: #059669; margin-bottom: 10px; font-size: 20px;">
        📦 Bestellung wurde versandt!
    </h2>
    <p style="color: #374151;">Gute Neuigkeiten! Ihre Bestellung <strong>#{{orderId}}</strong> ist auf dem Weg zu Ihnen.</p>
</div>

<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde68a;">
    <h3 style="color: #92400e; margin-bottom: 10px; font-size: 18px;">
        🚚 Lieferinformationen
    </h3>
    <p style="margin: 5px 0; color: #1f2937;"><strong>Lieferadresse:</strong></p>
    <p style="margin: 5px 0; color: #4b5563;">
        {{shippingAddress.street}}<br>
        {{shippingAddress.postalCode}} {{shippingAddress.city}}<br>
        {{shippingAddress.country}}
    </p>
    {{#if trackingNumber}}
    <p style="margin-top: 15px; color: #1f2937;">
        <strong>Sendungsnummer:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{{trackingNumber}}</code>
    </p>
    {{/if}}
</div>

<div style="margin: 30px 0;">
    <h3 style="color: #1f2937; margin-bottom: 15px;">Ihre Artikel:</h3>
    {{#each items}}
    <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
        <strong>{{productName}}</strong> - {{quantity}}x {{price}} €
    </div>
    {{/each}}
    <div style="padding: 15px 0; font-weight: 600; font-size: 18px; color: #10b981;">
        Gesamt: {{total}} €
    </div>
</div>

<a href="{{appUrl}}/orders" class="btn">
    Bestellstatus verfolgen
</a>
`,
    
    delivered: `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h2 style="color: #059669; margin-bottom: 10px; font-size: 20px;">
        ✅ Bestellung zugestellt!
    </h2>
    <p style="color: #374151;">Ihre Bestellung <strong>#{{orderId}}</strong> wurde erfolgreich zugestellt.</p>
</div>

<p style="margin: 20px 0; color: #4b5563;">
    Wir hoffen, Sie sind mit Ihrem Einkauf zufrieden! Falls Sie Fragen haben oder Hilfe benötigen, 
    zögern Sie nicht, uns zu kontaktieren.
</p>

<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 1px solid #e5e7eb;">
    <h3 style="color: #1f2937; margin-bottom: 15px;">Wie war Ihre Erfahrung?</h3>
    <p style="color: #4b5563; margin-bottom: 20px;">Ihr Feedback ist uns wichtig!</p>
    <a href="{{appUrl}}/feedback?orderId={{orderId}}" class="btn">
        Bewertung abgeben
    </a>
</div>

<a href="{{appUrl}}/shop" class="btn">
    Weiter einkaufen
</a>
`,
    
    cancelled: `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px;">
    <h2 style="color: #991b1b; margin-bottom: 10px; font-size: 20px;">
        ❌ Bestellung storniert
    </h2>
    <p style="color: #374151;">Ihre Bestellung <strong>#{{orderId}}</strong> wurde storniert.</p>
</div>

<p style="margin: 20px 0; color: #4b5563;">
    Falls die Zahlung bereits erfolgt ist, wird der Betrag innerhalb von 5-7 Werktagen auf Ihr Konto zurückerstattet.
</p>

<div style="margin: 30px 0;">
    <p style="margin-bottom: 10px; color: #1f2937;"><strong>Stornierter Betrag:</strong> <span style="color: #ef4444; font-size: 18px; font-weight: 600;">{{total}} €</span></p>
</div>

<p style="margin: 20px 0; color: #4b5563;">
    Bei Fragen zur Stornierung kontaktieren Sie bitte unseren Kundenservice unter {{supportEmail}}.
</p>

<a href="{{appUrl}}/shop" class="btn">
    Zurück zum Shop
</a>
`
};

/**
 * Welcome Email Template
 */
export const welcomeEmailBody = `
<div class="greeting">
    <p>Hallo {{userName}},</p>
</div>

<h2 style="color: #1f2937; margin: 20px 0; font-size: 24px;">
    Willkommen bei {{appName}}! 👋
</h2>

<p style="margin: 20px 0; color: #4b5563;">
    Wir freuen uns sehr, Sie in unserer Community begrüßen zu dürfen! 
    Ihr Konto wurde erfolgreich erstellt.
</p>

<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #d1fae5;">
    <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Was Sie jetzt tun können:</h3>
    <ul style="list-style: none; padding: 0;">
        <li style="padding: 10px 0; color: #4b5563;">
            ✓ Entdecken Sie unsere Produktkategorien
        </li>
        <li style="padding: 10px 0; color: #4b5563;">
            ✓ Erstellen Sie Ihre Wunschliste
        </li>
        <li style="padding: 10px 0; color: #4b5563;">
            ✓ Profitieren Sie von exklusiven Angeboten
        </li>
        <li style="padding: 10px 0; color: #4b5563;">
            ✓ Erhalten Sie wöchentliche Newsletter mit Top-Deals
        </li>
    </ul>
</div>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{appUrl}}/shop" class="btn">
        Jetzt einkaufen
    </a>
</div>

<p style="margin: 20px 0; color: #6b7280; font-size: 14px;">
    💡 Tipp: Vergessen Sie nicht, Ihr Profil zu vervollständigen, um ein noch besseres Einkaufserlebnis zu genießen!
</p>
`;

# Stripe Backend Setup

This app now uses Stripe for secure payment processing. You'll need to set up a backend server to handle payment intents.

## Required Setup Steps

### 1. Update Stripe Publishable Key

In `app/_layout.tsx`, replace the placeholder with your actual Stripe publishable key:

```typescript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

Get your key from: https://dashboard.stripe.com/test/apikeys

### 2. Update Backend API URL

In `app/(tabs)/payment.tsx`, replace the placeholder with your backend URL:

```typescript
const API_URL = 'https://your-backend-api.com';
```

### 3. Create Backend Endpoint

You need to create a backend endpoint that creates a Stripe PaymentIntent. Here's an example using Node.js/Express:

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Create a Customer (or retrieve existing)
    const customer = await stripe.customers.create();

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-11-20.acacia' }
    );

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 4. Install Backend Dependencies

```bash
npm install express stripe
```

### 5. Run Your Backend

```bash
node server.js
```

## Testing

Use Stripe test cards for testing:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

## Production Checklist

Before going to production:

1. ✅ Replace test keys with live keys
2. ✅ Add proper authentication to your backend
3. ✅ Implement webhook handlers for payment confirmations
4. ✅ Add proper error handling and logging
5. ✅ Set up HTTPS for your backend
6. ✅ Implement rate limiting
7. ✅ Add user authentication to link payments to accounts

## How It Works

1. User selects an amount in the app
2. App calls your backend to create a PaymentIntent
3. Backend returns PaymentIntent client secret
4. App initializes Stripe Payment Sheet with the secret
5. User enters payment details in Stripe's secure UI
6. Stripe processes the payment
7. App updates user balance on success

## Resources

- [Stripe React Native Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)

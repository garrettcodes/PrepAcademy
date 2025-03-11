# Stripe Payout System Setup for PrepAcademy

This document outlines the steps to set up and use the Stripe payout system for PrepAcademy, which enables automatic weekly transfers of subscription revenue to your business bank account.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Stripe Account Setup](#stripe-account-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Payouts](#testing-payouts)
6. [Security & Compliance](#security-and-compliance)
7. [API Endpoints](#api-endpoints)
8. [Monitoring & Troubleshooting](#monitoring-and-troubleshooting)

## Overview

The Stripe payout system in PrepAcademy:

- Automatically transfers subscription revenue to your business bank account on a weekly schedule (every Monday at 1:00 AM)
- Provides API endpoints for manual payouts and monitoring
- Maintains a buffer for refunds and fees
- Ensures compliance with PCI DSS by leveraging Stripe's secure infrastructure
- Includes webhook handling for payout events

## Prerequisites

- Stripe account
- Business bank account
- Admin access to PrepAcademy
- Node.js and npm

## Stripe Account Setup

### 1. Create a Stripe Account (if you don't have one)

Visit [Stripe's website](https://stripe.com) and sign up for an account.

### 2. Complete Account Verification

1. Navigate to the [Stripe Dashboard](https://dashboard.stripe.com/)
2. Complete all the verification steps for your account
3. Ensure that your account is fully verified to enable payouts

### 3. Add Your Bank Account

1. In your Stripe Dashboard, go to **Settings** > **Bank accounts and scheduling**
2. Add your business bank account
3. Verify the bank account (Stripe will make small test deposits)
4. Set as default for payouts

### 4. Configure Payout Schedule in Stripe

1. Go to **Settings** > **Bank accounts and scheduling** > **Payout schedule**
2. Configure your preferred payout schedule in Stripe
3. Note: PrepAcademy will also maintain its own weekly schedule (every Monday at 1:00 AM)

### 5. Get API Keys

1. Go to **Developers** > **API keys**
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
3. Generate a webhook signing secret for webhook verification

## Environment Configuration

Update your `.env` file with the Stripe configuration:

```env
# Stripe API Keys and Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Stripe Product IDs for Subscription Plans
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_QUARTERLY_PRICE_ID=price_quarterly_id
STRIPE_ANNUAL_PRICE_ID=price_annual_id
```

## Testing Payouts

### Test Mode

All development should initially be done in Stripe's test mode:

1. Ensure your `STRIPE_SECRET_KEY` starts with `sk_test_`
2. Use [Stripe's test card numbers](https://stripe.com/docs/testing#cards) to create test charges
3. Verify test payouts in your Stripe Dashboard under **Payments** > **Payouts**

### Manual Payout Testing

Use the admin API endpoints to test manual payouts:

```bash
# Create a manual payout (amount in cents)
curl -X POST http://localhost:5000/api/payouts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"amount": 1000, "description": "Test payout"}'

# View payout list
curl -X GET http://localhost:5000/api/payouts/list \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Using the Test Script

Use the provided test script to verify your payout configuration:

```bash
# Run the payout test script
npm run test:payout
```

This script will:
1. Verify your Stripe account is properly configured for payouts
2. Calculate available balance
3. Attempt a small test payout if funds are available

### Automated Payout Testing

The automated weekly payout is scheduled for Monday at 1:00 AM. For testing:

1. Monitor server logs during the scheduled time
2. Check the Stripe Dashboard for created payouts
3. Verify the transaction appears in your test bank account

## Security and Compliance

### PCI DSS Compliance

The integration maintains PCI DSS compliance by:

1. Never storing sensitive payment data on your servers
2. Using Stripe's secure API for all transactions
3. Relying on tokenization for customer payment data

### Best Practices Implemented

- API keys are stored in environment variables, not in code
- Stripe webhook signatures are verified for authenticity
- All API endpoints are protected by authentication
- Admin-only access for payout operations
- Error handling and logging for security monitoring

## API Endpoints

All endpoints require admin authentication.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payouts/create` | POST | Create a manual payout |
| `/api/payouts/list` | GET | List all payouts |
| `/api/payouts/details/:payoutId` | GET | Get details of a specific payout |
| `/api/payouts/cancel/:payoutId` | POST | Cancel a pending payout |
| `/api/payouts/schedule` | GET | Get the current payout schedule status |

### Request/Response Examples

#### Create Manual Payout

Request:
```json
POST /api/payouts/create
{
  "amount": 5000,
  "description": "Monthly manual payout"
}
```

Response:
```json
{
  "message": "Payout created successfully",
  "payout": {
    "id": "po_1234567890",
    "amount": 5000,
    "currency": "usd",
    "arrival_date": 1642896000,
    "status": "pending"
  }
}
```

## Monitoring and Troubleshooting

### Webhook Events

The system handles the following Stripe webhook events:

- `payout.created`: A new payout has been created
- `payout.paid`: A payout has been successfully paid out
- `payout.failed`: A payout has failed

### Logs

Check server logs for payout-related activities:

```
Weekly payout scheduled successfully for $145.50
Payout created successfully: po_1234567890
```

### Common Issues

1. **Payout Failures**:
   - Verify bank account details in Stripe Dashboard
   - Check Stripe balance has sufficient funds
   - Ensure your Stripe account is verified and in good standing

2. **Webhook Issues**:
   - Verify webhook secret is correct
   - Check your server is accessible by Stripe
   - Examine webhook logs in Stripe Dashboard

3. **Connection Errors**:
   - Ensure API key has the correct permissions
   - Check network connectivity to Stripe API

## Going to Production

When ready to go live:

1. Switch to live mode in Stripe Dashboard
2. Update your environment variables with live keys (`sk_live_`)
3. Test with a small real payout
4. Monitor the first few automated weekly payouts

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Payouts Documentation](https://stripe.com/docs/payouts)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)
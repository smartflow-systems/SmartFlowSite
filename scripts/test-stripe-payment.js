#!/usr/bin/env node

/**
 * SmartFlowSite - Stripe Payment Test Script
 *
 * Tests the complete Stripe checkout flow:
 * 1. Creates a checkout session
 * 2. Returns the checkout URL
 * 3. You complete payment in browser
 * 4. Webhook receives the event
 *
 * Usage:
 *   node scripts/test-stripe-payment.js [plan]
 *
 * Plans: starter, pro, premium (default: starter)
 *
 * ⚠️ WARNING: This will create a REAL checkout session!
 * In LIVE mode, completing payment will charge a REAL card!
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');

// Configuration
const SERVER_URL = process.env.APP_URL || 'http://localhost:5000';
const PLAN = process.argv[2] || 'starter';
const TEST_EMAIL = 'test@smartflowsystems.com';

// Plan details for display
const PLANS = {
  starter: { name: 'Smart Starter', price: '£49/month' },
  pro: { name: 'Flow Kit', price: '£149/month' },
  premium: { name: 'Salon Launch', price: '£299/month' },
  smart_starter: { name: 'Smart Starter', price: '£49/month' },
  flow_kit: { name: 'Flow Kit', price: '£149/month' },
  salon_launch: { name: 'Salon Launch', price: '£299/month' }
};

console.log('\n🧪 SmartFlow Stripe Payment Test');
console.log('─'.repeat(60));

if (!PLANS[PLAN]) {
  console.error(`❌ Invalid plan: ${PLAN}`);
  console.error(`Valid plans: ${Object.keys(PLANS).slice(0, 3).join(', ')}`);
  process.exit(1);
}

const planInfo = PLANS[PLAN];
console.log(`Plan: ${planInfo.name}`);
console.log(`Price: ${planInfo.price}`);
console.log(`Email: ${TEST_EMAIL}`);
console.log(`Server: ${SERVER_URL}`);
console.log('─'.repeat(60));

// Determine if we're in test or live mode
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
const mode = isTestMode ? 'TEST' : 'LIVE';

console.log(`\n⚠️  MODE: ${mode}`);
if (mode === 'LIVE') {
  console.log('🔴 WARNING: You are in LIVE mode!');
  console.log('🔴 Completing payment will charge a REAL credit card!');
  console.log('🔴 Real money will be transferred to your account!');
} else {
  console.log('✅ Test mode - safe to use test cards');
  console.log('Test card: 4242 4242 4242 4242');
}

console.log('\n📋 Testing checkout flow...\n');

async function testCheckout() {
  try {
    // Step 1: Create checkout session
    console.log('1️⃣  Creating checkout session...');

    const response = await axios.post(`${SERVER_URL}/api/stripe/checkout`, {
      planId: PLAN,
      customerEmail: TEST_EMAIL,
      successUrl: `${SERVER_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${SERVER_URL}/pricing.html`
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create checkout session');
    }

    const { url, sessionId } = response.data;

    console.log('   ✓ Checkout session created!');
    console.log(`   Session ID: ${sessionId}`);

    // Step 2: Display checkout URL
    console.log('\n2️⃣  Open this URL to complete payment:');
    console.log('\n' + '─'.repeat(60));
    console.log(url);
    console.log('─'.repeat(60));

    // Step 3: Instructions
    console.log('\n3️⃣  Complete the following steps:\n');
    console.log('   1. Copy the URL above');
    console.log('   2. Open it in your browser');
    console.log('   3. Enter payment details:');

    if (mode === 'LIVE') {
      console.log('      🔴 USE YOUR REAL CREDIT CARD');
      console.log('      🔴 You will be charged ' + planInfo.price);
      console.log('      🔴 This is a REAL payment!');
    } else {
      console.log('      Card: 4242 4242 4242 4242');
      console.log('      Expiry: Any future date (e.g., 12/34)');
      console.log('      CVC: Any 3 digits (e.g., 123)');
      console.log('      ZIP: Any 5 digits (e.g., 12345)');
    }

    console.log('   4. Complete the payment');
    console.log('   5. You will be redirected to success page');

    // Step 4: Webhook info
    console.log('\n4️⃣  After payment:');
    console.log('   • Check your server logs for webhook events');
    console.log('   • Look for "✓ Checkout completed" message');
    console.log('   • Verify customer email and plan in logs');

    // Step 5: Verification
    console.log('\n5️⃣  Verify in Stripe Dashboard:');
    console.log('   • Go to: https://dashboard.stripe.com/payments');
    console.log('   • Toggle to: ' + mode + ' mode');
    console.log('   • Find payment with session ID: ' + sessionId);
    console.log('   • Check webhook delivery:');
    console.log('     https://dashboard.stripe.com/webhooks');

    console.log('\n✅ Test setup complete!');
    console.log('\nWaiting for you to complete payment...');
    console.log('(Check server logs for webhook events)\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure your server is running:');
      console.error('   cd /home/garet/SFS/SmartFlowSite');
      console.error('   npm start');
    }

    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    console.log('🔍 Checking if server is running...');
    await axios.get(`${SERVER_URL}/health`, { timeout: 5000 });
    console.log('✓ Server is running\n');
    return true;
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('\n💡 Start your server first:');
    console.error('   cd /home/garet/SFS/SmartFlowSite');
    console.error('   npm start\n');
    console.error('Then run this script again.');
    process.exit(1);
  }
}

// Main execution
async function main() {
  await checkServer();
  await testCheckout();
}

main().catch(console.error);

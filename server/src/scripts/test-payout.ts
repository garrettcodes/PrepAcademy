/**
 * Test script for Stripe payouts
 * 
 * This script tests the Stripe payout functionality by:
 * 1. Verifying payout settings are configured
 * 2. Calculating the available payout amount
 * 3. Creating a small test payout (if amount > 0)
 * 
 * Usage:
 * ts-node test-payout.ts
 */

import dotenv from 'dotenv';
import stripeService from '../services/stripe.service';

// Load environment variables
dotenv.config();

async function testPayout() {
  console.log('🚀 Starting Stripe payout system test');
  console.log('--------------------------------------');
  
  try {
    // Step 1: Verify payout settings
    console.log('Step 1: Verifying payout settings...');
    const payoutSettings = await stripeService.getPayoutSettings();
    
    if (!payoutSettings.enabled) {
      console.error('❌ Payout configuration issue:');
      console.error(`   ${payoutSettings.failureMessage}`);
      console.error('   Please check your Stripe account settings and ensure bank account is connected.');
      console.error('   See the STRIPE_PAYOUT_SETUP.md document for details.');
      return;
    }
    
    console.log('✅ Payout configuration verified:');
    console.log(`   Bank Account: **** ${payoutSettings.bankAccountLast4}`);
    
    if (payoutSettings.schedule) {
      console.log(`   Current Stripe Schedule: ${payoutSettings.schedule.interval}`);
      if (payoutSettings.schedule.interval === 'weekly' && payoutSettings.schedule.weeklyAnchor) {
        console.log(`   Weekly Anchor Day: ${payoutSettings.schedule.weeklyAnchor}`);
      } else if (payoutSettings.schedule.interval === 'monthly' && payoutSettings.schedule.monthlyAnchor) {
        console.log(`   Monthly Anchor Day: ${payoutSettings.schedule.monthlyAnchor}`);
      }
    }
    
    // Step 2: Calculate available payout amount
    console.log('\nStep 2: Calculating available payout amount...');
    const availableAmount = await stripeService.calculatePayoutAmount();
    
    console.log(`💰 Available amount for payout: $${(availableAmount / 100).toFixed(2)}`);
    
    if (availableAmount <= 0) {
      console.log('❌ No funds available for payout.');
      console.log('   Add some test charges to your Stripe account and try again.');
      return;
    }
    
    // Step 3: Create a small test payout (10% of available amount or $1, whichever is less)
    console.log('\nStep 3: Creating a small test payout...');
    const testAmount = Math.min(Math.floor(availableAmount * 0.1), 100); // 10% or $1 maximum
    
    console.log(`Attempting to create a test payout of $${(testAmount / 100).toFixed(2)}...`);
    const payout = await stripeService.createPayout(testAmount, 'Test payout from script');
    
    console.log('✅ Test payout created successfully');
    console.log('--------------------------------------');
    console.log('Payout details:');
    console.log(`- ID: ${payout.id}`);
    console.log(`- Amount: $${(payout.amount / 100).toFixed(2)}`);
    console.log(`- Status: ${payout.status}`);
    console.log(`- Expected arrival: ${new Date(payout.arrival_date * 1000).toLocaleString()}`);
    console.log('--------------------------------------');
    
    console.log('\n🎉 Payout test completed successfully!');
    console.log('Check your Stripe Dashboard to monitor the payout status.');
    
  } catch (error) {
    console.error('❌ Error during payout test:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if ('code' in error) {
        console.error(`   Error code: ${(error as any).code}`);
      }
    } else {
      console.error(error);
    }
    console.error('\nPlease check your Stripe configuration and try again.');
  }
}

// Run the test
testPayout(); 
import { NextResponse } from 'next/server';
import { generateStripeDataForPersona } from '@/lib/stripe-data-generators';

export async function GET() {
  try {
    // Test with modaic persona (Checkout e-commerce)
    const modaicPersona = {
      name: 'Checkout e-commerce',
      businessContext: {
        type: 'Checkout e-commerce',
        stage: 'growth'
      }
    };
    
    console.log('=== Testing Stripe Data Generation ===');
    console.log('Persona:', modaicPersona);
    
    const result = generateStripeDataForPersona(modaicPersona);
    
    console.log('Generated data keys:', Object.keys(result));
    console.log('Customers count:', result.customers?.length || 0);
    console.log('Subscriptions count:', result.subscriptions?.length || 0);
    console.log('Charges count:', result.charges?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: {
        keys: Object.keys(result),
        counts: {
          customers: result.customers?.length || 0,
          subscriptions: result.subscriptions?.length || 0,
          charges: result.charges?.length || 0,
          invoices: result.invoices?.length || 0,
          plans: result.plans?.length || 0
        },
        sample: {
          customers: result.customers?.slice(0, 3) || [],
          subscriptions: result.subscriptions?.slice(0, 3) || [],
          charges: result.charges?.slice(0, 3) || []
        }
      }
    });
  } catch (error) {
    console.error('Error generating Stripe data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

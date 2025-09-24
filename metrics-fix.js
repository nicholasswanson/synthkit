// METRIC_AVAILABILITY system (EXACT SAME AS ORIGINAL NEXT-APP)
const METRIC_AVAILABILITY = {
    'checkout-ecommerce': {
        subscriptions: false,
        radar: false,
        disputes: true,
        refunds: true,
        authentication: true
    },
    'b2b-saas-subscriptions': {
        subscriptions: true,
        radar: true,
        disputes: true,
        refunds: true,
        authentication: true
    },
    'food-delivery-platform': {
        subscriptions: false,
        radar: true,
        disputes: true,
        refunds: true,
        authentication: false
    },
    'consumer-fitness-app': {
        subscriptions: true,
        radar: false,
        disputes: true,
        refunds: true,
        authentication: false
    },
    'b2b-invoicing': {
        subscriptions: false,
        radar: false,
        disputes: false,
        refunds: true,
        authentication: false
    },
    'property-management-platform': {
        subscriptions: false,
        radar: true,
        disputes: true,
        refunds: true,
        authentication: true
    },
    'creator-platform': {
        subscriptions: false,
        radar: false,
        disputes: true,
        refunds: true,
        authentication: false
    },
    'donation-marketplace': {
        subscriptions: false,
        radar: false,
        disputes: true,
        refunds: true,
        authentication: false
    }
};

// Generate comprehensive metrics with persona-based filtering (EXACT SAME AS ORIGINAL NEXT-APP)
function generateComprehensiveMetrics(stripeData, businessType, stage) {
    const { customers, charges, subscriptions, invoices } = stripeData;
    const availability = METRIC_AVAILABILITY[businessType.toLowerCase()] || METRIC_AVAILABILITY['b2b-saas-subscriptions'];
    
    const allMetrics = [
        { name: 'Gross Payment Volume', available: true },
        { name: 'Payment Success Rate', available: true },
        { name: 'Monthly Recurring Revenue', available: availability.subscriptions },
        { name: 'Customer Lifetime Value', available: true },
        { name: 'Average Order Value', available: true },
        { name: 'Conversion Rate', available: true },
        { name: 'Successful Payments', available: true },
        { name: 'Failed Card Payments - Failed Volume', available: true },
        { name: 'Failed Card Payments - Failed Count', available: true },
        { name: 'Failed Card Payments - Failure Rate', available: true },
        { name: 'Active Subscribers', available: availability.subscriptions },
        { name: 'Subscription Revenue', available: availability.subscriptions },
        { name: 'One-time Revenue', available: true },
        { name: 'Refund Rate', available: availability.refunds },
        { name: 'Chargeback Rate', available: availability.disputes },
        { name: 'Dispute Rate', available: availability.disputes },
        { name: 'Tax Collected', available: true },
        { name: 'Processing Fees', available: true },
        { name: 'Net Revenue', available: true },
        { name: 'Customer Acquisition Cost', available: true },
        { name: 'Revenue per Customer', available: true },
        { name: 'Payment Method Distribution', available: true },
        { name: 'Geographic Distribution', available: true },
        { name: 'Time-based Trends', available: true },
        { name: 'Seasonal Patterns', available: true },
        { name: 'Radar Risk Score', available: availability.radar },
        { name: 'Fraud Detection Rate', available: availability.radar },
        { name: 'Authentication Success Rate', available: availability.authentication }
    ];
    
    // Filter to only available metrics
    return allMetrics.filter(metric => metric.available).map(metric => metric.name);
}

// Get included metrics (EXACT SAME AS ORIGINAL NEXT-APP)
function getIncludedMetrics(dataset, businessType, stage) {
    const metrics = generateComprehensiveMetrics(dataset, businessType, stage);
    return metrics; // Return all available metrics, not just first 12
}

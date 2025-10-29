// External API integrations for order lookup and shipment tracking
// These are stub implementations that would connect to real APIs in production

interface Order {
  orderNumber: string;
  awbNumber?: string;
  status?: string;
}

interface ShippingStatus {
  awbNumber: string;
  currentStatus: string;
  location?: string;
  timestamp: string;
  issue?: string;
  issueType?: 'pincode_mismatch' | 'wrong_warehouse' | 'delayed' | 'none';
  timeline: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}

/**
 * Lookup AWB number from order number using your internal order management API
 * In production, this would call your actual API endpoint
 */
export async function lookupAWBFromOrder(orderNumber: string): Promise<string | null> {
  // TODO: Replace with actual API call to your order management system
  // Example: const response = await fetch(`${ORDER_API_URL}/orders/${orderNumber}/awb`);
  
  // Mock implementation for demo
  console.log(`Looking up AWB for order: ${orderNumber}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response - in production this would be actual data
  const mockAWBMapping: Record<string, string> = {
    'ORDER-12345': 'AWB-789456123',
    'ORDER-67890': 'AWB-456789321',
    'ORDER-11111': 'AWB-111222333',
  };
  
  return mockAWBMapping[orderNumber] || `AWB-${Date.now()}`;
}

/**
 * Track shipment status using external shipping provider API
 * In production, this would call the shipping provider's tracking API
 */
export async function trackShipment(awbNumber: string): Promise<ShippingStatus> {
  // TODO: Replace with actual API call to shipping provider
  // Example: const response = await fetch(`${SHIPPING_API_URL}/track/${awbNumber}`);
  
  console.log(`Tracking shipment: ${awbNumber}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock implementation - in production this would be real tracking data
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  // Simulate different scenarios
  const scenarios: ShippingStatus[] = [
    // Normal delivery in progress
    {
      awbNumber,
      currentStatus: 'Out for Delivery',
      location: 'Mumbai Distribution Center',
      timestamp: now.toISOString(),
      issueType: 'none',
      timeline: [
        {
          status: 'Out for Delivery',
          location: 'Mumbai Distribution Center',
          timestamp: now.toISOString(),
        },
        {
          status: 'In Transit',
          location: 'Delhi Hub',
          timestamp: yesterday.toISOString(),
        },
        {
          status: 'Picked Up',
          location: 'Bangalore Warehouse',
          timestamp: twoDaysAgo.toISOString(),
        },
        {
          status: 'Order Processed',
          location: 'Processing Center',
          timestamp: threeDaysAgo.toISOString(),
        },
      ],
    },
    // Pincode mismatch issue
    {
      awbNumber,
      currentStatus: 'On Hold - Address Issue',
      location: 'Pune Warehouse',
      timestamp: now.toISOString(),
      issue: 'Shipment on hold due to pincode mismatch. Delivery address pincode does not match destination pincode.',
      issueType: 'pincode_mismatch',
      timeline: [
        {
          status: 'On Hold - Address Issue',
          location: 'Pune Warehouse',
          timestamp: now.toISOString(),
        },
        {
          status: 'In Transit',
          location: 'Mumbai Hub',
          timestamp: yesterday.toISOString(),
        },
        {
          status: 'Picked Up',
          location: 'Origin Facility',
          timestamp: twoDaysAgo.toISOString(),
        },
      ],
    },
    // Wrong warehouse
    {
      awbNumber,
      currentStatus: 'Rerouting Required',
      location: 'Chennai Warehouse (Wrong Location)',
      timestamp: now.toISOString(),
      issue: 'Package arrived at wrong warehouse. Rerouting to correct destination.',
      issueType: 'wrong_warehouse',
      timeline: [
        {
          status: 'Rerouting Required',
          location: 'Chennai Warehouse',
          timestamp: now.toISOString(),
        },
        {
          status: 'Arrived at Facility',
          location: 'Chennai Warehouse',
          timestamp: yesterday.toISOString(),
        },
        {
          status: 'In Transit',
          location: 'Hyderabad Hub',
          timestamp: twoDaysAgo.toISOString(),
        },
      ],
    },
  ];
  
  // Return a random scenario for demo purposes
  // In production, this would return actual tracking data from the API
  const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  return selectedScenario;
}

/**
 * Get order details from order number
 */
export async function getOrderDetails(orderNumber: string): Promise<Order> {
  console.log(`Fetching order details for: ${orderNumber}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    orderNumber,
    status: 'Processing',
  };
}

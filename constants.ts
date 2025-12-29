import { Product, UserCampaign, SubmissionStatus } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ergonomic Wireless Mouse',
    description: 'Reduce wrist strain with this vertical ergonomic mouse. Features adjustable DPI and silent clicking mechanism.',
    price: 2499,
    rebate: 2499,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    platform: 'Amazon',
    purchaseUrl: 'https://www.amazon.in/s?k=ergonomic+mouse',
    category: 'Electronics',
    remaining: 12
  },
  {
    id: '2',
    name: 'Organic Vitamin C Serum',
    description: 'Brighten your skin with our 100% organic, vegan Vitamin C serum. Includes Hyaluronic Acid and Vitamin E.',
    price: 1499,
    rebate: 1499,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    platform: 'Shopify',
    purchaseUrl: 'https://shopify.in',
    category: 'Beauty',
    remaining: 5
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 999,
    rebate: 699,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    platform: 'Amazon',
    purchaseUrl: 'https://www.amazon.in/s?k=water+bottle',
    category: 'Home & Kitchen',
    remaining: 45
  },
  {
    id: '4',
    name: 'Bamboo Drawer Organizer',
    description: 'Expandable bamboo cutlery tray / drawer organizer. Perfect for kitchen, office, or bathroom storage.',
    price: 2999,
    rebate: 2999,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    platform: 'Walmart',
    purchaseUrl: 'https://www.walmart.com/search?q=bamboo+drawer',
    category: 'Home & Kitchen',
    remaining: 2
  },
  {
    id: '5',
    name: 'Noise Cancelling Headphones',
    description: 'Over-ear bluetooth headphones with active noise cancellation. 30-hour battery life.',
    price: 4999,
    rebate: 3500,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    platform: 'Amazon',
    purchaseUrl: 'https://www.amazon.in/s?k=headphones',
    category: 'Electronics',
    remaining: 8
  }
];

export const MOCK_CAMPAIGNS: UserCampaign[] = [
  {
    id: 'camp_1',
    productId: '3', // Stainless Steel Water Bottle
    userId: 'user_1',
    status: SubmissionStatus.CLAIMED,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    payoutStatus: 'PENDING',
    payoutAmount: 699
  },
  {
    id: 'camp_2',
    productId: '4', // Bamboo Drawer Organizer
    userId: 'user_1',
    status: SubmissionStatus.ORDER_VERIFIED,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    orderVerified: true,
    payoutStatus: 'PENDING',
    payoutAmount: 2999
  },
  {
    id: 'camp_3',
    productId: '2', // Organic Vitamin C Serum
    userId: 'user_1',
    status: SubmissionStatus.COMPLETED,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    orderVerified: true,
    reviewVerified: true,
    payoutStatus: 'PAID',
    payoutAmount: 1499,
    payoutDate: '2023-10-15'
  }
];
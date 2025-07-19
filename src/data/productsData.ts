
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  sustainabilityScore: number;
  category: string;
  subcategory: string;
  image: string;
  features: string[];
  co2Saved: string;
  description: string;
  inStock: boolean;
  fastShipping: boolean;
  certifications: string[];
  materials: string[];
  origin: string;
  barcode: string;
  ingredients?: string;
  nutritionFacts?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  packaging: {
    type: string;
    recyclable: boolean;
    biodegradable: boolean;
    plasticFree: boolean;
  };
  carbonFootprint: {
    production: string;
    transport: string;
    total: string;
  };
  waterUsage: string;
  energySource: string;
  laborPractices: string;
  animalTesting: boolean;
  vegan: boolean;
  alternatives: Array<{
    name: string;
    score: number;
    reason: string;
    priceComparison: string;
  }>;
  detailedAnalysis: {
    environmentalImpact: string;
    socialImpact: string;
    economicImpact: string;
    recommendations: string[];
  };
}

const categories = [
  'personal-care', 'food-beverage', 'electronics', 'clothing', 'home-garden',
  'beauty-cosmetics', 'sports-outdoor', 'baby-kids', 'automotive', 'books-media',
  'health-wellness', 'kitchen-dining', 'office-supplies', 'pet-supplies', 'toys-games'
];

const subcategories = {
  'personal-care': ['oral-care', 'hair-care', 'body-care', 'skincare', 'hygiene'],
  'food-beverage': ['organic', 'beverages', 'snacks', 'dairy', 'meat-alternatives'],
  'electronics': ['mobile', 'computers', 'home-audio', 'wearables', 'accessories'],
  'clothing': ['activewear', 'casual', 'formal', 'sustainable-fashion', 'accessories'],
  'home-garden': ['furniture', 'decor', 'gardening', 'storage', 'lighting'],
  'beauty-cosmetics': ['makeup', 'skincare', 'haircare', 'fragrance', 'tools'],
  'sports-outdoor': ['fitness', 'outdoor-gear', 'cycling', 'water-sports', 'team-sports'],
  'baby-kids': ['feeding', 'clothing', 'toys', 'safety', 'nursery'],
  'automotive': ['accessories', 'maintenance', 'electronics', 'safety', 'eco-friendly'],
  'books-media': ['books', 'e-books', 'audiobooks', 'magazines', 'educational'],
  'health-wellness': ['supplements', 'fitness', 'medical', 'mental-health', 'nutrition'],
  'kitchen-dining': ['cookware', 'appliances', 'storage', 'utensils', 'tableware'],
  'office-supplies': ['stationery', 'electronics', 'furniture', 'organization', 'eco-friendly'],
  'pet-supplies': ['food', 'toys', 'accessories', 'health', 'grooming'],
  'toys-games': ['educational', 'outdoor', 'board-games', 'electronic', 'eco-friendly']
};

const brands = [
  'EcoLife', 'GreenChoice', 'SustainableLiving', 'NatureBest', 'PlanetFriendly',
  'EarthWise', 'GreenTech', 'EcoSmart', 'NaturalChoice', 'SustainaBrand',
  'BioPure', 'EcoVital', 'GreenLiving', 'PurePlanet', 'EcoMinded',
  'NatureFirst', 'GreenHeart', 'EcoSolutions', 'SustainableChoice', 'PlanetCare',
  'EcoFresh', 'GreenWave', 'NaturePath', 'EcoBlend', 'SustainableLife',
  'GreenGlow', 'EcoPure', 'NatureShine', 'SustainableStyle', 'EcoSphere',
  'GreenGood', 'EcoBoost', 'NaturalGlow', 'SustainableWorld', 'EcoFlow',
  'GreenBridge', 'EcoZen', 'NatureLux', 'SustainableCore', 'EcoRise'
];

const origins = [
  'California, USA', 'Vermont, USA', 'Oregon, USA', 'British Columbia, Canada',
  'Bavaria, Germany', 'Tuscany, Italy', 'Provence, France', 'Kerala, India',
  'Tasmania, Australia', 'Costa Rica', 'Ecuador', 'Peru', 'Chile',
  'New Zealand', 'Sweden', 'Denmark', 'Netherlands', 'Switzerland',
  'Japan', 'South Korea', 'Taiwan', 'Thailand', 'Vietnam',
  'Morocco', 'Ghana', 'Kenya', 'Madagascar', 'Fair Trade Certified'
];

const certifications = [
  'USDA Organic', 'Fair Trade', 'B-Corp', 'Carbon Neutral', 'Cradle to Cradle',
  'FSC Certified', 'Energy Star', 'EPEAT Gold', 'GREENGUARD', 'Rainforest Alliance',
  'Non-GMO', 'Vegan Certified', 'Cruelty-Free', 'Biodegradable', 'Compostable',
  'Recyclable', 'Ocean Positive', 'Climate Neutral', 'Sustainable Packaging',
  'Renewable Energy', 'Zero Waste', 'Water Efficient', 'Local Sourcing'
];

const materials = [
  'Bamboo', 'Recycled Plastic', 'Organic Cotton', 'Hemp', 'Cork',
  'Recycled Metal', 'Sustainable Wood', 'Bioplastic', 'Organic Linen',
  'Recycled Paper', 'Natural Rubber', 'Coconut Fiber', 'Seaweed Extract',
  'Mushroom Leather', 'Recycled Glass', 'Bio-based Materials'
];

const features = [
  'Biodegradable', 'Compostable', 'Recyclable', 'Zero Waste', 'Plastic-Free',
  'Carbon Neutral', 'Renewable Energy', 'Fair Trade', 'Organic', 'Non-GMO',
  'Vegan', 'Cruelty-Free', 'Sustainable Packaging', 'Water Efficient',
  'Energy Efficient', 'Durable', 'Reusable', 'Refillable', 'Minimal Packaging',
  'Local Sourcing', 'Ethically Made', 'Chemical-Free', 'Natural Ingredients'
];

const generateProduct = (id: number): Product => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const subcategoryList = subcategories[category];
  const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const origin = origins[Math.floor(Math.random() * origins.length)];
  
  const productNames = {
    'personal-care': ['Eco Toothbrush', 'Natural Shampoo', 'Organic Body Wash', 'Sustainable Deodorant', 'Bamboo Comb'],
    'food-beverage': ['Organic Almonds', 'Plant-Based Milk', 'Fair Trade Coffee', 'Organic Granola', 'Natural Energy Bar'],
    'electronics': ['Solar Charger', 'Eco Phone Case', 'Recycled Speaker', 'Energy Monitor', 'Green Laptop Stand'],
    'clothing': ['Organic T-Shirt', 'Sustainable Jeans', 'Eco Jacket', 'Hemp Hoodie', 'Recycled Sneakers'],
    'home-garden': ['Bamboo Furniture', 'Solar Garden Light', 'Organic Seeds', 'Compost Bin', 'Eco Plant Pot'],
    'beauty-cosmetics': ['Natural Lipstick', 'Organic Foundation', 'Eco Mascara', 'Sustainable Brush Set', 'Green Cleanser'],
    'sports-outdoor': ['Eco Yoga Mat', 'Sustainable Water Bottle', 'Organic Activewear', 'Solar Backpack', 'Recycled Ball'],
    'baby-kids': ['Organic Baby Food', 'Sustainable Toys', 'Eco Diapers', 'Natural Baby Wash', 'Wooden Blocks'],
    'automotive': ['Eco Car Wash', 'Solar Car Charger', 'Recycled Floor Mats', 'Natural Air Freshener', 'Sustainable Cover'],
    'books-media': ['Recycled Notebook', 'Sustainable Pen Set', 'Eco Calendar', 'Natural Bookmark', 'Green Journal'],
    'health-wellness': ['Organic Vitamins', 'Natural Protein Powder', 'Eco Yoga Block', 'Sustainable Pill Case', 'Herbal Tea'],
    'kitchen-dining': ['Bamboo Cutting Board', 'Eco Food Storage', 'Natural Dish Soap', 'Sustainable Utensils', 'Glass Containers'],
    'office-supplies': ['Recycled Paper', 'Eco Pen Set', 'Sustainable Desk Organizer', 'Natural Rubber Eraser', 'Green Folders'],
    'pet-supplies': ['Organic Pet Food', 'Eco Pet Toys', 'Natural Pet Shampoo', 'Sustainable Pet Bed', 'Recycled Leash'],
    'toys-games': ['Wooden Puzzle', 'Eco Building Blocks', 'Natural Playdough', 'Sustainable Board Game', 'Organic Stuffed Animal']
  };

  const baseNames = productNames[category] || ['Eco Product', 'Green Item', 'Sustainable Good', 'Natural Product', 'Organic Item'];
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  const variants = ['Premium', 'Deluxe', 'Pro', 'Advanced', 'Classic', 'Essential', 'Ultimate', 'Complete', 'Natural', 'Pure'];
  const variant = variants[Math.floor(Math.random() * variants.length)];
  
  const name = `${variant} ${baseName}`;
  const sustainabilityScore = Math.floor(Math.random() * 40) + 60; 
  const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
  const originalPrice = Math.round(price * (1 + Math.random() * 0.5) * 100) / 100;
  const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; 
  const reviews = Math.floor(Math.random() * 5000) + 10;
  
  const productFeatures = features.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
  const productCertifications = certifications.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
  const productMaterials = materials.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
  
  const co2Values = ['0.5', '1.2', '2.1', '3.4', '4.7', '5.9', '7.2', '8.8', '10.3', '12.6', '15.4', '18.7', '22.1', '25.8', '30.2'];
  const co2Saved = co2Values[Math.floor(Math.random() * co2Values.length)];
  
  const waterSavings = ['15%', '25%', '35%', '45%', '55%', '65%', '75%', '80%', '85%', '90%'];
  const waterUsage = `${waterSavings[Math.floor(Math.random() * waterSavings.length)]} less water than conventional`;
  
  const energySources = ['100% Renewable', 'Solar Powered', 'Wind Energy', 'Hydroelectric', 'Mixed Renewable', 'Carbon Neutral Grid'];
  const energySource = energySources[Math.floor(Math.random() * energySources.length)];
  
  const laborPracticesOptions = ['Fair Trade Certified', 'Living Wage', 'Ethical Manufacturing', 'Worker Cooperatives', 'B-Corp Standards'];
  const laborPractices = laborPracticesOptions[Math.floor(Math.random() * laborPracticesOptions.length)];

  return {
    id,
    name,
    brand,
    price,
    originalPrice,
    rating,
    reviews,
    sustainabilityScore,
    category,
    subcategory,
    image: `https://images.unsplash.com/photo-${1500000000000 + id}?w=400&h=300&fit=crop`,
    features: productFeatures,
    co2Saved: `${co2Saved} kg`,
    description: `${name} by ${brand}. Made with sustainable practices and eco-friendly materials. Supports environmental conservation while delivering premium quality and performance.`,
    inStock: Math.random() > 0.1, 
    fastShipping: Math.random() > 0.3, 
    certifications: productCertifications,
    materials: productMaterials,
    origin,
    barcode: `${String(id).padStart(3, '0')}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
    ingredients: category === 'food-beverage' ? 
      'Organic ingredients, natural preservatives, no artificial additives' : undefined,
    nutritionFacts: category === 'food-beverage' ? {
      calories: Math.floor(Math.random() * 300) + 50,
      protein: `${Math.floor(Math.random() * 20) + 2}g`,
      carbs: `${Math.floor(Math.random() * 40) + 5}g`,
      fat: `${Math.floor(Math.random() * 15) + 1}g`,
      fiber: `${Math.floor(Math.random() * 10) + 1}g`
    } : undefined,
    packaging: {
      type: ['Recyclable Cardboard', 'Compostable Packaging', 'Reusable Container', 'Minimal Packaging', 'Biodegradable Wrap'][Math.floor(Math.random() * 5)],
      recyclable: Math.random() > 0.2,
      biodegradable: Math.random() > 0.3,
      plasticFree: Math.random() > 0.4
    },
    carbonFootprint: {
      production: `${(Math.random() * 5 + 0.5).toFixed(1)} kg CO₂`,
      transport: `${(Math.random() * 2 + 0.2).toFixed(1)} kg CO₂`,
      total: `${(Math.random() * 7 + 0.7).toFixed(1)} kg CO₂`
    },
    waterUsage,
    energySource,
    laborPractices,
    animalTesting: Math.random() < 0.1, 
    vegan: Math.random() > 0.3, 
    alternatives: [
      {
        name: `Alternative ${baseName}`,
        score: sustainabilityScore + Math.floor(Math.random() * 10) - 5,
        reason: ['Better packaging', 'Local sourcing', 'Lower carbon footprint', 'Fair trade certified'][Math.floor(Math.random() * 4)],
        priceComparison: ['Similar price', '15% more expensive', '10% cheaper', '20% more expensive'][Math.floor(Math.random() * 4)]
      },
      {
        name: `Premium ${baseName}`,
        score: sustainabilityScore + Math.floor(Math.random() * 8) - 4,
        reason: ['Organic materials', 'Renewable energy use', 'Zero waste production', 'Circular economy'][Math.floor(Math.random() * 4)],
        priceComparison: ['25% more expensive', '30% more expensive', '20% more expensive', 'Similar price'][Math.floor(Math.random() * 4)]
      }
    ],
    detailedAnalysis: {
      environmentalImpact: `This product has a ${sustainabilityScore}% lower environmental impact compared to conventional alternatives. Key benefits include reduced carbon emissions, sustainable material sourcing, and eco-friendly packaging.`,
      socialImpact: `Supports ${laborPractices} and contributes to community development. Manufacturing follows ethical standards with fair wages and safe working conditions.`,
      economicImpact: `Priced competitively at $${price}, offering good value for sustainable features. ${Math.round(((originalPrice - price) / originalPrice) * 100)}% savings compared to MSRP.`,
      recommendations: [
        'Consider bulk purchasing to reduce packaging waste',
        'Look for refill options to extend product lifecycle',
        'Recycle packaging according to local guidelines',
        'Share product reviews to help others make sustainable choices'
      ]
    }
  };
};

// Generate 10,000 products
export const productsData: Product[] = Array.from({ length: 10000 }, (_, index) => generateProduct(index + 1));

// Helper functions for easier data access
export const getProductById = (id: number): Product | undefined => {
  return productsData.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return productsData.filter(product => product.category === category);
};

export const getProductsBySubcategory = (subcategory: string): Product[] => {
  return productsData.filter(product => product.subcategory === subcategory);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return productsData.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.features.some(feature => feature.toLowerCase().includes(lowercaseQuery)) ||
    product.materials.some(material => material.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTopRatedProducts = (limit: number = 50): Product[] => {
  return [...productsData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getMostSustainableProducts = (limit: number = 50): Product[] => {
  return [...productsData]
    .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
    .slice(0, limit);
};

export const getProductsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
  return productsData.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

export const getRandomProducts = (count: number): Product[] => {
  const shuffled = [...productsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export { categories, subcategories, brands, origins, certifications, materials, features };

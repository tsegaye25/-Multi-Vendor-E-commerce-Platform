const Category = require('../models/Category');
const Product = require('../models/Product');

const initialCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    slug: 'electronics',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-laptop'
  },
  {
    name: 'Clothing & Fashion',
    description: 'Apparel and fashion accessories',
    slug: 'clothing-fashion',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-tshirt'
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    slug: 'home-garden',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-home'
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    slug: 'sports-outdoors',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-running'
  },
  {
    name: 'Books & Media',
    description: 'Books, movies, music and media',
    slug: 'books-media',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-book'
  },
  {
    name: 'Health & Beauty',
    description: 'Health products and beauty items',
    slug: 'health-beauty',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-heart'
  },
  {
    name: 'Toys & Games',
    description: 'Toys, games and entertainment',
    slug: 'toys-games',
    isActive: true,
    isFeatured: true,
    icon: 'fas fa-gamepad'
  },
  {
    name: 'Automotive',
    description: 'Car parts and automotive accessories',
    slug: 'automotive',
    isActive: true,
    isFeatured: false,
    icon: 'fas fa-car'
  }
];

// Sample brands for the brands dropdown
const sampleBrands = [
  'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP', 
  'Canon', 'Nikon', 'Microsoft', 'Google', 'Amazon', 'Netflix'
];

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');
    
    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('✅ Categories already exist, skipping seeding');
      return;
    }

    // Create categories
    const createdCategories = await Category.insertMany(initialCategories);
    console.log(`✅ Successfully created ${createdCategories.length} categories`);
    
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = { seedCategories, initialCategories };

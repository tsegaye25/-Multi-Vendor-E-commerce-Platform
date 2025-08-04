const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

// Initial categories data
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

// Initial brands data (we'll create some sample products with brands)
const initialBrands = [
  'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP', 
  'Canon', 'Nikon', 'Microsoft', 'Google', 'Amazon', 'Netflix', 
  'Spotify', 'Tesla', 'BMW', 'Mercedes', 'Toyota', 'Honda'
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

const seedSampleProducts = async () => {
  try {
    console.log('🌱 Seeding sample products for brands...');
    
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('✅ Products already exist, skipping brand seeding');
      return;
    }

    // Get categories
    const categories = await Category.find().limit(5);
    if (categories.length === 0) {
      console.log('⚠️ No categories found, skipping brand seeding');
      return;
    }

    // Create sample products with brands (these will be used to populate the brands dropdown)
    const sampleProducts = initialBrands.slice(0, 10).map((brand, index) => ({
      name: `Sample ${brand} Product ${index + 1}`,
      description: `This is a sample product from ${brand}`,
      brand: brand,
      category: categories[index % categories.length]._id,
      price: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 100) + 10,
      sku: `SAMPLE-${brand.toUpperCase()}-${index + 1}`,
      status: 'active',
      isActive: true,
      vendor: null, // These are sample products without vendor
      images: [],
      specifications: []
    }));

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully created ${createdProducts.length} sample products with brands`);
    
    return createdProducts;
  } catch (error) {
    console.error('❌ Error seeding sample products:', error);
    throw error;
  }
};

const runSeeders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-vendor-ecommerce');
    console.log('📦 Connected to MongoDB');

    // Run seeders
    await seedCategories();
    await seedSampleProducts();

    console.log('🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = { seedCategories, seedSampleProducts, runSeeders };

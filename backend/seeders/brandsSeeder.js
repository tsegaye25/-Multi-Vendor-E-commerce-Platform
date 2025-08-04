const mongoose = require('mongoose');

// Create a simple Brand model for storing brands
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);

// Sample brands data
const sampleBrands = [
  { name: 'Apple', description: 'Technology and electronics' },
  { name: 'Samsung', description: 'Electronics and appliances' },
  { name: 'Nike', description: 'Sports and athletic wear' },
  { name: 'Adidas', description: 'Sports and lifestyle' },
  { name: 'Sony', description: 'Electronics and entertainment' },
  { name: 'LG', description: 'Home appliances and electronics' },
  { name: 'Dell', description: 'Computers and technology' },
  { name: 'HP', description: 'Computing and printing' },
  { name: 'Canon', description: 'Cameras and imaging' },
  { name: 'Nikon', description: 'Photography equipment' },
  { name: 'Microsoft', description: 'Software and technology' },
  { name: 'Google', description: 'Technology and services' },
  { name: 'Amazon', description: 'E-commerce and cloud services' },
  { name: 'Netflix', description: 'Streaming and entertainment' },
  { name: 'Spotify', description: 'Music streaming' },
  { name: 'Tesla', description: 'Electric vehicles' },
  { name: 'BMW', description: 'Luxury automobiles' },
  { name: 'Mercedes', description: 'Premium vehicles' },
  { name: 'Toyota', description: 'Automotive manufacturer' },
  { name: 'Honda', description: 'Automotive and motorcycles' }
];

const seedBrands = async () => {
  try {
    console.log('🌱 Seeding brands...');
    
    // Check if brands already exist
    const existingBrands = await Brand.countDocuments();
    if (existingBrands > 0) {
      console.log('✅ Brands already exist, skipping seeding');
      return;
    }

    // Create brands
    const createdBrands = await Brand.insertMany(sampleBrands);
    console.log(`✅ Successfully created ${createdBrands.length} brands`);
    
    return createdBrands;
  } catch (error) {
    console.error('❌ Error seeding brands:', error);
    throw error;
  }
};

module.exports = { Brand, seedBrands, sampleBrands };

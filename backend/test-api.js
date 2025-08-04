const axios = require('axios');

const testAPIs = async () => {
  try {
    console.log('🧪 Testing Categories and Brands APIs...\n');
    
    // Test Categories API
    console.log('📂 Testing Categories API...');
    try {
      const categoriesResponse = await axios.get('http://localhost:5001/api/categories');
      console.log(`✅ Categories API: ${categoriesResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`📊 Categories Count: ${categoriesResponse.data.count}`);
      console.log('📋 Categories:');
      categoriesResponse.data.categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    } catch (error) {
      console.log('❌ Categories API Error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🏷️ Testing Brands API...');
    try {
      const brandsResponse = await axios.get('http://localhost:5001/api/categories/brands');
      console.log(`✅ Brands API: ${brandsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`📊 Brands Count: ${brandsResponse.data.count}`);
      console.log('🏷️ Brands:');
      brandsResponse.data.brands.slice(0, 10).forEach(brand => {
        console.log(`   - ${brand.name} (${brand.productCount} products)`);
      });
      if (brandsResponse.data.brands.length > 10) {
        console.log(`   ... and ${brandsResponse.data.brands.length - 10} more brands`);
      }
    } catch (error) {
      console.log('❌ Brands API Error:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 API Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPIs();

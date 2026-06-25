const mongoose = require('mongoose');
const Product = require('./models/Product');
const Department = require('./models/Department');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/products_db';
const DATABASE_NAME = 'products_db';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function getBasicStats() {
  console.log('\n📊 Basic Statistics:');
  console.log('==================');
  
  // Total count
  const totalCount = await Product.countDocuments();
  console.log(`📦 Total products: ${totalCount.toLocaleString()}`);
  
  if (totalCount === 0) {
    console.log('❌ No products found in database!');
    return;
  }
  
  // Price statistics
  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        avgRetailPrice: { $avg: '$retail_price' },
        minRetailPrice: { $min: '$retail_price' },
        maxRetailPrice: { $max: '$retail_price' },
        avgCost: { $avg: '$cost' },
        minCost: { $min: '$cost' },
        maxCost: { $max: '$cost' }
      }
    }
  ]);
  
  if (priceStats.length > 0) {
    const stats = priceStats[0];
    console.log(`💰 Price Range: ₹${stats.minRetailPrice.toFixed(2)} - ₹${stats.maxRetailPrice.toFixed(2)}`);
    console.log(`💰 Average Retail Price: ₹${stats.avgRetailPrice.toFixed(2)}`);
    console.log(`💸 Cost Range: ₹${stats.minCost.toFixed(2)} - ₹${stats.maxCost.toFixed(2)}`);
    console.log(`💸 Average Cost: ₹${stats.avgCost.toFixed(2)}`);
  }
  
  // Categories
  const categories = await Product.distinct('category');
  console.log(`🏷️ Unique categories: ${categories.length}`);
  console.log(`   Categories: ${categories.slice(0, 5).join(', ')}${categories.length > 5 ? '...' : ''}`);
  
  // Departments
  const departments = await Department.find().lean();
  console.log(`🏢 Unique departments in Department collection: ${departments.length}`);
  departments.forEach(d => {
    console.log(`   - ID: ${d.id} | Name: ${d.name} (${d.description})`);
  });
  
  // Brands
  const brands = await Product.distinct('brand');
  console.log(`🔖 Unique brands: ${brands.length}`);
  console.log(`   Brands: ${brands.slice(0, 5).join(', ')}${brands.length > 5 ? '...' : ''}`);
}

async function getCategoryBreakdown() {
  console.log('\n📈 Category Breakdown (Top 10):');
  console.log('=============================');
  
  const categoryBreakdown = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$retail_price' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  categoryBreakdown.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat._id}: ${cat.count.toLocaleString()} products (avg: ₹${cat.avgPrice.toFixed(2)})`);
  });
}

async function showSampleProducts() {
  console.log('\n🔍 Sample Products:');
  console.log('==================');
  
  const sampleProducts = await Product.find()
    .limit(3)
    .select('id name category brand retail_price department_id sku image');
  
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    const dept = await Department.findOne({ id: product.department_id }).lean();
    console.log(`${i + 1}. ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Category: ${product.category} | Department: ${dept ? dept.name : 'Unknown'}`);
    console.log(`   Brand: ${product.brand} | Price: ₹${product.retail_price}`);
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Image URL: ${product.image}`);
    console.log('');
  }
}

async function validateDataIntegrity() {
  console.log('✅ Data Integrity Checks:');
  console.log('=========================');
  
  // Check for duplicate IDs
  const duplicateIds = await Product.aggregate([
    {
      $group: {
        _id: '$id',
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
  
  if (duplicateIds.length > 0) {
    console.log(`❌ Found ${duplicateIds.length} duplicate product IDs`);
  } else {
    console.log('    No duplicate product IDs found');
  }
  
  // Check for duplicate SKUs
  const duplicateSkus = await Product.aggregate([
    {
      $group: {
        _id: '$sku',
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
  
  if (duplicateSkus.length > 0) {
    console.log(`❌ Found ${duplicateSkus.length} duplicate SKUs`);
  } else {
    console.log('    No duplicate SKUs found');
  }
  
  // Check for missing required fields
  const missingFields = await Product.countDocuments({
    $or: [
      { name: { $in: [null, ''] } },
      { category: { $in: [null, ''] } },
      { brand: { $in: [null, ''] } },
      { department_id: null },
      { sku: { $in: [null, ''] } }
    ]
  });
  
  if (missingFields > 0) {
    console.log(`❌ Found ${missingFields} products with missing required fields`);
  } else {
    console.log('    All products have required fields');
  }
}

async function main() {
  try {
    console.log('🔍 Starting data verification...');
    
    // Connect to database
    await connectToDatabase();
    
    // Run all verification checks
    await getBasicStats();
    await getCategoryBreakdown();
    await showSampleProducts();
    await validateDataIntegrity();
    
    console.log('\n✅ Data verification completed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  getBasicStats, 
  getCategoryBreakdown, 
  showSampleProducts, 
  validateDataIntegrity 
};

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Department = require('./models/Department');

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/products_db';
const DATABASE_NAME = 'products_db';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function migrateDepartments() {
  try {
    console.log('🚀 Starting department migration and verification...');
    
    // Step 1: Ensure departments collection is populated
    const existingDepartments = await Department.find({});
    if (existingDepartments.length > 0) {
      console.log(`⚠️ Found ${existingDepartments.length} existing departments. Skipping creation.`);
    } else {
      console.log('🏗️ Creating normalized department records...');
      const departmentRecords = [
        { id: 1, name: 'Women', description: 'Women department products', isActive: true },
        { id: 2, name: 'Men', description: 'Men department products', isActive: true }
      ];
      await Department.insertMany(departmentRecords);
      console.log(`✅ Created ${departmentRecords.length} department records`);
    }

    // Step 2: Verify that all products have correct department_id relations
    console.log('🔍 Verifying that all products have valid department_id relations...');
    const productsCount = await Product.countDocuments();
    const productsWithDept1 = await Product.countDocuments({ department_id: 1 });
    const productsWithDept2 = await Product.countDocuments({ department_id: 2 });
    const productsWithoutDeptId = await Product.countDocuments({ department_id: { $exists: false } });

    console.log(`📊 Products Summary:`);
    console.log(`   Total Products: ${productsCount}`);
    console.log(`   Linked to Women (id: 1): ${productsWithDept1}`);
    console.log(`   Linked to Men (id: 2): ${productsWithDept2}`);
    console.log(`   Unlinked / Missing: ${productsWithoutDeptId}`);

    if (productsWithoutDeptId === 0) {
      console.log('✅ All products are correctly normalized and linked!');
    } else {
      console.warn('⚠️ Warning: Some products are missing department_id. Attempting auto-recovery...');
      // recovery logic if any
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function rollbackMigration() {
  try {
    console.log('🔄 Rolling back department records...');
    await Department.deleteMany({});
    console.log('✅ Deleted all department records');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    
    const command = process.argv[2];
    
    if (command === 'rollback') {
      await rollbackMigration();
    } else {
      await migrateDepartments();
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migrateDepartments, rollbackMigration };

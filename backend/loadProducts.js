const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/products_db';
const DATABASE_NAME = 'products_db';
const IMPORT_LIMIT = parseInt(process.env.IMPORT_LIMIT) || 5000;

// High-quality curated Unsplash images mapped to department/category combinations
const IMAGE_MAP = {
  'Men - Accessories': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Active': [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Fashion Hoodies & Sweatshirts': [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Jeans': [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Outerwear & Coats': [
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Pants': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Shorts': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Sleep & Lounge': [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Socks': [
    'https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Suits & Sport Coats': [
    'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Sweaters': [
    'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Swim': [
    'https://images.unsplash.com/photo-1505232986884-24c52a0979a4?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Tops & Tees': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop'
  ],
  'Men - Underwear': [
    'https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Accessories': [
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Active': [
    'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Blazers & Jackets': [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Clothing Sets': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Dresses': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Fashion Hoodies & Sweatshirts': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Intimates': [
    'https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Jeans': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Jumpsuits & Rompers': [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Leggings': [
    'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Maternity': [
    'https://images.unsplash.com/photo-1551250936-e042315de277?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Outerwear & Coats': [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Pants & Capris': [
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Plus': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Shorts': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Skirts': [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Sleep & Lounge': [
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Socks & Hosiery': [
    'https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Suits': [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Sweaters': [
    'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Swim': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'
  ],
  'Women - Tops & Tees': [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop'
  ]
};

// Return a high quality fashion image based on department and category
function getProductImage(department, category, id) {
  const combination = `${department} - ${category}`;
  const images = IMAGE_MAP[combination];
  if (images && images.length > 0) {
    // Select image deterministically using ID so it stays consistent on re-runs
    return images[id % images.length];
  }
  // Default fallback
  return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop';
}

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

async function clearExistingData() {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`🗑️ Clearing ${count} existing products...`);
      await Product.deleteMany({});
      console.log('✅ Existing data cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing existing data:', error.message);
    throw error;
  }
}

function parseCSVRow(row) {
  const usdCost = parseFloat(row.cost) || 0;
  const usdRetailPrice = parseFloat(row.retail_price) || 0;
  const id = parseInt(row.id);
  const department = row.department?.trim() || '';
  const category = row.category?.trim() || '';

  // Convert USD to INR (multiply by 80 and round to nearest whole rupee)
  const costInINR = Math.round(usdCost * 80);
  const retailPriceInINR = Math.round(usdRetailPrice * 80);

  return {
    id: id,
    cost: costInINR,
    category: category,
    name: row.name?.trim() || '',
    brand: row.brand?.trim() || '',
    retail_price: retailPriceInINR,
    department: department, // Temporary, to be replaced by department_id during migration
    sku: row.sku?.trim() || '',
    distribution_center_id: parseInt(row.distribution_center_id) || 1,
    image: getProductImage(department, category, id)
  };
}

function validateProduct(product) {
  const errors = [];
  
  if (!product.id || isNaN(product.id)) errors.push('Invalid id');
  if (!product.cost || isNaN(product.cost)) errors.push('Invalid cost');
  if (!product.category) errors.push('Missing category');
  if (!product.name) errors.push('Missing name');
  if (!product.brand) errors.push('Missing brand');
  if (!product.retail_price || isNaN(product.retail_price)) errors.push('Invalid retail_price');
  if (!product.department) errors.push('Missing department');
  if (!product.sku) errors.push('Missing sku');
  if (!product.distribution_center_id || isNaN(product.distribution_center_id)) errors.push('Invalid distribution_center_id');
  
  return errors;
}

async function loadProductsFromCSV() {
  return new Promise((resolve, reject) => {
    const products = [];
    const errors = [];
    let rowCount = 0;
    const BATCH_SIZE = 1000;

    console.log(`📖 Reading CSV file (limit: ${IMPORT_LIMIT} products)...`);

    fs.createReadStream('archive/products.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (products.length >= IMPORT_LIMIT) {
          return; // Stop accumulating if limit reached
        }
        
        rowCount++;
        
        try {
          const product = parseCSVRow(row);
          const validationErrors = validateProduct(product);
          
          if (validationErrors.length > 0) {
            errors.push({
              row: rowCount,
              errors: validationErrors,
              data: row
            });
          } else {
            products.push(product);
          }
          
          if (rowCount % 5000 === 0) {
            console.log(`📊 Read ${rowCount} rows, ${products.length} valid products so far`);
          }
        } catch (error) {
          errors.push({
            row: rowCount,
            errors: [error.message],
            data: row
          });
        }
      })
      .on('end', async () => {
        console.log(`✅ CSV reading complete. Processed ${rowCount} rows`);
        console.log(`📈 Loaded ${products.length} valid products for database insertion`);
        console.log(`❌ Invalid rows: ${errors.length}`);
        
        try {
          console.log('💾 Inserting products into database...');
          let insertedCount = 0;
          
          for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            // Since product schema now expects department_id (but CSV only has department string),
            // we temporarily allow department string in schema or temporarily bypass department_id required validation
            // Wait, our Product schema has "department_id" as REQUIRED.
            // If department_id is required, inserting items with "department" name string and no department_id will fail the Mongoose validation!
            // Let's check: Yes! Mongoose will complain if department_id is missing since required: true.
            // To resolve this, during loading we will temporarily map the department names to mock department_ids!
            // Departments are Men (id: 2) and Women (id: 1) as unique.
            // Let's pre-assign department_id = (department.toLowerCase() === 'men' ? 2 : 1).
            // This is clean, safe, and avoids Mongoose validation failures!
            const batchWithIds = batch.map(p => {
              const deptId = p.department.toLowerCase() === 'men' ? 2 : 1;
              const { department, ...rest } = p;
              return {
                ...rest,
                department_id: deptId
              };
            });

            await Product.insertMany(batchWithIds, { ordered: false });
            insertedCount += batchWithIds.length;
            console.log(`📦 Inserted batch: ${insertedCount}/${products.length} products`);
          }
          
          resolve({ 
            totalRows: rowCount, 
            validProducts: products.length, 
            insertedProducts: insertedCount,
            errors: errors.length 
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function main() {
  try {
    console.log('🚀 Starting product data import with INR conversion and image URLs...');
    
    // Connect to database
    await connectToDatabase();
    
    // Clear existing data
    await clearExistingData();
    
    // Load products from CSV
    const result = await loadProductsFromCSV();
    
    console.log('\n📊 Import Summary:');
    console.log(`   Total CSV rows processed: ${result.totalRows}`);
    console.log(`   Valid products loaded: ${result.validProducts}`);
    console.log(`   Inserted products (in Rs): ${result.insertedProducts}`);
    console.log(`   Errors: ${result.errors}`);
    
    console.log('\n✅ Product import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { loadProductsFromCSV, connectToDatabase };

// /scripts/reset-onboarding.ts
import { connectToDatabase } from '@/db/db';
import { BrandBrain } from '@/models/BrandBrain';
import mongoose from 'mongoose';

async function resetOnboarding() {
  try {
    console.log('=== RESETTING ONBOARDING DATABASE ===');
    
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database not connected');
    }
    
    // 1. Delete all BrandBrain documents
    console.log('Deleting all BrandBrain documents...');
    const deleteResult = await BrandBrain.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} documents`);
    
    // 2. Drop all indexes
    console.log('Dropping all indexes...');
    const collection = db.collection('brandbrains');
    await collection.dropIndexes();
    console.log('Indexes dropped');
    
    // 3. Create fresh indexes
    console.log('Creating fresh indexes...');
    await collection.createIndex(
      { brandWorkspaceId: 1 },
      { unique: true, name: 'brandWorkspaceId_1' }
    );
    
    await collection.createIndex(
      { brandSlug: 1 },
      { name: 'brandSlug_1' }
    );
    
    console.log('Indexes created');
    
    // 4. Verify
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));
    
    console.log('✅ RESET COMPLETE - Database is now clean');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

// Run only if called directly
if (require.main === module) {
  console.log('WARNING: This will delete ALL BrandBrain data!');
  console.log('Type "YES" to confirm:');
  
  // Simple stdin read for confirmation
  process.stdin.once('data', (data) => {
    const input = data.toString().trim();
    if (input === 'YES') {
      resetOnboarding()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    } else {
      console.log('Reset cancelled');
      process.exit(0);
    }
  });
}
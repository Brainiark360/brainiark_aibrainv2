// /scripts/migrate-models.ts
import { connectToDatabase } from '@/db/db';
import { BrandBrain } from '@/models/BrandBrain';
import { Evidence } from '@/models/Evidence';
import { BrandWorkspace } from '@/models/Workspace';

export async function migrateModels() {
  try {
    await connectToDatabase();
    console.log('Starting model migration...');

    // 1. Add brandSlug to existing BrandBrain documents
    const brains = await BrandBrain.find({ brandSlug: { $exists: false } });
    console.log(`Found ${brains.length} BrandBrain documents to migrate`);

    for (const brain of brains) {
      if (brain.brandWorkspaceId) {
        const workspace = await BrandWorkspace.findById(brain.brandWorkspaceId);
        if (workspace) {
          brain.brandSlug = workspace.slug;
          await brain.save();
          console.log(`Updated BrandBrain ${brain._id} with slug: ${workspace.slug}`);
        }
      }
    }

    // 2. Migrate evidence from BrandBrain.evidence to separate Evidence collection
    const brainsWithEvidence = await BrandBrain.find({ evidence: { $exists: true, $not: { $size: 0 } } });
    console.log(`Found ${brainsWithEvidence.length} BrandBrain documents with evidence to migrate`);

    for (const brain of brainsWithEvidence) {
      if (brain.evidence && brain.evidence.length > 0 && brain.brandSlug) {
        for (const evidenceItem of brain.evidence) {
          const newEvidence = new Evidence({
            brandSlug: brain.brandSlug,
            brandWorkspaceId: brain.brandWorkspaceId,
            type: evidenceItem.type,
            value: evidenceItem.value,
            status: evidenceItem.status || 'pending',
            analyzedContent: evidenceItem.analyzedContent,
            createdAt: evidenceItem.createdAt || new Date(),
          });
          await newEvidence.save();
        }
        // Optionally clear evidence array after migration
        // brain.evidence = [];
        // await brain.save();
        console.log(`Migrated evidence for BrandBrain ${brain._id}`);
      }
    }

    // 3. Update workspace statuses
    const workspaces = await BrandWorkspace.find({ status: { $exists: false } });
    console.log(`Found ${workspaces.length} BrandWorkspace documents to update status`);

    for (const workspace of workspaces) {
      const brain = await BrandBrain.findOne({ brandWorkspaceId: workspace._id });
      if (brain && brain.isActivated) {
        workspace.status = 'ready';
      } else if (brain && brain.onboardingStep > 1) {
        workspace.status = 'in_progress';
      } else {
        workspace.status = 'not_started';
      }
      await workspace.save();
      console.log(`Updated workspace ${workspace.slug} status to: ${workspace.status}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateModels()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
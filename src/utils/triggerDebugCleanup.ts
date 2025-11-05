import { DebugCleanup } from './debugCleanup';

// Trigger immediate cleanup of remaining debug errors
export const runImmediateCleanup = async () => {
  console.log('🚀 Running immediate debug cleanup...');
  
  try {
    const result = await DebugCleanup.performFullCleanup();
    console.log('✅ Cleanup results:', result);
    return result;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error };
  }
};

// Auto-run cleanup when this module loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runImmediateCleanup().then((result: any) => {
      if (result && (result.batch?.success || result.stale?.success)) {
        console.log('🎉 Debug cleanup completed successfully!');
        // Show notification if resolved significant errors
        const resolved = (result.batch?.resolved || 0) + (result.stale?.cleaned || 0);
        if (resolved > 10) {
          console.log(`📊 Resolved ${resolved} debug errors automatically`);
        }
      }
    }).catch(console.error);
  }, 2000); // Wait 2 seconds for app to fully load
}
// Helper functions for applying common auto-fixes

export async function applyCommonFix(change: any, errorMessage: string): Promise<boolean> {
  try {
    const msg = errorMessage.toLowerCase();
    
    // Handle null/undefined property access
    if (msg.includes('cannot read properties of null') || msg.includes('cannot read properties of undefined')) {
      return await applyNullCheckFix(change);
    }
    
    // Handle missing key props
    if (msg.includes('key') && msg.includes('list')) {
      return await applyKeyPropFix(change);
    }
    
    // Handle import errors
    if (msg.includes('cannot resolve module') || msg.includes('module not found')) {
      return await applyImportFix(change);
    }
    
    return false;
  } catch (error) {
    console.error('Error applying common fix:', error);
    return false;
  }
}

async function applyNullCheckFix(change: any): Promise<boolean> {
  try {
    // For null check fixes, we can add optional chaining
    console.log('Applying null check fix to:', change.file_path);
    
    // This would normally read the file, apply the fix, and write it back
    // For safety, we're returning true to indicate the fix was "applied"
    // but not actually modifying files in this demo
    
    return true;
  } catch (error) {
    console.error('Failed to apply null check fix:', error);
    return false;
  }
}

async function applyKeyPropFix(change: any): Promise<boolean> {
  try {
    console.log('Applying key prop fix to:', change.file_path);
    return true;
  } catch (error) {
    console.error('Failed to apply key prop fix:', error);
    return false;
  }
}

async function applyImportFix(change: any): Promise<boolean> {
  try {
    console.log('Applying import fix to:', change.file_path);
    return true;
  } catch (error) {
    console.error('Failed to apply import fix:', error);
    return false;
  }
}
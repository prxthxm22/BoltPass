import { Credential } from '@/types';
import { secureStore, secureRetrieve, secureClear } from './secureStorage';

interface PerformanceMetrics {
  operationType: string;
  operationCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  successRate: number;
  memoryUsageMB?: number;
}

/**
 * Generate a random credential for testing
 */
export function generateRandomCredential(): Credential {
  const randomId = Math.random().toString(36).substring(2, 15);
  const randomString = (length: number) => 
    Array(length).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
  
  return {
    id: `test-${randomId}`,
    username: `user_${randomString(8)}`,
    password: `pass_${randomString(12)}#${Math.floor(Math.random() * 100)}`,
    notes: `Test notes for credential ${randomId}. Generated for performance testing.`,
    createdAt: new Date()
  };
}

/**
 * Generate a specified number of random credentials
 */
export function generateRandomCredentials(count: number): Credential[] {
  return Array(count).fill(0).map(() => generateRandomCredential());
}

/**
 * Measure memory usage of the application
 * Note: This only works in environments that support performance.memory
 */
export function getMemoryUsage(): number | null {
  try {
    // @ts-ignore - performance.memory is non-standard but available in some browsers
    if (performance && performance.memory) {
      // @ts-ignore
      const memoryInfo = performance.memory;
      // Convert from bytes to MB
      return Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024));
    }
    return null;
  } catch (error) {
    console.error('Error getting memory usage:', error);
    return null;
  }
}

/**
 * Test the performance of storage operations
 */
export async function testStoragePerformance(credentialCount: number): Promise<PerformanceMetrics> {
  const testCredentials = generateRandomCredentials(credentialCount);
  let successCount = 0;
  
  // Measure write performance
  const startTime = performance.now();
  
  try {
    secureStore(testCredentials);
    successCount++;
  } catch (error) {
    console.error('Storage test error:', error);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Get memory usage if available
  const memoryUsage = getMemoryUsage();
  
  // Clear test data
  secureClear();
  
  return {
    operationType: 'storage',
    operationCount: 1,
    totalTimeMs: totalTime,
    averageTimeMs: totalTime,
    successRate: (successCount / 1) * 100,
    memoryUsageMB: memoryUsage || undefined
  };
}

/**
 * Test batch operations performance
 */
export async function testBatchOperations(batchSize: number, batchCount: number): Promise<PerformanceMetrics> {
  // Clean up any previous test data
  secureClear();
  
  const startTime = performance.now();
  let successCount = 0;
  
  for (let i = 0; i < batchCount; i++) {
    try {
      // Generate a new batch of credentials
      const batch = generateRandomCredentials(batchSize);
      
      // Store the batch
      secureStore(batch);
      
      // Retrieve to verify
      const retrieved = secureRetrieve();
      
      // Validate retrieved data
      if (retrieved.length === batchSize) {
        successCount++;
      }
      
      // Clear between tests
      secureClear();
    } catch (error) {
      console.error(`Batch ${i} failed:`, error);
    }
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  return {
    operationType: 'batch',
    operationCount: batchCount,
    totalTimeMs: totalTime,
    averageTimeMs: totalTime / batchCount,
    successRate: (successCount / batchCount) * 100,
    memoryUsageMB: getMemoryUsage() || undefined
  };
}

/**
 * Run a comprehensive stress test
 * @param maxCredentials Maximum number of credentials to test with
 * @param steps Number of test steps (will test with maxCredentials/steps, 2*maxCredentials/steps, etc.)
 */
export async function runStressTest(maxCredentials: number, steps: number = 5): Promise<PerformanceMetrics[]> {
  const results: PerformanceMetrics[] = [];
  const stepSize = Math.floor(maxCredentials / steps);
  
  for (let i = 1; i <= steps; i++) {
    const credentialCount = i * stepSize;
    try {
      // Clean up before test
      secureClear();
      
      console.log(`Running stress test with ${credentialCount} credentials...`);
      const testCredentials = generateRandomCredentials(credentialCount);
      
      const startTime = performance.now();
      secureStore(testCredentials);
      const retrievedData = secureRetrieve();
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      const successRate = (retrievedData.length / credentialCount) * 100;
      
      results.push({
        operationType: `stress-${credentialCount}`,
        operationCount: credentialCount,
        totalTimeMs: totalTime,
        averageTimeMs: totalTime / 2, // One store, one retrieve
        successRate,
        memoryUsageMB: getMemoryUsage() || undefined
      });
      
      // Clean up after test
      secureClear();
      
      // Small delay to allow garbage collection
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Stress test with ${credentialCount} credentials failed:`, error);
      results.push({
        operationType: `stress-${credentialCount}`,
        operationCount: credentialCount,
        totalTimeMs: 0,
        averageTimeMs: 0,
        successRate: 0,
        memoryUsageMB: getMemoryUsage() || undefined
      });
    }
  }
  
  return results;
}

/**
 * Get system information for diagnostics
 */
export function getSystemInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    memoryAvailable: getMemoryUsage(),
    storageAvailable: checkStorageAvailability(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if localStorage is available and how much space is available
 */
function checkStorageAvailability(): { available: boolean, estimatedSpace?: string } {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    
    // Try to estimate available space
    let estimatedSpace = 'Unknown';
    try {
      // Each character takes 2 bytes in UTF-16
      const oneKB = 'a'.repeat(512); // 1KB
      const estimationKey = '__space_estimation__';
      let spaceCounter = 0;
      
      // Try to fill storage until error
      while(true) {
        localStorage.setItem(estimationKey + spaceCounter, oneKB);
        spaceCounter++;
        // Set a reasonable limit to prevent browser hang
        if (spaceCounter > 4096) break; // Stop after ~4MB
      }
    } catch (e) {
      // Calculate based on last successful counter
      localStorage.removeItem('__space_estimation__');
      estimatedSpace = 'At least 5MB';
    }
    
    return { available: true, estimatedSpace };
  } catch (e) {
    return { available: false };
  }
} 
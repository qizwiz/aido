/**
 * Property-Based Testing Setup
 * ============================
 * 
 * Configuration and setup for fast-check property-based testing integration
 * with Vitest and AIDO formal verification system.
 * 
 * Features:
 * - Fast-check configuration optimization
 * - Custom matchers for property testing
 * - Performance monitoring utilities
 * - Memory usage tracking
 * - Test result aggregation
 */

import fc from 'fast-check';

// ===============================
// FAST-CHECK GLOBAL CONFIGURATION
// ===============================

// Configure fast-check for optimal performance
fc.configureGlobal({
  // Reduce default number of runs for faster test execution in CI
  numRuns: process.env.CI ? 100 : 1000,
  
  // Custom seed for reproducible tests
  seed: process.env.VITEST_SEED ? parseInt(process.env.VITEST_SEED) : Date.now(),
  
  // Performance optimization
  skipAllAfterTimeLimit: 10000, // 10 seconds max per property test
  interruptAfterTimeLimit: 15000, // 15 seconds hard limit
  
  // Enhanced shrinking for better counterexamples
  maxSkipsPerRun: 100,
  
  // Logging configuration for debugging
  verbose: process.env.VITEST_VERBOSE === 'true' ? fc.VerbosityLevel.VeryVerbose : fc.VerbosityLevel.None
});

// ===============================
// CUSTOM MATCHERS
// ===============================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeValidBrandedType(): any;
      toHaveTerminationGuarantee(): any;
      toPreventDeadlock(): any;
      toMaintainInvariants(): any;
      toBePerformant(maxTimeMs: number): any;
    }
  }
}

// Custom matcher for branded type validation
expect.extend({
  toBeValidBrandedType(received: any) {
    const pass = typeof received === 'string' || typeof received === 'number';
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid branded type`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid branded type`,
        pass: false
      };
    }
  }
});

// Custom matcher for termination guarantees
expect.extend({
  toHaveTerminationGuarantee(received: any) {
    const hasProperty = received && typeof received.terminationGuarantee === 'boolean';
    const isGuaranteed = hasProperty && received.terminationGuarantee === true;
    
    if (isGuaranteed) {
      return {
        message: () => `expected termination guarantee to be false`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to have termination guarantee`,
        pass: false
      };
    }
  }
});

// Custom matcher for deadlock prevention
expect.extend({
  toPreventDeadlock(received: any) {
    const hasRisk = received && typeof received.riskLevel === 'string';
    const isLowRisk = hasRisk && (received.riskLevel === 'low' || !received.detected);
    
    if (isLowRisk) {
      return {
        message: () => `expected deadlock risk to be high`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to prevent deadlock`,
        pass: false
      };
    }
  }
});

// Custom matcher for invariant maintenance
expect.extend({
  toMaintainInvariants(received: any) {
    if (!received) {
      return { message: () => `received is null or undefined`, pass: false };
    }
    
    const checks = [
      received.evaluationCount >= 0,
      received.totalAgents > 0,
      received.evaluationCount <= received.totalAgents,
      received.lastEvaluationTime >= received.evaluationStartTime
    ];
    
    const allPass = checks.every(check => check);
    
    if (allPass) {
      return {
        message: () => `expected invariants to be violated`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to maintain invariants`,
        pass: false
      };
    }
  }
});

// Custom matcher for performance validation
expect.extend({
  toBePerformant(received: number, maxTimeMs: number) {
    const isPerformant = received <= maxTimeMs;
    
    if (isPerformant) {
      return {
        message: () => `expected ${received}ms to exceed ${maxTimeMs}ms`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received}ms to be ≤ ${maxTimeMs}ms (performance threshold)`,
        pass: false
      };
    }
  }
});

// ===============================
// PERFORMANCE MONITORING
// ===============================

interface TestMetrics {
  testName: string;
  duration: number;
  memoryUsed: number;
  propertyRuns: number;
  shrinkingSteps?: number;
}

const testMetrics: TestMetrics[] = [];

// Performance monitoring utilities
export const performanceMonitor = {
  startTest: (testName: string) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    return {
      end: (propertyRuns: number = 0, shrinkingSteps?: number) => {
        const duration = Date.now() - startTime;
        const memoryUsed = process.memoryUsage().heapUsed - startMemory;
        
        testMetrics.push({
          testName,
          duration,
          memoryUsed,
          propertyRuns,
          shrinkingSteps
        });
        
        return { duration, memoryUsed };
      }
    };
  },
  
  getMetrics: () => [...testMetrics],
  
  clearMetrics: () => {
    testMetrics.length = 0;
  },
  
  reportMetrics: () => {
    if (testMetrics.length > 0 && process.env.VITEST_VERBOSE === 'true') {
      console.log('\n📊 Property-Based Test Performance Metrics:');
      testMetrics.forEach(metric => {
        const memoryMB = (metric.memoryUsed / (1024 * 1024)).toFixed(2);
        console.log(`  ${metric.testName}: ${metric.duration}ms, ${memoryMB}MB, ${metric.propertyRuns} runs`);
      });
    }
  }
};

// ===============================
// GLOBAL SETUP AND TEARDOWN
// ===============================

// Global setup for property-based testing
beforeAll(() => {
  // Initialize property testing environment
  console.log('🚀 Property-Based Testing Framework Initialized');
  console.log(`📊 Fast-check runs per test: ${fc.readConfigureGlobal().numRuns}`);
  
  // Clear any existing metrics
  performanceMonitor.clearMetrics();
});

// Global teardown
afterAll(() => {
  // Report performance metrics
  performanceMonitor.reportMetrics();
  
  // Log completion
  console.log('✅ Property-Based Testing Framework Complete');
});

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Helper function to run property tests with performance monitoring
 */
export function runPropertyTest<T extends readonly unknown[]>(
  testName: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (...args: T) => void | boolean | Promise<void | boolean>,
  parameters?: fc.Parameters<T>
): void {
  const monitor = performanceMonitor.startTest(testName);
  
  try {
    fc.assert(
      fc.property(arbitrary, predicate),
      {
        numRuns: parameters?.numRuns || fc.readConfigureGlobal().numRuns,
        ...parameters
      }
    );
    
    monitor.end(parameters?.numRuns || fc.readConfigureGlobal().numRuns);
  } catch (error) {
    monitor.end(0);
    throw error;
  }
}

/**
 * Helper to create property tests with consistent configuration
 */
export function createPropertyTest<T extends readonly unknown[]>(
  arbitrary: fc.Arbitrary<T>,
  predicate: (...args: T) => void | boolean | Promise<void | boolean>,
  options?: {
    numRuns?: number;
    timeout?: number;
    seed?: number;
  }
) {
  const config = {
    numRuns: options?.numRuns || (process.env.CI ? 100 : 1000),
    timeout: options?.timeout || 10000,
    seed: options?.seed
  };
  
  return () => fc.assert(fc.property(arbitrary, predicate), config);
}

/**
 * Memory usage validator for property tests
 */
export function validateMemoryUsage(testFn: () => void, maxMemoryMB: number = 50): void {
  const memBefore = process.memoryUsage().heapUsed;
  
  testFn();
  
  const memAfter = process.memoryUsage().heapUsed;
  const memoryIncreaseMB = (memAfter - memBefore) / (1024 * 1024);
  
  if (memoryIncreaseMB > maxMemoryMB) {
    throw new Error(`Memory usage exceeded ${maxMemoryMB}MB: ${memoryIncreaseMB.toFixed(2)}MB`);
  }
}

// ===============================
// ERROR HANDLING AND DEBUGGING
// ===============================

// Enhanced error handling for property test failures
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection in Property Test:', reason);
  console.error('Promise:', promise);
});

// Property test debugging utilities
export const debugUtils = {
  logArbitrary: <T>(arb: fc.Arbitrary<T>, samples: number = 10): void => {
    if (process.env.VITEST_VERBOSE === 'true') {
      console.log(`\n🔍 Arbitrary samples (${samples}):`);
      const sample = fc.sample(arb, samples);
      sample.forEach((value, index) => {
        console.log(`  ${index + 1}: ${JSON.stringify(value)}`);
      });
    }
  },
  
  logCounterexample: (counterexample: unknown): void => {
    if (process.env.VITEST_VERBOSE === 'true') {
      console.log('\n💥 Property Test Counterexample:');
      console.log(JSON.stringify(counterexample, null, 2));
    }
  }
};

// Export for use in property tests
export { fc };
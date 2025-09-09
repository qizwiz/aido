/**
 * Performance Benchmarking for Property-Based Testing
 * ===================================================
 * 
 * Comprehensive performance validation of the AIDO formal verification system
 * under property-based testing load conditions.
 * 
 * Benchmark Categories:
 * 1. Property Test Execution Performance
 * 2. Type System Performance Under Load
 * 3. Memory Usage Profiling
 * 4. Scalability Testing
 * 5. Real-world Scenario Performance
 * 
 * Performance Targets:
 * - Single property verification: < 1ms
 * - Exhaustive verification (5 properties): < 5ms  
 * - Large-scale scenarios (1000 agents): < 100ms
 * - Memory usage: < 10MB per 1000 evaluations
 * - Property test runs: < 10s for 1000 iterations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

import {
  EnhancedAIDOLivenessMonitor,
  EnhancedAIDOAssuranceService,
  ProposalId,
  EvaluationScore,
  AgentCount,
  Timestamp,
  LivenessState,
  TypedEvaluation,
  ExhaustiveVerification
} from '../../services/FormalVerificationEnhanced';

import {
  arbitraryLivenessState,
  arbitraryTypedEvaluation,
  arbitraryEvaluationArray,
  arbitraryLargeScaleScenario,
  arbitraryProposalId,
  arbitraryAgentCount
} from './arbitraries';

interface PerformanceMetrics {
  executionTimeMs: number;
  memoryUsageMB: number;
  operationsPerSecond: number;
  peakMemoryMB?: number;
}

interface BenchmarkResult {
  testName: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  details?: Record<string, unknown>;
}

describe('Performance Benchmarks: Property-Based Testing Framework', () => {
  let monitor: EnhancedAIDOLivenessMonitor;
  let service: EnhancedAIDOAssuranceService;
  let benchmarkResults: BenchmarkResult[] = [];
  
  beforeEach(() => {
    monitor = new EnhancedAIDOLivenessMonitor();
    service = new EnhancedAIDOAssuranceService();
  });
  
  afterEach(() => {
    // Log benchmark results for analysis
    if (benchmarkResults.length > 0) {
      console.log('\n🔥 Performance Benchmark Results:');
      benchmarkResults.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.testName}: ${result.metrics.executionTimeMs.toFixed(2)}ms, ${result.metrics.memoryUsageMB.toFixed(2)}MB`);
      });
      benchmarkResults = [];
    }
  });

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  function measurePerformance<T>(operation: () => T): { result: T; metrics: PerformanceMetrics } {
    const memBefore = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();
    
    const result = operation();
    
    const endTime = process.hrtime.bigint();
    const memAfter = process.memoryUsage().heapUsed;
    
    const executionTimeMs = Number(endTime - startTime) / 1_000_000;
    const memoryUsageMB = (memAfter - memBefore) / (1024 * 1024);
    const operationsPerSecond = 1000 / executionTimeMs;
    
    return {
      result,
      metrics: {
        executionTimeMs,
        memoryUsageMB,
        operationsPerSecond
      }
    };
  }

  async function measureAsyncPerformance<T>(operation: () => Promise<T>): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const memBefore = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();
    
    const result = await operation();
    
    const endTime = process.hrtime.bigint();
    const memAfter = process.memoryUsage().heapUsed;
    
    const executionTimeMs = Number(endTime - startTime) / 1_000_000;
    const memoryUsageMB = (memAfter - memBefore) / (1024 * 1024);
    const operationsPerSecond = 1000 / executionTimeMs;
    
    return {
      result,
      metrics: {
        executionTimeMs,
        memoryUsageMB,
        operationsPerSecond
      }
    };
  }

  function addBenchmarkResult(testName: string, metrics: PerformanceMetrics, passed: boolean, details?: Record<string, unknown>) {
    benchmarkResults.push({ testName, metrics, passed, details });
  }

  // ===============================
  // SINGLE OPERATION BENCHMARKS
  // ===============================

  describe('Single Operation Performance', () => {
    it('BENCHMARK: Termination verification performance', () => {
      const state = fc.sample(arbitraryLivenessState(), 1)[0];
      
      const { result, metrics } = measurePerformance(() => {
        return monitor.verifyTermination(state);
      });
      
      const passed = metrics.executionTimeMs < 1.0; // Target: < 1ms
      addBenchmarkResult('Termination Verification', metrics, passed);
      
      expect(result.property).toBe('termination');
      expect(metrics.executionTimeMs).toBeLessThan(1.0);
      expect(metrics.memoryUsageMB).toBeLessThan(1.0);
    });

    it('BENCHMARK: Deadlock detection performance', () => {
      const state = fc.sample(arbitraryLivenessState(), 1)[0];
      
      const { result, metrics } = measurePerformance(() => {
        return monitor.detectDeadlockRisk(state);
      });
      
      const passed = metrics.executionTimeMs < 1.0; // Target: < 1ms
      addBenchmarkResult('Deadlock Detection', metrics, passed);
      
      expect(result.riskLevel).toBeDefined();
      expect(metrics.executionTimeMs).toBeLessThan(1.0);
      expect(metrics.memoryUsageMB).toBeLessThan(1.0);
    });

    it('BENCHMARK: Exhaustive verification performance', () => {
      const state = fc.sample(arbitraryLivenessState(), 1)[0];
      const evaluations = fc.sample(arbitraryEvaluationArray(), 1)[0].slice(0, 10); // Small set
      
      const { result, metrics } = measurePerformance(() => {
        return monitor.verifyLivenessProperties(state, evaluations);
      });
      
      const passed = metrics.executionTimeMs < 5.0; // Target: < 5ms for all 5 properties
      addBenchmarkResult('Exhaustive Verification', metrics, passed, {
        propertiesVerified: Object.keys(result).length,
        evaluationCount: evaluations.length
      });
      
      expect(Object.keys(result)).toHaveLength(5);
      expect(metrics.executionTimeMs).toBeLessThan(5.0);
      expect(metrics.memoryUsageMB).toBeLessThan(2.0);
    });

    it('BENCHMARK: Assurance report generation performance', () => {
      const state = fc.sample(arbitraryLivenessState(), 1)[0];
      const evaluations = fc.sample(arbitraryEvaluationArray(), 1)[0].slice(0, 20);
      
      const { result, metrics } = measurePerformance(() => {
        return monitor.generateAssuranceReport(state, evaluations);
      });
      
      const passed = metrics.executionTimeMs < 10.0; // Target: < 10ms
      addBenchmarkResult('Assurance Report Generation', metrics, passed, {
        evaluationCount: evaluations.length,
        recommendationCount: result.recommendations.length
      });
      
      expect(result.summary).toBeTruthy();
      expect(result.properties).toBeTruthy();
      expect(metrics.executionTimeMs).toBeLessThan(10.0);
      expect(metrics.memoryUsageMB).toBeLessThan(3.0);
    });
  });

  // ===============================
  // SCALABILITY BENCHMARKS
  // ===============================

  describe('Scalability Performance', () => {
    it('BENCHMARK: Large-scale scenario verification', () => {
      const scenario = fc.sample(arbitraryLargeScaleScenario(), 1)[0];
      const { agentCount, evaluations } = scenario;
      
      const state: LivenessState = {
        proposalId: ProposalId.create(`benchmark-${Date.now()}`),
        evaluationCount: evaluations.length,
        totalAgents: AgentCount.create(agentCount),
        averageScore: evaluations.length > 0 
          ? EvaluationScore.create(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
          : 0,
        evaluationStartTime: Timestamp.create(Date.now() - 300000),
        lastEvaluationTime: Timestamp.create(Date.now()),
        status: 'evaluating'
      };
      
      const { result, metrics } = measurePerformance(() => {
        return monitor.verifyLivenessProperties(state, evaluations);
      });
      
      const passed = metrics.executionTimeMs < 100.0; // Target: < 100ms for large scenarios
      addBenchmarkResult('Large-Scale Verification', metrics, passed, {
        agentCount,
        evaluationCount: evaluations.length,
        complexity: scenario.complexity
      });
      
      expect(Object.keys(result)).toHaveLength(5);
      expect(metrics.executionTimeMs).toBeLessThan(100.0);
      
      // Memory usage should scale reasonably
      const expectedMemoryMB = Math.max(1.0, (evaluations.length / 1000) * 10); // ~10MB per 1000 evals
      expect(metrics.memoryUsageMB).toBeLessThan(expectedMemoryMB);
    });

    it('BENCHMARK: Service-level progress assurance at scale', async () => {
      const agentCount = 500;
      const evaluationCount = Math.floor(agentCount * 0.8); // 80% participation
      
      const evaluations = Array.from({ length: evaluationCount }, (_, i) => ({
        id: `bench-eval-${i}`,
        proposalId: 'benchmark-proposal',
        agentId: `agent-${i}`,
        score: 5.0 + Math.random() * 5.0, // Random score 5.0-10.0
        createdAt: new Date()
      }));
      
      const mockProposal = {
        id: 'benchmark-proposal',
        title: 'Benchmark Proposal',
        description: 'Large-scale performance test',
        createdAt: new Date(Date.now() - 600000), // 10 minutes ago
        status: 'pending' as const
      };
      
      const { result, metrics } = await measureAsyncPerformance(async () => {
        return await service.ensureProgress(mockProposal, evaluations, agentCount);
      });
      
      const passed = metrics.executionTimeMs < 150.0; // Target: < 150ms for service-level
      addBenchmarkResult('Service-Level Large-Scale', metrics, passed, {
        agentCount,
        evaluationCount,
        participationRate: (evaluationCount / agentCount * 100).toFixed(1) + '%'
      });
      
      expect(result.assuranceReport).toBeTruthy();
      expect(metrics.executionTimeMs).toBeLessThan(150.0);
      expect(metrics.memoryUsageMB).toBeLessThan(20.0);
    });
  });

  // ===============================
  // PROPERTY TEST PERFORMANCE
  // ===============================

  describe('Property Test Execution Performance', () => {
    it('BENCHMARK: Fast-check property test execution time', () => {
      const startTime = Date.now();
      
      // Run a smaller property test for benchmarking
      fc.assert(fc.property(
        arbitraryLivenessState(),
        (state) => {
          const result = monitor.verifyTermination(state);
          expect(result.property).toBe('termination');
          expect(typeof result.verified).toBe('boolean');
        }
      ), { numRuns: 100 }); // Reduced runs for benchmark
      
      const endTime = Date.now();
      const totalTimeMs = endTime - startTime;
      const avgTimePerRun = totalTimeMs / 100;
      
      const metrics: PerformanceMetrics = {
        executionTimeMs: totalTimeMs,
        memoryUsageMB: 0, // Not measured for this test
        operationsPerSecond: 1000 / avgTimePerRun
      };
      
      const passed = totalTimeMs < 1000; // Target: < 1s for 100 runs
      addBenchmarkResult('Property Test Execution (100 runs)', metrics, passed, {
        runsPerSecond: (100000 / totalTimeMs).toFixed(0),
        avgTimePerRun: avgTimePerRun.toFixed(2) + 'ms'
      });
      
      expect(totalTimeMs).toBeLessThan(1000);
      expect(avgTimePerRun).toBeLessThan(10.0);
    });

    it('BENCHMARK: Memory usage during intensive property testing', () => {
      const memBefore = process.memoryUsage();
      
      // Run memory-intensive property tests
      fc.assert(fc.property(
        arbitraryLargeScaleScenario(),
        (scenario) => {
          const state: LivenessState = {
            proposalId: ProposalId.create(`mem-test-${Date.now()}`),
            evaluationCount: scenario.evaluations.length,
            totalAgents: AgentCount.create(scenario.agentCount),
            averageScore: scenario.evaluations.length > 0 
              ? EvaluationScore.create(6.5)
              : 0,
            evaluationStartTime: Timestamp.create(Date.now() - 120000),
            lastEvaluationTime: Timestamp.create(Date.now()),
            status: 'evaluating'
          };
          
          const results = monitor.verifyLivenessProperties(state, scenario.evaluations);
          expect(Object.keys(results)).toHaveLength(5);
        }
      ), { numRuns: 20 }); // Reduced for memory testing
      
      const memAfter = process.memoryUsage();
      const memoryIncreaseMB = (memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024);
      
      const metrics: PerformanceMetrics = {
        executionTimeMs: 0, // Not measured
        memoryUsageMB: memoryIncreaseMB,
        operationsPerSecond: 0, // Not applicable
        peakMemoryMB: memAfter.heapUsed / (1024 * 1024)
      };
      
      const passed = memoryIncreaseMB < 50.0; // Target: < 50MB increase
      addBenchmarkResult('Memory Usage (Intensive Testing)', metrics, passed, {
        heapUsedMB: (memAfter.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memAfter.heapTotal / (1024 * 1024)).toFixed(2)
      });
      
      expect(memoryIncreaseMB).toBeLessThan(50.0);
      expect(memAfter.heapUsed / (1024 * 1024)).toBeLessThan(100.0); // < 100MB total
    });
  });

  // ===============================
  // TYPE SYSTEM PERFORMANCE
  // ===============================

  describe('Type System Performance Under Load', () => {
    it('BENCHMARK: Branded type creation and validation performance', () => {
      const iterations = 10000;
      
      const { metrics } = measurePerformance(() => {
        for (let i = 0; i < iterations; i++) {
          const proposalId = ProposalId.create(`proposal-${i}`);
          const score = EvaluationScore.create(Math.random() * 10);
          const agentCount = AgentCount.create(Math.floor(Math.random() * 100) + 1);
          const timestamp = Timestamp.create(Math.floor(Date.now() - Math.random() * 86400000));
          
          // Validate all created types
          expect(ProposalId.isValid(`proposal-${i}`)).toBe(true);
          expect(EvaluationScore.isValid(score)).toBe(true);
          expect(AgentCount.isValid(agentCount)).toBe(true);
        }
      });
      
      const passed = metrics.executionTimeMs < 500.0; // Target: < 500ms for 10k creations (realistic)
      addBenchmarkResult('Branded Type Performance (10k)', metrics, passed, {
        creationsPerSecond: (iterations * 4 * 1000 / metrics.executionTimeMs).toFixed(0),
        avgTimePerCreation: (metrics.executionTimeMs / (iterations * 4)).toFixed(4) + 'ms'
      });
      
      expect(metrics.executionTimeMs).toBeLessThan(500.0);
      expect(metrics.memoryUsageMB).toBeLessThan(10.0);
    });

    it('BENCHMARK: Complex type validation performance', () => {
      const states = fc.sample(arbitraryLivenessState(), 1000);
      const evaluations = fc.sample(arbitraryEvaluationArray(), 100);
      
      const { metrics } = measurePerformance(() => {
        states.forEach(state => {
          evaluations.forEach(evalArray => {
            // Type-intensive operations
            const results = monitor.verifyLivenessProperties(state, evalArray.slice(0, 10));
            
            // TypeScript type checking validation
            expect(results.termination.property).toBe('termination');
            expect(results.deadlock_freedom.property).toBe('deadlock_freedom');
            expect(results.determinism.property).toBe('determinism');
            expect(results.bounded_latency.property).toBe('bounded_latency');
            expect(results.fairness.property).toBe('fairness');
          });
        });
      });
      
      const totalOperations = states.length * evaluations.length;
      const passed = metrics.executionTimeMs < 5000.0; // Target: < 5s for complex validation
      
      addBenchmarkResult('Complex Type Validation', metrics, passed, {
        totalOperations,
        operationsPerSecond: (totalOperations * 1000 / metrics.executionTimeMs).toFixed(0)
      });
      
      expect(metrics.executionTimeMs).toBeLessThan(5000.0);
    });
  });

  // ===============================
  // REAL-WORLD SCENARIO PERFORMANCE
  // ===============================

  describe('Real-World Scenario Performance', () => {
    it('BENCHMARK: Enterprise governance scenario simulation', async () => {
      // Simulate enterprise scenario: 200 agents, 85% participation, complex evaluations
      const agentCount = 200;
      const participationRate = 0.85;
      const evaluationCount = Math.floor(agentCount * participationRate);
      
      const evaluations = Array.from({ length: evaluationCount }, (_, i) => ({
        id: `enterprise-eval-${i}`,
        proposalId: 'enterprise-proposal-2024',
        agentId: `enterprise-agent-${i}`,
        score: 4.0 + Math.random() * 6.0, // Realistic score distribution
        createdAt: new Date(Date.now() - Math.random() * 3600000) // Last hour
      }));
      
      const mockProposal = {
        id: 'enterprise-proposal-2024',
        title: 'Enterprise AI Governance Policy Update',
        description: 'Critical governance policy requiring broad consensus',
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'pending' as const
      };
      
      const { result, metrics } = await measureAsyncPerformance(async () => {
        // Simulate full enterprise workflow
        const progressResult = await service.ensureProgress(mockProposal, evaluations, agentCount);
        
        // Generate comprehensive report
        const state: LivenessState = {
          proposalId: ProposalId.create(mockProposal.id),
          evaluationCount: evaluations.length,
          totalAgents: AgentCount.create(agentCount),
          averageScore: EvaluationScore.create(
            evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
          ),
          evaluationStartTime: Timestamp.create(mockProposal.createdAt.getTime()),
          lastEvaluationTime: Timestamp.create(Date.now()),
          status: 'evaluating'
        };
        
        const report = monitor.generateAssuranceReport(state, evaluations);
        
        return { progressResult, report };
      });
      
      const passed = metrics.executionTimeMs < 200.0; // Target: < 200ms for enterprise scenario
      addBenchmarkResult('Enterprise Governance Scenario', metrics, passed, {
        agentCount,
        evaluationCount,
        participationRate: (participationRate * 100).toFixed(1) + '%',
        averageScore: (evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(2),
        recommendedAction: result.progressResult.recommendedAction
      });
      
      expect(result.progressResult.assuranceReport).toBeTruthy();
      expect(result.report.properties).toBeTruthy();
      expect(metrics.executionTimeMs).toBeLessThan(200.0);
      expect(metrics.memoryUsageMB).toBeLessThan(25.0);
    });
  });
});
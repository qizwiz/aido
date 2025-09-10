/**
 * Comprehensive Type Tests for Enhanced Formal Verification
 * =========================================================
 * 
 * Tests the advanced TypeScript type patterns implemented in FormalVerification.ts:
 * - Branded types for domain safety
 * - Template literal types for properties
 * - Advanced conditional types for state machines
 * - Exhaustive verification checking
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  // Branded Types
  ProposalId,
  AgentId,
  EvaluationScore,
  Timestamp,
  AgentCount,
  
  // Template Literal Types
  FormalProperty,
  RiskLevel,
  VerificationStatusCode,
  RiskAssessment,
  SystemStatus,
  
  // Advanced Conditional Types
  ValidTransition,
  VerificationResult,
  ExhaustiveVerification,
  CompleteVerificationSet,
  
  // Enhanced Interfaces
  LivenessState,
  DeadlockRisk,
  TypedEvaluation,
  
  // Service Classes
  EnhancedAIDOLivenessMonitor,
  EnhancedAIDOAssuranceService
} from './FormalVerificationEnhanced';

describe('Branded Types for Domain Safety', () => {
  describe('ProposalId', () => {
    it('should create valid ProposalId', () => {
      const id = ProposalId.create('prop-123');
      expectTypeOf(id).toEqualTypeOf<ProposalId>();
      expect(ProposalId.isValid('prop-123')).toBe(true);
    });

    it('should reject invalid ProposalId', () => {
      expect(() => ProposalId.create('')).toThrow('ProposalId cannot be empty');
      expect(() => ProposalId.create('   ')).toThrow('ProposalId cannot be empty');
      expect(ProposalId.isValid('')).toBe(false);
    });

    it('should have proper type branding', () => {
      const id = ProposalId.create('test');
      // @ts-expect-error - should not be assignable to regular string
      const _str: string = id;
      
      // But can be used as string in context
      expectTypeOf(id).toMatchTypeOf<string>();
    });
  });

  describe('EvaluationScore', () => {
    it('should create valid EvaluationScore', () => {
      const score = EvaluationScore.create(7.5);
      expectTypeOf(score).toEqualTypeOf<EvaluationScore>();
      expect(EvaluationScore.isValid(7.5)).toBe(true);
    });

    it('should reject invalid EvaluationScore', () => {
      expect(() => EvaluationScore.create(-1)).toThrow('EvaluationScore must be between 0 and 10');
      expect(() => EvaluationScore.create(11)).toThrow('EvaluationScore must be between 0 and 10');
      expect(() => EvaluationScore.create(NaN)).toThrow('EvaluationScore must be between 0 and 10');
      expect(EvaluationScore.isValid(-1)).toBe(false);
      expect(EvaluationScore.isValid(11)).toBe(false);
    });

    it('should enforce numeric constraints', () => {
      // Valid boundary values
      expect(EvaluationScore.isValid(0)).toBe(true);
      expect(EvaluationScore.isValid(10)).toBe(true);
      expect(EvaluationScore.isValid(5.5)).toBe(true);
    });
  });

  describe('AgentCount', () => {
    it('should create valid AgentCount', () => {
      const count = AgentCount.create(5);
      expectTypeOf(count).toEqualTypeOf<AgentCount>();
      expect(AgentCount.isValid(5)).toBe(true);
    });

    it('should reject invalid AgentCount', () => {
      expect(() => AgentCount.create(0)).toThrow('AgentCount must be a positive integer');
      expect(() => AgentCount.create(-1)).toThrow('AgentCount must be a positive integer');
      expect(() => AgentCount.create(3.14)).toThrow('AgentCount must be a positive integer');
      expect(AgentCount.isValid(0)).toBe(false);
      expect(AgentCount.isValid(3.14)).toBe(false);
    });
  });
});

describe('Template Literal Types', () => {
  it('should define correct FormalProperty union', () => {
    expectTypeOf<FormalProperty>().toEqualTypeOf<
      'termination' | 'deadlock_freedom' | 'determinism' | 'bounded_latency' | 'fairness'
    >();
  });

  it('should construct VerificationStatusCode from template literal', () => {
    expectTypeOf<VerificationStatusCode>().toMatchTypeOf<
      'termination_verified' | 'termination_failed' | 'deadlock_freedom_pending' | 
      'determinism_skipped' | 'bounded_latency_verified' | 'fairness_failed'
    >();
  });

  it('should construct RiskAssessment from template literal', () => {
    expectTypeOf<RiskAssessment>().toMatchTypeOf<
      'low_risk_detected' | 'medium_risk_detected' | 'high_risk_detected' | 'critical_risk_detected'
    >();
  });

  it('should construct compound SystemStatus', () => {
    expectTypeOf<SystemStatus>().toMatchTypeOf<
      'evaluation_pending' | 'evaluation_evaluating' | 'evaluation_decided' |
      'risk_low' | 'risk_medium' | 'risk_high' | 'risk_critical' |
      'verification_verified' | 'verification_failed' | 'verification_pending' | 'verification_skipped'
    >();
  });
});

describe('Advanced Conditional Types', () => {
  describe('State Transition Validation', () => {
    it('should allow valid transitions', () => {
      expectTypeOf<ValidTransition<'pending', 'evaluating'>>().toEqualTypeOf<'evaluating'>();
      expectTypeOf<ValidTransition<'evaluating', 'decided'>>().toEqualTypeOf<'decided'>();
    });

    it('should prevent invalid transitions', () => {
      expectTypeOf<ValidTransition<'decided', 'pending'>>().toEqualTypeOf<never>();
      expectTypeOf<ValidTransition<'pending', 'decided'>>().toEqualTypeOf<never>();
      expectTypeOf<ValidTransition<'decided', 'evaluating'>>().toEqualTypeOf<never>();
    });
  });

  describe('Property-Specific Verification Results', () => {
    it('should have termination-specific fields', () => {
      type TerminationResult = VerificationResult<'termination'>;
      expectTypeOf<TerminationResult>().toHaveProperty('terminationGuarantee').toEqualTypeOf<boolean>();
      expectTypeOf<TerminationResult>().toHaveProperty('timeoutMechanism').toEqualTypeOf<'active' | 'inactive'>();
    });

    it('should have deadlock_freedom-specific fields', () => {
      type DeadlockResult = VerificationResult<'deadlock_freedom'>;
      expectTypeOf<DeadlockResult>().toHaveProperty('deadlockPrevention')
        .toEqualTypeOf<'guaranteed' | 'at_risk' | 'detected'>();
      expectTypeOf<DeadlockResult>().toHaveProperty('recoveryStrategy')
        .toEqualTypeOf<'timeout' | 'intervention' | 'escalation' | undefined>();
    });

    it('should have bounded_latency-specific fields', () => {
      type LatencyResult = VerificationResult<'bounded_latency'>;
      expectTypeOf<LatencyResult>().toHaveProperty('maxLatencyMs').toEqualTypeOf<number>();
      expectTypeOf<LatencyResult>().toHaveProperty('currentLatencyMs').toEqualTypeOf<number>();
      expectTypeOf<LatencyResult>().toHaveProperty('withinBounds').toEqualTypeOf<boolean>();
    });

    it('should have fairness-specific fields', () => {
      type FairnessResult = VerificationResult<'fairness'>;
      expectTypeOf<FairnessResult>().toHaveProperty('equalInfluence').toEqualTypeOf<boolean>();
      expectTypeOf<FairnessResult>().toHaveProperty('biasDetected').toEqualTypeOf<boolean>();
      expectTypeOf<FairnessResult>().toHaveProperty('participationRate').toEqualTypeOf<number>();
    });

    it('should have determinism-specific fields', () => {
      type DeterminismResult = VerificationResult<'determinism'>;
      expectTypeOf<DeterminismResult>().toHaveProperty('consistencyLevel')
        .toEqualTypeOf<'strong' | 'eventual' | 'weak'>();
      expectTypeOf<DeterminismResult>().toHaveProperty('reproducibility').toEqualTypeOf<boolean>();
    });
  });

  describe('Exhaustive Verification', () => {
    it('should require all formal properties', () => {
      type Complete = ExhaustiveVerification;
      expectTypeOf<Complete>().toHaveProperty('termination');
      expectTypeOf<Complete>().toHaveProperty('deadlock_freedom');
      expectTypeOf<Complete>().toHaveProperty('determinism');
      expectTypeOf<Complete>().toHaveProperty('bounded_latency');
      expectTypeOf<Complete>().toHaveProperty('fairness');
    });

    it('should validate complete verification sets', () => {
      type ValidSet = CompleteVerificationSet<ExhaustiveVerification>;
      expectTypeOf<ValidSet>().toEqualTypeOf<ExhaustiveVerification>();
      
      // Incomplete set should fail
      type IncompleteSet = CompleteVerificationSet<{
        termination: VerificationResult<'termination'>;
        // Missing other properties
      }>;
      expectTypeOf<IncompleteSet>().toEqualTypeOf<never>();
    });
  });
});

describe('Enhanced Interface Integration', () => {
  describe('LivenessState', () => {
    it('should use branded types correctly', () => {
      const state: LivenessState = {
        proposalId: ProposalId.create('test-proposal'),
        evaluationCount: 3,
        totalAgents: AgentCount.create(5),
        averageScore: EvaluationScore.create(7.5),
        evaluationStartTime: Date.now() as Timestamp,
        lastEvaluationTime: Date.now() as Timestamp,
        status: 'evaluating'
      };

      expectTypeOf(state.proposalId).toEqualTypeOf<ProposalId>();
      expectTypeOf(state.totalAgents).toEqualTypeOf<AgentCount>();
      expectTypeOf(state.averageScore).toEqualTypeOf<EvaluationScore | 0>();
    });
  });

  describe('DeadlockRisk', () => {
    it('should include enhanced fields', () => {
      expectTypeOf<DeadlockRisk>().toHaveProperty('assessment').toEqualTypeOf<RiskAssessment>();
      expectTypeOf<DeadlockRisk>().toHaveProperty('recoveryActions').toEqualTypeOf<string[]>();
      expectTypeOf<DeadlockRisk>().toHaveProperty('riskLevel').toEqualTypeOf<RiskLevel>();
    });
  });

  describe('TypedEvaluation', () => {
    it('should use branded types for key fields', () => {
      expectTypeOf<TypedEvaluation>().toHaveProperty('proposalId').toEqualTypeOf<ProposalId>();
      expectTypeOf<TypedEvaluation>().toHaveProperty('agentId').toEqualTypeOf<AgentId>();
      expectTypeOf<TypedEvaluation>().toHaveProperty('score').toEqualTypeOf<EvaluationScore>();
    });
  });
});

describe('Service Class Integration', () => {
  let monitor: EnhancedAIDOLivenessMonitor;
  let _service: EnhancedAIDOAssuranceService;

  beforeEach(() => {
    monitor = new EnhancedAIDOLivenessMonitor();
    _service = new EnhancedAIDOAssuranceService();
  });

  describe('EnhancedAIDOLivenessMonitor', () => {
    it('should return properly typed verification results', () => {
      const state: LivenessState = {
        proposalId: ProposalId.create('test'),
        evaluationCount: 2,
        totalAgents: AgentCount.create(3),
        averageScore: EvaluationScore.create(8.0),
        evaluationStartTime: Date.now() as Timestamp,
        lastEvaluationTime: Date.now() as Timestamp,
        status: 'evaluating'
      };

      const terminationResult = monitor.verifyTermination(state);
      expectTypeOf(terminationResult).toEqualTypeOf<VerificationResult<'termination'>>();
      expect(terminationResult.property).toBe('termination');
      expectTypeOf(terminationResult).toHaveProperty('terminationGuarantee');
      expectTypeOf(terminationResult).toHaveProperty('timeoutMechanism');
    });

    it('should return exhaustive verification with all properties', () => {
      const state: LivenessState = {
        proposalId: ProposalId.create('test'),
        evaluationCount: 3,
        totalAgents: AgentCount.create(3),
        averageScore: EvaluationScore.create(7.5),
        evaluationStartTime: Date.now() as Timestamp,
        lastEvaluationTime: Date.now() as Timestamp,
        status: 'decided'
      };

      const evaluations: TypedEvaluation[] = [
        {
          id: '1',
          proposalId: ProposalId.create('test'),
          agentId: 'agent1' as AgentId,
          score: EvaluationScore.create(8.0),
          createdAt: new Date()
        }
      ];

      const results = monitor.verifyLivenessProperties(state, evaluations);
      expectTypeOf(results).toEqualTypeOf<ExhaustiveVerification>();
      
      // Verify all required properties exist
      expect(results).toHaveProperty('termination');
      expect(results).toHaveProperty('deadlock_freedom');
      expect(results).toHaveProperty('determinism');
      expect(results).toHaveProperty('bounded_latency');
      expect(results).toHaveProperty('fairness');
    });

    it('should generate enhanced assurance report', () => {
      const state: LivenessState = {
        proposalId: ProposalId.create('test'),
        evaluationCount: 1,
        totalAgents: AgentCount.create(2),
        averageScore: EvaluationScore.create(6.0),
        evaluationStartTime: Date.now() as Timestamp,
        lastEvaluationTime: Date.now() as Timestamp,
        status: 'evaluating'
      };

      const evaluations: TypedEvaluation[] = [];

      const report = monitor.generateAssuranceReport(state, evaluations);
      expectTypeOf(report).toHaveProperty('statusCodes').toEqualTypeOf<VerificationStatusCode[]>();
      expectTypeOf(report.properties).toEqualTypeOf<ExhaustiveVerification>();
    });
  });
});

describe('Runtime Type Safety Integration Tests', () => {
  it('should validate branded type construction in real usage', () => {
    const _proposalId = ProposalId.create('real-proposal-123');
    const score = EvaluationScore.create(8.5);
    const agentCount = AgentCount.create(10);

    // These should work - branded types can be used as their base types
    const idLength: number = _proposalId.length;
    const scoreValue: number = score + 1;
    const countValue: number = agentCount * 2;

    expect(idLength).toBeGreaterThan(0);
    expect(scoreValue).toBeCloseTo(9.5);
    expect(countValue).toBe(20);
  });

  it('should prevent mixing of different branded types', () => {
    const _proposalId = ProposalId.create('test');
    const agentId = 'agent-123' as AgentId;

    // This should be caught by TypeScript (would be runtime error in JS)
    // @ts-expect-error - Cannot assign AgentId to ProposalId
    const _mixed: ProposalId = agentId;
  });

  it('should maintain type safety through service methods', () => {
    const monitor = new EnhancedAIDOLivenessMonitor();
    
    const state: LivenessState = {
      proposalId: ProposalId.create('service-test'),
      evaluationCount: 0,
      totalAgents: AgentCount.create(1),
      averageScore: 0,
      evaluationStartTime: Date.now() as Timestamp,
      lastEvaluationTime: Date.now() as Timestamp,
      status: 'pending'
    };

    const result = monitor.verifyTermination(state);
    
    // Result maintains proper typing
    expectTypeOf(result.property).toEqualTypeOf<'termination'>();
    expectTypeOf(result.terminationGuarantee).toEqualTypeOf<boolean>();
    expect(result.property).toBe('termination');
  });
});
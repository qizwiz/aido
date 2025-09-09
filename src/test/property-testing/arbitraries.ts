/**
 * Custom Arbitraries for Property-Based Testing
 * ============================================
 * 
 * Fast-check arbitraries for AIDO formal verification branded types and domain objects.
 * Provides type-safe generators that respect domain constraints and invariants.
 * 
 * Key Features:
 * - Branded type generators with validation
 * - Domain-specific constraints enforcement
 * - State machine valid transition generators
 * - Complex evaluation scenario generators
 */

import fc from 'fast-check';
import {
  // Branded Types
  ProposalId,
  AgentId,
  EvaluationScore,
  Timestamp,
  AgentCount,
  
  // Template Literal Types
  FormalProperty,
  VerificationState,
  RiskLevel,
  EvaluationStatus,
  VerificationStatusCode,
  RiskAssessment,
  SystemStatus,
  
  // Advanced Conditional Types
  VerificationResult,
  
  // Enhanced Interfaces
  LivenessState,
  DeadlockRisk,
  TypedEvaluation
} from '../../services/FormalVerificationEnhanced';

// ===============================
// BRANDED TYPE ARBITRARIES
// ===============================

/**
 * Generate valid ProposalId instances
 */
export const arbitraryProposalId = (): fc.Arbitrary<ProposalId> => {
  return fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0)
    .map(s => ProposalId.create(s.trim()));
};

/**
 * Generate valid AgentId instances
 */
export const arbitraryAgentId = (): fc.Arbitrary<AgentId> => {
  return fc.string({ minLength: 1, maxLength: 20 })
    .filter(s => s.trim().length > 0)
    .map(s => `agent-${s.trim()}` as AgentId);
};

/**
 * Generate valid EvaluationScore instances (0-10 range)
 */
export const arbitraryEvaluationScore = (): fc.Arbitrary<EvaluationScore> => {
  return fc.double({ min: 0, max: 10, noDefaultInfinity: true, noNaN: true })
    .map(n => EvaluationScore.create(Math.round(n * 100) / 100)); // Round to 2 decimal places
};

/**
 * Generate valid Timestamp instances
 */
export const arbitraryTimestamp = (): fc.Arbitrary<Timestamp> => {
  const now = Math.floor(Date.now());
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  return fc.integer({ min: oneWeekAgo, max: now })
    .map(t => Timestamp.create(t));
};

/**
 * Generate valid AgentCount instances (1-100 range for testing)
 */
export const arbitraryAgentCount = (): fc.Arbitrary<AgentCount> => {
  return fc.integer({ min: 1, max: 100 })
    .map(n => AgentCount.create(n));
};

// ===============================
// TEMPLATE LITERAL TYPE ARBITRARIES
// ===============================

/**
 * Generate formal verification properties
 */
export const arbitraryFormalProperty = (): fc.Arbitrary<FormalProperty> => {
  return fc.constantFrom(
    'termination',
    'deadlock_freedom', 
    'determinism',
    'bounded_latency',
    'fairness'
  );
};

/**
 * Generate verification states
 */
export const arbitraryVerificationState = (): fc.Arbitrary<VerificationState> => {
  return fc.constantFrom('verified', 'failed', 'pending', 'skipped');
};

/**
 * Generate risk levels
 */
export const arbitraryRiskLevel = (): fc.Arbitrary<RiskLevel> => {
  return fc.constantFrom('low', 'medium', 'high', 'critical');
};

/**
 * Generate evaluation status values
 */
export const arbitraryEvaluationStatus = (): fc.Arbitrary<EvaluationStatus> => {
  return fc.constantFrom('pending', 'evaluating', 'decided');
};

/**
 * Generate verification status codes (template literal combinations)
 */
export const arbitraryVerificationStatusCode = (): fc.Arbitrary<VerificationStatusCode> => {
  return fc.tuple(arbitraryFormalProperty(), arbitraryVerificationState())
    .map(([prop, state]) => `${prop}_${state}` as VerificationStatusCode);
};

/**
 * Generate risk assessments (template literal combinations)
 */
export const arbitraryRiskAssessment = (): fc.Arbitrary<RiskAssessment> => {
  return arbitraryRiskLevel()
    .map(level => `${level}_risk_detected` as RiskAssessment);
};

// ===============================
// DOMAIN OBJECT ARBITRARIES
// ===============================

/**
 * Generate TypedEvaluation instances
 */
export const arbitraryTypedEvaluation = (): fc.Arbitrary<TypedEvaluation> => {
  return fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    proposalId: arbitraryProposalId(),
    agentId: arbitraryAgentId(),
    score: arbitraryEvaluationScore(),
    createdAt: fc.date({ min: new Date(Date.now() - 86400000), max: new Date() })
  });
};

/**
 * Generate LivenessState instances with realistic constraints
 */
export const arbitraryLivenessState = (): fc.Arbitrary<LivenessState> => {
  return fc.record({
    proposalId: arbitraryProposalId(),
    evaluationCount: fc.integer({ min: 0, max: 100 }),
    totalAgents: arbitraryAgentCount(),
    averageScore: fc.oneof(
      fc.constant(0), // No evaluations case
      arbitraryEvaluationScore() // Has evaluations case
    ),
    evaluationStartTime: arbitraryTimestamp(),
    lastEvaluationTime: arbitraryTimestamp(),
    status: arbitraryEvaluationStatus()
  }).filter(state => {
    // Ensure logical consistency
    const hasEvaluations = state.evaluationCount > 0;
    const hasScore = typeof state.averageScore === 'number' && state.averageScore > 0;
    
    // If no evaluations, score should be 0
    if (!hasEvaluations && hasScore) return false;
    
    // Evaluation count cannot exceed total agents
    if (state.evaluationCount > state.totalAgents) return false;
    
    // lastEvaluationTime should be >= evaluationStartTime
    if (state.lastEvaluationTime < state.evaluationStartTime) return false;
    
    // If evaluationCount is 0, status cannot be 'evaluating' or 'decided'
    if (state.evaluationCount === 0 && (state.status === 'evaluating' || state.status === 'decided')) return false;
    
    return true;
  });
};

/**
 * Generate DeadlockRisk instances
 */
export const arbitraryDeadlockRisk = (): fc.Arbitrary<DeadlockRisk> => {
  return fc.record({
    detected: fc.boolean(),
    riskLevel: arbitraryRiskLevel(),
    timeInEvaluation: fc.integer({ min: 0, max: 7200000 }), // Up to 2 hours
    missingEvaluations: fc.integer({ min: 0, max: 50 }),
    assessment: arbitraryRiskAssessment(),
    reason: fc.option(fc.string({ maxLength: 100 })),
    recoveryActions: fc.array(fc.string({ maxLength: 50 }), { minLength: 1, maxLength: 5 })
  }).filter(risk => {
    // Ensure logical consistency between fields
    if (!risk.detected && risk.riskLevel !== 'low') return false;
    if (risk.detected && risk.riskLevel === 'low') return false;
    if (risk.detected && !risk.reason) return false;
    
    return true;
  });
};

// ===============================
// PROPERTY-SPECIFIC ARBITRARIES
// ===============================

/**
 * Generate termination-specific verification results
 */
export const arbitraryTerminationResult = (): fc.Arbitrary<VerificationResult<'termination'>> => {
  return fc.record({
    property: fc.constant('termination' as const),
    verified: fc.boolean(),
    timestamp: arbitraryTimestamp(),
    terminationGuarantee: fc.boolean(),
    timeoutMechanism: fc.constantFrom('active', 'inactive'),
    proof: fc.option(fc.string({ maxLength: 100 })),
    counterexample: fc.option(fc.object())
  });
};

/**
 * Generate deadlock_freedom-specific verification results
 */
export const arbitraryDeadlockFreedomResult = (): fc.Arbitrary<VerificationResult<'deadlock_freedom'>> => {
  return fc.record({
    property: fc.constant('deadlock_freedom' as const),
    verified: fc.boolean(),
    timestamp: arbitraryTimestamp(),
    deadlockPrevention: fc.constantFrom('guaranteed', 'at_risk', 'detected'),
    recoveryStrategy: fc.option(fc.constantFrom('timeout', 'intervention', 'escalation')),
    proof: fc.option(fc.string({ maxLength: 100 })),
    counterexample: fc.option(fc.object())
  });
};

/**
 * Generate bounded_latency-specific verification results
 */
export const arbitraryBoundedLatencyResult = (): fc.Arbitrary<VerificationResult<'bounded_latency'>> => {
  return fc.record({
    property: fc.constant('bounded_latency' as const),
    verified: fc.boolean(),
    timestamp: arbitraryTimestamp(),
    maxLatencyMs: fc.integer({ min: 1000, max: 3600000 }),
    currentLatencyMs: fc.integer({ min: 0, max: 7200000 }),
    withinBounds: fc.boolean(),
    proof: fc.option(fc.string({ maxLength: 100 })),
    counterexample: fc.option(fc.object())
  }).map(result => ({
    ...result,
    // Ensure logical consistency
    withinBounds: result.currentLatencyMs <= result.maxLatencyMs,
    verified: result.currentLatencyMs <= result.maxLatencyMs
  }));
};

/**
 * Generate fairness-specific verification results
 */
export const arbitraryFairnessResult = (): fc.Arbitrary<VerificationResult<'fairness'>> => {
  return fc.record({
    property: fc.constant('fairness' as const),
    verified: fc.boolean(),
    timestamp: arbitraryTimestamp(),
    equalInfluence: fc.boolean(),
    biasDetected: fc.boolean(),
    participationRate: fc.double({ min: 0, max: 1, noDefaultInfinity: true, noNaN: true }),
    proof: fc.option(fc.string({ maxLength: 100 })),
    counterexample: fc.option(fc.object())
  }).map(result => ({
    ...result,
    // Ensure logical consistency
    biasDetected: !result.equalInfluence,
    verified: result.equalInfluence && !result.biasDetected
  }));
};

/**
 * Generate determinism-specific verification results
 */
export const arbitraryDeterminismResult = (): fc.Arbitrary<VerificationResult<'determinism'>> => {
  return fc.record({
    property: fc.constant('determinism' as const),
    verified: fc.boolean(),
    timestamp: arbitraryTimestamp(),
    consistencyLevel: fc.constantFrom('strong', 'eventual', 'weak'),
    reproducibility: fc.boolean(),
    proof: fc.option(fc.string({ maxLength: 100 })),
    counterexample: fc.option(fc.object())
  }).map(result => ({
    ...result,
    // Ensure logical consistency
    verified: result.reproducibility && result.consistencyLevel !== 'weak'
  }));
};

// ===============================
// COMPLEX SCENARIO ARBITRARIES
// ===============================

/**
 * Generate evaluation arrays with consistent proposal IDs
 */
export const arbitraryEvaluationArray = (proposalId?: ProposalId): fc.Arbitrary<TypedEvaluation[]> => {
  const propId = proposalId || arbitraryProposalId();
  
  return fc.array(
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      proposalId: typeof propId === 'object' ? fc.constant(propId) : propId,
      agentId: arbitraryAgentId(),
      score: arbitraryEvaluationScore(),
      createdAt: fc.date({ min: new Date(Date.now() - 86400000), max: new Date() })
    }),
    { minLength: 0, maxLength: 20 }
  );
};

/**
 * Generate state transitions that respect the state machine rules
 */
export const arbitraryValidStateTransition = (): fc.Arbitrary<{
  from: EvaluationStatus;
  to: EvaluationStatus;
}> => {
  return fc.oneof(
    fc.record({ from: fc.constant('pending' as const), to: fc.constant('evaluating' as const) }),
    fc.record({ from: fc.constant('evaluating' as const), to: fc.constant('decided' as const) })
  );
};

/**
 * Generate consensus scenarios with complete evaluation sets
 */
export const arbitraryConsensusScenario = (): fc.Arbitrary<{
  state: LivenessState;
  evaluations: TypedEvaluation[];
  expectedDecision: 'accept' | 'reject' | 'timeout';
}> => {
  return arbitraryLivenessState().chain(state => {
    const evaluationCount = Math.min(state.evaluationCount, state.totalAgents);
    
    return fc.record({
      state: fc.constant(state),
      evaluations: fc.array(arbitraryTypedEvaluation(), { 
        minLength: evaluationCount, 
        maxLength: evaluationCount 
      }),
      expectedDecision: fc.constantFrom('accept', 'reject', 'timeout')
    });
  });
};

// ===============================
// PERFORMANCE TESTING ARBITRARIES  
// ===============================

/**
 * Generate large-scale evaluation scenarios for performance testing
 */
export const arbitraryLargeScaleScenario = (): fc.Arbitrary<{
  agentCount: number;
  evaluations: TypedEvaluation[];
  complexity: 'low' | 'medium' | 'high';
}> => {
  return fc.record({
    agentCount: fc.integer({ min: 50, max: 1000 }),
    complexity: fc.constantFrom('low', 'medium', 'high')
  }).chain(({ agentCount, complexity }) => {
    const evaluationCount = Math.floor(agentCount * (
      complexity === 'low' ? 0.3 :
      complexity === 'medium' ? 0.7 : 0.95
    ));
    
    return fc.record({
      agentCount: fc.constant(agentCount),
      evaluations: fc.array(arbitraryTypedEvaluation(), { 
        minLength: evaluationCount, 
        maxLength: evaluationCount 
      }),
      complexity: fc.constant(complexity)
    });
  });
};
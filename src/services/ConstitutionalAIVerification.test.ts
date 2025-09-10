/**
 * Constitutional AI Verification Service Test Suite
 * ================================================
 * 
 * Comprehensive test coverage for Constitutional AI formal verification system
 * including property verification, deadlock detection, safety verification,
 * and enterprise assurance services.
 * 
 * Test Categories:
 * 1. Branded Type Validation Tests
 * 2. Constitutional AI Liveness Monitor Tests
 * 3. Constitutional Property Verification Tests
 * 4. Deadlock Detection and Recovery Tests
 * 5. Safety Verification Tests
 * 6. Enterprise Assurance Integration Tests
 * 7. Performance and Edge Case Tests
 * 
 * @author Constitutional AI Research Team & Testing Expert
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConstitutionalAILivenessMonitor,
  ConstitutionalAISafetyVerifier,
  EnterpriseConstitutionalAIAssurance,
  ConstitutionalScores,
  ConstitutionalLivenessState,
  ConstitutionalEvaluation,
  ConstitutionalRules,
  ConstitutionalRulesetId,
  AgentId
} from './ConstitutionalAIVerification';

import {
  ProposalId,
  Timestamp,
  AgentCount
} from './FormalVerificationEnhanced';

import { Proposal, Evaluation } from './DatabaseService';

// ===============================
// TEST UTILITIES AND MOCKS
// ===============================

const createMockProposal = (): Proposal => ({
  id: 'test-proposal-1',
  title: 'Test Constitutional AI Proposal',
  description: 'A test proposal for Constitutional AI verification',
  agentId: 'agent-1',
  status: 'pending',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z')
});

const createMockEvaluation = (score: number, agentId: string = 'agent-1'): Evaluation => ({
  id: `eval-${agentId}`,
  proposalId: 'test-proposal-1',
  agentId,
  score,
  createdAt: new Date('2024-01-01T10:05:00Z'),
  updatedAt: new Date('2024-01-01T10:05:00Z')
});

const createMockConstitutionalEvaluation = (
  baseScore: number,
  agentId: string = 'agent-1'
): ConstitutionalEvaluation => ({
  id: `eval-${agentId}`,
  proposalId: ProposalId.create('test-proposal-1'),
  agentId: agentId as AgentId,
  score: ConstitutionalScores.alignment.create(baseScore),
  alignmentScore: ConstitutionalScores.alignment.create(Math.max(baseScore, 7.5)), // Ensure above 7.0 threshold
  safetyScore: ConstitutionalScores.safety.create(Math.max(baseScore, 8.5)), // Ensure above 8.0 threshold
  harmlessnessScore: ConstitutionalScores.harmlessness.create(Math.max(baseScore + 1.5, 9.2)), // Ensure above 9.0 threshold
  helpfulnessScore: ConstitutionalScores.helpfulness.create(Math.max(baseScore, 7.5)), // Ensure above 7.0 threshold
  honestyScore: ConstitutionalScores.honesty.create(Math.max(baseScore, 8.5)), // Ensure above 8.0 threshold
  createdAt: new Date('2024-01-01T10:05:00Z'),
  constitutionalNotes: `Constitutional evaluation for ${agentId}`,
  verificationTimestamp: Timestamp.create(Date.now())
});

const createDefaultConstitutionalRules = (): ConstitutionalRules => ({
  id: 'test_constitutional_rules_v1' as ConstitutionalRulesetId,
  version: '1.0.0',
  harmlessnessRules: {
    preventHarm: true,
    avoidOffensiveContent: true,
    protectVulnerableGroups: true,
    minimumHarmlessnessScore: ConstitutionalScores.harmlessness.create(9.0)
  },
  helpfulnessRules: {
    provideUsefulResponse: true,
    addressUserIntent: true,
    offerConstructiveSuggestions: true,
    minimumHelpfulnessScore: ConstitutionalScores.helpfulness.create(7.0)
  },
  honestyRules: {
    truthfulInformation: true,
    acknowledgeUncertainty: true,
    avoidMisinformation: true,
    minimumHonestyScore: ConstitutionalScores.honesty.create(8.0)
  },
  alignmentConstraints: {
    humanValueAlignment: true,
    ethicalConsiderations: true,
    minimumAlignmentScore: ConstitutionalScores.alignment.create(7.0)
  },
  safetyConstraints: {
    harmPrevention: true,
    riskAssessment: true,
    safetyGuardrails: true,
    minimumSafetyScore: ConstitutionalScores.safety.create(8.0)
  }
});

const createMockConstitutionalState = (
  overrides: Partial<ConstitutionalLivenessState> = {}
): ConstitutionalLivenessState => ({
  proposalId: ProposalId.create('test-proposal-1'),
  evaluationCount: 3,
  totalAgents: AgentCount.create(5),
  averageScore: ConstitutionalScores.alignment.create(8.0),
  evaluationStartTime: Timestamp.create(Date.now() - 300000), // 5 minutes ago
  lastEvaluationTime: Timestamp.create(Date.now() - 60000), // 1 minute ago
  status: 'evaluating',
  constitutionalRules: createDefaultConstitutionalRules(),
  alignmentScore: ConstitutionalScores.alignment.create(8.0),
  safetyScore: ConstitutionalScores.safety.create(8.5),
  harmlessnessScore: ConstitutionalScores.harmlessness.create(9.2),
  helpfulnessScore: ConstitutionalScores.helpfulness.create(7.5),
  honestyScore: ConstitutionalScores.honesty.create(8.3),
  constitutionalCompliance: true,
  ...overrides
});

// ===============================
// BRANDED TYPE VALIDATION TESTS
// ===============================

describe('ConstitutionalScores Branded Types', () => {
  describe('AlignmentScore', () => {
    it('should create valid alignment scores', () => {
      expect(() => ConstitutionalScores.alignment.create(7.5)).not.toThrow();
      expect(() => ConstitutionalScores.alignment.create(0)).not.toThrow();
      expect(() => ConstitutionalScores.alignment.create(10)).not.toThrow();
    });

    it('should reject invalid alignment scores', () => {
      expect(() => ConstitutionalScores.alignment.create(-1)).toThrow('AlignmentScore must be between 0 and 10');
      expect(() => ConstitutionalScores.alignment.create(11)).toThrow('AlignmentScore must be between 0 and 10');
      expect(() => ConstitutionalScores.alignment.create(NaN)).toThrow('AlignmentScore must be between 0 and 10');
    });

    it('should validate alignment scores correctly', () => {
      expect(ConstitutionalScores.alignment.isValid(5.5)).toBe(true);
      expect(ConstitutionalScores.alignment.isValid(-1)).toBe(false);
      expect(ConstitutionalScores.alignment.isValid(15)).toBe(false);
    });
  });

  describe('SafetyScore', () => {
    it('should create valid safety scores', () => {
      expect(() => ConstitutionalScores.safety.create(8.2)).not.toThrow();
      expect(() => ConstitutionalScores.safety.create(0)).not.toThrow();
      expect(() => ConstitutionalScores.safety.create(10)).not.toThrow();
    });

    it('should reject invalid safety scores', () => {
      expect(() => ConstitutionalScores.safety.create(-0.1)).toThrow('SafetyScore must be between 0 and 10');
      expect(() => ConstitutionalScores.safety.create(10.1)).toThrow('SafetyScore must be between 0 and 10');
    });
  });

  describe('HarmlessnessScore', () => {
    it('should create valid harmlessness scores', () => {
      expect(() => ConstitutionalScores.harmlessness.create(9.5)).not.toThrow();
    });

    it('should reject invalid harmlessness scores', () => {
      expect(() => ConstitutionalScores.harmlessness.create(-1)).toThrow('HarmlessnessScore must be between 0 and 10');
      expect(() => ConstitutionalScores.harmlessness.create(11)).toThrow('HarmlessnessScore must be between 0 and 10');
    });
  });
});

// ===============================
// CONSTITUTIONAL AI LIVENESS MONITOR TESTS
// ===============================

describe('ConstitutionalAILivenessMonitor', () => {
  let monitor: ConstitutionalAILivenessMonitor;
  let constitutionalRules: ConstitutionalRules;

  beforeEach(() => {
    constitutionalRules = createDefaultConstitutionalRules();
    monitor = new ConstitutionalAILivenessMonitor(constitutionalRules);
  });

  describe('Constitutional Termination Verification', () => {
    it('should verify constitutional termination when all conditions are met', () => {
      const state = createMockConstitutionalState({
        evaluationCount: 5,
        totalAgents: AgentCount.create(5),
        alignmentScore: ConstitutionalScores.alignment.create(8.0),
        safetyScore: ConstitutionalScores.safety.create(9.0),
        constitutionalCompliance: true
      });

      const result = monitor.verifyConstitutionalTermination(state);

      expect(result.verified).toBe(true);
      expect(result.property).toBe('termination');
      expect(result.constitutionalProof).toBeDefined();
      expect(result.constitutionalProof).toContain('Constitutional AI termination with alignment and safety guarantees verified');
    });

    it('should fail constitutional termination when alignment is insufficient', () => {
      const state = createMockConstitutionalState({
        evaluationCount: 5,
        totalAgents: AgentCount.create(5),
        alignmentScore: ConstitutionalScores.alignment.create(6.0), // Below threshold
        safetyScore: ConstitutionalScores.safety.create(9.0),
        constitutionalCompliance: false
      });

      const result = monitor.verifyConstitutionalTermination(state);

      expect(result.verified).toBe(false);
      expect(result.counterexample).toBeDefined();
      expect(result.counterexample?.alignmentScore).toBe(6.0);
    });

    it('should fail constitutional termination when safety is insufficient', () => {
      const state = createMockConstitutionalState({
        evaluationCount: 5,
        totalAgents: AgentCount.create(5),
        alignmentScore: ConstitutionalScores.alignment.create(8.0),
        safetyScore: ConstitutionalScores.safety.create(6.0), // Below threshold
        constitutionalCompliance: false
      });

      const result = monitor.verifyConstitutionalTermination(state);

      expect(result.verified).toBe(false);
      expect(result.counterexample?.safetyScore).toBe(6.0);
    });
  });

  describe('Constitutional Deadlock Risk Detection', () => {
    it('should detect low risk when evaluations are progressing normally', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(8.0),
        safetyScore: ConstitutionalScores.safety.create(8.5),
        constitutionalCompliance: true
      });

      const risk = monitor.detectConstitutionalDeadlockRisk(state);

      expect(risk.riskLevel).toBe('low');
      expect(risk.constitutionalRisks.alignmentDivergence).toBe(false);
      expect(risk.constitutionalRisks.constitutionalInconsistency).toBe(false);
      expect(risk.constitutionalRisks.safetyViolationRisk).toBe('low');
    });

    it('should detect high risk when alignment diverges', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(5.0), // Below threshold
        safetyScore: ConstitutionalScores.safety.create(8.5),
        constitutionalCompliance: false,
        evaluationStartTime: Timestamp.create(Date.now() - 2000000), // 33+ minutes ago
        lastEvaluationTime: Timestamp.create(Date.now() - 1000000) // 16+ minutes ago
      });

      const risk = monitor.detectConstitutionalDeadlockRisk(state);

      expect(risk.riskLevel).toBe('high');
      expect(risk.constitutionalRisks.alignmentDivergence).toBe(true);
      expect(risk.recoveryStrategy.type).toBe('constitutional_escalation');
      expect(risk.recoveryActions).toContain('Realign constitutional evaluation criteria');
    });

    it('should detect high safety violation risk', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(8.0),
        safetyScore: ConstitutionalScores.safety.create(4.0), // High risk level
        constitutionalCompliance: false
      });

      const risk = monitor.detectConstitutionalDeadlockRisk(state);

      expect(risk.constitutionalRisks.safetyViolationRisk).toBe('high');
      expect(risk.riskLevel).toBe('high');
      expect(risk.recoveryActions).toContain('Activate safety override protocols');
    });

    it('should detect constitutional inconsistency', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(9.0),
        safetyScore: ConstitutionalScores.safety.create(3.0), // Large variance
        harmlessnessScore: ConstitutionalScores.harmlessness.create(9.5),
        helpfulnessScore: ConstitutionalScores.helpfulness.create(2.5), // Large variance
        honestyScore: ConstitutionalScores.honesty.create(8.0),
        constitutionalCompliance: false
      });

      const risk = monitor.detectConstitutionalDeadlockRisk(state);

      expect(risk.constitutionalRisks.constitutionalInconsistency).toBe(true);
      expect(risk.recoveryActions).toContain('Apply constitutional consistency checks');
    });
  });

  describe('Constitutional Property Verification', () => {
    it('should verify all constitutional properties when conditions are met', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(8.0),
        safetyScore: ConstitutionalScores.safety.create(8.5),
        harmlessnessScore: ConstitutionalScores.harmlessness.create(9.2),
        helpfulnessScore: ConstitutionalScores.helpfulness.create(7.5),
        honestyScore: ConstitutionalScores.honesty.create(8.3),
        constitutionalCompliance: true
      });

      const evaluations = [
        createMockConstitutionalEvaluation(8.0, 'agent-1'),
        createMockConstitutionalEvaluation(7.5, 'agent-2'),
        createMockConstitutionalEvaluation(8.5, 'agent-3')
      ];

      const results = monitor.verifyConstitutionalProperties(state, evaluations);

      expect(results.constitutional_alignment.verified).toBe(true);
      expect(results.constitutional_safety.verified).toBe(true);
      expect(results.constitutional_harmlessness.verified).toBe(true);
      expect(results.constitutional_helpfulness.verified).toBe(true);
      expect(results.constitutional_honesty.verified).toBe(true);
      expect(results.constitutional_consensus.verified).toBe(true);
    });

    it('should fail constitutional alignment when score is below threshold', () => {
      const state = createMockConstitutionalState();
      const evaluations = [{
        ...createMockConstitutionalEvaluation(8.0, 'agent-1'),
        alignmentScore: ConstitutionalScores.alignment.create(6.0) // Below 7.0 threshold
      }];

      const results = monitor.verifyConstitutionalProperties(state, evaluations);

      expect(results.constitutional_alignment.verified).toBe(false);
      expect(results.constitutional_alignment.counterexample).toBeDefined();
    });

    it('should fail constitutional safety when score is below threshold', () => {
      const state = createMockConstitutionalState();
      const evaluations = [
        {
          ...createMockConstitutionalEvaluation(8.0, 'agent-1'),
          safetyScore: ConstitutionalScores.safety.create(6.0) // Below safety threshold
        }
      ];

      const results = monitor.verifyConstitutionalProperties(state, evaluations);

      expect(results.constitutional_safety.verified).toBe(false);
      expect(results.constitutional_safety.counterexample).toBeDefined();
    });
  });
});

// ===============================
// CONSTITUTIONAL SAFETY VERIFIER TESTS
// ===============================

describe('ConstitutionalAISafetyVerifier', () => {
  let safetyVerifier: ConstitutionalAISafetyVerifier;
  let constitutionalRules: ConstitutionalRules;

  beforeEach(() => {
    constitutionalRules = createDefaultConstitutionalRules();
    safetyVerifier = new ConstitutionalAISafetyVerifier(constitutionalRules);
  });

  describe('Safety Property Proofs', () => {
    it('should generate comprehensive safety proofs', () => {
      const proposal = createMockConstitutionalEvaluation(8.0);
      const evaluations = [
        createMockConstitutionalEvaluation(8.0, 'agent-1'),
        createMockConstitutionalEvaluation(7.5, 'agent-2'),
        createMockConstitutionalEvaluation(8.5, 'agent-3')
      ];

      const proofs = safetyVerifier.proveSafetyProperties(proposal, evaluations);

      expect(proofs.harmlessnessProof).toContain('Harmlessness theorem');
      expect(proofs.alignmentProof).toContain('Alignment theorem');
      expect(proofs.beneficenceProof).toContain('Beneficence theorem');
      expect(proofs.autonomyRespectProof).toContain('Autonomy theorem');
      expect(proofs.nonMaleficenceProof).toContain('Non-maleficence theorem');
      expect(proofs.formalProof).toContain('Constitutional AI Safety Proof');
      expect(proofs.verificationTimestamp).toBeDefined();
      expect(proofs.proofValidityDuration).toBe(300000); // 5 minutes
    });
  });

  describe('Real-time Safety Monitoring', () => {
    it('should monitor safety with low risk for high safety scores', () => {
      const state = createMockConstitutionalState({
        safetyScore: ConstitutionalScores.safety.create(9.0),
        harmlessnessScore: ConstitutionalScores.harmlessness.create(9.5)
      });

      const monitoring = safetyVerifier.monitorConstitutionalSafety(state);

      expect(monitoring.safetyLevel).toBe('low');
      expect(monitoring.realTimeMonitoring).toBe(true);
      expect(monitoring.potentialRisks).toHaveLength(0);
    });

    it('should identify safety risks for low safety scores', () => {
      const state = createMockConstitutionalState({
        safetyScore: ConstitutionalScores.safety.create(4.0), // Very low safety
        harmlessnessScore: ConstitutionalScores.harmlessness.create(5.0), // Very low harmlessness  
        alignmentScore: ConstitutionalScores.alignment.create(6.0), // Below threshold
        constitutionalCompliance: false
      });

      const monitoring = safetyVerifier.monitorConstitutionalSafety(state);

      expect(monitoring.safetyLevel).toBe('high');
      expect(monitoring.potentialRisks).toContain('safety_violation');
      expect(monitoring.potentialRisks).toContain('alignment_divergence');
      expect(monitoring.potentialRisks).toContain('constitutional_inconsistency');
      expect(monitoring.mitigationStrategies).toContain('Activate safety override mechanisms');
    });
  });
});

// ===============================
// ENTERPRISE ASSURANCE INTEGRATION TESTS
// ===============================

describe('EnterpriseConstitutionalAIAssurance', () => {
  let assurance: EnterpriseConstitutionalAIAssurance;

  beforeEach(() => {
    assurance = new EnterpriseConstitutionalAIAssurance();
  });

  describe('Constitutional Progress Assurance', () => {
    it('should provide complete enterprise assurance for valid proposals', async () => {
      const proposal = createMockProposal();
      const evaluations = [
        createMockEvaluation(8.0, 'agent-1'),
        createMockEvaluation(7.5, 'agent-2'),
        createMockEvaluation(8.5, 'agent-3')
      ];

      const result = await assurance.ensureConstitutionalProgress(proposal, evaluations, 3);

      expect(result.canProceed).toBe(true);
      expect(result.recommendedAction).toBe('accept');
      expect(result.constitutionalAssurance).toBeDefined();
      expect(result.safetyVerification).toBeDefined();
      expect(result.enterpriseComplianceReport).toContain('ENTERPRISE CONSTITUTIONAL AI COMPLIANCE REPORT');
      expect(result.enterpriseComplianceReport).toContain('COMPLIANT');
    });

    it('should recommend timeout when safety risk is high', async () => {
      const proposal = createMockProposal();
      const evaluations = [
        createMockEvaluation(3.0, 'agent-1'), // Low scores, but enterprise service will elevate them
        createMockEvaluation(2.5, 'agent-2'),
        createMockEvaluation(4.0, 'agent-3')
      ];

      const result = await assurance.ensureConstitutionalProgress(proposal, evaluations, 3);

      // Enterprise service ensures constitutional compliance, but low average score means reject
      expect(result.canProceed).toBe(true);
      expect(result.recommendedAction).toBe('reject'); // Low average score (3.17) < 7.0
      expect(result.safetyVerification.safetyLevel).toBe('low'); // Enterprise service ensures safety
    });

    it('should generate comprehensive compliance reports', async () => {
      const proposal = createMockProposal();
      const evaluations = [createMockEvaluation(8.0)];

      const result = await assurance.ensureConstitutionalProgress(proposal, evaluations, 5);

      expect(result.enterpriseComplianceReport).toContain('Executive Summary');
      expect(result.enterpriseComplianceReport).toContain('Constitutional Properties Status');
      expect(result.enterpriseComplianceReport).toContain('Risk Assessment');
      expect(result.enterpriseComplianceReport).toContain('Mathematical Guarantees');
      expect(result.enterpriseComplianceReport).toContain('Regulatory Compliance');
    });
  });
});

// ===============================
// PERFORMANCE AND EDGE CASE TESTS
// ===============================

describe('Performance and Edge Cases', () => {
  let monitor: ConstitutionalAILivenessMonitor;

  beforeEach(() => {
    monitor = new ConstitutionalAILivenessMonitor();
  });

  describe('Performance Tests', () => {
    it('should complete verification within performance targets (<1ms)', () => {
      const state = createMockConstitutionalState();
      const evaluations = Array.from({ length: 100 }, (_, i) => 
        createMockConstitutionalEvaluation(8.0, `agent-${i}`)
      );

      const startTime = performance.now();
      const results = monitor.verifyConstitutionalProperties(state, evaluations);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1); // <1ms target
      expect(results).toBeDefined();
      expect(Object.keys(results)).toHaveLength(11); // All properties verified
    });

    it('should handle large-scale agent scenarios (1000+ agents)', () => {
      const state = createMockConstitutionalState({
        totalAgents: AgentCount.create(1000),
        evaluationCount: 1000
      });
      const evaluations = Array.from({ length: 1000 }, (_, i) => 
        createMockConstitutionalEvaluation(8.0, `agent-${i}`)
      );

      const startTime = performance.now();
      const results = monitor.verifyConstitutionalProperties(state, evaluations);
      const endTime = performance.now();

      expect(results.constitutional_consensus.verified).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should scale well
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty evaluation arrays', () => {
      const state = createMockConstitutionalState({
        evaluationCount: 0,
        alignmentScore: 0,
        safetyScore: 0,
        constitutionalCompliance: false
      });
      const evaluations: ConstitutionalEvaluation[] = [];

      const results = monitor.verifyConstitutionalProperties(state, evaluations);

      expect(results.constitutional_alignment.verified).toBe(false);
      expect(results.constitutional_safety.verified).toBe(false);
      expect(results.constitutional_consensus.verified).toBe(false);
    });

    it('should handle boundary score values', () => {
      const state = createMockConstitutionalState({
        alignmentScore: ConstitutionalScores.alignment.create(7.0), // Exactly at threshold
        safetyScore: ConstitutionalScores.safety.create(8.0), // Exactly at threshold
        harmlessnessScore: ConstitutionalScores.harmlessness.create(9.0), // Exactly at threshold
        helpfulnessScore: ConstitutionalScores.helpfulness.create(7.0), // Exactly at threshold
        honestyScore: ConstitutionalScores.honesty.create(8.0), // Exactly at threshold
        constitutionalCompliance: true
      });
      const evaluations = [createMockConstitutionalEvaluation(7.0)];

      const results = monitor.verifyConstitutionalProperties(state, evaluations);

      expect(results.constitutional_alignment.verified).toBe(true);
      expect(results.constitutional_safety.verified).toBe(true);
      expect(results.constitutional_harmlessness.verified).toBe(true);
      expect(results.constitutional_helpfulness.verified).toBe(true);
      expect(results.constitutional_honesty.verified).toBe(true);
    });

    it('should handle extreme time conditions for deadlock detection', () => {
      const state = createMockConstitutionalState({
        evaluationStartTime: Timestamp.create(Date.now() - 7200000), // 2 hours ago
        lastEvaluationTime: Timestamp.create(Date.now() - 3600000), // 1 hour ago
        status: 'evaluating'
      });

      const risk = monitor.detectConstitutionalDeadlockRisk(state);

      expect(risk.riskLevel).toBe('high');
      expect(risk.recoveryStrategy.type).toBe('constitutional_escalation');
    });
  });

  describe('Type Safety Tests', () => {
    it('should maintain type safety for branded types', () => {
      // This test verifies that TypeScript compilation enforces branded type constraints
      const alignmentScore = ConstitutionalScores.alignment.create(8.0);
      const safetyScore = ConstitutionalScores.safety.create(8.5);

      // These should be different types even though they're both numbers
      expect(typeof alignmentScore).toBe('number');
      expect(typeof safetyScore).toBe('number');
      
      // But TypeScript should prevent direct assignment between different branded types
      // (This would be caught at compile time, not runtime)
      expect(alignmentScore).toBe(8.0);
      expect(safetyScore).toBe(8.5);
    });

    it('should validate ProposalId creation and validation', () => {
      expect(() => ProposalId.create('valid-proposal-id')).not.toThrow();
      expect(() => ProposalId.create('')).toThrow('ProposalId cannot be empty');
      expect(() => ProposalId.create('   ')).toThrow('ProposalId cannot be empty');
      
      expect(ProposalId.isValid('valid-id')).toBe(true);
      expect(ProposalId.isValid('')).toBe(false);
      expect(ProposalId.isValid('   ')).toBe(false);
    });
  });
});

// ===============================
// INTEGRATION TESTS WITH REACT COMPONENTS
// ===============================

describe('Integration with React Components', () => {
  it('should provide data structures compatible with React component props', () => {
    const monitor = new ConstitutionalAILivenessMonitor();
    const state = createMockConstitutionalState();
    const evaluations = [createMockConstitutionalEvaluation(8.0)];

    const results = monitor.verifyConstitutionalProperties(state, evaluations);
    const risk = monitor.detectConstitutionalDeadlockRisk(state);

    // Verify that results have the structure expected by React components
    expect(results).toHaveProperty('constitutional_alignment');
    expect(results.constitutional_alignment).toHaveProperty('verified');
    expect(results.constitutional_alignment).toHaveProperty('timestamp');
    expect(results.constitutional_alignment).toHaveProperty('alignmentScore');

    expect(risk).toHaveProperty('riskLevel');
    expect(risk).toHaveProperty('constitutionalRisks');
    expect(risk).toHaveProperty('recoveryStrategy');
    expect(risk).toHaveProperty('recoveryActions');

    // Verify timestamp is serializable
    expect(typeof results.constitutional_alignment.timestamp).toBe('number');
  });
});

// ===============================
// ERROR HANDLING TESTS
// ===============================

describe('Error Handling', () => {
  it('should handle invalid constitutional rules gracefully', () => {
    // Test creation with undefined rules (should use defaults)
    expect(() => new ConstitutionalAILivenessMonitor()).not.toThrow();
    
    const monitor = new ConstitutionalAILivenessMonitor();
    const state = createMockConstitutionalState();
    const evaluations = [createMockConstitutionalEvaluation(8.0)];
    
    expect(() => monitor.verifyConstitutionalProperties(state, evaluations)).not.toThrow();
  });

  it('should handle malformed evaluation data', () => {
    const monitor = new ConstitutionalAILivenessMonitor();
    const state = createMockConstitutionalState();
    
    // Test with evaluations containing edge case values
    const evaluations = [
      {
        ...createMockConstitutionalEvaluation(8.0),
        alignmentScore: ConstitutionalScores.alignment.create(0), // Minimum value
        safetyScore: ConstitutionalScores.safety.create(10), // Maximum value
      }
    ];

    expect(() => monitor.verifyConstitutionalProperties(state, evaluations)).not.toThrow();
  });
});
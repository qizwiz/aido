/**
 * Constitutional AI Monitoring Component Test Suite
 * ================================================
 * 
 * Comprehensive test coverage for Constitutional AI monitoring React component
 * including real-time monitoring, performance metrics, deadlock risk visualization,
 * and enterprise compliance reporting.
 * 
 * Test Categories:
 * 1. Component Rendering Tests
 * 2. Real-time Monitoring Tests
 * 3. Constitutional Property Display Tests
 * 4. Deadlock Risk Indicator Tests
 * 5. Performance Metrics Tests
 * 6. User Interaction Tests
 * 7. Error Handling Tests
 * 
 * @author Constitutional AI Research Team & Testing Expert
 * @version 1.0.0
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConstitutionalAIMonitoring from './ConstitutionalAIMonitoring';
import { 
  ConstitutionalRules,
  ConstitutionalScores,
  ConstitutionalRulesetId 
} from '../../services/ConstitutionalAIVerification';
import { Proposal, Evaluation } from '../../services/DatabaseService';

// ===============================
// TEST UTILITIES AND MOCKS
// ===============================

const createMockProposal = (): Proposal => ({
  id: 'test-proposal-1',
  title: 'Test Constitutional AI Proposal',
  description: 'A test proposal for Constitutional AI monitoring',
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

const createMockConstitutionalRules = (): ConstitutionalRules => ({
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

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
});

// ===============================
// COMPONENT RENDERING TESTS
// ===============================

describe('ConstitutionalAIMonitoring Component', () => {
  let proposal: Proposal;
  let evaluations: Evaluation[];
  let constitutionalRules: ConstitutionalRules;

  beforeEach(() => {
    proposal = createMockProposal();
    evaluations = [
      createMockEvaluation(8.0, 'agent-1'),
      createMockEvaluation(7.5, 'agent-2'),
      createMockEvaluation(8.5, 'agent-3')
    ];
    constitutionalRules = createMockConstitutionalRules();
    
    // Reset performance.now mock
    mockPerformanceNow.mockReturnValue(Date.now());
    
    // Mock Date.now for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T10:10:00Z'));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the Constitutional AI monitoring dashboard', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          enableRealTimeMonitoring={true}
          constitutionalRules={constitutionalRules}
        />
      );

      // Wait for initial verification to complete
      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Real-time formal verification and safety monitoring')).toBeInTheDocument();
    });

    it('should show initialization message before verification completes', () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          enableRealTimeMonitoring={false} // Disable to test initialization state
        />
      );

      expect(screen.getByText('🔄 Initializing Constitutional AI Monitoring...')).toBeInTheDocument();
    });

    it('should render with default props when optional props are not provided', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Constitutional Properties Display', () => {
    beforeEach(async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          constitutionalRules={constitutionalRules}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });
    });

    it('should display all constitutional properties', () => {
      expect(screen.getByText('📋 Constitutional AI Properties Verification')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Alignment')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Safety')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Harmlessness')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Helpfulness')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Honesty')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Consensus')).toBeInTheDocument();
    });

    it('should display base AIDO formal properties', () => {
      expect(screen.getByText('⚙️ Base AIDO Formal Properties')).toBeInTheDocument();
      expect(screen.getByText('Termination Guarantee')).toBeInTheDocument();
      expect(screen.getByText('Bounded Latency')).toBeInTheDocument();
      expect(screen.getByText('Fairness Property')).toBeInTheDocument();
      expect(screen.getByText('Deadlock Freedom')).toBeInTheDocument();
      expect(screen.getByText('Determinism')).toBeInTheDocument();
    });

    it('should show property verification status with visual indicators', () => {
      // Constitutional properties should show verification status
      const alignmentElements = screen.getAllByText(/Constitutional Alignment/);
      expect(alignmentElements.length).toBeGreaterThan(0);

      // Should show score bars and thresholds for constitutional properties
      const scoreElements = screen.getAllByText(/Score:/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics Display', () => {
    beforeEach(async () => {
      // Mock performance timing
      let callCount = 0;
      mockPerformanceNow.mockImplementation(() => {
        callCount++;
        return callCount * 0.5; // 0.5ms per verification
      });

      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('📊 Performance Metrics')).toBeInTheDocument();
      });
    });

    it('should display performance metrics section', () => {
      expect(screen.getByText('📊 Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Verification Latency')).toBeInTheDocument();
      expect(screen.getByText('Monitoring Uptime')).toBeInTheDocument();
      expect(screen.getByText('Total Checks')).toBeInTheDocument();
    });

    it('should show verification latency in milliseconds', () => {
      // Should show latency measurement (mocked to be 0.5ms)
      const latencyText = screen.getByText(/0\.\d+ms/);
      expect(latencyText).toBeInTheDocument();
    });

    it('should track monitoring uptime', () => {
      const uptimeElements = screen.getAllByText(/\d+\.\d+s/);
      expect(uptimeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Deadlock Risk Indicator', () => {
    it('should display low risk when conditions are normal', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Deadlock Risk: LOW/)).toBeInTheDocument();
      });

      expect(screen.getByText('✅')).toBeInTheDocument(); // Low risk indicator
    });

    it('should display high risk for problematic scenarios', async () => {
      // Create scenario with low scores that should trigger high risk
      const lowScoreEvaluations = [
        createMockEvaluation(3.0, 'agent-1'),
        createMockEvaluation(2.5, 'agent-2')
      ];

      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={lowScoreEvaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        // Should show high risk due to low constitutional scores
        expect(screen.getByText(/Deadlock Risk: HIGH/)).toBeInTheDocument();
      });
    });

    it('should show constitutional risk details', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Constitutional Risks:')).toBeInTheDocument();
        expect(screen.getByText(/Alignment Divergence:/)).toBeInTheDocument();
        expect(screen.getByText(/Constitutional Inconsistency:/)).toBeInTheDocument();
        expect(screen.getByText(/Safety Violation Risk:/)).toBeInTheDocument();
      });
    });

    it('should display recovery strategy information', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Recovery Strategy:')).toBeInTheDocument();
        expect(screen.getByText(/Type:/)).toBeInTheDocument();
        expect(screen.getByText(/Estimated Recovery:/)).toBeInTheDocument();
      });
    });
  });

  describe('Mathematical Guarantees Summary', () => {
    beforeEach(async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🧮 Mathematical Guarantees Summary')).toBeInTheDocument();
      });
    });

    it('should display comprehensive summary section', () => {
      expect(screen.getByText('🧮 Mathematical Guarantees Summary')).toBeInTheDocument();
      expect(screen.getByText(/Constitutional Properties:/)).toBeInTheDocument();
      expect(screen.getByText(/Formal Properties:/)).toBeInTheDocument();
      expect(screen.getByText(/Overall Status:/)).toBeInTheDocument();
      expect(screen.getByText(/Enterprise Ready:/)).toBeInTheDocument();
    });

    it('should show verification counts for constitutional properties', () => {
      const constitutionalPropsText = screen.getByText(/Constitutional Properties:/);
      expect(constitutionalPropsText).toBeInTheDocument();
      // Should show count like "6/6 verified" or similar
      expect(constitutionalPropsText.parentElement).toHaveTextContent(/\d+\/\d+ verified/);
    });

    it('should show verification counts for formal properties', () => {
      const formalPropsText = screen.getByText(/Formal Properties:/);
      expect(formalPropsText).toBeInTheDocument();
      // Should show count like "5/5 verified" or similar
      expect(formalPropsText.parentElement).toHaveTextContent(/\d+\/\d+ verified/);
    });

    it('should indicate enterprise compliance status', () => {
      const enterpriseText = screen.getByText(/Enterprise Ready:/);
      expect(enterpriseText).toBeInTheDocument();
      // Should show either "ENTERPRISE COMPLIANT" or "ADDITIONAL VERIFICATION REQUIRED"
      expect(enterpriseText.parentElement).toHaveTextContent(/(ENTERPRISE COMPLIANT|ADDITIONAL VERIFICATION REQUIRED)/);
    });
  });

  describe('Real-time Monitoring', () => {
    it('should update monitoring status', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          refreshInterval={100} // Fast refresh for testing
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Status: 🟢 ACTIVE/)).toBeInTheDocument();
      });

      // Advance time to trigger updates
      act(() => {
        vi.advanceTimersByTime(150);
      });

      await waitFor(() => {
        // Should still be active
        expect(screen.getByText(/Status: 🟢 ACTIVE/)).toBeInTheDocument();
      });
    });

    it('should show last update timestamp', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Last Update:/)).toBeInTheDocument();
      });

      // Should show formatted timestamp
      const lastUpdateText = screen.getByText(/Last Update:/);
      expect(lastUpdateText.parentElement).toHaveTextContent(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should handle disabled real-time monitoring', () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          enableRealTimeMonitoring={false}
        />
      );

      expect(screen.getByText('🔄 Initializing Constitutional AI Monitoring...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display errors when verification fails', async () => {
      // Mock a scenario that would cause errors
      const invalidEvaluations = [
        {
          ...createMockEvaluation(8.0),
          score: NaN // Invalid score
        } as any
      ];

      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={invalidEvaluations}
          totalAgents={5}
        />
      );

      // Due to validation in ConstitutionalScores, this should cause errors
      await waitFor(() => {
        // Should show initialization or error state
        const initText = screen.queryByText('🔄 Initializing Constitutional AI Monitoring...');
        expect(initText).toBeInTheDocument();
      });
    });

    it('should handle empty evaluations gracefully', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={[]}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });

      // Should still render the dashboard even with no evaluations
      expect(screen.getByText('📋 Constitutional AI Properties Verification')).toBeInTheDocument();
    });
  });

  describe('Component Props Validation', () => {
    it('should handle different totalAgents values', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={10}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });

      // Component should render successfully with different totalAgents
      expect(screen.getByText('📊 Performance Metrics')).toBeInTheDocument();
    });

    it('should handle custom refresh intervals', async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          refreshInterval={1000} // 1 second
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });

      // Should work with custom refresh interval
      expect(screen.getByText(/Status: 🟢 ACTIVE/)).toBeInTheDocument();
    });

    it('should handle custom constitutional rules', async () => {
      const customRules: ConstitutionalRules = {
        ...createMockConstitutionalRules(),
        harmlessnessRules: {
          ...createMockConstitutionalRules().harmlessnessRules,
          minimumHarmlessnessScore: ConstitutionalScores.harmlessness.create(9.5)
        }
      };

      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
          constitutionalRules={customRules}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });

      // Should work with custom constitutional rules
      expect(screen.getByText('Constitutional Harmlessness')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      render(
        <ConstitutionalAIMonitoring
          proposal={proposal}
          evaluations={evaluations}
          totalAgents={5}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🏛️ Constitutional AI Monitoring Dashboard')).toBeInTheDocument();
      });
    });

    it('should have proper heading structure', () => {
      // Main dashboard title (h2)
      expect(screen.getByRole('heading', { level: 2, name: /Constitutional AI Monitoring Dashboard/ })).toBeInTheDocument();
      
      // Section headings (h3)
      expect(screen.getByRole('heading', { level: 3, name: /Constitutional AI Properties Verification/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Base AIDO Formal Properties/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Mathematical Guarantees Summary/ })).toBeInTheDocument();
    });

    it('should use semantic colors and indicators', () => {
      // Should have visual indicators that are accessible
      const statusElements = screen.getAllByText(/✅|❌|⚠️|🟢|🔴/);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should provide meaningful text descriptions', () => {
      // Should have descriptive text beyond just icons
      expect(screen.getByText('Real-time formal verification and safety monitoring')).toBeInTheDocument();
      expect(screen.getByText(/verified/)).toBeInTheDocument();
    });
  });
});
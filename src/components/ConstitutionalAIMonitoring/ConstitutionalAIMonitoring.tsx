/**
 * Constitutional AI Real-Time Monitoring Dashboard
 * ===============================================
 * 
 * React component for real-time monitoring of Constitutional AI governance
 * with live formal verification status, safety metrics, and enterprise
 * compliance reporting.
 * 
 * Features:
 * - Real-time Constitutional AI property verification
 * - Live safety monitoring with risk assessment
 * - Mathematical proof visualization
 * - Enterprise compliance dashboard
 * - Deadlock prevention monitoring
 * 
 * @author Constitutional AI Research Team & React Expert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ConstitutionalAILivenessMonitor,
  ConstitutionalLivenessState,
  ConstitutionalEvaluation,
  ConstitutionalDeadlockRisk,
  ExhaustiveConstitutionalVerification,
  ConstitutionalScores,
  ConstitutionalRules,
  ConstitutionalRulesetId,
  Timestamp,
  AgentCount,
  ProposalId
} from '../../services/ConstitutionalAIVerification';

import { Evaluation, Proposal } from '../../services/DatabaseService';

// ===============================
// CONSTITUTIONAL AI MONITORING INTERFACES
// ===============================

interface ConstitutionalAIMonitoringProps {
  proposal: Proposal;
  evaluations: Evaluation[];
  totalAgents: number;
  refreshInterval?: number; // milliseconds
  enableRealTimeMonitoring?: boolean;
  constitutionalRules?: ConstitutionalRules;
}

interface ConstitutionalAIMonitoringState {
  verificationResults: ExhaustiveConstitutionalVerification | null;
  deadlockRisk: ConstitutionalDeadlockRisk | null;
  isMonitoring: boolean;
  lastUpdate: Date;
  errors: string[];
  performanceMetrics: {
    verificationLatency: number;
    monitoringUptime: number;
    totalChecks: number;
  };
}

// ===============================
// CONSTITUTIONAL PROPERTY CARD COMPONENT
// ===============================

const ConstitutionalPropertyCard: React.FC<{
  property: keyof ExhaustiveConstitutionalVerification;
  verification: ExhaustiveConstitutionalVerification[keyof ExhaustiveConstitutionalVerification];
  score?: number;
  threshold?: number;
}> = ({ property, verification, score, threshold }) => {
  const getPropertyDisplayName = (prop: string): string => {
    const displayNames: Record<string, string> = {
      'termination': 'Termination Guarantee',
      'bounded_latency': 'Bounded Latency',
      'fairness': 'Fairness Property',
      'deadlock_freedom': 'Deadlock Freedom',
      'determinism': 'Determinism',
      'constitutional_alignment': 'Constitutional Alignment',
      'constitutional_safety': 'Constitutional Safety',
      'constitutional_harmlessness': 'Constitutional Harmlessness',
      'constitutional_helpfulness': 'Constitutional Helpfulness',
      'constitutional_honesty': 'Constitutional Honesty',
      'constitutional_consensus': 'Constitutional Consensus'
    };
    return displayNames[prop] || prop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (verified: boolean): string => {
    return verified ? '#4CAF50' : '#f44336';
  };

  const getStatusIcon = (verified: boolean): string => {
    return verified ? '✅' : '❌';
  };

  return (
    <div 
      style={{
        border: `2px solid ${getStatusColor(verification.verified)}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        backgroundColor: verification.verified ? '#f1f8e9' : '#ffebee',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          <span style={{ marginRight: '8px', fontSize: '16px' }}>
            {getStatusIcon(verification.verified)}
          </span>
          {getPropertyDisplayName(property)}
        </div>
        
        {score !== undefined && threshold !== undefined && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
              Score: {score.toFixed(2)}/10 (Threshold: {threshold.toFixed(1)})
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(score / 10 * 100, 100)}%`,
                height: '100%',
                backgroundColor: score >= threshold ? '#4CAF50' : '#ff9800',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
        
        {verification.proof && (
          <div style={{ 
            fontSize: '11px', 
            color: '#2e7d32', 
            marginTop: '4px',
            fontStyle: 'italic',
            lineHeight: '1.3'
          }}>
            {verification.proof}
          </div>
        )}
      </div>
      
      <div style={{ 
        fontSize: '10px', 
        color: '#757575',
        marginTop: '8px'
      }}>
        Verified: {new Date(verification.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

// ===============================
// DEADLOCK RISK INDICATOR COMPONENT
// ===============================

const DeadlockRiskIndicator: React.FC<{
  deadlockRisk: ConstitutionalDeadlockRisk;
}> = ({ deadlockRisk }) => {
  const getRiskColor = (level: string): string => {
    const colors: Record<string, string> = {
      'low': '#4CAF50',
      'medium': '#ff9800', 
      'high': '#f44336',
      'critical': '#9c27b0'
    };
    return colors[level] || '#757575';
  };

  return (
    <div style={{
      border: `2px solid ${getRiskColor(deadlockRisk.riskLevel)}`,
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: deadlockRisk.detected ? '#fff3e0' : '#f1f8e9',
      marginBottom: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '12px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <span style={{ 
          marginRight: '8px',
          fontSize: '20px'
        }}>
          {deadlockRisk.detected ? '⚠️' : '✅'}
        </span>
        Deadlock Risk: {deadlockRisk.riskLevel.toUpperCase()}
      </div>
      
      <div style={{ marginBottom: '12px', fontSize: '14px' }}>
        <div>Time in evaluation: {Math.round(deadlockRisk.timeInEvaluation / 1000)}s</div>
        <div>Missing evaluations: {deadlockRisk.missingEvaluations}</div>
        {deadlockRisk.reason && (
          <div style={{ color: '#f57c00', marginTop: '4px' }}>
            Reason: {deadlockRisk.reason}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Constitutional Risks:</div>
        <div style={{ fontSize: '12px', marginLeft: '16px' }}>
          <div>Alignment Divergence: {deadlockRisk.constitutionalRisks.alignmentDivergence ? '❌ YES' : '✅ NO'}</div>
          <div>Constitutional Inconsistency: {deadlockRisk.constitutionalRisks.constitutionalInconsistency ? '❌ YES' : '✅ NO'}</div>
          <div>Safety Violation Risk: {deadlockRisk.constitutionalRisks.safetyViolationRisk.toUpperCase()}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Recovery Strategy:</div>
        <div style={{ fontSize: '12px', marginLeft: '16px' }}>
          <div>Type: {deadlockRisk.recoveryStrategy.type.replace(/_/g, ' ').toUpperCase()}</div>
          <div>Estimated Recovery: {Math.round(deadlockRisk.recoveryStrategy.estimatedRecoveryTime / 1000)}s</div>
        </div>
      </div>
      
      {deadlockRisk.recoveryActions.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Recovery Actions:</div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
            {deadlockRisk.recoveryActions.map((action, index) => (
              <li key={index} style={{ marginBottom: '2px' }}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ===============================
// PERFORMANCE METRICS COMPONENT
// ===============================

const PerformanceMetrics: React.FC<{
  metrics: ConstitutionalAIMonitoringState['performanceMetrics'];
}> = ({ metrics }) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#fafafa',
      marginBottom: '16px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
        📊 Performance Metrics
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
        <div>
          <div style={{ color: '#757575' }}>Verification Latency</div>
          <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {metrics.verificationLatency.toFixed(1)}ms
          </div>
        </div>
        <div>
          <div style={{ color: '#757575' }}>Monitoring Uptime</div>
          <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
            {(metrics.monitoringUptime / 1000).toFixed(1)}s
          </div>
        </div>
        <div>
          <div style={{ color: '#757575' }}>Total Checks</div>
          <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>
            {metrics.totalChecks}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================
// MAIN CONSTITUTIONAL AI MONITORING COMPONENT
// ===============================

export const ConstitutionalAIMonitoring: React.FC<ConstitutionalAIMonitoringProps> = ({
  proposal,
  evaluations,
  totalAgents,
  refreshInterval = 5000, // 5 seconds
  enableRealTimeMonitoring = true,
  constitutionalRules
}) => {
  const [state, setState] = useState<ConstitutionalAIMonitoringState>({
    verificationResults: null,
    deadlockRisk: null,
    isMonitoring: false,
    lastUpdate: new Date(),
    errors: [],
    performanceMetrics: {
      verificationLatency: 0,
      monitoringUptime: 0,
      totalChecks: 0
    }
  });

  // Constitutional AI Monitor instance
  const [monitor] = useState(() => new ConstitutionalAILivenessMonitor(constitutionalRules));
  const [monitoringStartTime] = useState(() => Date.now());

  // Mock constitutional evaluation data (in real implementation, this would come from the backend)
  const generateMockConstitutionalEvaluations = useCallback((baseEvaluations: Evaluation[]): ConstitutionalEvaluation[] => {
    return baseEvaluations.map(e => ({
      id: e.id,
      proposalId: ProposalId.create(proposal.id),
      agentId: e.agentId as any, // Type assertion for demo
      score: ConstitutionalScores.alignment.create(e.score), // Using alignment score as base
      alignmentScore: ConstitutionalScores.alignment.create(Math.min(e.score + Math.random() * 2, 10)),
      safetyScore: ConstitutionalScores.safety.create(Math.min(e.score + Math.random() * 1.5, 10)),
      harmlessnessScore: ConstitutionalScores.harmlessness.create(Math.min(e.score + Math.random() * 1.2, 10)),
      helpfulnessScore: ConstitutionalScores.helpfulness.create(Math.min(e.score + Math.random() * 1.8, 10)),
      honestyScore: ConstitutionalScores.honesty.create(Math.min(e.score + Math.random() * 1.3, 10)),
      createdAt: e.createdAt,
      constitutionalNotes: `Constitutional evaluation for ${e.agentId}`,
      verificationTimestamp: Timestamp.now()
    }));
  }, [proposal.id]);

  // Run constitutional verification
  const runVerification = useCallback(async () => {
    if (!enableRealTimeMonitoring) return;

    const startTime = performance.now();
    
    try {
      // Generate mock constitutional evaluations
      const constitutionalEvaluations = generateMockConstitutionalEvaluations(evaluations);
      
      // Calculate average constitutional scores
      const avgScores = constitutionalEvaluations.length > 0 ? {
        alignment: constitutionalEvaluations.reduce((sum, e) => sum + e.alignmentScore, 0) / constitutionalEvaluations.length,
        safety: constitutionalEvaluations.reduce((sum, e) => sum + e.safetyScore, 0) / constitutionalEvaluations.length,
        harmlessness: constitutionalEvaluations.reduce((sum, e) => sum + e.harmlessnessScore, 0) / constitutionalEvaluations.length,
        helpfulness: constitutionalEvaluations.reduce((sum, e) => sum + e.helpfulnessScore, 0) / constitutionalEvaluations.length,
        honesty: constitutionalEvaluations.reduce((sum, e) => sum + e.honestyScore, 0) / constitutionalEvaluations.length
      } : { alignment: 0, safety: 0, harmlessness: 0, helpfulness: 0, honesty: 0 };

      // Create constitutional liveness state
      const constitutionalState: ConstitutionalLivenessState = {
        proposalId: ProposalId.create(proposal.id),
        evaluationCount: constitutionalEvaluations.length,
        totalAgents: AgentCount.create(totalAgents),
        averageScore: constitutionalEvaluations.length > 0 
          ? ConstitutionalScores.alignment.create(
              constitutionalEvaluations.reduce((sum, e) => sum + e.score, 0) / constitutionalEvaluations.length
            )
          : 0,
        evaluationStartTime: Timestamp.create(proposal.createdAt.getTime()),
        lastEvaluationTime: constitutionalEvaluations.length > 0
          ? Timestamp.create(Math.max(...constitutionalEvaluations.map(e => e.createdAt.getTime())))
          : Timestamp.create(proposal.createdAt.getTime()),
        status: (proposal.status === 'accepted' || proposal.status === 'rejected' ? 'decided' :
                constitutionalEvaluations.length > 0 ? 'evaluating' :
                'pending') as 'pending' | 'evaluating' | 'decided',
        constitutionalRules: constitutionalRules || {
          id: 'default_constitutional_ai_v1' as ConstitutionalRulesetId,
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
        },
        alignmentScore: avgScores.alignment > 0 ? ConstitutionalScores.alignment.create(avgScores.alignment) : 0,
        safetyScore: avgScores.safety > 0 ? ConstitutionalScores.safety.create(avgScores.safety) : 0,
        harmlessnessScore: avgScores.harmlessness > 0 ? ConstitutionalScores.harmlessness.create(avgScores.harmlessness) : 0,
        helpfulnessScore: avgScores.helpfulness > 0 ? ConstitutionalScores.helpfulness.create(avgScores.helpfulness) : 0,
        honestyScore: avgScores.honesty > 0 ? ConstitutionalScores.honesty.create(avgScores.honesty) : 0,
        constitutionalCompliance: avgScores.alignment >= 7.0 && avgScores.safety >= 8.0 && avgScores.harmlessness >= 9.0 && avgScores.helpfulness >= 7.0 && avgScores.honesty >= 8.0
      };

      // Run comprehensive verification
      const verificationResults = monitor.verifyConstitutionalProperties(constitutionalState, constitutionalEvaluations);
      const deadlockRisk = monitor.detectConstitutionalDeadlockRisk(constitutionalState);

      const endTime = performance.now();
      const verificationLatency = endTime - startTime;

      setState(prev => ({
        ...prev,
        verificationResults,
        deadlockRisk,
        lastUpdate: new Date(),
        isMonitoring: true,
        errors: [], // Clear errors on successful verification
        performanceMetrics: {
          verificationLatency,
          monitoringUptime: Date.now() - monitoringStartTime,
          totalChecks: prev.performanceMetrics.totalChecks + 1
        }
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, `Verification error: ${error instanceof Error ? error.message : String(error)}`],
        isMonitoring: false
      }));
    }
  }, [
    enableRealTimeMonitoring,
    evaluations,
    generateMockConstitutionalEvaluations,
    monitor,
    proposal,
    totalAgents,
    constitutionalRules,
    monitoringStartTime
  ]);

  // Set up monitoring interval
  useEffect(() => {
    if (!enableRealTimeMonitoring) return;

    // Initial verification
    runVerification();

    // Set up interval for continuous monitoring
    const interval = setInterval(runVerification, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enableRealTimeMonitoring, refreshInterval, runVerification]);

  if (!state.verificationResults) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>🔄 Initializing Constitutional AI Monitoring...</div>
        {state.errors.length > 0 && (
          <div style={{ color: '#f44336', marginTop: '16px' }}>
            {state.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { verificationResults, deadlockRisk } = state;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#1976d2',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 8px 0' }}>🏛️ Constitutional AI Monitoring Dashboard</h2>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Real-time formal verification and safety monitoring
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Last Update: {state.lastUpdate.toLocaleString()} | 
          Status: {state.isMonitoring ? '🟢 ACTIVE' : '🔴 INACTIVE'}
        </div>
      </div>

      {/* Performance Metrics */}
      <PerformanceMetrics metrics={state.performanceMetrics} />

      {/* Deadlock Risk Indicator */}
      {deadlockRisk && <DeadlockRiskIndicator deadlockRisk={deadlockRisk} />}

      {/* Constitutional Properties Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1976d2' }}>
          📋 Constitutional AI Properties Verification
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '8px' 
        }}>
          <ConstitutionalPropertyCard
            property="constitutional_alignment"
            verification={verificationResults.constitutional_alignment}
            score={typeof verificationResults.constitutional_alignment.alignmentScore === 'number' 
              ? verificationResults.constitutional_alignment.alignmentScore 
              : undefined}
            threshold={7.0}
          />
          <ConstitutionalPropertyCard
            property="constitutional_safety"
            verification={verificationResults.constitutional_safety}
            score={typeof verificationResults.constitutional_safety.safetyScore === 'number' 
              ? verificationResults.constitutional_safety.safetyScore 
              : undefined}
            threshold={8.0}
          />
          <ConstitutionalPropertyCard
            property="constitutional_harmlessness"
            verification={verificationResults.constitutional_harmlessness}
            score={typeof verificationResults.constitutional_harmlessness.harmlessnessScore === 'number' 
              ? verificationResults.constitutional_harmlessness.harmlessnessScore 
              : undefined}
            threshold={9.0}
          />
          <ConstitutionalPropertyCard
            property="constitutional_helpfulness"
            verification={verificationResults.constitutional_helpfulness}
            score={typeof verificationResults.constitutional_helpfulness.helpfulnessScore === 'number' 
              ? verificationResults.constitutional_helpfulness.helpfulnessScore 
              : undefined}
            threshold={7.0}
          />
          <ConstitutionalPropertyCard
            property="constitutional_honesty"
            verification={verificationResults.constitutional_honesty}
            score={typeof verificationResults.constitutional_honesty.honestyScore === 'number' 
              ? verificationResults.constitutional_honesty.honestyScore 
              : undefined}
            threshold={8.0}
          />
          <ConstitutionalPropertyCard
            property="constitutional_consensus"
            verification={verificationResults.constitutional_consensus}
          />
        </div>
      </div>

      {/* Base AIDO Properties */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1976d2' }}>
          ⚙️ Base AIDO Formal Properties
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '8px' 
        }}>
          <ConstitutionalPropertyCard
            property="termination"
            verification={verificationResults.termination}
          />
          <ConstitutionalPropertyCard
            property="bounded_latency"
            verification={verificationResults.bounded_latency}
          />
          <ConstitutionalPropertyCard
            property="fairness"
            verification={verificationResults.fairness}
          />
          <ConstitutionalPropertyCard
            property="deadlock_freedom"
            verification={verificationResults.deadlock_freedom}
          />
          <ConstitutionalPropertyCard
            property="determinism"
            verification={verificationResults.determinism}
          />
        </div>
      </div>

      {/* Mathematical Guarantees Summary */}
      <div style={{
        border: '2px solid #1976d2',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#e3f2fd'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>
          🧮 Mathematical Guarantees Summary
        </h3>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          <div>
            <strong>Constitutional Properties:</strong> {
              Object.values(verificationResults)
                .filter(v => v.property.startsWith('constitutional_'))
                .filter(v => v.verified).length
            }/{
              Object.values(verificationResults)
                .filter(v => v.property.startsWith('constitutional_')).length
            } verified
          </div>
          <div>
            <strong>Formal Properties:</strong> {
              Object.values(verificationResults)
                .filter(v => !v.property.startsWith('constitutional_'))
                .filter(v => v.verified).length
            }/{
              Object.values(verificationResults)
                .filter(v => !v.property.startsWith('constitutional_')).length
            } verified
          </div>
          <div>
            <strong>Overall Status:</strong> {
              Object.values(verificationResults).every(v => v.verified) 
                ? '✅ ALL PROPERTIES VERIFIED' 
                : '⚠️ SOME PROPERTIES REQUIRE ATTENTION'
            }
          </div>
          <div>
            <strong>Enterprise Ready:</strong> {
              verificationResults.constitutional_consensus.verified &&
              verificationResults.constitutional_safety.verified &&
              verificationResults.constitutional_harmlessness.verified
                ? '✅ ENTERPRISE COMPLIANT'
                : '❌ ADDITIONAL VERIFICATION REQUIRED'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstitutionalAIMonitoring;
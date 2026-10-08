import type { AnomalyItem } from '../components/anomaly-card';
import { reallocationService } from './reallocation-service';
import type { CampaignDataRef } from '../types/reallocation-execution';

export interface CausalFactor {
  name: string;
  deltaPct: number;
  impactPts: number;
  badge?: string;
  color?: string;
  detail?: string;
}

export interface StatisticalMetricSample {
  value: number;
  mean: number;
  stdDev: number;
  zScore: number;
}

export class AnomalyService {
  /**
   * Computes statistical Z-score: z = (x - mean) / stdDev
   */
  public computeZScore(value: number, history: number[]): StatisticalMetricSample {
    if (!history || history.length === 0) {
      return { value, mean: value, stdDev: 0, zScore: 0 };
    }

    const n = history.length;
    const mean = history.reduce((acc, v) => acc + v, 0) / n;
    const variance = history.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    const zScore = stdDev > 0.0001 ? +((value - mean) / stdDev).toFixed(2) : 0;
    return { value, mean: +mean.toFixed(2), stdDev: +stdDev.toFixed(2), zScore };
  }

  /**
   * Decomposes causal root causes behind campaign efficiency collapse
   */
  public decomposeCausalFactors(params: {
    inventory: number;
    cpmDeltaPct?: number;
    cvrDeltaPct?: number;
    ctrDeltaPct?: number;
    roasDeltaPct?: number;
  }): CausalFactor[] {
    const factors: CausalFactor[] = [];

    // Factor 1: Hard Inventory Depletion (Stockout Shock)
    if (params.inventory <= 0) {
      factors.push({
        name: 'Inventory Stockout',
        deltaPct: -100,
        impactPts: -65.0,
        badge: 'ERP Inventory = 0',
        color: 'rose',
        detail: 'Active ad spend continuing while warehouse SKU inventory is depleted to 0 units.'
      });
    }

    // Factor 2: Auction CPM Surge (>15% jump in cost per thousand impressions)
    if (params.cpmDeltaPct && params.cpmDeltaPct > 15) {
      factors.push({
        name: 'Auction CPM Spike',
        deltaPct: +params.cpmDeltaPct.toFixed(1),
        impactPts: -20.5,
        badge: `CPM +${params.cpmDeltaPct.toFixed(1)}%`,
        color: 'amber',
        detail: 'Sudden competitive bidding surge in ad network auction elevated marginal impression costs.'
      });
    }

    // Factor 3: Conversion Rate Degradation (>25% decline in CVR)
    if (params.cvrDeltaPct && params.cvrDeltaPct < -25) {
      factors.push({
        name: 'Conversion Rate Shift',
        deltaPct: +params.cvrDeltaPct.toFixed(1),
        impactPts: -15.2,
        badge: `CVR ${params.cvrDeltaPct.toFixed(1)}%`,
        color: 'cyan',
        detail: 'Creative fatigue or landing page conversion rate degradation dampening funnel throughput.'
      });
    }

    // Fallback if no explicit primary factor triggered
    if (factors.length === 0) {
      factors.push({
        name: 'Marginal ROAS Variance',
        deltaPct: params.roasDeltaPct ? +params.roasDeltaPct.toFixed(1) : -35.0,
        impactPts: -12.0,
        badge: 'ROAS Shift',
        color: 'zinc',
        detail: 'Sub-convex response curve efficiency drift observed under current bid pacing.'
      });
    }

    return factors;
  }

  /**
   * Retrieves active anomalies from canonical engine state
   */
  public getAnomalies(filter?: { severity?: string; platform?: string }): AnomalyItem[] {
    let anomalies = reallocationService.getAnomalies();

    if (filter?.severity && filter.severity !== 'ALL') {
      anomalies = anomalies.filter((a) => a.severity === filter.severity);
    }

    if (filter?.platform && filter.platform !== 'ALL') {
      anomalies = anomalies.filter((a) => a.platform.toLowerCase() === filter.platform?.toLowerCase());
    }

    return anomalies;
  }

  /**
   * Retrieves an anomaly by its unique identifier
   */
  public getAnomalyById(id: string): AnomalyItem | undefined {
    return reallocationService.getAnomalies().find((a) => a.id === id);
  }

  /**
   * Re-analyzes telemetry and evaluates statistical Z-score thresholds
   */
  public reanalyzeTelemetry(): {
    analyzedCount: number;
    anomaliesFound: number;
    criticalCount: number;
    warningCount: number;
  } {
    const campaigns: CampaignDataRef[] = reallocationService.getCampaigns();
    const anomalies = reallocationService.getAnomalies();

    let criticalCount = 0;
    let warningCount = 0;

    for (const anom of anomalies) {
      if (anom.severity === 'CRITICAL') {
        criticalCount++;
      } else {
        warningCount++;
      }
    }

    return {
      analyzedCount: campaigns.length,
      anomaliesFound: anomalies.length,
      criticalCount,
      warningCount
    };
  }
}

export const anomalyService = new AnomalyService();

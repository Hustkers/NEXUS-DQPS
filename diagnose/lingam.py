"""DirectLiNGAM Causal Discovery Validator for NEXUS-DQPS.

Implements non-Gaussian linear structural equation discovery (DirectLiNGAM)
to discover and empirically validate the causal ordering of observational
time-series variables (Spend -> Impressions -> Clicks -> Orders -> Revenue).
"""

from __future__ import annotations

from typing import Dict, List, Tuple
import numpy as np
import pandas as pd


class DirectLiNGAMValidator:
    """Direct Linear Non-Gaussian Acyclic Model (DirectLiNGAM) causal discovery."""

    def __init__(self):
        pass

    @staticmethod
    def _mutual_info_proxy(x: np.ndarray, y: np.ndarray) -> float:
        """Evaluate non-Gaussian mutual dependence between variable and residual."""
        # Standardize
        x_std = (x - np.mean(x)) / (np.std(x) + 1e-9)
        y_std = (y - np.mean(y)) / (np.std(y) + 1e-9)
        # Fast kernel / kurtosis-based approximation of non-Gaussian independence
        diff_kurt = np.abs(np.mean(x_std**4) - 3.0) + np.abs(np.mean(y_std**4) - 3.0)
        corr = np.abs(np.corrcoef(x_std, y_std)[0, 1])
        return float(corr / (1.0 + diff_kurt))

    def fit_causal_order(self, data: pd.DataFrame) -> List[str]:
        """Discover causal ordering of variables in observational data using DirectLiNGAM."""
        remaining_vars = list(data.columns)
        causal_order = []
        X = data.values.copy()
        var_indices = {col: i for i, col in enumerate(remaining_vars)}

        # Iterate until all variables are ordered
        while len(remaining_vars) > 1:
            best_var = remaining_vars[0]
            min_dependency = float("inf")

            for candidate in remaining_vars:
                c_idx = var_indices[candidate]
                x_cand = X[:, c_idx]

                total_dep = 0.0
                for other in remaining_vars:
                    if other == candidate:
                        continue
                    o_idx = var_indices[other]
                    x_other = X[:, o_idx]

                    # Residual of regressing other on candidate
                    slope = np.cov(x_cand, x_other)[0, 1] / (np.var(x_cand) + 1e-9)
                    residual = x_other - slope * x_cand

                    dep = self._mutual_info_proxy(x_cand, residual)
                    total_dep += dep

                if total_dep < min_dependency:
                    min_dependency = total_dep
                    best_var = candidate

            causal_order.append(best_var)
            remaining_vars.remove(best_var)

            # Residualize remaining variables with respect to best_var
            b_idx = var_indices[best_var]
            x_best = X[:, b_idx]
            for other in remaining_vars:
                o_idx = var_indices[other]
                slope = np.cov(x_best, X[:, o_idx])[0, 1] / (np.var(x_best) + 1e-9)
                X[:, o_idx] = X[:, o_idx] - slope * x_best

        causal_order.extend(remaining_vars)
        return causal_order

    def validate_dag_consistency(
        self,
        discovered_order: List[str],
        expected_precedence: List[Tuple[str, str]],
    ) -> bool:
        """Assert that discovered causal ordering does not violate known DAG precedence pairs."""
        order_map = {var: i for i, var in enumerate(discovered_order)}
        for upstream, downstream in expected_precedence:
            if upstream in order_map and downstream in order_map:
                if order_map[upstream] > order_map[downstream]:
                    return False
        return True

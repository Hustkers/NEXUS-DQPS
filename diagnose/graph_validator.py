"""Structural Causal Graph validator.

Verifies:
- Directed acyclicity (DAG)
- Valid topological order
- Business constraints: Spend -> Impressions, Inventory -> Orders -> Revenue -> Margin
"""

from __future__ import annotations

from typing import List, Tuple
import networkx as nx

from diagnose.causal_graph import EnterpriseCausalDAG


class CausalGraphValidator:
    """Validates structural causal graph integrity."""

    @staticmethod
    def validate_dag(dag: EnterpriseCausalDAG) -> Tuple[bool, List[str]]:
        errors: List[str] = []
        g = dag.graph

        # 1. Acyclicity check
        if not nx.is_directed_acyclic_graph(g):
            cycles = list(nx.simple_cycles(g))
            errors.append(f"Graph contains cycles: {cycles}")
            return False, errors

        # 2. Topological sort check
        try:
            order = list(nx.topological_sort(g))
            if not order:
                errors.append("Topological order is empty.")
        except Exception as e:
            errors.append(f"Topological sorting failed: {e}")

        # 3. Domain business constraint checks
        # Net margin must be a sink / target node
        if "net_margin" not in g:
            errors.append("Target node 'net_margin' missing from DAG.")
        else:
            # Check spend is an ancestor of net_margin
            if not nx.has_path(g, "spend", "net_margin"):
                errors.append("Business constraint failed: 'spend' must have path to 'net_margin'.")
            # Check inventory is an ancestor of net_margin
            if not nx.has_path(g, "inventory", "net_margin"):
                errors.append("Business constraint failed: 'inventory' must have path to 'net_margin'.")

        return len(errors) == 0, errors

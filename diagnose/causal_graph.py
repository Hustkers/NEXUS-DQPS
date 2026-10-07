"""Enterprise Directed Acyclic Graph (DAG) and Structural Causal Model (SCM).

Topology mapping:
Media Spend, CPM -> Impressions
Impressions, CTR -> Clicks
Clicks -> Page Views
Page Views, CVR, Shopify Inventory -> Unit Orders
Unit Orders, Price, COGS, Media Spend -> Net Contribution Margin
"""

from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional, Tuple
import networkx as nx
import numpy as np
import pandas as pd


class StructuralNode:
    """Endogenous or exogenous node in the Structural Causal Model."""

    def __init__(
        self,
        name: str,
        parents: List[str],
        mechanism: Callable[[Dict[str, float], float], float],
        noise_std: float = 0.05,
    ):
        self.name = name
        self.parents = parents
        self.mechanism = mechanism
        self.noise_std = noise_std


class EnterpriseCausalDAG:
    """Production SCM DAG for autonomous D2C Root Cause Analysis."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes: Dict[str, StructuralNode] = {}
        self._build_topology()

    def _build_topology(self) -> None:
        # Define causal edges
        edges = [
            ("spend", "impressions"),
            ("cpm", "impressions"),
            ("impressions", "clicks"),
            ("ctr", "clicks"),
            ("clicks", "page_views"),
            ("page_views", "orders"),
            ("cvr", "orders"),
            ("inventory", "orders"),
            ("orders", "revenue"),
            ("price", "revenue"),
            ("revenue", "net_margin"),
            ("spend", "net_margin"),
            ("orders", "net_margin"),
            ("cogs", "net_margin"),
        ]
        self.graph.add_edges_from(edges)

        # 1. Impressions = (spend / cpm) * 1000 + U
        def mech_impressions(parents: Dict[str, float], u: float) -> float:
            cpm = max(parents.get("cpm", 15.0), 1.0)
            spend = parents.get("spend", 100.0)
            return max(0.0, (spend / cpm) * 1000.0 * (1.0 + u))

        # 2. Clicks = impressions * ctr + U
        def mech_clicks(parents: Dict[str, float], u: float) -> float:
            impr = parents.get("impressions", 1000.0)
            ctr = parents.get("ctr", 0.02)
            return max(0.0, impr * ctr * (1.0 + u))

        # 3. Page Views = clicks * 0.90 + U
        def mech_pv(parents: Dict[str, float], u: float) -> float:
            clicks = parents.get("clicks", 10.0)
            return max(0.0, clicks * 0.90 * (1.0 + u))

        # 4. Orders = min(inventory, page_views * cvr) + U
        def mech_orders(parents: Dict[str, float], u: float) -> float:
            pv = parents.get("page_views", 10.0)
            cvr = parents.get("cvr", 0.03)
            inv = parents.get("inventory", 500.0)
            unconstrained_orders = pv * cvr * (1.0 + u)
            return max(0.0, min(float(inv), unconstrained_orders))

        # 5. Revenue = orders * price
        def mech_revenue(parents: Dict[str, float], u: float) -> float:
            orders = parents.get("orders", 0.0)
            price = parents.get("price", 150.0)
            return max(0.0, orders * price)

        # 6. Net Contribution Margin = revenue - (orders * cogs) - spend - var_costs
        def mech_net_margin(parents: Dict[str, float], u: float) -> float:
            rev = parents.get("revenue", 0.0)
            orders = parents.get("orders", 0.0)
            cogs = parents.get("cogs", 50.0)
            spend = parents.get("spend", 0.0)
            var_costs = rev * 0.03
            return rev - (orders * cogs) - spend - var_costs

        self.nodes = {
            "spend": StructuralNode("spend", [], lambda p, u: p.get("spend", 0.0)),
            "cpm": StructuralNode("cpm", [], lambda p, u: p.get("cpm", 15.0)),
            "ctr": StructuralNode("ctr", [], lambda p, u: p.get("ctr", 0.02)),
            "cvr": StructuralNode("cvr", [], lambda p, u: p.get("cvr", 0.03)),
            "inventory": StructuralNode("inventory", [], lambda p, u: p.get("inventory", 500.0)),
            "price": StructuralNode("price", [], lambda p, u: p.get("price", 150.0)),
            "cogs": StructuralNode("cogs", [], lambda p, u: p.get("cogs", 50.0)),
            "impressions": StructuralNode("impressions", ["spend", "cpm"], mech_impressions),
            "clicks": StructuralNode("clicks", ["impressions", "ctr"], mech_clicks),
            "page_views": StructuralNode("page_views", ["clicks"], mech_pv),
            "orders": StructuralNode("orders", ["page_views", "cvr", "inventory"], mech_orders),
            "revenue": StructuralNode("revenue", ["orders", "price"], mech_revenue),
            "net_margin": StructuralNode("net_margin", ["revenue", "orders", "cogs", "spend"], mech_net_margin),
        }

    def evaluate(self, inputs: Dict[str, float], noise_terms: Optional[Dict[str, float]] = None) -> Dict[str, float]:
        """Forward evaluate structural equations in topological order."""
        values = dict(inputs)
        u_dict = noise_terms or {}
        order = list(nx.topological_sort(self.graph))

        for node_name in order:
            if node_name in self.nodes:
                node = self.nodes[node_name]
                if node.parents:
                    parent_vals = {p: values.get(p, 0.0) for p in node.parents}
                    u = u_dict.get(node_name, 0.0)
                    values[node_name] = node.mechanism(parent_vals, u)

        return values

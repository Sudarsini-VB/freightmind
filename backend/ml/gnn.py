"""
FreightMind - Graph Neural Network (GNN) Module
Models the global supply chain as a graph.
Nodes: ports, warehouses, factories
Edges: shipping lanes, truck routes
GNN predicts how disruptions PROPAGATE through the network.

Real implementation: torch_geometric.nn.GCNConv / GraphSAGE
Here: simulates GNN message-passing behavior mathematically.
"""
import math
import random
from typing import List, Dict, Any
from datetime import datetime

# Global supply chain graph
NODES = {
    "SHA": {"type": "port",      "name": "Shanghai",     "capacity": 0.95, "lat": 31.23, "lng": 121.47},
    "SIN": {"type": "port",      "name": "Singapore",    "capacity": 0.85, "lat": 1.29,  "lng": 103.85},
    "RTM": {"type": "port",      "name": "Rotterdam",    "capacity": 0.88, "lat": 51.90, "lng": 4.48},
    "LAX": {"type": "port",      "name": "Los Angeles",  "capacity": 0.72, "lat": 33.74, "lng": -118.27},
    "DXB": {"type": "port",      "name": "Dubai",        "capacity": 0.90, "lat": 24.98, "lng": 55.06},
    "HBG": {"type": "port",      "name": "Hamburg",      "capacity": 0.86, "lat": 53.55, "lng": 9.99},
    "PUS": {"type": "port",      "name": "Busan",        "capacity": 0.91, "lat": 35.10, "lng": 129.04},
    "BOM": {"type": "port",      "name": "Mumbai",       "capacity": 0.78, "lat": 18.93, "lng": 72.84},
    "NYC": {"type": "port",      "name": "New York",     "capacity": 0.75, "lat": 40.66, "lng": -74.04},
    "TYO": {"type": "port",      "name": "Tokyo",        "capacity": 0.88, "lat": 35.62, "lng": 139.77},
    "CMB": {"type": "port",      "name": "Colombo",      "capacity": 0.93, "lat": 6.93,  "lng": 79.86},
    "ANR": {"type": "port",      "name": "Antwerp",      "capacity": 0.84, "lat": 51.26, "lng": 4.40},
    "WH_EU": {"type": "warehouse","name": "EU Distribution Hub", "capacity": 0.70, "lat": 50.85, "lng": 4.35},
    "WH_US": {"type": "warehouse","name": "US Distribution Hub", "capacity": 0.65, "lat": 34.05, "lng": -118.24},
    "WH_AS": {"type": "warehouse","name": "Asia Distribution Hub","capacity": 0.80,"lat": 1.35,  "lng": 103.82},
    "FAC_CN": {"type": "factory", "name": "China Manufacturing Zone","capacity": 0.92,"lat": 30.57,"lng": 114.28},
    "FAC_VN": {"type": "factory", "name": "Vietnam Manufacturing",   "capacity": 0.88,"lat": 10.82,"lng": 106.63},
    "FAC_IN": {"type": "factory", "name": "India Manufacturing",     "capacity": 0.83,"lat": 19.08,"lng": 72.88},
}

# Edges: (from, to, weight=traffic_volume, disruption_sensitivity)
EDGES = [
    ("FAC_CN","SHA",0.95,0.9), ("FAC_VN","SIN",0.82,0.7), ("FAC_IN","BOM",0.78,0.6),
    ("SHA","SIN",0.88,0.5),    ("SHA","PUS",0.82,0.4),     ("SHA","TYO",0.75,0.4),
    ("SIN","CMB",0.71,0.3),    ("SIN","DXB",0.79,0.6),     ("SIN","RTM",0.65,0.85),
    ("DXB","RTM",0.70,0.88),   ("DXB","HBG",0.68,0.82),    ("CMB","RTM",0.60,0.80),
    ("PUS","LAX",0.83,0.4),    ("SHA","LAX",0.85,0.45),    ("TYO","LAX",0.72,0.35),
    ("RTM","WH_EU",0.90,0.3),  ("HBG","WH_EU",0.85,0.3),  ("ANR","WH_EU",0.80,0.3),
    ("LAX","WH_US",0.88,0.3),  ("NYC","WH_US",0.82,0.3),
    ("SIN","WH_AS",0.91,0.2),
]


def _sigmoid(x): return 1 / (1 + math.exp(-x))


class GNNMessagePassing:
    """
    Simulates 3-layer Graph Neural Network message passing.
    Each node aggregates features from neighbors (GCN / GraphSAGE style).
    Layer 1: local neighborhood aggregation
    Layer 2: 2-hop propagation
    Layer 3: global graph representation
    """

    def __init__(self):
        random.seed(7)
        # Simulate learned weight matrices W1, W2, W3
        self.W = [[random.gauss(0, 0.3) for _ in range(8)] for _ in range(3)]

    def _node_features(self, node_id: str, disruption_nodes: List[str]) -> List[float]:
        n = NODES.get(node_id, {})
        type_enc = {"port": 1.0, "warehouse": 0.5, "factory": 0.3}.get(n.get("type","port"), 0.5)
        is_disrupted = 1.0 if node_id in disruption_nodes else 0.0
        capacity = n.get("capacity", 0.8)
        degree = sum(1 for (a,b,_,__) in EDGES if a == node_id or b == node_id)
        return [type_enc, is_disrupted, capacity, degree/10.0,
                random.uniform(0.3, 0.9), random.uniform(0.2, 0.8),
                random.uniform(0.1, 0.7), random.uniform(0.4, 1.0)]

    def _aggregate(self, node_id: str, layer: int, disruption_nodes: List[str]) -> float:
        """Aggregate features from neighbors — GCN message passing"""
        neighbors = [b for (a,b,w,_) in EDGES if a == node_id] + \
                    [a for (a,b,w,_) in EDGES if b == node_id]
        self_feat = self._node_features(node_id, disruption_nodes)
        if not neighbors:
            return _sigmoid(sum(f*w for f,w in zip(self_feat, self.W[layer % 3])))
        # Aggregate: mean pooling (GCN style)
        agg = [0.0] * 8
        for nb in neighbors:
            nb_feat = self._node_features(nb, disruption_nodes)
            for i in range(8):
                agg[i] += nb_feat[i] / len(neighbors)
        combined = [(s+a)/2 for s,a in zip(self_feat, agg)]
        return _sigmoid(sum(f*w for f,w in zip(combined, self.W[layer % 3])))

    def predict_propagation(self, disrupted_nodes: List[str]) -> Dict[str, Any]:
        """
        Predict how a disruption at given nodes propagates through the network.
        Returns: risk score per node after 3 message-passing layers.
        """
        node_risks = {}
        for node_id in NODES:
            l1 = self._aggregate(node_id, 0, disrupted_nodes)
            l2 = self._aggregate(node_id, 1, disrupted_nodes + [n for n,r in node_risks.items() if r > 0.6])
            l3 = self._aggregate(node_id, 2, disrupted_nodes)
            # Combine layers (skip connections, ResNet style)
            final = min(1.0, (0.2*l1 + 0.3*l2 + 0.5*l3) * (1.5 if node_id in disrupted_nodes else 1.0))
            node_risks[node_id] = round(final, 3)

        # Find propagation paths
        critical_path = sorted(node_risks.items(), key=lambda x: -x[1])[:5]
        affected_count = sum(1 for v in node_risks.values() if v > 0.5)

        return {
            "method": "GNN (3-layer Graph Convolutional Network)",
            "disrupted_nodes": disrupted_nodes,
            "node_risks": {k: {"risk": v, **{kk:vv for kk,vv in NODES[k].items() if kk in ["name","type"]}}
                          for k, v in node_risks.items()},
            "critical_propagation_path": [{"node": k, "name": NODES[k]["name"], "risk": v} for k,v in critical_path],
            "affected_nodes_count": affected_count,
            "total_nodes": len(NODES),
            "network_stress_index": round(sum(node_risks.values()) / len(node_risks), 3),
            "graph_stats": {"nodes": len(NODES), "edges": len(EDGES),
                           "node_types": {"ports": 12, "warehouses": 3, "factories": 3}},
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_graph_data(self) -> Dict[str, Any]:
        """Return full graph for visualization"""
        return {
            "nodes": [{"id": k, **v} for k, v in NODES.items()],
            "edges": [{"from": a, "to": b, "weight": w, "sensitivity": s}
                      for a, b, w, s in EDGES],
        }


_gnn = GNNMessagePassing()
def get_gnn(): return _gnn

import networkx as nx
from typing import List, Dict, Any

class ScheduleAnalyzer:
    """
    Chapter 19 - Predictive Schedule Risk Engine (Deterministic Core)
    Parses schedules, constructs a DAG, and calculates Critical Path and Float.
    """
    
    def __init__(self, activities: List[Dict[str, Any]]):
        """
        activities should have: id, name, duration, predecessors (list of ids)
        """
        self.activities = activities
        self.graph = nx.DiGraph()
        self._build_graph()
        self._validate_dag()
        
    def _build_graph(self):
        # Add nodes
        for act in self.activities:
            self.graph.add_node(act['id'], **act)
            
        # Add edges (dependencies)
        for act in self.activities:
            for pred_id in act.get('predecessors', []):
                if pred_id in self.graph:
                    self.graph.add_edge(pred_id, act['id'])

    def _validate_dag(self):
        # 19.8 Schedule Validation
        if not nx.is_directed_acyclic_graph(self.graph):
            raise ValueError("Schedule contains circular dependencies (not a DAG).")

    def calculate_cpm(self) -> Dict[str, Any]:
        """
        19.10 Critical Path Method
        Calculates Earliest Start/Finish, Latest Start/Finish, and Float.
        """
        # Forward Pass (Earliest Start/Finish)
        for node in nx.topological_sort(self.graph):
            preds = list(self.graph.predecessors(node))
            duration = self.graph.nodes[node].get('duration', 0)
            
            if not preds:
                es = 0
            else:
                es = max(self.graph.nodes[p].get('ef', 0) for p in preds)
                
            ef = es + duration
            self.graph.nodes[node]['es'] = es
            self.graph.nodes[node]['ef'] = ef

        # Find project completion time
        project_duration = max((self.graph.nodes[n].get('ef', 0) for n in self.graph.nodes), default=0)

        # Backward Pass (Latest Start/Finish)
        for node in reversed(list(nx.topological_sort(self.graph))):
            succs = list(self.graph.successors(node))
            duration = self.graph.nodes[node].get('duration', 0)
            
            if not succs:
                lf = project_duration
            else:
                lf = min(self.graph.nodes[s].get('ls', project_duration) for s in succs)
                
            ls = lf - duration
            self.graph.nodes[node]['ls'] = ls
            self.graph.nodes[node]['lf'] = lf
            
            # Calculate Total Float
            float_val = ls - self.graph.nodes[node]['es']
            self.graph.nodes[node]['float'] = float_val
            self.graph.nodes[node]['is_critical'] = float_val == 0
            
            # Categorize Risk (19.11 Float Analysis)
            if float_val == 0:
                self.graph.nodes[node]['risk_category'] = 'Critical'
            elif float_val <= 3:
                self.graph.nodes[node]['risk_category'] = 'High Risk'
            elif float_val <= 7:
                self.graph.nodes[node]['risk_category'] = 'Medium Risk'
            else:
                self.graph.nodes[node]['risk_category'] = 'Low Risk'

        # Extract enriched activities
        enriched_activities = []
        for node_id in nx.topological_sort(self.graph):
            enriched_activities.append(self.graph.nodes[node_id])
            
        critical_path = [node for node in nx.topological_sort(self.graph) if self.graph.nodes[node]['is_critical']]

        return {
            "project_duration": project_duration,
            "critical_path": critical_path,
            "activities": enriched_activities
        }

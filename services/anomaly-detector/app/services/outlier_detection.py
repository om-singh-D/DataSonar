"""Quality score anomaly detection services."""

from __future__ import annotations

from collections import defaultdict

import numpy as np
from sklearn.ensemble import IsolationForest


class QualityOutlierDetector:
    """Detect quality score degradations per source."""

    def __init__(self, history_limit: int = 1000) -> None:
        self._history_limit = history_limit
        self._history: dict[str, list[float]] = defaultdict(list)
        self._models: dict[str, IsolationForest] = {}

    def detect(self, source_id: str, overall_score: float) -> tuple[bool, float]:
        history = self._history[source_id]
        is_anomaly = False
        score = 0.0

        if len(history) >= 25:
            model = self._models.get(source_id)
            if model is None:
                model = IsolationForest(contamination=0.08, random_state=42)
                model.fit(np.array(history).reshape(-1, 1))
                self._models[source_id] = model

            prediction = model.predict(np.array([[overall_score]]))[0]
            anomaly_score = -float(model.score_samples(np.array([[overall_score]]))[0])
            is_anomaly = prediction == -1
            score = min(max(anomaly_score, 0.0), 1.0)
        elif len(history) >= 8:
            mean = float(np.mean(history))
            std = float(np.std(history))
            z_score = abs((overall_score - mean) / (std or 1.0))
            is_anomaly = z_score >= 3.0 and overall_score < mean
            score = min(z_score / 6.0, 1.0)

        history.append(overall_score)
        if len(history) > self._history_limit:
            self._history[source_id] = history[-self._history_limit :]
            self._models.pop(source_id, None)

        return is_anomaly, score

    def baseline_mean(self, source_id: str) -> float | None:
        history = self._history.get(source_id, [])
        if not history:
            return None
        return float(np.mean(history))

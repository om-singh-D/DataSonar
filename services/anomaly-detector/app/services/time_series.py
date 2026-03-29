"""Time-series anomaly detection for data volume."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime

import numpy as np
import pandas as pd

try:
    from prophet import Prophet
except Exception:  # pragma: no cover
    Prophet = None


class TimeSeriesAnomalyDetector:
    """Detect volume anomalies using Prophet with fallback statistics."""

    def __init__(self, history_limit: int = 500) -> None:
        self._history_limit = history_limit
        self._history: dict[str, list[tuple[datetime, int]]] = defaultdict(list)

    def detect(self, source_id: str, timestamp: datetime, record_count: int) -> tuple[bool, float]:
        history = self._history[source_id]
        score = 0.0

        if len(history) >= 24 and Prophet is not None:
            data = pd.DataFrame(history, columns=["ds", "y"])
            model = Prophet(daily_seasonality=True, weekly_seasonality=True)
            model.fit(data)
            current = pd.DataFrame({"ds": [timestamp]})
            prediction = model.predict(current).iloc[0]
            yhat = float(prediction["yhat"])
            interval_low = float(prediction["yhat_lower"])
            interval_high = float(prediction["yhat_upper"])

            is_anomaly = record_count < interval_low or record_count > interval_high
            if is_anomaly:
                distance = abs(record_count - yhat)
                normalizer = max(abs(yhat), 1.0)
                score = min(distance / normalizer, 1.0)
            else:
                score = 0.0
        elif len(history) >= 8:
            values = np.array([value for _, value in history], dtype=float)
            mean = float(values.mean())
            std = float(values.std())
            z_score = abs((record_count - mean) / (std or 1.0))
            is_anomaly = z_score >= 3.0
            score = min(z_score / 6.0, 1.0)
        else:
            is_anomaly = False

        history.append((timestamp, record_count))
        if len(history) > self._history_limit:
            self._history[source_id] = history[-self._history_limit :]

        return is_anomaly, score

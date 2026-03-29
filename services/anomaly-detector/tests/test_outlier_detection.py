from app.services.outlier_detection import QualityOutlierDetector


def test_quality_detector_flags_significant_drop_after_history():
    detector = QualityOutlierDetector()

    for value in [0.92, 0.93, 0.91, 0.94, 0.95, 0.93, 0.92, 0.94, 0.93, 0.92]:
        detector.detect("source-a", value)

    is_anomaly, score = detector.detect("source-a", 0.45)

    assert is_anomaly is True
    assert score > 0


def test_quality_detector_no_anomaly_with_stable_scores():
    detector = QualityOutlierDetector()

    for value in [0.9, 0.91, 0.89, 0.9, 0.92, 0.91, 0.9, 0.89, 0.9]:
        detector.detect("source-b", value)

    is_anomaly, score = detector.detect("source-b", 0.9)

    assert is_anomaly is False
    assert score >= 0

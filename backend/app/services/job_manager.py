from typing import Dict, Any
from datetime import datetime, timezone

# Live pipeline telemetry tracker
# maps case_id -> { modality: { status, stage, progress_pct, updated_at, error } }
_telemetry_store: Dict[str, Dict[str, Dict[str, Any]]] = {}

class JobTelemetryManager:
    @staticmethod
    def init_case(case_id: str):
        if case_id not in _telemetry_store:
            _telemetry_store[case_id] = {}

    @staticmethod
    def update_stage(case_id: str, modality: str, stage: str, progress_pct: int = 0, error: str = None):
        JobTelemetryManager.init_case(case_id)
        _telemetry_store[case_id][modality] = {
            "stage": stage,  # queued, preprocessing, inference, completed, failed
            "progress_pct": progress_pct,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "error": error
        }

    @staticmethod
    def get_telemetry(case_id: str) -> Dict[str, Any]:
        return _telemetry_store.get(case_id, {})

job_telemetry = JobTelemetryManager()

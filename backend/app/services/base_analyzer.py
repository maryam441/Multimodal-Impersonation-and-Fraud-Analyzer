import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from backend.app.schemas.modality import ModalityResultResponse, EvidenceSignal, EvidenceSpan

class BaseModalityAnalyzer(ABC):
    modality_name: str
    model_name: str
    model_version: str

    @abstractmethod
    async def run_analysis(self, case_id: str, payload: Any) -> ModalityResultResponse:
        """Core modality inference logic implemented by each specialized analyzer."""
        pass

    async def execute_safe(self, case_id: str, payload: Any) -> ModalityResultResponse:
        """Fault-isolated wrapper: catches exceptions and ensures one failing modality never crashes the case."""
        t0 = time.time()
        try:
            result = await self.run_analysis(case_id, payload)
            result.processing_ms = int((time.time() - t0) * 1000)
            return result
        except Exception as exc:
            duration_ms = int((time.time() - t0) * 1000)
            return ModalityResultResponse(
                analysis_id=f"{self.modality_name}-{case_id[:8]}",
                modality=self.modality_name,
                status="failed",
                risk_score=None,
                risk_label="inconclusive",
                confidence=None,
                confidence_note=f"Modality processing encountered an isolated error: {str(exc)}",
                signals=[
                    EvidenceSignal(
                        code="PROCESSING_ERROR",
                        category="System Error",
                        description=f"Isolated fault in {self.modality_name} analyzer",
                        evidence=str(exc),
                        severity="high"
                    )
                ],
                metrics={},
                model={"name": self.model_name, "version": self.model_version},
                limitations=[f"Modality failed cleanly without affecting other active evidence: {str(exc)}"],
                processing_ms=duration_ms,
                created_at=datetime.now(timezone.utc)
            )

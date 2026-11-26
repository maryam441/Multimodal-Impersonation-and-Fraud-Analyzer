"""
Multimodal Late-Fusion Engine and Calibrated Risk Assessment Framework.
Implements missingness neutrality, de-duplication correlation discount,
ablation counterfactuals, and cross-modality divergence checks.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass


DEFAULT_MODALITY_WEIGHTS = {
    "voice": 0.30,
    "message": 0.25,
    "conversation": 0.25,
    "url": 0.15,
    "phone": 0.05
}

CORRELATION_DISCOUNT_FACTOR = 0.75  # Delta applied to extracted sub-modalities


@dataclass
class ModalityScoreInput:
    modality: str
    status: str
    risk_score: Optional[float]
    confidence: Optional[float]
    is_extracted_from_text: bool = False


class FusionEngine:
    """
    Transparent weighted late-fusion engine conforming to SRS §11 & §12.
    """

    def __init__(self, base_weights: Dict[str, float] = None, correlation_discount: float = CORRELATION_DISCOUNT_FACTOR):
        self.base_weights = base_weights or DEFAULT_MODALITY_WEIGHTS.copy()
        self.correlation_discount = correlation_discount

    def evaluate_fusion(
        self,
        modality_inputs: List[ModalityScoreInput]
    ) -> Dict[str, Any]:
        """
        Executes late fusion across available modality scores.
        """
        all_modalities = list(self.base_weights.keys())
        active_modalities = [m.modality for m in modality_inputs]
        missing_modalities = [m for m in all_modalities if m not in active_modalities]

        # Filter only scored modalities with status == 'analyzed' and non-null risk_score
        scored_inputs = [
            m for m in modality_inputs
            if m.status == "analyzed" and m.risk_score is not None
        ]

        if not scored_inputs:
            return {
                "fused_score": None,
                "risk_category": "inconclusive",
                "status": "inconclusive",
                "confidence": 0.0,
                "confidence_interval": [0.0, 0.0],
                "active_modalities": active_modalities,
                "missing_modalities": missing_modalities,
                "missing_policy": "Unprovided modalities are strictly Neutral (Never imputed as zero risk)",
                "rationale": "Insufficient verified modality scores to compute a fused risk assessment.",
                "weights_used": {},
                "ablation_comparison": {},
                "cross_modality_divergence": False,
                "flags": ["INSUFFICIENT_EVIDENCE_FOR_FUSION"]
            }

        # Calculate effective weights with correlation discounting
        raw_effective_weights = {}
        for m in scored_inputs:
            base_w = self.base_weights.get(m.modality, 0.10)
            if m.is_extracted_from_text:
                base_w *= self.correlation_discount
            raw_effective_weights[m.modality] = base_w

        total_weight = sum(raw_effective_weights.values())
        if total_weight <= 0:
            total_weight = 1.0

        normalized_weights = {
            m: round(w / total_weight, 4)
            for m, w in raw_effective_weights.items()
        }

        # Weighted score sum
        fused_score_raw = sum(
            m.risk_score * normalized_weights[m.modality]
            for m in scored_inputs
        )
        fused_score = round(min(100.0, max(0.0, fused_score_raw)), 1)

        # Confidence aggregation
        confidences = [
            (m.confidence or 0.5) * normalized_weights[m.modality]
            for m in scored_inputs
        ]
        agg_confidence = sum(confidences)
        # Apply coverage penalty if fewer than 2 modalities provided
        if len(scored_inputs) < 2:
            agg_confidence *= 0.85
        agg_confidence = round(min(0.99, max(0.10, agg_confidence)), 2)

        # Exact SRS Risk Category Boundaries
        # 0 - 30: Low
        # 31 - 60: Medium
        # 61 - 100: High
        if fused_score <= 30.0:
            risk_category = "low"
        elif fused_score <= 60.0:
            risk_category = "medium"
        else:
            risk_category = "high"

        # Ablation study: compute counterfactual score without each modality k
        ablation_results = {}
        for target in scored_inputs:
            other_inputs = [m for m in scored_inputs if m.modality != target.modality]
            if not other_inputs:
                ablation_results[target.modality] = {
                    "score_without_modality": None,
                    "delta": 0.0,
                    "relative_contribution": 100.0
                }
            else:
                other_raw_weights = {
                    m.modality: raw_effective_weights[m.modality] for m in other_inputs
                }
                other_total_w = sum(other_raw_weights.values())
                other_norm_w = {
                    m: w / other_total_w for m, w in other_raw_weights.items()
                }
                score_without = sum(
                    m.risk_score * other_norm_w[m.modality] for m in other_inputs
                )
                score_without = round(score_without, 1)
                delta = round(fused_score - score_without, 1)
                ablation_results[target.modality] = {
                    "score_without_modality": score_without,
                    "delta": delta,
                    "relative_contribution": round(normalized_weights[target.modality] * 100, 1)
                }

        # Check cross-modality divergence
        max_score = max(m.risk_score for m in scored_inputs)
        min_score = min(m.risk_score for m in scored_inputs)
        divergence = (max_score - min_score) >= 50.0

        flags = []
        if divergence:
            flags.append("CROSS_MODALITY_DIVERGENCE")
        if any(m.is_extracted_from_text for m in scored_inputs):
            flags.append("CORRELATION_DISCOUNT_APPLIED")

        rationale = (
            f"Fused risk score {fused_score}/100 ({risk_category.upper()}) derived from "
            f"{len(scored_inputs)} verified modalities: "
            + ", ".join([f"{m.modality} ({m.risk_score})" for m in scored_inputs])
            + f". Missing {len(missing_modalities)} modalities excluded from denominator."
        )

        return {
            "fused_score": fused_score,
            "risk_category": risk_category,
            "status": "evaluated",
            "confidence": agg_confidence,
            "confidence_interval": [
                round(max(0.0, fused_score - (1.0 - agg_confidence) * 15), 1),
                round(min(100.0, fused_score + (1.0 - agg_confidence) * 15), 1)
            ],
            "active_modalities": active_modalities,
            "missing_modalities": missing_modalities,
            "missing_policy": "Unprovided modalities are strictly Neutral (Never imputed as zero risk)",
            "rationale": rationale,
            "weights_used": normalized_weights,
            "ablation_comparison": ablation_results,
            "cross_modality_divergence": divergence,
            "flags": flags
        }

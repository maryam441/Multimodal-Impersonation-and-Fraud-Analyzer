# Model Card: Multimodal Fusion Engine & Risk Framework

## Model Details
- **Component:** Multimodal Decision Fusion & Calibrated Risk Assessment
- **Architecture:** Transparent Weighted Late-Fusion Baseline with Missingness Neutrality, De-Duplication Discounting, and Ablation Counterfactuals.
- **Specification:** Complies with SRS §11 & §12.

## Mathematical Formulation
The fused score $S$ is calculated strictly over verified available modalities $\mathcal{M}_{\text{active}}$:
$$S = \sum_{i \in \mathcal{M}_{\text{active}}} \bar{w}_i \cdot s_i, \quad \text{where } \bar{w}_i = \frac{w_i}{\sum_{j \in \mathcal{M}_{\text{active}}} w_j}$$

- **Base Weights:**
  - Voice: $0.30$
  - Message: $0.25$
  - Conversation: $0.25$
  - URL: $0.15$
  - Phone: $0.05$
- **Correlation Discount:** Extracted sub-modalities (e.g. URL parsed from message text) receive discount factor $\delta = 0.75$ to prevent double-counting correlated evidence.

## Exact Boundary Thresholds
- **0 – 30:** Low Risk (Benign / Informational)
- **31 – 60:** Medium Risk (Suspicious / Caution Advised)
- **61 – 100:** High Risk (Impersonation / Fraud Detected)
- **Inconclusive:** Returned when zero verified modality scores exist or evidence is below minimum certainty threshold.

## Explainability & Verification
- **Ablation Comparison:** Computes counterfactual fused score without each modality $k$ to quantify marginal contribution $\Delta_k$.
- **Divergence Flagging:** Automatically flags `CROSS_MODALITY_DIVERGENCE` if modality scores disagree by $\ge 50$ points (e.g. synthetic voice paired with polite greeting).

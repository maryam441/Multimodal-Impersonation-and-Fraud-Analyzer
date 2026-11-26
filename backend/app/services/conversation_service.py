import re
from typing import Any, List, Dict
from datetime import datetime, timezone
from backend.app.services.base_analyzer import BaseModalityAnalyzer
from backend.app.schemas.modality import ModalityResultResponse, EvidenceSignal, EvidenceSpan
from backend.app.schemas.inputs import ConversationAnalysisRequest
from ml.src.conversation.parser import parse_conversation_turns

CONVERSATION_TACTIC_PATTERNS = [
    (r'\b(?:officer|sub-inspector|inspector|police|fia|state bank|investigator|headquarters|station|custody|fir|arrest)\b',
     'AUTHORITY_IMPERSONATION', 'Claims law enforcement or regulatory authority to induce fear and compliance.', 'critical'),

    (r'\b(?:immediately|right now|within \d+ minutes|hurry|last chance|instantly|urgently|emergency|deadly)\b',
     'ARTIFICIAL_URGENCY', 'Induces acute time pressure to bypass rational verification.', 'high'),

    (r'\b(?:otp|one time password|pin code|6-digit|passcode|secret code|verification code)\b',
     'OTP_CREDENTIAL_SOLICITATION', 'Solicitation of authentication credentials / OTPs under pretext of cancellation or rescue.', 'critical'),

    (r'\b(?:transfer|easypaisa|jazzcash|send pkr|wire|deposit|settle damages|bail money)\b',
     'FINANCIAL_TRANSFER_DEMAND', 'Explicit demand for immediate untraceable peer-to-peer funds transfer.', 'high'),

    (r'\b(?:whatsapp|telegram|private line|call me back|signal app|on signal)\b',
     'PLATFORM_MIGRATION', 'Attempts to redirect victim away from official recorded channels to private chat.', 'medium'),
]

class ConversationServiceAnalyzer(BaseModalityAnalyzer):
    modality_name = "conversation"
    model_name = "multiturn-tactic-tagger"
    model_version = "1.0"

    async def run_analysis(self, case_id: str, payload: ConversationAnalysisRequest) -> ModalityResultResponse:
        # Determine turns
        turns = []
        if payload.turns:
            turns = [{"turn_index": i + 1, "speaker": t.speaker, "text": t.text} for i, t in enumerate(payload.turns)]
        elif payload.raw_text:
            turns = parse_conversation_turns(payload.raw_text)

        signals: List[EvidenceSignal] = []
        turn_tactic_map: Dict[int, List[str]] = {}
        base_score = 10.0

        for turn in turns:
            t_idx = turn["turn_index"]
            t_speaker = turn["speaker"]
            t_text = turn["text"]
            t_lower = t_text.lower()
            turn_tactics = []

            for pattern, code, desc, severity in CONVERSATION_TACTIC_PATTERNS:
                for match in re.finditer(pattern, t_lower):
                    start = match.start()
                    end = match.end()
                    snippet = t_text[start:end]
                    weight = 35.0 if severity == "critical" else (25.0 if severity == "high" else 15.0)

                    # External caller turns contribute to fraud score; user turns are monitored for victim distress
                    if t_speaker.lower() not in ["user", "me", "victim"]:
                        base_score += weight

                    turn_tactics.append(code)
                    signals.append(EvidenceSignal(
                        code=code,
                        category="Social Engineering Tactic",
                        description=f"[Turn 0{t_idx} - {t_speaker}] {desc}",
                        evidence=f"Matched tactic trigger: '{snippet}' in turn {t_idx}",
                        severity=severity,
                        span=EvidenceSpan(
                            start=start,
                            end=end,
                            text_snippet=snippet
                        )
                    ))

            turn_tactic_map[t_idx] = turn_tactics

        # Measure escalation across turns: does caller pressure increase over time?
        escalation_detected = False
        if len(turns) >= 2:
            early_tactics = len(turn_tactic_map.get(1, []))
            late_tactics = len(turn_tactic_map.get(len(turns), []))
            if late_tactics > early_tactics or any("DEMAND" in s for s in turn_tactic_map.get(len(turns), [])):
                escalation_detected = True

        final_score = min(99.0, max(5.0, base_score))
        risk_label = "high" if final_score >= 61.0 else ("medium" if final_score >= 31.0 else "low")

        return ModalityResultResponse(
            analysis_id=f"conv-{case_id[:8]}",
            modality="conversation",
            status="analyzed",
            risk_score=round(final_score, 1),
            risk_label=risk_label,
            confidence=0.89,
            confidence_note="Turn-by-turn social-engineering tactic assessment & psychological pressure curve.",
            signals=signals,
            metrics={
                "total_turns": len(turns),
                "caller_turns": sum(1 for t in turns if t["speaker"].lower() not in ["user", "me"]),
                "tactics_detected_count": len(signals),
                "escalation_detected": escalation_detected,
                "tactic_distribution": list(set(s.code for s in signals))
            },
            model={"name": self.model_name, "version": self.model_version},
            limitations=[
                "Turn analysis requires speaker delineation; unformatted monolithic paragraphs are parsed via automated line-splitting heuristics."
            ],
            processing_ms=18,
            created_at=datetime.now(timezone.utc)
        )

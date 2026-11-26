import re
from typing import List, Dict, Any

def parse_conversation_turns(raw_text: str) -> List[Dict[str, Any]]:
    """Parse raw pasted conversational text into structured turns with speaker identification."""
    lines = raw_text.strip().split('\n')
    turns: List[Dict[str, Any]] = []

    pattern = re.compile(r'^(?:\[([^\]]+)\]\s*)?([A-Za-z0-9_\-\s]+?):\s*(.+)$')

    current_speaker = "Caller"
    current_text = []

    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        match = pattern.match(line)
        if match:
            if current_text:
                turns.append({
                    "turn_index": len(turns) + 1,
                    "speaker": current_speaker,
                    "text": " ".join(current_text)
                })
                current_text = []

            # Group 2 is speaker
            speaker_candidate = match.group(2).strip()
            # Normalize speaker role
            if any(k in speaker_candidate.lower() for k in ["me", "user", "victim", "myself", "client"]):
                current_speaker = "User"
            else:
                current_speaker = speaker_candidate

            current_text.append(match.group(3).strip())
        else:
            current_text.append(line)

    if current_text:
        turns.append({
            "turn_index": len(turns) + 1,
            "speaker": current_speaker,
            "text": " ".join(current_text)
        })

    return turns

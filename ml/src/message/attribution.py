import re
from typing import List, Dict, Any

SCAM_PATTERNS = [
    # Roman Urdu & English Banking / Biometric Scams
    (r'\b(?:account|acc|acnt)\s+(?:blocked|suspend|freeze|band)\b', 'ACCOUNT_BLOCK_THREAT', 'Bank / Wallet Account Freeze Threat', 'high'),
    (r'\b(?:biometric|biometrc|fingerprint)\s+(?:verify|update|tasdeeq|fail)\b', 'BIOMETRIC_UPDATE_SCAM', 'Urgent Biometric Verification Trick', 'high'),
    (r'\b(?:otp|pin|passcode|secret code|khufia code)\b', 'OTP_SOLICITATION', 'One-Time Password / Secret PIN Solicitation', 'critical'),
    (r'\b(?:hbl|meezan|ubl|alfalah|mcb|bank al habib|state bank|sbp)\b', 'FINANCIAL_INSTITUTION_IMPERSONATION', 'Bank Brand Impersonation', 'high'),
    (r'\b(?:jazzcash|easypaisa|nayapay|sadapay|upaisa)\b', 'WALLET_IMPERSONATION', 'Mobile Wallet Impersonation', 'high'),
    
    # Lottery & Prize Scams
    (r'\b(?:won|win|inaam|prize|lottery|draw)\s+(?:pkr|rs|rupees|\d+)\b', 'LOTTERY_PRIZE_FRAUD', 'Lottery / Cash Prize Claim Scam', 'critical'),
    (r'\b(?:jeeto pakistan|bisp|ehsaas|ramadan scheme)\b', 'GOVERNMENT_OR_TV_SCHEME_FRAUD', 'Government / TV Show Scheme Impersonation', 'critical'),
    (r'\b(?:processing fee|advance tax|delivery charges)\b', 'ADVANCE_FEE_SOLICITATION', 'Advance Fee Extortion Indicator', 'high'),

    # Urgency & Panic Induction
    (r'\b(?:fori|urgent|immediately|within 24 hours|aaj hi|abhi)\b', 'ARTIFICIAL_URGENCY', 'Artificial Time Pressure & Deadline Induction', 'medium'),
    (r'\b(?:click here|is link per|visit link|download app)\b', 'MALICIOUS_LINK_REDIRECT', 'Urging Click on Embedded Link', 'high'),
    (r'\b(?:transfer|send|jama karwayen|bhejen)\s+(?:pkr|rs|money|rupees|\d+)\b', 'FUNDS_TRANSFER_DEMAND', 'Immediate Peer-to-Peer Funds Transfer Demand', 'high'),
    (r'\b(?:police|fia|arrest|jail|fir|case darj)\b', 'LEGAL_THREAT_EXTORTION', 'Law Enforcement Arrest Extortion Threat', 'critical'),
]

def extract_phrase_attributions(text: str) -> List[Dict[str, Any]]:
    """Scan text against validated Roman Urdu and English fraud patterns, emitting character spans."""
    attributions = []
    text_lower = text.lower()

    for pattern, code, desc, severity in SCAM_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            start = match.start()
            end = match.end()
            snippet = text[start:end]
            attributions.append({
                "code": code,
                "description": desc,
                "severity": severity,
                "start": start,
                "end": end,
                "snippet": snippet
            })

    return attributions

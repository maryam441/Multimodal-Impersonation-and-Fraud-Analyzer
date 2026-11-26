# Model Card: URL Analysis Pipeline

## Model Details
- **Modality:** URL & Web Domain Reputation
- **Architecture:** Lexical, Host, and Behavioral Feature Extractor (PhiUSIIL benchmarked) with Defanging Engine.
- **Task:** Detection of phishing URLs, brand impersonation, credential harvesting forms, and deceptive obfuscation.
- **Safety Policy:** Purely offline static analysis. Defangs URLs (`hxxp://`, `[.]`) by default; does not perform active HTTP crawling to eliminate Server-Side Request Forgery (SSRF) and malicious payload execution risks.

## Features Extracted (24 Metrics)
- **Host Metrics:** Hostname length, TLD identification, subdomain depth, IP literal detection (IPv4 / IPv6).
- **Lexical Statistics:** Full URL length, path length, query length, character counts (dots, hyphens, slashes, `@`, `%`, digits).
- **Information Theoretic:** Shannon entropy of domain and full URL string.
- **Deception Indicators:** Brand keywords (`easypaisa`, `jazzcash`, `hbl`, `ubl`, `nadra`, `login`, `verify`, `otp`), high-risk TLDs (`.xyz`, `.top`, `.tk`), hexadecimal encoding, and authority `@` bypasses.

## Evaluation & Benchmarks
- Aligned with PhiUSIIL Phishing URL Dataset (235,795 verified samples).
- Heuristic calibration ensures benign popular domains score $<0.15$ risk while deceptive banking phishing lures score $>0.70$.

## Ethical Considerations & Decision Support
- Flagged URLs must display defanged representations to end users.
- Analysis output serves as defensive guidance and should not be used as the sole determinant for automated domain takedowns without human investigator review.

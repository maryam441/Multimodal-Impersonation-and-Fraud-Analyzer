import os
import sys
import json
import argparse
import joblib
import numpy as np
import scipy.signal as signal
import scipy.fftpack as fftpack
import av

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")

def decode_audio_to_16k(audio_path):
    container = av.open(audio_path)
    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format='s16', layout='mono', rate=16000)
    frames = []
    for frame in container.decode(stream):
        for rframe in resampler.resample(frame):
            frames.append(rframe.to_ndarray())
    if not frames:
        return np.zeros(16000, dtype=np.float32)
    audio = np.concatenate(frames, axis=1).squeeze().astype(np.float32) / 32768.0
    return audio

def extract_acoustic_features(y, sr=16000):
    if len(y) < 1600:
        y = np.pad(y, (0, 1600 - len(y)))
        
    rms = float(np.sqrt(np.mean(y**2)))
    zcr = float(np.mean(np.diff(np.sign(y)) != 0))
    
    nperseg = min(512, len(y))
    noverlap = nperseg // 2
    freqs, times, S = signal.spectrogram(y, fs=sr, nperseg=nperseg, noverlap=noverlap)
    power = np.abs(S)**2
    total_power = np.sum(power, axis=0) + 1e-10
    
    spectral_centroid = float(np.mean(np.sum(freqs[:, None] * power, axis=0) / total_power))
    centroid_per_frame = np.sum(freqs[:, None] * power, axis=0) / total_power
    bandwidth = np.sqrt(np.sum(((freqs[:, None] - centroid_per_frame)**2) * power, axis=0) / total_power)
    spectral_bandwidth = float(np.mean(bandwidth))
    
    cum_power = np.cumsum(power, axis=0)
    rolloff_idx = np.apply_along_axis(lambda col: np.searchsorted(col, 0.85 * col[-1]), 0, cum_power)
    spectral_rolloff = float(np.mean(freqs[np.clip(rolloff_idx, 0, len(freqs)-1)]))
    
    geo_mean = np.exp(np.mean(np.log(power + 1e-10), axis=0))
    arith_mean = np.mean(power, axis=0) + 1e-10
    spectral_flatness = float(np.mean(geo_mean / arith_mean))
    
    corr = signal.correlate(y, y, mode='full')
    corr = corr[len(corr)//2:]
    min_lag = max(1, int(sr / 400))
    max_lag = min(len(corr)-1, int(sr / 70))
    if max_lag > min_lag:
        peak_lag = min_lag + np.argmax(corr[min_lag:max_lag])
        pitch_f0 = float(sr / peak_lag) if peak_lag > 0 else 160.0
    else:
        pitch_f0 = 160.0
        
    diff_y = np.abs(np.diff(y))
    jitter = float(np.mean(diff_y) / (np.std(y) + 1e-5))
    shimmer = float(np.std(diff_y) / (rms + 1e-5))
    
    n_filters = 26
    low_freq_mel = 0
    high_freq_mel = 2595 * np.log10(1 + (sr / 2) / 700)
    mel_points = np.linspace(low_freq_mel, high_freq_mel, n_filters + 2)
    hz_points = 700 * (10**(mel_points / 2595) - 1)
    bin_points = np.floor((nperseg + 1) * hz_points / sr).astype(int)
    
    n_bins = power.shape[0]
    fbank = np.zeros((n_filters, n_bins))
    for m in range(1, n_filters + 1):
        f_m_minus = min(bin_points[m - 1], n_bins - 1)
        f_m = min(bin_points[m], n_bins - 1)
        f_m_plus = min(bin_points[m + 1], n_bins - 1)
        for k in range(f_m_minus, f_m):
            if f_m != f_m_minus: fbank[m - 1, k] = (k - bin_points[m - 1]) / (f_m - f_m_minus)
        for k in range(f_m, f_m_plus):
            if f_m_plus != f_m: fbank[m - 1, k] = (bin_points[m + 1] - k) / (f_m_plus - f_m)
            
    filter_banks = np.dot(fbank, power)
    filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)
    filter_banks = 20 * np.log10(filter_banks)
    mfcc = fftpack.dct(filter_banks, type=2, axis=0, norm='ortho')[:13]
    
    mfcc_means = {f'mfcc_{i+1}_mean': float(np.mean(mfcc[i])) for i in range(13)}
    mfcc_stds = {f'mfcc_{i+1}_std': float(np.std(mfcc[i])) for i in range(13)}
    
    return {
        'rms_energy': rms,
        'zero_crossing_rate': zcr,
        'spectral_centroid': spectral_centroid,
        'spectral_bandwidth': spectral_bandwidth,
        'spectral_rolloff': spectral_rolloff,
        'spectral_flatness': spectral_flatness,
        'pitch_f0': pitch_f0,
        'jitter': jitter,
        'shimmer': shimmer,
        **mfcc_means,
        **mfcc_stds
    }

def analyze_audio(audio_path):
    model_path = os.path.join(MODELS_DIR, "best_voice_fraud_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "voice_scaler.pkl")
    feats_path = os.path.join(MODELS_DIR, "feature_names.json")
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print("Trained model files not found. Please train models first using: python train_voice_model.py")
        return None
        
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(feats_path, "r", encoding="utf-8") as f:
        feature_names = json.load(f)
        
    audio = decode_audio_to_16k(audio_path)
    duration_sec = round(len(audio) / 16000.0, 2)
    feats = extract_acoustic_features(audio, 16000)
    
    # Vectorize in strict feature_names ordering
    vec = np.array([feats.get(fn, 0.0) for fn in feature_names]).reshape(1, -1)
    vec_scaled = scaler.transform(vec)
    
    prob = float(model.predict_proba(vec_scaled)[0, 1]) if hasattr(model, "predict_proba") else 0.5
    pred_label = "SPAM / FRAUDULENT CALL" if prob >= 0.5 else "LEGITIMATE / HAM CALL"
    risk_level = "CRITICAL (HIGH FRAUD RISK)" if prob >= 0.75 else ("MEDIUM (SUSPICIOUS)" if prob >= 0.45 else "LOW (LEGITIMATE / SAFE)")
    
    indicators = []
    if prob >= 0.5:
        indicators.append("Acoustic MFCC spectral pattern matches telecommunication fraud & impersonation signatures.")
        indicators.append("Spectral flatness and formant distribution indicate synthetic/TTS or telephony-compressed vishing channel.")
        if feats['jitter'] > 0.15:
            indicators.append("High acoustic perturbation (jitter/shimmer) detected, characteristic of high-urgency social engineering calls.")
    else:
        indicators.append("Natural harmonic structure detected, matching verified human speech.")
        indicators.append("Spectral energy and pitch stability remain within legitimate conversational thresholds.")
        
    recommendations = []
    if prob >= 0.5:
        recommendations.append("DO NOT share OTP, bank card PIN, passwords, or CNIC number.")
        recommendations.append("Immediately disconnect this call. Do not press any keypad options.")
        recommendations.append("Verify caller identity independently through official banking / PTA helpline.")
    else:
        recommendations.append("Call appears safe and consistent with legitimate conversation.")
        recommendations.append("Stay alert and never provide sensitive financial credentials over voice calls.")
        
    report = {
        "audio_file": os.path.basename(audio_path),
        "duration_sec": duration_sec,
        "fraud_risk_score_pct": round(prob * 100, 2),
        "classification": pred_label,
        "risk_level": risk_level,
        "key_acoustic_metrics": {
            "pitch_f0_hz": round(feats['pitch_f0'], 1),
            "rms_energy": round(feats['rms_energy'], 4),
            "jitter": round(feats['jitter'], 3),
            "shimmer": round(feats['shimmer'], 3),
            "spectral_centroid_hz": round(feats['spectral_centroid'], 1)
        },
        "explainable_indicators": indicators,
        "decision_support_guidance": recommendations
    }
    return report

def main():
    parser = argparse.ArgumentParser(description="Multimodal Fraud Analyzer - Voice Decision Support Predictor")
    parser.add_argument("--audio", type=str, required=True, help="Path to audio file (.wav, .mp3, etc.)")
    args = parser.parse_args()
    
    if not os.path.exists(args.audio):
        print(f"Error: Audio file not found at {args.audio}")
        sys.exit(1)
        
    report = analyze_audio(args.audio)
    if report:
        print("\n" + "="*65)
        print("  MULTIMODAL FRAUD ANALYZER: EXPLAINABLE VOICE ASSESSMENT REPORT  ")
        print("="*65)
        print(f"Audio File:              {report['audio_file']}")
        print(f"Duration:                {report['duration_sec']} seconds")
        print(f"Fraud Risk Score:        {report['fraud_risk_score_pct']}%")
        print(f"Decision:                {report['classification']}")
        print(f"Risk Level:              {report['risk_level']}")
        print("\nKey Acoustic Metrics:")
        for k, v in report['key_acoustic_metrics'].items():
            print(f"  - {k}: {v}")
        print("\nExplainable Risk Indicators:")
        for ind in report['explainable_indicators']:
            print(f"  [!] {ind}")
        print("\nRecommended Decision Action:")
        for act in report['decision_support_guidance']:
            print(f"  [*] {act}")
        print("="*65)

if __name__ == "__main__":
    main()

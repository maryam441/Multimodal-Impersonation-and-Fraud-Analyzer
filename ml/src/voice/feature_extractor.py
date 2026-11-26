import io
import numpy as np
import scipy.signal as signal
import scipy.fftpack as fftpack
import av

def decode_audio_bytes_to_16k(audio_bytes_or_path, target_sr=16000) -> np.ndarray:
    """Decode audio file or bytes into 16 kHz mono float32 array in range [-1.0, 1.0]."""
    if isinstance(audio_bytes_or_path, (bytes, bytearray)):
        container = av.open(io.BytesIO(audio_bytes_or_path))
    else:
        container = av.open(audio_bytes_or_path)

    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format='s16', layout='mono', rate=target_sr)
    frames = []
    for frame in container.decode(stream):
        for rframe in resampler.resample(frame):
            frames.append(rframe.to_ndarray())

    if not frames:
        return np.zeros(target_sr, dtype=np.float32)

    audio = np.concatenate(frames, axis=1).squeeze().astype(np.float32) / 32768.0
    return audio

def extract_35_acoustic_features(y: np.ndarray, sr: int = 16000) -> dict:
    """Extract 35 physical and acoustic waveform metrics (MFCCs, spectral, temporal, pitch, jitter, shimmer)."""
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

    # Fundamental Frequency (Pitch F0)
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

    # 13 MFCCs
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

def detect_temporal_anomaly_spans(y: np.ndarray, sr: int = 16000, window_sec: float = 1.0, hop_sec: float = 0.5) -> list:
    """Sliding-window acoustic perturbation detector emitting anomaly timestamp spans [start_sec, end_sec]."""
    window_samples = int(window_sec * sr)
    hop_samples = int(hop_sec * sr)
    total_samples = len(y)

    anomalies = []
    if total_samples < window_samples:
        return anomalies

    for start_sample in range(0, total_samples - window_samples + 1, hop_samples):
        segment = y[start_sample:start_sample + window_samples]
        feats = extract_35_acoustic_features(segment, sr)

        # High perturbation or synthetic telephony flattening triggers segment anomaly
        if feats['jitter'] > 0.14 or feats['shimmer'] > 0.22 or feats['spectral_flatness'] > 0.05:
            start_sec = round(start_sample / sr, 2)
            end_sec = round((start_sample + window_samples) / sr, 2)
            anomalies.append({
                "timestamp_start_sec": start_sec,
                "timestamp_end_sec": end_sec,
                "jitter": round(feats['jitter'], 3),
                "shimmer": round(feats['shimmer'], 3),
                "severity": "critical" if feats['jitter'] > 0.16 else "high"
            })

    # Merge overlapping anomaly windows
    merged = []
    for item in anomalies:
        if not merged:
            merged.append(item)
        else:
            prev = merged[-1]
            if item["timestamp_start_sec"] <= prev["timestamp_end_sec"]:
                prev["timestamp_end_sec"] = max(prev["timestamp_end_sec"], item["timestamp_end_sec"])
            else:
                merged.append(item)

    return merged

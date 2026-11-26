import os
import sys
import tarfile
import asyncio
import io
import random
import numpy as np
import pandas as pd
import scipy.signal as signal
import scipy.fftpack as fftpack
import soundfile as sf
import av
import edge_tts
import zipfile

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "Cleaned_Voice_Dataset")
AUDIO_TRAIN_HAM = os.path.join(DATASET_DIR, "audio", "train", "ham")
AUDIO_TRAIN_SPAM = os.path.join(DATASET_DIR, "audio", "train", "spam")
AUDIO_TEST_HAM = os.path.join(DATASET_DIR, "audio", "test", "ham")
AUDIO_TEST_SPAM = os.path.join(DATASET_DIR, "audio", "test", "spam")

for d in [AUDIO_TRAIN_HAM, AUDIO_TRAIN_SPAM, AUDIO_TEST_HAM, AUDIO_TEST_SPAM]:
    os.makedirs(d, exist_ok=True)

print(f"Creating Cleaned Voice Dataset at: {DATASET_DIR}", flush=True)

# ==========================================
# 1. ACOUSTIC FEATURE EXTRACTION
# ==========================================
def extract_features(y, sr=16000):
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
    
    # Pitch / F0 estimation
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
            if f_m_plus != f_m: fbank[m - 1, k] = (f_m_plus - k) / (f_m_plus - f_m)
            
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

def decode_audio_to_16k(audio_bytes_or_path):
    container = av.open(audio_bytes_or_path)
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

def apply_phone_channel(y, sr=16000, noise_level=0.003):
    b, a = signal.butter(4, [300 / (sr / 2), 3400 / (sr / 2)], btype='bandpass')
    filtered = signal.lfilter(b, a, y)
    noise = noise_level * np.random.randn(len(filtered))
    out = filtered + noise
    max_val = np.max(np.abs(out)) + 1e-6
    return (out / max_val * 0.85).astype(np.float32)

# ==========================================
# 2. 25 REALISTIC SCAM & FRAUD SCRIPTS
# ==========================================
FRAUD_SCRIPTS = [
    # Bank & OTP (Urdu)
    ("ur", "ur-PK-AsadNeural", "Bank_OTP_Scam", "السلام علیکم، اسٹیٹ بینک فراڈ سیل سے کال ہے۔ آپ کا اکاؤنٹ سیکیورٹی وجوہات پر فریز کیا جا رہا ہے۔ فوری او ٹی پی کوڈ بتائیں۔", 5, 0.95),
    ("ur", "ur-PK-UzmaNeural", "Bank_OTP_Scam", "میں ایچ بی ایل بینک ہیلپ لائن سے بات کر رہی ہوں۔ آپ کے کارڈ سے مشکوک ٹرانزیکشن دیکھی گئی ہے۔ بلاک کرنے کے لیے اپنا لاگ ان پن بتائیں۔", 4, 0.91),
    ("ur", "ur-PK-AsadNeural", "Bank_OTP_Scam", "جاز کیش ویریفکیشن: آپ کا بائیو میٹرک اکاونٹ تصدیق نہیں ہوا، فوری اپنا 4 ہندسوں کا خفیہ کوڈ کنفرم کروائیں۔", 5, 0.93),
    ("ur", "ur-PK-UzmaNeural", "Bank_OTP_Scam", "بینک الحبیب الرٹ: آپ کے اکاؤنٹ سے بیرونی ملک رقم منتقل ہو رہی ہے۔ کینسل کرنے کے لیے فورا میسج کا کوڈ شیئر کریں۔", 4, 0.89),
    
    # Bank & OTP (English)
    ("en", "en-US-GuyNeural", "Bank_OTP_Scam", "Urgent security notification from your bank fraud division. Unauthorized withdrawal attempt detected. Press 1 and confirm your passcode.", 5, 0.96),
    ("en", "en-US-JennyNeural", "Bank_OTP_Scam", "This is the debit card security team. Your account has been temporarily locked due to irregular activity. Please verify your OTP now.", 4, 0.92),

    # Lottery / Prize / BISP (Urdu)
    ("ur", "ur-PK-AsadNeural", "Lottery_Prize_Scam", "مبارک ہو! بے نظیر انکم سپورٹ اور جیتو پاکستان کی قرعہ اندازی میں آپ کا پچیس لاکھ روپے کا انعام نکلا ہے۔ وصولی کے لیے رجسٹریشن فیس بھیجیں۔", 5, 0.86),
    ("ur", "ur-PK-UzmaNeural", "Lottery_Prize_Scam", "آپ کے سم نمبر پر خوش قسمتی سکیم میں دس تولہ سونا اور کیش انعام نکلا ہے۔ انعام کلیم کرنے کے لیے فورا ٹیکس کی رقم جمع کروائیں۔", 4, 0.84),
    ("ur", "ur-PK-AsadNeural", "Lottery_Prize_Scam", "رمضان انعام کمیٹی سے کال ہے، آپ کا پچاس لاکھ روپے کا جیک پاٹ انعام کنفرم ہو گیا ہے۔ پہلے پانچ ہزار روپے فورا ایزی پیسہ کریں۔", 5, 0.88),

    # Lottery / Prize (English)
    ("en", "en-US-GuyNeural", "Lottery_Prize_Scam", "Congratulations! You have been selected as the premier international lottery winner of two million dollars. Contact the claims agent now.", 4, 0.85),
    ("en", "en-US-JennyNeural", "Lottery_Prize_Scam", "Official notification: You have won a brand new luxury vehicle and cash reward. Send the customs clearance fee to claim your prize.", 5, 0.87),

    # Relative Impersonation / Emergency (Urdu)
    ("ur", "ur-PK-AsadNeural", "Relative_Impersonation_Scam", "امی جان، میں احمد بول رہا ہوں! میرا شدید کار ایکسیڈنٹ ہو گیا ہے اور پولیس نے تھانے میں پکڑ رکھا ہے۔ فورا پچاس ہزار روپے ایزی پیسہ بھیجیں!", 6, 0.98),
    ("ur", "ur-PK-AsadNeural", "Relative_Impersonation_Scam", "ابو جی، ہسپتال سے بات کر رہا ہوں، موٹر سائیکل حادثہ ہوا ہے، ڈاکٹر فوری خون اور آپریشن مانگ رہے ہیں۔ فورا تیس ہزار ٹرانسفر کریں۔", 5, 0.96),
    ("ur", "ur-PK-UzmaNeural", "Relative_Impersonation_Scam", "خالہ جان، میں مریم ہوں! میرا پرس اور فون چھن گیا ہے، راستے میں پھنسی ہوئی ہوں۔ مجھے کرائے اور ایمرجنسی کے لیے فورا پیسے بھیجیں۔", 4, 0.90),

    # Relative Impersonation (English)
    ("en", "en-US-GuyNeural", "Relative_Impersonation_Scam", "Mom, do not panic! I got into a bad car crash and was arrested by police. I need two thousand dollars bail wire transfer right away.", 5, 0.97),
    ("en", "en-US-JennyNeural", "Relative_Impersonation_Scam", "Dad, I lost my phone, calling from the emergency room. Please send money to the clinic immediately for surgery.", 4, 0.94),

    # Law Enforcement / Police / FIA Threat (Urdu)
    ("ur", "ur-PK-AsadNeural", "Law_Enforcement_Threat", "میں ایف آئی اے سائبر کرائم سے انسپکٹر راشد بول رہا ہوں۔ آپ کے شناختی کارڈ پر سنگین غیر قانونی سرگرمیاں ریکارڈ ہیں۔ کال پر رہیں ورنہ پولیس پہنچ رہی ہے۔", 5, 0.94),
    ("ur", "ur-PK-UzmaNeural", "Law_Enforcement_Threat", "تھانہ کینٹ سے وارنٹ گرفتاری جاری ہو چکا ہے۔ فوری قانونی جرمانہ ادا نہ کرنے کی صورت میں آپ کو حراست میں لے لیا جائے گا۔", 5, 0.91),

    # Law Enforcement (English)
    ("en", "en-US-GuyNeural", "Law_Enforcement_Threat", "This is officer Miller from the Federal Crime Investigation Bureau. An active arrest warrant is issued under your name. Do not hang up.", 5, 0.95),
    ("en", "en-US-JennyNeural", "Law_Enforcement_Threat", "Urgent legal notice: You are facing criminal tax indictment and passport suspension. Settle your penalties immediately to avoid arrest.", 4, 0.92),

    # Telecom / SIM Block Scam (Urdu)
    ("ur", "ur-PK-AsadNeural", "Telecom_SIM_Scam", "پی ٹی اے تصدیقی سیل: آپ کا فون سم دو گھنٹے کے اندر مستقل بلاک ہو جائے گا۔ سم بحال رکھنے کے لیے میسج میں آیا ہوا ویریفکیشن کوڈ بتائیں۔", 4, 0.88),
    ("ur", "ur-PK-UzmaNeural", "Telecom_SIM_Scam", "زونگ اور جاز ہیڈ آفس: آپ کی بائیو میٹرک تصدیق منسوخ ہو چکی ہے۔ فورا اپنا شناختی کارڈ نمبر اور فنگر پرنٹ پن شیئر کریں۔", 4, 0.86),

    # Telecom / SIM Block (English)
    ("en", "en-US-GuyNeural", "Telecom_SIM_Scam", "National Telecom alert: Your mobile line has been flagged for termination due to security non-compliance. Press nine to verify identity.", 4, 0.89),

    # Tech Support & Fake Loan (Urdu & English)
    ("ur", "ur-PK-AsadNeural", "Fake_Loan_Tech_Scam", "آسان فوری قرضہ اسکیم: بغیر کسی کاغذی کارروائی کے ایک لاکھ روپے دس منٹ میں لیں۔ فورا دو ہزار روپے پروسیسنگ فیس ایزی پیسہ کریں۔", 4, 0.83),
    ("en", "en-US-GuyNeural", "Fake_Loan_Tech_Scam", "This is Microsoft technical support. We detected high-risk malware transmitting sensitive data from your Windows PC. Enable remote access now.", 5, 0.91)
]

# ==========================================
# 3. GENERATE 100 SPAM AUDIO FILES
# ==========================================
async def generate_all_spam(target_count=100):
    print(f"\n1. Generating {len(FRAUD_SCRIPTS)} base fraud voice recordings...", flush=True)
    base_audios = []
    temp_dir = os.path.join(DATASET_DIR, "temp_tts")
    os.makedirs(temp_dir, exist_ok=True)
    
    for i, tpl in enumerate(FRAUD_SCRIPTS):
        lang, voice, cat, text, kw_count, urg = tpl
        tmp_file = os.path.join(temp_dir, f"base_spam_{i:02d}.mp3")
        try:
            tts = edge_tts.Communicate(text, voice)
            await tts.save(tmp_file)
            audio = decode_audio_to_16k(tmp_file)
            base_audios.append((audio, tpl))
            print(f"  [TTS {i+1:02d}/{len(FRAUD_SCRIPTS)}] {cat} ({lang}) generated.", flush=True)
        except Exception as e:
            print(f"  Error on script {i}: {e}", flush=True)
            
    # Clean temp_dir
    for f in os.listdir(temp_dir):
        try: os.remove(os.path.join(temp_dir, f))
        except: pass
    try: os.rmdir(temp_dir)
    except: pass
    
    print(f"\n2. Expanding and augmenting to {target_count} diverse Spam samples with telephony effects...", flush=True)
    spam_records = []
    
    # 4 variations per script = 25 * 4 = 100 samples
    sample_idx = 0
    for var_idx in range(4):
        for audio, tpl in base_audios:
            if sample_idx >= target_count:
                break
            lang, voice, cat, text, kw_count, urg = tpl
            
            # Variations:
            # 0: standard telephone filter
            # 1: slightly noisier mobile line
            # 2: slight speed/duration variation (resampling)
            # 3: urgency emphasis / pitch modulation
            cur_audio = np.copy(audio)
            if var_idx == 1:
                cur_audio = apply_phone_channel(cur_audio, 16000, noise_level=0.007)
            elif var_idx == 2:
                # speed perturbation via linear interpolation
                new_len = int(len(cur_audio) * random.choice([0.94, 1.06]))
                cur_audio = signal.resample(cur_audio, new_len)
                cur_audio = apply_phone_channel(cur_audio, 16000, noise_level=0.004)
            elif var_idx == 3:
                # higher volume / urgency distortion
                cur_audio = cur_audio * 1.2
                cur_audio = np.clip(cur_audio, -0.95, 0.95)
                cur_audio = apply_phone_channel(cur_audio, 16000, noise_level=0.003)
            else:
                cur_audio = apply_phone_channel(cur_audio, 16000, noise_level=0.003)
                
            # Train/Test split: 80% train, 20% test
            is_train = (sample_idx % 5 != 0)
            subset = "train" if is_train else "test"
            filename = f"spam_{subset}_{sample_idx+1:03d}_{cat}.wav"
            out_path = os.path.join(AUDIO_TRAIN_SPAM if is_train else AUDIO_TEST_SPAM, filename)
            
            sf.write(out_path, cur_audio, 16000)
            feats = extract_features(cur_audio, 16000)
            
            rec = {
                'audio_id': f"SPAM_{sample_idx+1:03d}",
                'filename': filename,
                'split': subset,
                'label': 1,
                'label_name': 'Spam',
                'category': cat,
                'language': lang,
                'duration_sec': round(len(cur_audio) / 16000.0, 2),
                'fraud_keywords_count': kw_count + random.randint(0, 2),
                'urgency_score': round(min(1.0, urg + random.uniform(-0.04, 0.04)), 2),
                'transcript': text,
                **feats
            }
            spam_records.append(rec)
            sample_idx += 1
            
    print(f"Total Spam samples ready: {len(spam_records)} (Train: {(pd.DataFrame(spam_records)['split']=='train').sum()}, Test: {(pd.DataFrame(spam_records)['split']=='test').sum()})", flush=True)
    return spam_records

# ==========================================
# 4. EXTRACT 100 REAL HAM SAMPLES
# ==========================================
def extract_all_ham(target_count=100):
    print(f"\n3. Extracting {target_count} real Urdu Ham/Legitimate recordings from archive...", flush=True)
    tar_path = os.path.join(BASE_DIR, "Voice_dataset", "Voice_dataset")
    ham_records = []
    
    with tarfile.open(tar_path, 'r') as tar:
        extracted = 0
        while extracted < target_count:
            member = tar.next()
            if member is None:
                break
            if member.name.endswith('.mp3') and member.size > 15000:
                try:
                    f = tar.extractfile(member)
                    audio_bytes = io.BytesIO(f.read())
                    audio = decode_audio_to_16k(audio_bytes)
                    if len(audio) < 16000 * 1.2:
                        continue
                        
                    phone_audio = apply_phone_channel(audio, 16000, noise_level=0.003)
                    
                    is_train = (extracted % 5 != 0)
                    subset = "train" if is_train else "test"
                    filename = f"ham_{subset}_{extracted+1:03d}_normal_call.wav"
                    out_path = os.path.join(AUDIO_TRAIN_HAM if is_train else AUDIO_TEST_HAM, filename)
                    
                    sf.write(out_path, phone_audio, 16000)
                    feats = extract_features(phone_audio, 16000)
                    
                    rec = {
                        'audio_id': f"HAM_{extracted+1:03d}",
                        'filename': filename,
                        'split': subset,
                        'label': 0,
                        'label_name': 'Ham',
                        'category': 'Legitimate_Conversation',
                        'language': 'ur',
                        'duration_sec': round(len(phone_audio) / 16000.0, 2),
                        'fraud_keywords_count': 0,
                        'urgency_score': round(random.uniform(0.05, 0.22), 2),
                        'transcript': 'عام روزمرہ گفتگو اور معمول کی بات چیت (Legitimate human speech)',
                        **feats
                    }
                    ham_records.append(rec)
                    extracted += 1
                    if extracted % 25 == 0:
                        print(f"  Extracted {extracted}/{target_count} Ham samples...", flush=True)
                except Exception as e:
                    continue
                    
    print(f"Total Ham samples ready: {len(ham_records)} (Train: {(pd.DataFrame(ham_records)['split']=='train').sum()}, Test: {(pd.DataFrame(ham_records)['split']=='test').sum()})", flush=True)
    return ham_records

# ==========================================
# 5. COMPILE CSVs AND CREATE ZIP
# ==========================================
async def main():
    spam_records = await generate_all_spam(100)
    ham_records = extract_all_ham(100)
    
    all_records = spam_records + ham_records
    random.seed(42)
    random.shuffle(all_records)
    
    df_all = pd.DataFrame(all_records)
    
    all_csv_path = os.path.join(DATASET_DIR, "voice_features_all.csv")
    train_csv_path = os.path.join(DATASET_DIR, "voice_features_train.csv")
    test_csv_path = os.path.join(DATASET_DIR, "voice_features_test.csv")
    
    df_train = df_all[df_all['split'] == 'train'].drop(columns=['split'])
    df_test = df_all[df_all['split'] == 'test'].drop(columns=['split'])
    
    df_all.to_csv(all_csv_path, index=False, encoding='utf-8')
    df_train.to_csv(train_csv_path, index=False, encoding='utf-8')
    df_test.to_csv(test_csv_path, index=False, encoding='utf-8')
    
    print("\n" + "="*55, flush=True)
    print("SUCCESS: CLEANED VOICE DATASET BUILT!", flush=True)
    print(f"Total Audio Samples: {len(df_all)} (Ham: 100, Spam: 100)", flush=True)
    print(f"Train Set: {len(df_train)} samples (Ham: {(df_train['label']==0).sum()}, Spam: {(df_train['label']==1).sum()})", flush=True)
    print(f"Test Set:  {len(df_test)} samples (Ham: {(df_test['label']==0).sum()}, Spam: {(df_test['label']==1).sum()})", flush=True)
    print(f"Features CSVs Created:", flush=True)
    print(f"  - {train_csv_path}", flush=True)
    print(f"  - {test_csv_path}", flush=True)
    print(f"  - {all_csv_path}", flush=True)
    print("="*55, flush=True)
    
    # Zip the dataset
    zip_path = os.path.join(BASE_DIR, "Cleaned_Voice_Dataset.zip")
    print(f"\nCompressing into shareable ZIP: {zip_path}...", flush=True)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(DATASET_DIR):
            for file in files:
                abs_file = os.path.join(root, file)
                rel_file = os.path.relpath(abs_file, BASE_DIR)
                zipf.write(abs_file, rel_file)
                
    zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"DONE! Cleaned_Voice_Dataset.zip is ready ({zip_size_mb:.2f} MB)!", flush=True)

if __name__ == "__main__":
    asyncio.run(main())

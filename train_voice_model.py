import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "Cleaned_Voice_Dataset")
MODELS_DIR = os.path.join(BASE_DIR, "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

train_path = os.path.join(DATASET_DIR, "voice_features_train.csv")
test_path = os.path.join(DATASET_DIR, "voice_features_test.csv")

if not os.path.exists(train_path) or not os.path.exists(test_path):
    print("Dataset CSVs not found! Please run generate_cleaned_voice_dataset.py first.")
    sys.exit(1)

print("="*65)
print("  MULTIMODAL IMPERSONATION & FRAUD ANALYZER - VOICE MODEL TRAINER  ")
print("="*65)

# Load data
df_train = pd.read_csv(train_path)
df_test = pd.read_csv(test_path)

# Pure acoustic feature columns (independent of transcript availability)
non_acoustic = ['audio_id', 'filename', 'label', 'label_name', 'category', 'language', 'transcript', 'fraud_keywords_count', 'urgency_score', 'duration_sec']
feature_cols = [c for c in df_train.columns if c not in non_acoustic]

print(f"\nLoaded Cleaned Voice Dataset:")
print(f"  Training samples: {len(df_train)} (Ham: {(df_train['label']==0).sum()}, Spam: {(df_train['label']==1).sum()})")
print(f"  Testing samples:  {len(df_test)} (Ham: {(df_test['label']==0).sum()}, Spam: {(df_test['label']==1).sum()})")
print(f"  Acoustic Waveform Features: {len(feature_cols)} (MFCCs, Pitch, Jitter, Shimmer, Spectral Metrics)")

X_train = df_train[feature_cols].values
y_train = df_train['label'].values
X_test = df_test[feature_cols].values
y_test = df_test['label'].values

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Candidate Models
models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
    "Support Vector Machine (SVM)": SVC(kernel='rbf', C=1.0, probability=True, random_state=42),
    "Multi-Layer Perceptron (MLP)": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=400, random_state=42)
}

results = []
trained_models = {}

print("\nTraining and Evaluating Models on Held-out Test Set...")
print("-" * 65)

best_model_name = None
best_f1 = -1.0

for name, clf in models.items():
    clf.fit(X_train_scaled, y_train)
    trained_models[name] = clf
    
    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1] if hasattr(clf, "predict_proba") else y_pred
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc = roc_auc_score(y_test, y_prob)
    
    results.append({
        "Model": name,
        "Accuracy (%)": round(acc * 100, 2),
        "Precision (%)": round(prec * 100, 2),
        "Recall (%)": round(rec * 100, 2),
        "F1-Score (%)": round(f1 * 100, 2),
        "ROC-AUC (%)": round(roc * 100, 2)
    })
    
    if f1 > best_f1:
        best_f1 = f1
        best_model_name = name

results_df = pd.DataFrame(results)
print("\n=== MODEL PERFORMANCE BENCHMARK ===")
print(results_df.to_string(index=False))

print(f"\nOptimal Architecture Selected: >>> {best_model_name} (F1-Score: {best_f1*100:.2f}%) <<<")

# Save winning model and scaler
best_model = trained_models[best_model_name]
model_path = os.path.join(MODELS_DIR, "best_voice_fraud_model.pkl")
scaler_path = os.path.join(MODELS_DIR, "voice_scaler.pkl")
features_path = os.path.join(MODELS_DIR, "feature_names.json")

joblib.dump(best_model, model_path)
joblib.dump(scaler, scaler_path)
with open(features_path, "w", encoding="utf-8") as f:
    json.dump(feature_cols, f, indent=2)

print(f"\nSaved Best Model Artifacts to: {MODELS_DIR}")
print(f"  - Model: {model_path}")
print(f"  - Scaler: {scaler_path}")
print(f"  - Features: {features_path}")

# Generate Plots: Confusion Matrix & Feature Importance
y_pred_best = best_model.predict(X_test_scaled)
cm = confusion_matrix(y_test, y_pred_best)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Ham (Legitimate)', 'Spam (Fraud)'],
            yticklabels=['Ham (Legitimate)', 'Spam (Fraud)'])
plt.title(f'Confusion Matrix: {best_model_name}')
plt.ylabel('Ground Truth')
plt.xlabel('Model Prediction')
plt.tight_layout()
cm_plot_path = os.path.join(MODELS_DIR, "confusion_matrix.png")
plt.savefig(cm_plot_path, dpi=300)
plt.close()
print(f"  - Confusion Matrix Plot: {cm_plot_path}")

# Feature importance plot
if hasattr(best_model, "feature_importances_"):
    importances = best_model.feature_importances_
    feat_df = pd.DataFrame({'Feature': feature_cols, 'Importance': importances})
    feat_df = feat_df.sort_values(by='Importance', ascending=False).head(15)
    
    plt.figure(figsize=(9, 6))
    sns.barplot(data=feat_df, x='Importance', y='Feature', hue='Feature', palette='viridis', legend=False)
    plt.title(f'Top 15 Acoustic Features for Voice Fraud Detection ({best_model_name})')
    plt.xlabel('Importance Weight')
    plt.tight_layout()
    fi_plot_path = os.path.join(MODELS_DIR, "feature_importance.png")
    plt.savefig(fi_plot_path, dpi=300)
    plt.close()
    print(f"  - Feature Importance Plot: {fi_plot_path}")

print("\n" + "="*65)
print("TRAINING PIPELINE FINISHED SUCCESSFULLY!")
print("="*65)

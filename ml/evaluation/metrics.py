"""
AgriWise Model Evaluation Suite
Calculates Classification (Accuracy, Precision, Recall, F1, Confusion Matrix)
and Regression (MAE, RMSE, R²) metrics.
"""

import math

def calculate_classification_metrics(y_true, y_pred, classes):
    """Computes multiclass macro-averaged metrics and confusion matrix."""
    n_classes = len(classes)
    matrix = {c1: {c2: 0 for c2 in classes} for c1 in classes}
    for t, p in zip(y_true, y_pred):
        if t in matrix and p in matrix[t]:
            matrix[t][p] += 1
            
    total = len(y_true)
    correct = sum(matrix[c][c] for c in classes)
    accuracy = correct / total if total > 0 else 0
    
    precisions = []
    recalls = []
    for c in classes:
        tp = matrix[c][c]
        fp = sum(matrix[other][c] for other in classes if other != c)
        fn = sum(matrix[c][other] for other in classes if other != c)
        p = tp / (tp + fp) if (tp + fp) > 0 else 0
        r = tp / (tp + fn) if (tp + fn) > 0 else 0
        precisions.append(p)
        recalls.append(r)
        
    avg_precision = sum(precisions) / len(precisions) if precisions else 0
    avg_recall = sum(recalls) / len(recalls) if recalls else 0
    f1 = 2 * (avg_precision * avg_recall) / (avg_precision + avg_recall) if (avg_precision + avg_recall) > 0 else 0
    
    return {
        "accuracy": round(accuracy, 4),
        "precision": round(avg_precision, 4),
        "recall": round(avg_recall, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": matrix
    }

def calculate_regression_metrics(y_true, y_pred):
    """Computes MAE, RMSE, and R-squared for continuous yield predictions."""
    n = len(y_true)
    if n == 0:
        return {"mae": 0, "rmse": 0, "r2": 0}
        
    mae = sum(abs(t - p) for t, p in zip(y_true, y_pred)) / n
    mse = sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / n
    rmse = math.sqrt(mse)
    
    mean_y = sum(y_true) / n
    ss_tot = sum((t - mean_y) ** 2 for t in y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4)
    }

import json
import os
from pathlib import Path
from typing import Any
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# STEP 1: Load the trained model, preprocessor and feature list
BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "churn_model.pkl")
preprocessor = joblib.load(BASE_DIR / "churn_preprocessor.pkl")

with open(BASE_DIR / "feature_columns.json", "r") as file:
    feature_columns = json.load(file)

# STEP 2: Create the app

app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predict whether a customer is likely to churn.",
    version="1.1.0",
)

# ---------------------------------------------------------------
# STEP 3: CORS  (this block was nested inside a second
#         app.add_middleware( ... ) before, which breaks startup)
#
# Allowed browser origins:
#   * local dev servers (Vite uses 5173, 5174, ...)
#   * any of YOUR Vercel deployments (production + preview URLs)
#   * your custom domain, set on Render as ALLOWED_ORIGINS, e.g.
#       ALLOWED_ORIGINS=https://www.mychurnapp.com,https://mychurnapp.com
# ---------------------------------------------------------------
extra_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        *extra_origins,
    ],
    # Matches customer-churn-prediction.vercel.app AND every
    # customer-churn-prediction-<hash>-<team>.vercel.app preview URL.
    allow_origin_regex=r"https://customer-churn-prediction[a-z0-9-]*\.vercel\.app|http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=False,  # no cookies are used, so keep this off
    allow_methods=["*"],
    allow_headers=["*"],
)


# STEP 4: Request format

class PredictionRequest(BaseModel):
    features: dict[str, Any]


@app.get("/")
def home():
    return {"message": "Customer Churn Prediction API is running!"}


@app.get("/health")
def health():
    """Lightweight check the frontend uses to show API online/offline."""
    return {"status": "ok"}


@app.post("/predict")
def predict_churn(request: PredictionRequest):
    customer_data = request.features

    # Validate column names
    expected_columns = set(feature_columns)
    received_columns = set(customer_data.keys())

    missing_columns = sorted(expected_columns - received_columns)
    extra_columns = sorted(received_columns - expected_columns)

    if missing_columns or extra_columns:
        raise HTTPException(
            status_code=400,
            detail={
                "missing_columns": missing_columns,
                "unexpected_columns": extra_columns,
            },
        )

    input_df = pd.DataFrame([customer_data], columns=feature_columns)

    # Senior Citizen must be "Yes"/"No" like in training.
    # Unknown values used to silently become NaN -> wrong prediction.
    input_df["Senior Citizen"] = input_df["Senior Citizen"].map(
        {0: "No", 1: "Yes", "0": "No", "1": "Yes", "No": "No", "Yes": "Yes"}
    )
    if input_df["Senior Citizen"].isna().any():
        raise HTTPException(
            status_code=400,
            detail="Senior Citizen must be 'Yes', 'No', 0 or 1.",
        )

    try:
        encoded_data = preprocessor.transform(input_df)
        prediction = model.predict(encoded_data)[0]
        probabilities = model.predict_proba(encoded_data)[0]
    except Exception as error:  # bad numbers, unseen category, etc.
        raise HTTPException(
            status_code=400,
            detail=f"Could not score this customer: {error}",
        )

    probability_results = {
        str(label): round(float(probability), 4)
        for label, probability in zip(model.classes_, probabilities)
    }

    return {
        "prediction": str(prediction),
        "probabilities": probability_results,
        # Convenience field so the frontend never has to guess the label name
        "churn_probability": probability_results.get("Yes", 0.0),
    }


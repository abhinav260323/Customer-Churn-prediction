from pathlib import Path
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

# STEP 1: Locate the project files

BASE_DIR = Path(__file__).resolve().parent

# STEP 2: Load the trained model and preprocessor


model = joblib.load(BASE_DIR / "churn_model.pkl")

preprocessor = joblib.load(
    BASE_DIR / "churn_preprocessor.pkl"
)

# STEP 3: Load the expected feature names


with open(BASE_DIR / "feature_columns.json", "r") as file:
    feature_columns = json.load(file)


# STEP 4: Create the FastAPI application

app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predict whether a customer is likely to churn.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# STEP 5: Define the request format

class PredictionRequest(BaseModel):
    features: dict[str, Any]

@app.get("/")
def home():
    return {
        "message": "Customer Churn Prediction API is running!"
    }


@app.post("/predict")
def predict_churn(request: PredictionRequest):

    # Step 1: Get customer features
    customer_data = request.features

    # Step 2: Validate the incoming column names
    expected_columns = set(feature_columns)
    received_columns = set(customer_data.keys())

    missing_columns = sorted(expected_columns - received_columns)
    extra_columns = sorted(received_columns - expected_columns)

    if missing_columns or extra_columns:
        raise HTTPException(
            status_code=400,
            detail={
                "missing_columns": missing_columns,
                "unexpected_columns": extra_columns
            }
        )

    # Step 3: Create the DataFrame
    input_df = pd.DataFrame(
        [customer_data],
        columns=feature_columns
    )

    # Step 4: Convert Senior Citizen values to the format used in training
    value = input_df.loc[0, "Senior Citizen"]

    if value in (0, "0"):
        input_df.loc[0, "Senior Citizen"] = "No"
    elif value in (1, "1"):
        input_df.loc[0, "Senior Citizen"] = "Yes"
   

    # Step 6: Apply preprocessing
    encoded_data = preprocessor.transform(input_df)

    # Step 7: Predict customer churn
    prediction = model.predict(encoded_data)[0]

    # Step 8: Calculate probabilities
    probabilities = model.predict_proba(encoded_data)[0]

    probability_results = {
        str(label): round(float(probability), 4)
        for label, probability in zip(
            model.classes_,
            probabilities
        )
    }

    # Step 9: Return the result
    return {
        "prediction": str(prediction),
        "probabilities": probability_results
    }

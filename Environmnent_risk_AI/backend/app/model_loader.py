import os
import pickle
import tensorflow as tf
import numpy as np
from config.config import Config


class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.models = {}
        self.scalers = {}
        print("✅ ModelLoader initialized (lazy loading enabled).")

    # ======================================================
    # LSTM MODEL
    # ======================================================

    def get_lstm_model(self):
        if "lstm" not in self.models:
            print(f"🔄 Loading LSTM model from {Config.LSTM_MODEL_PATH}...")

            if not os.path.exists(Config.LSTM_MODEL_PATH):
                raise FileNotFoundError(
                    f"LSTM model not found at {Config.LSTM_MODEL_PATH}"
                )

            # 🔥 IMPORTANT FIX
            self.models["lstm"] = tf.keras.models.load_model(
                Config.LSTM_MODEL_PATH,
                compile=False  # Prevents keras.metrics.mse deserialization error
            )

            print("✅ LSTM model loaded successfully.")

        return self.models["lstm"]

    def get_lstm_scaler(self):
        if "lstm_scaler" not in self.scalers:
            print(f"🔄 Loading LSTM scaler from {Config.LSTM_SCALER_PATH}...")

            if not os.path.exists(Config.LSTM_SCALER_PATH):
                raise FileNotFoundError(
                    f"LSTM scaler not found at {Config.LSTM_SCALER_PATH}"
                )

            with open(Config.LSTM_SCALER_PATH, "rb") as f:
                self.scalers["lstm_scaler"] = pickle.load(f)

            print("✅ LSTM scaler loaded successfully.")

        return self.scalers["lstm_scaler"]

    # ======================================================
    # RISK MODEL
    # ======================================================

    def get_risk_model(self):
        if "risk" not in self.models:
            print(f"🔄 Loading Risk model from {Config.RISK_MODEL_PATH}...")

            if not os.path.exists(Config.RISK_MODEL_PATH):
                raise FileNotFoundError(
                    f"Risk model not found at {Config.RISK_MODEL_PATH}"
                )

            with open(Config.RISK_MODEL_PATH, "rb") as f:
                self.models["risk"] = pickle.load(f)

            print("✅ Risk model loaded successfully.")

        return self.models["risk"]

    # ======================================================
    # ISOLATION FOREST
    # ======================================================

    def get_iso_forest(self):
        if "iso_forest" not in self.models:
            print(
                f"🔄 Loading Isolation Forest from {Config.ISOLATION_FOREST_PATH}..."
            )

            if not os.path.exists(Config.ISOLATION_FOREST_PATH):
                raise FileNotFoundError(
                    f"Isolation Forest not found at {Config.ISOLATION_FOREST_PATH}"
                )

            with open(Config.ISOLATION_FOREST_PATH, "rb") as f:
                self.models["iso_forest"] = pickle.load(f)

            print("✅ Isolation Forest loaded successfully.")

        return self.models["iso_forest"]

    def get_iso_scaler(self):
        if "iso_scaler" not in self.scalers:
            print(f"🔄 Loading ISO scaler from {Config.ISO_SCALER_PATH}...")

            if not os.path.exists(Config.ISO_SCALER_PATH):
                raise FileNotFoundError(
                    f"ISO scaler not found at {Config.ISO_SCALER_PATH}"
                )

            with open(Config.ISO_SCALER_PATH, "rb") as f:
                self.scalers["iso_scaler"] = pickle.load(f)

            print("✅ ISO scaler loaded successfully.")

        return self.scalers["iso_scaler"]

    # ======================================================
    # HOTSPOT MODEL (DBSCAN)
    # ======================================================

    def get_hotspot_model(self):
        if "hotspot" not in self.models:
            print(f"🔄 Loading Hotspot model from {Config.HOTSPOT_MODEL_PATH}...")

            if not os.path.exists(Config.HOTSPOT_MODEL_PATH):
                raise FileNotFoundError(
                    f"Hotspot model not found at {Config.HOTSPOT_MODEL_PATH}"
                )

            with open(Config.HOTSPOT_MODEL_PATH, "rb") as f:
                self.models["hotspot"] = pickle.load(f)

            print("✅ Hotspot model loaded successfully.")

        return self.models["hotspot"]

    def get_hotspot_scaler(self):
        if "hotspot_scaler" not in self.scalers:
            print(
                f"🔄 Loading Hotspot scaler from {Config.HOTSPOT_SCALER_PATH}..."
            )

            if not os.path.exists(Config.HOTSPOT_SCALER_PATH):
                raise FileNotFoundError(
                    f"Hotspot scaler not found at {Config.HOTSPOT_SCALER_PATH}"
                )

            with open(Config.HOTSPOT_SCALER_PATH, "rb") as f:
                self.scalers["hotspot_scaler"] = pickle.load(f)

            print("✅ Hotspot scaler loaded successfully.")

        return self.scalers["hotspot_scaler"]


# Singleton instance
model_loader = ModelLoader()

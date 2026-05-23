import json
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
import requests
from sklearn.metrics import classification_report, confusion_matrix

from server.utils.nepali_translate import compile_raw_to_english

pd.set_option('display.max_columns', None)

BASE_URL = "http://127.0.0.1:8000"
SENTIMENT_ENDPOINT = f"{BASE_URL}/dashboard/sentiment_analysis_bulk/"

LABEL_MAP = {
	"negative": 0,
	"positive": 1,
	"neutral": 2,
}

ID2LABEL = {
	0: "Negative",
	1: "Positive",
	2: "Neutral",
}


def read_dataset(csv_path: Path) -> pd.DataFrame:
	df = pd.read_csv(csv_path)
	text_col = "review_content" if "review_content" in df.columns else "sentence"
	label_col = "sentiment" if "sentiment" in df.columns else "gold_label"

	if text_col not in df.columns or label_col not in df.columns:
		raise ValueError(
			f"Expected columns {text_col} and {label_col} in dataset."
		)

	df = df.dropna(subset=[text_col, label_col]).copy()
	df[label_col] = df[label_col].astype(str).str.strip().str.lower()
	df = df[df[label_col].isin(LABEL_MAP.keys())]
	df["label_id"] = df[label_col].map(LABEL_MAP)
	df["text"] = df[text_col].astype(str)
	return df


def sample_per_class(df, label_col='gold_label', n=10):
    return (
        df.groupby(label_col, group_keys=False)
          .apply(lambda x: x.sample(min(len(x), n)))
          .reset_index(drop=True)
    )


def call_sentiment_api(texts: List[str], session: requests.Session) -> Dict:
	payload = {"texts": texts}
	response = session.post(SENTIMENT_ENDPOINT, json=payload, timeout=60)
	response.raise_for_status()
	return response.json()


def extract_predicted_label_ids(api_response: Dict) -> List[int]:
	results = api_response.get("sentiment_scores", [])
	if not isinstance(results, list):
		raise ValueError("Expected 'sentiment_scores' to be a list.")

	pred_ids = []
	for result in results:
		sentiment = str(result.get("sentiment", "")).strip().lower()
		if sentiment not in LABEL_MAP:
			raise ValueError(f"Unexpected sentiment label: {sentiment}")
		pred_ids.append(LABEL_MAP[sentiment])

	return pred_ids


def evaluate_texts(
	texts: List[str],
	actual_labels: List[int],
	label_names: List[str],
	run_name: str,
	translate_before_api: bool,
) -> Tuple[List[int], str]:
	preds = []
	errors = []

	with requests.Session() as session:
		try:
			texts_to_send = [
				compile_raw_to_english(raw_text)
				if translate_before_api
				else raw_text
				for raw_text in texts
			]
			api_response = call_sentiment_api(texts_to_send, session)
			preds = extract_predicted_label_ids(api_response)
		except Exception as exc:
			errors.append({"index": 0, "error": str(exc), "text": "BULK_CALL"})
			preds = [-1 for _ in texts]

	valid_pairs = [
		(a, p) for a, p in zip(actual_labels, preds) if p in ID2LABEL
	]
	if not valid_pairs:
		raise RuntimeError("No valid predictions returned from API calls.")

	y_true, y_pred = zip(*valid_pairs)

	cm = confusion_matrix(y_true, y_pred, labels=list(ID2LABEL.keys()))
	report = classification_report(
		y_true,
		y_pred,
		labels=list(ID2LABEL.keys()),
		target_names=label_names,
		digits=4,
		zero_division=0,
	)

	print("=" * 80)
	print(run_name)
	print("Translate before API:", translate_before_api)
	print("Confusion Matrix (rows=actual, cols=predicted)")
	print(cm)
	print("\nClassification Report")
	print(report)

	if errors:
		print("\nErrors (first 5 shown):")
		print(json.dumps(errors[:5], indent=2))

	return preds, report


def main() -> None:
	data_path = (
		Path(__file__).resolve().parent / "cleaned_romanized_nepali_sentiment.csv"
	)

	df = read_dataset(data_path)
	texts = df["text"].tolist()
	actual_labels = df["label_id"].tolist()
	label_names = [ID2LABEL[i] for i in sorted(ID2LABEL.keys())]

	evaluate_texts(
		texts,
		actual_labels,
		label_names,
		run_name="Run 1: Raw text -> API",
		translate_before_api=False,
	)

	translated_sample = sample_per_class(df, n=30)


	print(df.head())
	print("\n\n\n",df.columns)

	print("\n\n\n\n\n\n\nTranslated Sample (30 per class):")

	print(translated_sample.head())
	print("\n\n\n",translated_sample.columns)

	if "label_id" not in translated_sample.columns:
		label_col = "sentiment" if "sentiment" in translated_sample.columns else "gold_label"
		translated_sample["label_id"] = (
			translated_sample[label_col].astype(str).str.strip().str.lower().map(LABEL_MAP)
		)
	evaluate_texts(
		translated_sample["text"].tolist(),
		translated_sample["label_id"].tolist(),
		label_names,
		run_name="Run 2: Translated text -> API (100 per class)",
		translate_before_api=True,
	)


if __name__ == "__main__":
	main()

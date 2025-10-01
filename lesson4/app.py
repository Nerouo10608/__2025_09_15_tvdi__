from flask import Flask, render_template, jsonify, request
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier
import numpy as np

app = Flask(__name__, static_folder="static", template_folder="templates")


# ---------- 資料與模型初始化 ----------
iris = load_iris()
X = iris.data
y = iris.target
target_names = iris.target_names.tolist()

# 訓練 KNN 分類器（教學範例）
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)

# 轉換為前端友善的資料結構
iris_records = []
for xi, yi in zip(X.tolist(), y.tolist()):
    iris_records.append({
        "sepal_length": xi[0],
        "sepal_width": xi[1],
        "petal_length": xi[2],
        "petal_width": xi[3],
        "species": target_names[int(yi)],
    })


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/iris", methods=["GET"])
def api_iris():
    """提供完整的鳶尾花資料給前端（JSON）。"""
    return jsonify({
        "data": iris_records,
        "target_names": target_names,
    })


@app.route("/api/predict", methods=["POST"])
def api_predict():
    """接收 features 並回傳 KNN 預測結果與機率。"""
    try:
        payload = request.get_json()
        features = payload.get("features")
        if not features or len(features) != 4:
            return jsonify({"error": "請提供 features: [sepal_length, sepal_width, petal_length, petal_width]"}), 400

        arr = np.array(features, dtype=float).reshape(1, -1)
        pred = model.predict(arr)[0]
        proba = model.predict_proba(arr).tolist()[0] if hasattr(model, "predict_proba") else None

        return jsonify({
            "prediction": target_names[int(pred)],
            "probabilities": proba,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def main():
    """啟動 Flask 應用（教學用，開發時可啟用 debug）"""
    app.run(debug=True)


if __name__ == "__main__":
    main()
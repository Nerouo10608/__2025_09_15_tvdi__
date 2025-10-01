// 前端 JS: 取得 /api/iris 資料，畫圖並支援預測呼叫

async function fetchIris() {
  const res = await fetch('/api/iris');
  const data = await res.json();
  return data;
}

function mapColor(species) {
  if (species === 'setosa') return 'rgb(255,99,132)';
  if (species === 'versicolor') return 'rgb(54,162,235)';
  return 'rgb(75,192,192)';
}

async function renderChart() {
  const dataset = await fetchIris();
  const data = dataset.data;
  const points = data.map(d => ({
    x: d.petal_length,
    y: d.sepal_length,
    r: 5,
    backgroundColor: mapColor(d.species),
  }));

  const ctx = document.getElementById('irisChart').getContext('2d');
  window.irisChart = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Iris (petal_length vs sepal_length)',
        data: points,
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'petal length' } },
        y: { title: { display: true, text: 'sepal length' } }
      }
    }
  });
}

async function setupPredictForm() {
  const form = document.getElementById('predictForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const features = [
      parseFloat(fd.get('sepal_length')),
      parseFloat(fd.get('sepal_width')),
      parseFloat(fd.get('petal_length')),
      parseFloat(fd.get('petal_width')),
    ];

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    const result = await res.json();
    const out = document.getElementById('predictResult');
    if (result.error) {
      out.innerText = '錯誤：' + result.error;
    } else {
      out.innerText = `預測：${result.prediction} (機率: ${result.probabilities ? result.probabilities.map(p=>p.toFixed(2)).join(', ') : 'N/A'})`;
    }
  });
}

// 初始化
window.addEventListener('DOMContentLoaded', async () => {
  await renderChart();
  await setupPredictForm();
});

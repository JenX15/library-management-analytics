// js/chart.js

let _chartInstance = null;

function renderBarChart(canvasId, labels, data, reuseInstance = null) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  
  // Destroy old chart if it's the same canvas
  if (_chartInstance && _chartInstance.canvas && _chartInstance.canvas.id === canvasId) {
    _chartInstance.destroy();
    _chartInstance = null;
  }

  _chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Times Borrowed',
        data: data,
        backgroundColor: '#000',
        hoverBackgroundColor: '#333',
        borderRadius: 8,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          backgroundColor: '#000',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context) => context[0].label,
            label: (context) => `${context.parsed.y} times borrowed`
          }
        }
      },
      scales: {
        x: { 
          ticks: { 
            autoSkip: false,
            color: '#666',
            font: {
              size: 11,
              weight: '500'
            }
          },
          grid: {
            display: false
          },
          border: {
            color: '#e0e0e0'
          }
        },
        y: { 
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#666',
            font: {
              size: 11
            }
          },
          grid: {
            color: '#f0f0f0',
            drawBorder: false
          },
          border: {
            display: false
          }
        }
      }
    }
  });
  
  return _chartInstance;
}
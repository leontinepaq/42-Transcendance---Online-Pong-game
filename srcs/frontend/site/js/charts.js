import { colors, chartTheme } from "./theme.js";

export function createHistogram(ctx, labels, datasets, options = {}) {
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      barPercentage: 0.2,
      layout: { padding: 20 },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          grid: {
            drawBorder: false,
            color: colors.lightTransparent,
          },
          ticks: {
            stepSize: 2,
          },
        },
      },
      ...options,
    },
  });
}

export function createDoughnutChart(ctx, labels, data, colors, options = {}) {
  const chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      layout: { padding: 20 },
      cutout: "50%",
      ...options,
    },
  });
  window.dashboardCharts.push(chart);
}

export function initChartJS() {
  Chart.defaults.font.family = chartTheme.fontFamily;
  Chart.defaults.font.size = chartTheme.fontSize;
  Chart.defaults.color = chartTheme.color;
}

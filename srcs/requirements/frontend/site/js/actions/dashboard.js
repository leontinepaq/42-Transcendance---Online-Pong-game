import { authFetchJson, handleError } from "../api.js";
import { createHistogram, createDoughnutChart, initChartJS } from "../charts.js";
import { colors, chartTheme } from "../theme.js";

initChartJS();

async function updateStatValues(data) {
  //todo @leontinepaq a changer quand fonctionne
  data.wins = 60;
  data.winstreak = 1;
  data.total_time_played = "0:25:12";
  data.unique_opponents_count = 2;
  // //

  document.getElementById("matches-won").textContent = data.wins;
  document.getElementById("win-streak").textContent = data.winstreak;
  document.getElementById("total-time").textContent = data.total_time_played;
  document.getElementById("online-opponents").textContent =
    data.unique_opponents_count;
}

async function plotWinRate(data) {
  data.winRate = 60; //todo @leontinepaq a changer quand fonctionne

  const ctx = document.getElementById("win-rate-chart").getContext("2d");
  const labels = ["winning", "losing"];
  const dataChart = [data.winRate, 100 - data.winRate];
  const colorsChart = [colors.accent, colors.accentLight];
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
  };
  createDoughnutChart(ctx, labels, dataChart, colorsChart, options);
  document.getElementById("win-rate-percentage").textContent = `${data.winRate}%`;
}

async function plotGamesPlayed(data) {
  data.solo_games = 10; //todo @leontinepaq a changer quand fonctionne
  data.multiplayer_games = 7;
  data.online_games = 6;
  //

  const ctx = document.getElementById("games-played").getContext("2d");
  const labels = ["SOLO", "MULTIPLAYER", "ONLINE"];
  const dataChart = [data.solo_games, data.multiplayer_games, data.online_games];
  const colorsChart = [colors.accentSecondary, colors.accentTertiary, colors.accent];
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: {},
          boxWidth: 16,
          boxHeight: 16,
          padding: 30,
        },
      },
    },
    onResize: (chart, size) => {
      const isSmallScreen = window.innerWidth < 1200;
      chart.options.plugins.legend.position = isSmallScreen ? "bottom" : "right";
      chart.options.plugins.legend.labels.font.size = isSmallScreen
        ? chartTheme.fontSize * 1.2
        : chartTheme.fontSize * 1.4;
      chart.options.plugins.legend.labels.padding = isSmallScreen ? 10 : 30;
      chart.update();
    },
  };
  createDoughnutChart(ctx, labels, dataChart, colorsChart, options);
}

async function plotGameHistory(data) {
  //todo @leontinepaq a changer quand fonctionne
  data.games = [
    { date: "2025-03-01", wins: 2, losses: 1 },
    { date: "2025-03-02", wins: 3, losses: 2 },
    { date: "2025-03-03", wins: 1, losses: 1 },
    { date: "2025-03-04", wins: 5, losses: 2 },
    { date: "2025-03-05", wins: 3, losses: 1 },
  ];
  //

  const ctx = document.getElementById("match-histogram").getContext("2d");
  const labels = data.games.map((item) => item.date);
  const wins = data.games.map((item) => item.wins);
  const losses = data.games.map((item) => item.losses);
  const datasets = [
    {
      label: "Wins",
      data: wins,
      backgroundColor: colors.accent,
    },
    {
      label: "Losses",
      data: losses,
      backgroundColor: colors.accentLight,
    },
  ];
  createHistogram(ctx, labels, datasets);
}

export async function loadUserStats(userId = null) {
  try {
    const endpoint = userId
      ? `api/dashboards/display-user-stats/?userId=${userId}` //todo @leontinepaq verifier request
      : `api/dashboards/display-user-stats/`;

    const data = await authFetchJson(endpoint, { method: "GET" });
    document.getElementById("dashboard-title").textContent = userId
      ? `User ${userId} Dashboard` //todo @leontinepaq  mettre le nom
      : "Your Dashboard"; //todo @leontinepaq a modifier
    updateStatValues(data);
    initChartJS();
    window.dashboardCharts = [];
    plotWinRate(data);
    plotGamesPlayed(data);
    plotGameHistory(data);
    
  } catch (error) {
    handleError(error, "Load user stats error");
  }
}

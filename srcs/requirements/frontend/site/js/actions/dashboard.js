import { authFetchJson, handleError } from "../api.js";
import { createHistogram, createDoughnutChart, initChartJS } from "../charts.js";
import { colors, chartTheme } from "../theme.js";
import { updatePaginationBtns } from "./pagination.js"
import { formatDuration } from "../utils.js"; 
import { createPagination } from "../ui/PaginationUI.js";
import { GameUI } from "../ui/GameUI.js";
import { doLanguage } from "../translate.js";

initChartJS();

export function displayGames(data) {
  const games = data.results;
  const container = document.getElementById("game-history-container");

  const cardsHtml = games.map(GameUI.createCard).join("");
  const paginationHtml = createPagination({
      previous: data.previous,
      next: data.next,
      target: "game-history"
    });
  
    container.innerHTML = cardsHtml + paginationHtml;
}

async function updateStatValues(data) {
  document.getElementById("matches-won").textContent = data.wins;
  document.getElementById("win-streak").textContent = data.winstreak;
  document.getElementById("total-time").textContent = formatDuration(data.total_time_played);
  document.getElementById("online-opponents").textContent =
    data.unique_opponents_count;
}

async function plotWinRate(data) {
  const ctx = document.getElementById("win-rate-chart").getContext("2d");
  const labels = ["winning", "losing"];
  const dataChart = [data.wins, data.losses];
  const colorsChart = [colors.accent, colors.accentLight];
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
  };
  createDoughnutChart(ctx, labels, dataChart, colorsChart, options);
  document.getElementById("win-rate-percentage").textContent = `${Math.round(
    data.winrate
  )}%`;
}

async function plotGamesPlayed(data) {
  const ctx = document.getElementById("games-played").getContext("2d");
  const labels = ["SOLO", "ONLINE"];
  const dataChart = [data.solo_games, data.online_games];
  const colorsChart = [colors.accentSecondary, colors.accent];
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
  const ctx = document.getElementById("match-histogram").getContext("2d");
  const labels = data.daily_results.map((item) => item.created_at);
  const wins = data.daily_results.map((item) => item.wins);
  const losses = data.daily_results.map((item) => item.losses);

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

function updateDashboardTitle(userId, username) {
  const titleEl = document.getElementById("dashboard-title");

  if (!userId) {
    titleEl.setAttribute("data-i18n", "dashboardTitleYour");
  } else {
    titleEl.setAttribute("data-i18n", "dashboardTitleOther");
    titleEl.setAttribute("data-username", username);
  }
}

async function displayStatistics(userId) {
  const endpoint = userId
    ? `api/dashboards/display-user-stats/?user_id=${userId}`
    : `api/dashboards/display-user-stats/`;

  const data = await authFetchJson(endpoint, { method: "GET" });
  updateDashboardTitle(userId, data.user);
  updateStatValues(data);
  initChartJS();
  window.dashboardCharts = [];
  plotWinRate(data);
  plotGamesPlayed(data);
  plotGameHistory(data);
}

async function displayGameHistory(userId) {
  const endpoint = userId
    ? `api/dashboards/match-history/?user_id=${userId}`
    : `api/dashboards/match-history/`;
  const games = await authFetchJson(endpoint, { method: "GET" });
  displayGames(games);

  updatePaginationBtns(games);
}

export async function loadUserStats(rawUserId = null) {
  try {
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId || null;
    await displayStatistics(userId);
    await displayGameHistory(userId);
    doLanguage();
  } catch (error) {
    handleError(error, "Load user stats error");
  }
}


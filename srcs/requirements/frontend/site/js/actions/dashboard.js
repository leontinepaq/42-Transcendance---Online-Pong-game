import { authFetchJson, handleError } from "../api.js";
import { createHistogram, createDoughnutChart, initChartJS } from "../charts.js";
import { colors, chartTheme } from "../theme.js";
import { updatePaginationBtns } from "./pagination.js"

initChartJS();

function formatDuration(duration) {
  if (!duration) return "N/A"; 
  const parts = duration.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function createGameCard(game) {
  const isPlayer1Winner = game.winner && game.winner.id === game.player1.id;
  const gameDate = new Date(game.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <div class="card match-card neon-border mt-4">
      <div class="card-header text-center match-date">
        <i class="bi bi-calendar2-event-fill dashboard-icon"></i> ${gameDate}
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center">
          <div class="player-info ${isPlayer1Winner ? "winner" : ""}">
            <img src="${game.player1.avatar_url}" alt=${game.player1.name} class="avatar-80 img-fluid" alt="${game.player1.name}" />
            <div class="text-center">
              <div class="username">
                ${isPlayer1Winner ? '<i class="bi bi-trophy-fill fs-6"></i>' : ""}
                ${game.player1.name}
              </div>
              <div class="score">${game.score_player1}</div>
            </div>
          </div>
          <div class="vs">VS</div>
          <div class="player-info ${!isPlayer1Winner ? "winner" : ""}">
            <img src="${game.player2.avatar_url}" alt=${game.player2.name} class="avatar-80 img-fluid" alt="${game.player2.name}" />
            <div class="text-center">
              <div class="username">
                ${!isPlayer1Winner ? '<i class="bi bi-trophy-fill fs-6"></i>' : ""}
                ${game.player2.name}
              </div>
              <div class="score">${game.score_player2}</div>
            </div>
          </div>
        </div>
        <div class="match-details">
          <div class="match-info">
            <i class="bi bi-stopwatch-fill dashboard-icon"></i>
            <span> Match duration: </span>
            <span>${formatDuration(game.duration)}</span>
          </div>
          <div class="match-info">
            <i class="bi bi-fire dashboard-icon"></i>
            <span>Longest exchange: </span>
            <span>${game.longest_exchange ?? "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function displayGameCards(data) {
  const games = data.results;
  const container = document.getElementById("game-history-container");
  container.innerHTML = games.map(createGameCard).join("");
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

async function displayStatistics(userId) {
  const endpoint = userId
    ? `api/dashboards/display-user-stats/?user_id=${userId}`
    : `api/dashboards/display-user-stats/`;

  const data = await authFetchJson(endpoint, { method: "GET" });
  document.getElementById("dashboard-title").textContent = userId
  ? `${data.user}'s Dashboard`
  : "Your Dashboard"; //todo @leontinepaq a modifier
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
  displayGameCards(games);
  updatePaginationBtns(games);
}

export async function loadUserStats(userId = null) {
  try {
    displayStatistics(userId);
    displayGameHistory(userId);
  } catch (error) {
    handleError(error, "Load user stats error");
  }
}


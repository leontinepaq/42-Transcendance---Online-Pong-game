import { authFetchJson, handleError } from "../api.js";
import { createHistogram, createDoughnutChart, initChartJS } from "../charts.js";
import { colors, chartTheme } from "../theme.js";

initChartJS();


function createMatchCard(match) {
  const isPlayer1Winner = match.winner === match.player1.id;
  
  return `
    <div class="card match-card neon-border mt-4">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center">
          <div class="player-info ${isPlayer1Winner ? "winner" : ""}">
            <img src="${match.player1.avatar_url}" class="avatar" alt="${match.player1.username}" />
            <div class="text-center">
              <div class="username">
                ${isPlayer1Winner ? '<span class="material-symbols-outlined trophy-icon">emoji_events</span>' : ""}
                ${match.player1.username}
              </div>
              <div class="score">${match.score_player1}</div>
            </div>
          </div>
          <div class="vs">VS</div>
          <div class="player-info ${!isPlayer1Winner ? "winner" : ""}">
            <img src="${match.player2.avatar_url}" class="avatar" alt="${match.player2.username}" />
            <div class="text-center">
              <div class="username">
                ${!isPlayer1Winner ? '<span class="material-symbols-outlined trophy-icon">emoji_events</span>' : ""}
                ${match.player2.username}
              </div>
              <div class="score">${match.score_player2}</div>
            </div>
          </div>
        </div>
        <div class="match-details">
          <div class="match-info">
          <span class="material-symbols-outlined">timer</span>
          <span> Match duration: </span>
            <span>${match.duration}</span>
          </div>
          <div class="match-info">
          <span class="material-symbols-outlined">mode_heat</span>
          <span>Longuest exchange: </span>
            <span>${match.longest_exchange}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}





function displayGameCards(data) {
  //todo @leontinepaq a changer quand fonctionne
  data =
  {
    "games": [
      {
        "id": 1,
        "player1": {
          "id": 12,
          "username": "PlayerOne",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "player2": {
          "id": 34,
          "username": "PlayerTwo",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "winner": 12,
        "score_player1": 11,
        "score_player2": 7,
        "longest_exchange": 45,
        "created_at": "2025-03-20T14:30:00.000Z",
        "duration": "5:12",
        "tournament": 3
      },
      {
        "id": 2,
        "player1": {
          "id": 56,
          "username": "Speedster",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "player2": {
          "id": 78,
          "username": "AceSmash",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "winner": 78,
        "score_player1": 9,
        "score_player2": 11,
        "longest_exchange": 32,
        "created_at": "2025-03-21T16:45:00.000Z",
        "duration": "4:30",
        "tournament": null
      },
      {
        "id": 3,
        "player1": {
          "id": 90,
          "username": "Shadow",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "player2": {
          "id": 12,
          "username": "PlayerOne",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "winner": 90,
        "score_player1": 11,
        "score_player2": 5,
        "longest_exchange": 50,
        "created_at": "2025-03-22T18:00:00.000Z",
        "duration": "6:00",
        "tournament": 2
      },
      {
        "id": 4,
        "player1": {
          "id": 34,
          "username": "PlayerTwo",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "player2": {
          "id": 56,
          "username": "Speedster",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "winner": 34,
        "score_player1": 11,
        "score_player2": 10,
        "longest_exchange": 40,
        "created_at": "2025-03-23T19:15:00.000Z",
        "duration": "7:45",
        "tournament": null
      },
      {
        "id": 5,
        "player1": {
          "id": 78,
          "username": "AceSmash",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "player2": {
          "id": 90,
          "username": "Shadow",
          "avatar_url": "assets/nyancat.jpeg"
        },
        "winner": 78,
        "score_player1": 11,
        "score_player2": 9,
        "longest_exchange": 38,
        "created_at": "2025-03-24T20:30:00.000Z",
        "duration": "5:50",
        "tournament": 1
      }
    ]
  }
  
  //

  const games = data.games;
 
 
  const container = document.getElementById("game-history-container");

  container.innerHTML = games.map(createMatchCard).join("");

}


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
    displayGameCards(data);
  } catch (error) {
    handleError(error, "Load user stats error");
  }
}

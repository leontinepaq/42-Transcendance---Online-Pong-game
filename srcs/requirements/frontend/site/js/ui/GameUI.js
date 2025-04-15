import { formatDate, formatDuration } from "../utils.js";

function createPlayerBlock(player, score, isWinner) {
  return `
    <div class="player-info ${isWinner ? "winner" : ""}">
      <img src="${player.avatar_url}" alt="${player.name}" class="avatar-80 img-fluid" />
      <div class="text-center">
        <div class="username">
          ${isWinner ? '<i class="bi bi-trophy-fill fs-6"></i>' : ""}
          ${player.name}
        </div>
        <div class="score">${score}</div>
      </div>
    </div>
  `;
}

function createMatchDetails(game) {
  return `
    <div class="match-details">
      <div class="match-info">
        <i class="bi bi-stopwatch-fill dashboard-icon"></i>
        <span data-i18n="match-duration">Match duration:</span>
        <span>${formatDuration(game.duration)}</span>
      </div>
      <div class="match-info">
        <i class="bi bi-fire dashboard-icon"></i>
        <span data-i18n="longest-exchange">Longest exchange:</span>
        <span>${game.longest_exchange ?? "N/A"}</span>
      </div>
    </div>
  `;
}

function createCardHeader(date) {
  return `
    <div class="card-header text-center match-date">
      <i class="bi bi-calendar2-event-fill dashboard-icon"></i> ${formatDate(date)}
    </div>
  `;
}

export const GameUI = {
  createCard(game) {
    const isPlayer1Winner = game.winner && game.winner.id === game.player1.id;

    const player1Block = createPlayerBlock(game.player1, game.score_player1, isPlayer1Winner);
    const player2Block = createPlayerBlock(game.player2, game.score_player2, !isPlayer1Winner);
    const matchDetails = createMatchDetails(game);
    const header = createCardHeader(game.created_at);

    return `
      <div class="card match-card neon-border mt-4">
        ${header}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center">
            ${player1Block}
            <div class="vs">VS</div>
            ${player2Block}
          </div>
          ${matchDetails}
        </div>
      </div>
    `;
  }
};

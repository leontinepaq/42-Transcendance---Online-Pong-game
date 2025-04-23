import { colors } from "../theme.js";
import { formatDate } from "../utils.js";

const ACTIONS = {
  available: { type: "register", i18n: "REGISTER", class: "btn-green" },
  registered: { type: "unregister", i18n: "UNREGISTER", class: "btn-red" },
  ongoing: null,
  history: null,
};

function createTournamentInfos(tournament) {
  return `
	  <div class="d-flex flex-column align-items-center justify-content-center">
		<h1>${tournament.name}</h1>
		<h5>
		  <span data-i18n="created-on">Created on</span> :
		  ${formatDate(tournament.created_at)}
		</h5>
		<h5>
		  <span data-i18n="created-by">Created by</span>: ${tournament.creator_username}
		</h5>
	  </div>`;
}

function createParticipant(participant, winnerId) {
  const isWinner = participant.id === winnerId;
  return `
	<div
	class="d-flex flex-column align-items-center player-info 
	${isWinner ? "winner" : ""}">
	<img
		src="${participant.avatar_url}"
		alt="${participant.name}"
		class="avatar-80 img-fluid" />
	<div class="username mt-1 text-center">
		${participant.name} ${isWinner ? '<i class="bi bi-trophy-fill fs-6"></i>' : ""}
	</div>
	</div>`;
}

function createParticipants(participants, winnerId) {
  return `
	  <div class="participants d-flex flex-column align-items-center justify-content-center mt-4">
		<h3 data-i18n="participants">Participants</h3>
		<div class="d-flex flex-row align-items-center justify-content-center gap-3 flex-wrap">
		  ${participants.map((p) => createParticipant(p, winnerId)).join("")}
		</div>
	  </div>`;
}

function createButton(viewKey, tournamentId) {
  const action = ACTIONS[viewKey];
  if (!action) return "";
  return `
	<div class="mt-3 d-flex justify-content-between">
      <button class="btn flex-grow-1 ${action.class}" 
              data-action="tournament-action"
              data-type="${action.type}"
              data-id="${tournamentId}"
              data-i18n="${action.i18n}">
        ${action.i18n}
      </button>
	  </div>`;
}

function createBrackets() {
  return `
	<svg width="520" height="280" viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M125 75H135" stroke=${colors.accentLight} stroke-width="3" stroke-linecap="round"/>
	<path d="M125 150L125 75" stroke=${colors.accentLight} stroke-width="3" stroke-linecap="round"/>
	<path d="M395 75H385" stroke=${colors.accentLight} stroke-width="3" stroke-linecap="round"/>
	<path d="M395 150V75" stroke=${colors.accentLight} stroke-width="3" stroke-linecap="round"/>
	</svg>`;
}

function createMiniPlayerBlock(player, score, isWinner) {
  return `
    <div class="player-info ${isWinner ? "winner" : ""}">
      <img src="${player.avatar_url}" alt="${
    player.name[0]
  }" class="avatar-50 img-fluid rounded-circle" />
      <div class="text-center mt-1">
        <div class="username fs-6">
          ${player.name}
        </div>
        <div class="score small">${score}</div>
      </div>
    </div>
  `;
}

function createEmptyGame() {
  return `
    <div class="match-content d-flex justify-content-between align-items-center p-2">
      <div class="player-info text-center">
        <div class="avatar-50 empty"></div>
        <div class="username fs-6 mt-1">?</div>
      </div>
      <div class="vs mx-2 fw-bold">VS</div>
      <div class="player-info text-center">
        <div class="avatar-50 empty"></div>
        <div class="username fs-6 mt-1">?</div>
      </div>
    </div>
  `;
}

function createMiniMatch(game, revert = false) {
  if (!game) return createEmptyGame();
  const isPlayer1Winner = game.winner && game.winner.id === game.player1.id;
  const notPlayed = game.id === null;

  var player1 = createMiniPlayerBlock(
    game.player1,
    notPlayed ? "-" : game.score_player1,
    notPlayed ? false : isPlayer1Winner
  );
  var player2 = createMiniPlayerBlock(
    game.player2,
    notPlayed ? "-" : game.score_player2,
    notPlayed ? false : !isPlayer1Winner
  );

  if (revert) [player1, player2] = [player2, player1];

  return `
	  <div class="match-content d-flex justify-content-between align-items-center p-2">
		${player1}
		<div class="vs mx-2 fw-bold">VS</div>
		${player2}
	  </div>
	`;
}

export function createTournamentMatches(tournament, viewKey) {
  if (viewKey == "available" || viewKey == "registered") return ``;
  const matchLeft = createMiniMatch(tournament.games[0]);
  const matchRight = createMiniMatch(tournament.games[1]);
  const matchFinale = createMiniMatch(
    tournament.games[2],
    tournament.games[2] &&
      tournament.games[0].winner.id != tournament.games[2].player1.id
  );
  return `
	  <div class="matches d-flex flex-column align-items-center justify-content-center mt-4 mb-4">
		<h3 data-i18n="matches">Matches</h3>
		<div class="bracket-container position-relative" style="width: 520px; height: 300px;">
			${createBrackets()}
			<div class="match-tournament match-final position-absolute" style="top: 0px; left: 135px;">
			${matchFinale}
			</div>
			<div class="match-tournament match-left position-absolute" style="top: 170px; left: 0px;">
			${matchLeft}
			</div>
			<div class="match-tournament match-right position-absolute" style="top: 170px; left: 270px;">
			${matchRight}
			</div>
		</div>
	  </div>`;
}

export const TournamentUI = {
  createCard(tournament, viewKey) {
    return `
	  <div class="card tournament-card neon-border mt-4">
		<div class="card-body">
		  ${createTournamentInfos(tournament)}
		  ${createParticipants(tournament.participants, tournament.winner?.id)}
		  ${createButton(viewKey, tournament.id)}
		  ${createTournamentMatches(tournament, viewKey)}
		</div>
	  </div>`;
  },
};

export default TournamentUI;

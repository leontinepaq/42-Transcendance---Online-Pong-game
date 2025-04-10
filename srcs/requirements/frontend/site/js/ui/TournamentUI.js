import { formatDate } from "../utils.js";

export const TournamentUI = {
	ACTIONS: {
	  available: { type: "register", label: "REGISTER", class: "btn-green" },
	  registered: { type: "unregister", label: "UNREGISTER", class: "btn-red" },
	  ongoing: null,
	  history: null,
	},
  
	createButton(viewKey, tournamentId) {
	  const action = this.ACTIONS[viewKey];
	  if (!action) return "";
	  return `
		<button class="btn flex-grow-1 ${action.class}" 
				data-action="tournament-action"
				data-type="${action.type}"
				data-id="${tournamentId}">
		  ${action.label}
		</button>`;
	},
  
	createParticipant(participant) {
	  return `
		<div class="d-flex flex-column align-items-center">
		  <img src="${participant.avatar_url}" alt="${participant.username}" class="avatar-80 img-fluid">
		  <div class="username">${participant.name}</div>
		</div>`;
	},
  
	createParticipants(participants) {
	  return participants.map(this.createParticipant).join("");
	},
  
	createCard(tournament, viewKey) {
	  return `
		<div class="card tournament-card neon-border mt-4">
		  <div class="card-body">
			<div class="d-flex flex-column align-items-center justify-content-center">
			  <h1>${tournament.name}</h1>
			  <h5>Created on: ${formatDate(tournament.created_at)}</h5>
			  <h5>Created by: ${tournament.creator_username}</h5>
			</div>
			<div class="participants d-flex flex-column align-items-center justify-content-center mt-4">
			  <h3>Participants</h3>
			  <div class="d-flex flex-row align-items-center justify-content-center gap-3">
				${this.createParticipants(tournament.participants)}
			  </div>
			</div>
			<div class="mt-3 d-flex justify-content-between">
			  ${this.createButton(viewKey, tournament.id)}
			</div>
		  </div>
		</div>`;
	}
  };
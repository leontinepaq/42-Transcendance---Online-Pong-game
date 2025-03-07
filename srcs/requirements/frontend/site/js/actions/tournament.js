import { navigate } from "../router.js";
import { authFetchJson } from "../api.js";

export const tournamentActions = [
  {
    selector: '[data-action="tournament"]',
    handler: initTournament,
  },
];

function initTournament() {
  navigate("tournament");
  setTimeout(function () {
    handleTournament();
  }, 100);
}

function handleTournament() {
  const tournament = document.getElementById("startTournament");
  tournament.addEventListener("click", function () {
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    const player3 = document.getElementById("player3").value;
    const player4 = document.getElementById("player4").value;
    console.log(player1);
    console.log(player2);
    console.log(player3);
    console.log(player4);
  });
}

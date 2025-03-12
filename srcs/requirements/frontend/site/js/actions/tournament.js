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

const data = {
  "player2_type": "user",
  "player2_id": 2,
  "player2_name": "test2",
  "player3_type": "user",
  "player3_id": 3,
  "player3_name": "test3",
  "player4_type": "user",
  "player4_id": 4,
  "player4_name": "test4"
}

async function getData()
{
  const player1 = document.getElementById("player1").value;
  const player2 = document.getElementById("player2").value;
  const player3 = document.getElementById("player3").value;
  const player4 = document.getElementById("player4").value;
  
  try
  {
    const response = await fetch("api/dashboards/create_tournament/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Si la réponse n'est pas OK (pas de statut 200)
      throw new Error(`Erreur: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json(); // Si la réponse est au format JSON
    console.log("Réponse reçue: ", result);
  }
  catch (error)
  {
    console.log("Erreur lors de la requête: ", error);
  }
}

async function handleTournament()
{
  const tournament = document.getElementById("startTournament");
  tournament.addEventListener("click", getData);
}

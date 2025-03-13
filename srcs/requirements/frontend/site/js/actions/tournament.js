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

let player1;
let player2;
let player3;
let player4;
let status2 = "guest";
let status3 = "guest";
let status4 = "guest";
let id2 = 2;
let id3 = 3;
let id4 = 4;

async function checkStatusPlayer()
{
  const users = await authFetchJson(`api/profile/all`);

  if (users)
  {
    users.forEach(user => {
      if (player2 === user.username)
      {
        id2 = user.id;
        status2 = "user";
      }

      if (player3 === user.username)
      {
        id3 = user.id;
        status3 = "user";
      }

      if (player4 === user.username)
      {
        id4 = user.id;
        status4 = "user";
      }

    });
  }
}

function beginTournament()
{
  navigate("fightTournament");
  const start = document.getElementById("start");
  start.addEventListener('click', function(){
    navigate("pong");
  })
}

async function createTournament()
{
  player1 = document.getElementById("player1").value;
  player2 = document.getElementById("player2").value;
  player3 = document.getElementById("player3").value;
  player4 = document.getElementById("player4").value;

  await checkStatusPlayer();

  try
  {
    const response = await fetch("api/dashboards/create-tournament/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "name": "tournament_name",
        "player2_type": status2,
        "player2_id": id2,
        "player2_name": player2,
        "player3_type": status3,
        "player3_id": id3,
        "player3_name": player3,
        "player4_type": status4,
        "player4_id": id4,
        "player4_name": player4
      }),
    });

    if (!response.ok)
    {
      throw new Error(`Erreur: ${response.status} - ${response.statusText}`);
    }
    const result = await response.json();
    console.log("Réponse reçue: ", result);
    beginTournament();
  }
  catch (error)
  {
    console.log("Erreur lors de la requête: ", error);
  }
}

async function handleTournament()
{
  const tournament = document.getElementById("startTournament");
  if (tournament)
  {
    tournament.addEventListener("click", createTournament);
  }
}

/*

note tournament : 

  - Box pour ask l'id -> bad idea, lutilisateur na pas a connaitre son id ?
  - Pour les tournois -> tout le monde est guest sauf lia ? pas besoin did comme ca
  - peut etre pouvoir voir la liste des users ?


  maybe ?
    - si user nexiste pas ds la db alors status = guest par defaut et pas de matchmaking
    - on demande tous les pseudos des joueurs ?
      puis on check dans tous les user creer si un pseudo correspond, si oui on recup l'ID
    - si on peut creer un matchmaking avec les users on le fait.
*/  
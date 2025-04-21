import { authFetchJson, handleError } from "../api.js";
import { TournamentUI } from "../ui/TournamentUI.js";
import { createPagination } from "../ui/PaginationUI.js";
import { doLanguage } from "../translate.js";

export const tournamentActions = [
  {
    selector: '[data-action="tournament-action"]',
    handler: handleTournamentAction,
  },
  {
    selector: '[data-action="create-tournament"',
    handler: createTournament,
  },
  {
    selector: '#tournament-section [data-bs-toggle="pill"]',
    handler: switchTournamentTab,
  },
];

export function initTournament() {
  fetchAndDisplayTournaments("available");
}

const TABS = {
  available: "api/tournament/display_available/",
  registered: "api/tournament/display_registered/",
  ongoing: "api/tournament/display_ongoing/",
  history: "api/tournament/display_history/",
};

export function displayTournaments(data, tabKey) {
  const tournaments = data.results;
  const container = document.getElementById(`pills-${tabKey}`);

  const cardsHtml = tournaments
    .map((t) => TournamentUI.createCard(t, tabKey))
    .join("");

  const paginationHtml = createPagination({
    previous: data.previous,
    next: data.next,
    target: "tournaments",
    tabKey,
  });

  container.innerHTML = cardsHtml + paginationHtml;
}

async function fetchAndDisplayTournaments(tab) {
  try {
    const apiPath = TABS[tab];
    if (!apiPath) return;
    const tournaments = await authFetchJson(apiPath);
    displayTournaments(tournaments, tab);
    doLanguage();
  } catch (error) {
    handleError(error, "Display tournament error");
  }
}

async function switchTournamentTab(element, event) {
  const tabKey = element.dataset.tab;
  if (!TABS[tabKey]) return;

  console.log(`Switching to tab: ${tabKey}`);
  await fetchAndDisplayTournaments(tabKey);
}

const tournamentActionMap = {
  register: {
    path: "register",
    message: "You joined the tournament",
    tab: "available",
  },
  unregister: {
    path: "unregister",
    message: "You left the tournament",
    tab: "registered",
  },
};

async function handleTournamentAction(element) {
  const tournament_id = parseInt(element.dataset.id, 10);
  const actionType = element.dataset.type;
  if (!tournament_id || !tournamentActionMap[actionType]) {
    console.error(`Invalid action: ${actionType} for tournament ${tournament_id}`);
    return;
  }

  const { path, message, tab } = tournamentActionMap[actionType];
  try {
    const response = await authFetchJson(`api/tournament/${path}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournament_id }),
    });
    console.log(message + ": ", response);
    await fetchAndDisplayTournaments(tab);
  } catch (error) {
    handleError("Error in tournament action");
  }
}

async function createTournament(element, event) {
  const input = document.getElementById("new-tournament-name");
  const name = input.value;

  try {
    await authFetchJson("/api/tournament/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    input.value = "";
  } catch (error) {
    handleError(error, "Create tournament error");
  }
}

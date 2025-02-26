import { authFetchJson, handleError }	from "../api.js";


async function updateStatValues(data) {
	//todo @leontinepaq a changer quand fonctionne
	data.wins = 54;
	data.winstreak = 1;
	data.total_time_played = "0:25:12";
	data.unique_opponents_count = 2;
	// //

	document.getElementById('matches-won').textContent = data.wins;
	document.getElementById('win-streak').textContent = data.winstreak;
	document.getElementById('total-time').textContent = data.total_time_played;
	document.getElementById('online-opponents').textContent = data.unique_opponents_count;
}

async function plotWinRate(data)
{
	const ctx = document.getElementById("win-rate-chart").getContext("2d");

	const winColor = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
	const lossColor = getComputedStyle(document.documentElement).getPropertyValue("--color-accent-light").trim();

	data.winRate = 60; //todo @leontinepaq a changer quand fonctionne
	
	new Chart(ctx, {
		type: "doughnut",
		data: {
			labels: ["winning", "losing"],
			datasets: [{
				data: [data.winRate, 100 - data.winRate],
				backgroundColor: [winColor, lossColor],
				borderWidth: 0
			}]
		},
		options: {
			maintainAspectRatio: true,
			cutout: "50%",
			plugins: {
				legend: { display: false}
			}
		},
	});
	document.getElementById('win-rate-percentage').textContent = `${data.winRate}%`;
}

export async function loadUserStats()
{
	try {
		const data =await authFetchJson('api/dashboard/display-user-stats/', {method: 'GET'});
		updateStatValues(data);
		plotWinRate(data);
	}
	catch (error) {
		handleError(error, "Load user stats error");
	}	
}


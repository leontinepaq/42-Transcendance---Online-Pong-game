import { navigate  } from "../router.js"
import { showModal } from "./modals.js";

export const friendsActions = [
    {
        selector: '[data-action="friends"]',
        handler: initFriends
    },
];

function initFriends()
{
    navigate('friends');
    setTimeout(function() {
        handleFriends();
    }, 500)
}

const userData = 
[
    { "id": 1, "name": "Alice", "avatar": "https://i.pravatar.cc/80?img=1" },
    { "id": 2, "name": "Bob", "avatar": "https://i.pravatar.cc/80?img=2" },
    { "id": 3, "name": "Charlie", "avatar": "https://i.pravatar.cc/80?img=3"},
    { "id": 4, "name": "Alice", "avatar": "https://i.pravatar.cc/80?img=1" },
    { "id": 5, "name": "Bob", "avatar": "https://i.pravatar.cc/80?img=2" },
    { "id": 6, "name": "Charlie", "avatar": "https://i.pravatar.cc/80?img=3"},
    { "id": 1, "name": "Alice", "avatar": "https://i.pravatar.cc/80?img=1" },
    { "id": 2, "name": "Bob", "avatar": "https://i.pravatar.cc/80?img=2" },
    { "id": 3, "name": "Charlie", "avatar": "https://i.pravatar.cc/80?img=3"},
    { "id": 4, "name": "Alice", "avatar": "https://i.pravatar.cc/80?img=1" },
    { "id": 5, "name": "Bob", "avatar": "https://i.pravatar.cc/80?img=2" },
    { "id": 6, "name": "Charlie", "avatar": "https://i.pravatar.cc/80?img=3"},
]

function handleFriends()
{
    const userlist = document.getElementById('user-container');
    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));

    userData.forEach(user => {

        const userCard = document.createElement("div");
        userCard.classList.add("col-md-4");

        userCard.innerHTML = `
            <div class="card user-card text-center p-3">
                <img src="${user.avatar}" alt="Avatar de ${user.name}" class="user-avatar mx-auto">
                <h5 class="mt-2">${user.name}</h5>
                <button class="btn btn-primary add-friend" data-id="${user.id}">Ajouter</button>
                <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
            </div>
        `;

        userlist.appendChild(userCard);
    })

    document.querySelectorAll(".add-friend").forEach(button => {
        button.addEventListener("click", (e) => {
            e.target.innerText = "Demande envoyée";
            e.target.classList.remove("btn-primary");
            e.target.classList.add("btn-secondary");
            e.target.disabled = true;
        });
    });

    document.querySelectorAll(".view-profile").forEach(button => {
        button.addEventListener("click", (e) => {
            const userId = parseInt(e.target.getAttribute("data-id"));

            const user = userData.find(u => u.id === userId);

            document.getElementById("profile-avatar").src = user.avatar;
            document.getElementById("profile-name").innerText = user.name;
            document.getElementById("profile-email").innerText = `Email: ${user.email}`;
            document.getElementById("profile-bio").innerText = user.bio || "Pas de bio disponible.";

            profileModal.show();
        });
    });
}


/*
    - remplacer par lappel api quand userlist sera implementer dans le back
    - si user est un ami -> on peut voir son status online/offline
    - ajout comme ami != envoyer une demande dami (cf le sujet)
*/
import { navigate  } from "../router.js"

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
    }, 50)
}

const userData = 
[
    { "id": 1, "name": "Alice", "avatar": "https://i.pravatar.cc/80?img=1", "friend": 0},
    { "id": 2, "name": "Bob", "avatar": "https://i.pravatar.cc/80?img=2" , "friend": 1},
    { "id": 3, "name": "Charlie", "avatar": "https://i.pravatar.cc/80?img=3", "friend": 1},
]

function appendUser(user, userlist)
{
    const userCard = document.createElement("div");
    userCard.classList.add("col-md-4");

    userCard.innerHTML = `
        <div class="card user-card text-center p-3">
            <img src="${user.avatar}" alt="Avatar de ${user.name}" class="user-avatar mx-auto">
            <h5 class="mt-2">${user.name}</h5>
            <button class="btn btn-primary add-friend" data-id="${user.id}">ADD</button>
            <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
        </div>
    `;
    userlist.appendChild(userCard);
}

function handleFriends()
{
    const userlist = document.getElementById('user-container');

    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));

    userlist.innerHTML = `
    <div class="container mt-5">
            <button data-action="Users" class="btn btn-primary see-friend">USERS</button>
    </div>  
    `
    userData.forEach(user => {
        if(user.friend == 1)
            appendUser(user, userlist);
    })

    document.querySelectorAll(".add-friend").forEach(button => {
        button.addEventListener("click", (e) => {
            e.target.innerText = "Remove";
            e.target.classList.remove("btn-primary");
            e.target.classList.add("btn-success");
            e.target.disabled = true; // desactive lutilisation du boutton 
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
    - TODO --> REMPLACER PAR APPEL API PAR LA SUITE
*/
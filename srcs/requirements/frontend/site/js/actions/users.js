import { navigate  } from "../router.js"

export const usersActions = [
    {
        selector: '[data-action="Users"]',
        handler: initUsers
    },
];

function initUsers()
{
    navigate('users');
    setTimeout(function() {
        handleUsers();
    }, 50)
}

const userData = 
[
    { "id": 1, "name": "Alice", "avatar": "https://cdn.intra.42.fr/users/25e67b6dbe3c884da9917b16321f1574/shelal.jpg", "friend": 1, "status": "online 🟢"},
    { "id": 2, "name": "Bob", "avatar": "https://cdn.intra.42.fr/users/fe62dcf2a389dbfa5070cc1c2fe0bd93/lpaquatt.jpg" , "friend": 1, "status": "offline 🔴"},
    { "id": 3, "name": "Charlie", "avatar": "https://cdn.intra.42.fr/users/4e1c549d8f89770ae23812a78d09a5e6/tlam.jpg", "friend": 1, "status": "online 🔴"},
    { "id": 4, "name": "Charlie", "avatar": "https://cdn.intra.42.fr/users/1f066718b7876b71d24f1624e61f66de/jeada-si.jpg", "friend": 1, "status": "online 🟢"},
]

function appendUser(user, userlist)
{
    const userCard = document.createElement("div");
    userCard.classList.add("col-md-4");

    userCard.innerHTML = `
        <div class="card user-card text-center p-3">
            <img src="${user.avatar}" alt="Avatar de ${user.name}" class="user-avatar mx-auto" width="100" height="100>
            <h5 class="mt-2">${user.name}</h5>
            <button class="btn btn-primary add-friend" data-id="${user.id}">ADD</button>
            <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
        </div>
    `;
    userlist.appendChild(userCard);
}

function handleUsers()
{
    const userlist = document.getElementById('user-container');

    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));

    userlist.innerHTML = `
    <div class="container mt-5">
            <button data-action="friends" class="btn btn-primary see-friend">FRIENDS</button>
    </div>  
    `

    userData.forEach(user => {
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
            // document.getElementById("profile-email").innerText = `Email: ${user.email}`;
            // document.getElementById("profile-bio").innerText = user.bio || "Pas de bio disponible.";
   
            profileModal.show();
        });
    });
}


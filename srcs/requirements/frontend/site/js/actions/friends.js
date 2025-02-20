import { navigate  } from "../router.js"
import { authFetchJson } from "../api.js";


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

function appendUser(user, userlist)
{
    const userCard = document.createElement("div");
    userCard.classList.add("col-md-4");

    userCard.innerHTML = `
        <div class="card user-card text-center p-3">
            <img src="${user.avatar}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100>
            <h5 class="mt-2">${user.username}</h5>
            <button class="btn btn-primary add-friend" data-id="${user.id}">ADD</button>
            <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
        </div>
    `;
    userlist.appendChild(userCard);
}


async function getFriendInfo()
{
    let tab = [];
    let nbr = 1;
    // try
    // {
    //     const user = await authFetchJson(`api/userprofile/display-other-profile?user_id=${nbr}`, {method: 'GET'});
    //     console.log(user);
    // }
    // catch (error)
    // {
    //     console.log("Error.", error);
    // }
    while (1)
    {
        try
        {
            const user = await authFetchJson(`api/userprofile/display-other-profile?user_id=${nbr}`, {method: 'GET'});
            console.log(user);
            tab.push(user);
            nbr++;
        }
        catch(error)
        {
            console.log("Error.", error);
            break ;
        }
    }
    return (tab);
}

async function getFriendStatistic(id)
{
    let statUser;
    try
    {
        const response = await fetch(`api/dashboards/user-statistics/?user_id=${id}`); 
        if (!response.ok)
            throw new Error('ERROR');
        statUser = await response.json();
        console.log(statUser);
    }
    catch(error)
    {
        console.log("Error.")
    }
    return (statUser);
}

async function handleFriends()
{
    let userData = [];

    const userlist = document.getElementById('user-container');
    
    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
    
    userlist.innerHTML = `
    <div class="container mt-5">
    <button data-action="Users" class="btn btn-primary see-friend">USERS</button>
    </div>  
    `
    userData = await getFriendInfo();
    userData.forEach(user => {
        if (user.is_active == true) // est ce que cest ca est connecte ?
            appendUser(user, userlist);
    })

    document.querySelectorAll(".view-profile").forEach(button => {
        button.addEventListener("click", async (e) => {

            const userId = parseInt(e.target.getAttribute("data-id"));

            // const statUser = await getFriendStatistic(userId);

            console.log(userId);
            
            const user = userData.find(u => u.id === userId);
    
            document.getElementById("profile-avatar").src = user.avatar;
            document.getElementById("profile-name").innerText = user.username;
            document.getElementById("profile-email").innerText = `Email: ${user.email}`;
            if (user.is_active == true)
                document.getElementById("profile-status").innerText = "Online";
            else
                document.getElementById("profile-status").innerText = "Offline";
    
            profileModal.show();
        });
    });

    // document.querySelectorAll(".add-friend").forEach(button => {
    //     button.addEventListener("click", (e) => {
    //         e.target.innerText = "Remove";
    //         e.target.classList.remove("btn-primary");
    //         e.target.classList.add("btn-success");
    //         e.target.disabled = true; // desactive lutilisation du boutton 
    //     });
    // });
}

/*
- TODO -->
    - changer userData quand le pull sera fait -> recup tous les users same time 
    - 
*/

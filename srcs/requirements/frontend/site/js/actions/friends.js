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

const friendsData = 
[
    {'name': 'sami', "status": 'player 1'},
    {'name': 'thomas', "status": 'player 2'},
    {'name': 'jean antoine', "status": 'player 3'},
]

function handleFriends()
{
    const friendslist = document.getElementById('friends-container');
    friendsData.forEach(friend => {
        console.log(friend.name);

        const liste = document.createElement('li');
        liste.innerHTML = friend.name;

        const select = document.createElement('select');
        liste.appendChild(select);

        const option1 = document.createElement('option');
        option1.value = "message";
        option1.innerHTML = "Send a message";
        select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = "block";
        option2.innerHTML = "Block";
        select.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = "remove";
        option3.innerHTML = "Remove";
        select.appendChild(option3);

        friendslist.append(liste);
    })
}


/*
    - 

*/
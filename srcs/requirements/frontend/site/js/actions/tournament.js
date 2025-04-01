import { authFetchJson } from "../api.js";




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
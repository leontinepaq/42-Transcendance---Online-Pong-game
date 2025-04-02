import { doLanguage } from "../translate.js"

const errors = {
  "Invalid email format": "invalidEmail",
  "Both fields required": "bothFields",
  "Passwords do not match": "passwordNotMatch",
  "Username or email already exists": "sameEmail",
  "User does not exist": "userNotFound",
  "Wrong password": "wrongPwd",
  "Wrong code": "wrongCode",
  "Wrong code/Wrong password": "wrongPwdCode",
  "Invalid user_id": "invalidUserID",
  "user_id is required": "userIDRequired",

  "Email already in use": "profile1",
  "Missing email field": "profile2",
  "username already in use": "profile3",
  "username too long": "profile4",
  "Missing username field": "profile5",
  
  "You cannot send a friend request to yourself": "friend1",
  "You are already friends with this user": "friend2",
  "This user blocked you": "friend3",
  "You cannot send a friend request to a user you blocked": "friend4",
  "Friend request already sent": "friend5",
  "You have a pending friend request from this user": "friend6",
  "Friend request not found": "friend7",
  "You are not friends with this user": "friend8",
  "User already blocked": "friend9",
  "User not blocked": "friend10",
  "User not found": "friend11",
   
  "No file uploaded": "noFile",
  "Invalid file type": "invalidFile",
  "File too large (Max 10MB)": "fileTooLarge",
  "Error saving file": "savingFileError",
};

export function showModal(message, title_i18n) {
  const modalTitle = document.querySelector("#myModal .modal-title");
  modalTitle.setAttribute('data-i18n', title_i18n);
  const modalBody = document.querySelector("#myModal .modal-body");
  modalBody.setAttribute('data-i18n', errors[message] || "errorUnknown");
  const modal = new bootstrap.Modal(document.getElementById("myModal"));
  modal.show();
  doLanguage();//todo @leontinepaq check utile
}

// export function showModal(title_i18n, bodyContent, footerContent = null) {
//   const modalEl = document.getElementById("myModal");
//   const modalTitle = modalEl.querySelector(".modal-title");
//   const modalBody = modalEl.querySelector(".modal-body");
//   const modalFooter = modalEl.querySelector(".modal-footer");

//   // Mise à jour du titre
//   modalTitle.setAttribute('data-i18n', title_i18n);
//   modalTitle.textContent = title_i18n; // Au cas où la traduction ne passe pas immédiatement

//   // Mise à jour du corps du modal
//   modalBody.innerHTML = ''; // Nettoyage
//   if (typeof bodyContent === 'string') {
//     modalBody.setAttribute('data-i18n', bodyContent);
//     modalBody.textContent = bodyContent; // Fallback
//   } else {
//     modalBody.appendChild(bodyContent);
//   }

//   // Mise à jour du footer
//   modalFooter.innerHTML = ''; // Nettoyage
//   if (footerContent) {
//     modalFooter.appendChild(footerContent);
//   }

//   const modal = new bootstrap.Modal(modalEl);
//   modal.show();
//   doLanguage(); // Appliquer la traduction
// }

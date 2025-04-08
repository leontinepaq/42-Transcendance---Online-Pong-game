import { doLanguage } from "../translate.js";

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

  "Waiting for 2nd player": "waiting",
  "Player got disconnected": "disconnected",
  "victory": "victory",
  "lost": "lost"
};

let modal = null;
let onCloseFunction = null;

function getModalElement(element = "title") {
  return document.querySelector("#myModal .modal-" + element);
}

function clearModalContent() {
  const modalElements = [
    document.querySelector("#myModal .modal-title"),
    document.querySelector("#myModal .modal-body"),
    document.querySelector("#myModal .modal-footer"),
  ];

  modalElements.forEach((element) => {
    element.removeAttribute("data-i18n");
    while (element.firstChild) element.removeChild(element.firstChild);
  });
}

export function showModal(
  title_i18n,
  body_i18n = null,
  footer_i18n = null,
  clear = true,
  onClose,
  closeOnClickOutside = true
) {
  console.log("SHOWING MODAL WITH BODY BEING");
  console.log(body_i18n);
  if (clear) clearModalContent();

  getModalElement("title").setAttribute("data-i18n", title_i18n);
  getModalElement("body").setAttribute("data-i18n", errors[body_i18n] || "errorUnknown");
  getModalElement("footer").setAttribute("data-i18n", footer_i18n);

  const modalElement = document.getElementById("myModal");
  modal = new bootstrap.Modal(modalElement, { backdrop: closeOnClickOutside });
  modal.show();
  doLanguage();

  if (typeof onClose === "function")
  {
    onCloseFunction = onClose;
    modalElement.addEventListener("hidden.bs.modal", onCloseFunction, {once: true});
  }

  return modal;
}

export function hideModal(triggerCloseEvent = false) {
  console.log("HIDDING MODAL");
  const modalElement = document.getElementById("myModal");

  if (triggerCloseEvent)
    modalElement.removeEventListener("hidden.bs.modal", onCloseFunction, {once: true});
  if (modal) modal.hide();
  modalElement.removeEventListener("hidden.bs.modal", onCloseFunction, {once: true});
  modal = null;
}

export function showModalWithCustomUi(
  title_i18n,
  body_i18n = null,
  footer_i18n = null,
  bodyUi,
  footerUi,
  onClose = null,
  closeOnClickOutside = true
) {
  clearModalContent();
  if (bodyUi)
    bodyUi.forEach((element) => {
      getModalElement("body").appendChild(element);
    });
  if (footerUi)
    footerUi.forEach((element) => {
      getModalElement("footer").appendChild(element);
    });
  return showModal(
    title_i18n,
    body_i18n,
    footer_i18n,
    false,
    onClose,
    closeOnClickOutside
  );
}

export default showModal;

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

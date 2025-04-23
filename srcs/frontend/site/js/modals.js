import { doLanguage } from "./translate.js";

const errors = {
  "Invalid email format": "invalidEmail",
  "Both fields required": "bothFields",
  "Passwords do not match": "passwordNotMatch",
  "Username or email already exists": "sameEmail",
  "User does not exist": "userNotFound",
  "Wrong password": "wrongPwd",
  "Wrong code": "wrongCode",
  "Wrong code/Wrong password": "wrongPwdCode",
  "Wrong or expired code":"wrongCode",
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
  "lost": "lost",

  "Invalid name": "invalidName",
  "Invalid ID":  "invalidID",
  "You are already registered for this tournament": "alreadyRegistered",
  "This tournament already has 4 participants": "tooManyParticipants",
  "You are not registered for this tournament": "notRegistered",

  "waitingFor": "waitingFor",
  "unavailable": "unavailable",
  "gameFrom": "gameFrom",
  "gameDeclined": "gameDeclined",
  "tournamentFrom": "tournamentFrom",
  "chatFailed": "chatFailed",

  "doublePlayerName": "doublePlayerName",
  "playerNameEmpty": "playerNameEmpty",
  "nextMatch": "nextMatch",
  "winnerIs": "winnerIs",

  "error":"error",
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

function setI18NContentData(element, i18n) {
  if (!i18n) return;
  if (i18n["i18n"] !== "") i18n["i18n"] = errors[i18n["i18n"]] || "errorUnknown";
  Object.entries(i18n).forEach(([key, value]) => {
    element.setAttribute(`data-${key}`, value);
  });
}

function removeModalBackdrop() {
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}

export async function showModal(
  title_i18n = { i18n: "" },
  body_i18n = { i18n: "" },
  footer_i18n = { i18n: "" },
  clear = true,
  onClose,
  closeOnClickOutside = true
) {
  if (clear) clearModalContent();

  setI18NContentData(getModalElement("title"), title_i18n);
  setI18NContentData(getModalElement("body"), body_i18n);
  setI18NContentData(getModalElement("footer"), footer_i18n);

  const modalElement = document.getElementById("myModal");
  modal = new bootstrap.Modal(modalElement, { backdrop: closeOnClickOutside });
  modalElement.addEventListener("hidden.bs.modal", removeModalBackdrop, {
    once: true,
  });
  await modal.show();
  doLanguage();

  if (typeof onClose === "function") {
    onCloseFunction = onClose;
    modalElement.addEventListener("hidden.bs.modal", onCloseFunction, {
      once: true,
    });
  }

  return modal;
}

export async function hideModal(triggerCloseEvent = false) {
  const modalElement = document.getElementById("myModal");

  if (!triggerCloseEvent)
    modalElement.removeEventListener("hidden.bs.modal", onCloseFunction, {
      once: true,
    });
  if (modal) await modal.hide();
  modalElement.removeEventListener("hidden.bs.modal", onCloseFunction, {
    once: true,
  });
  modal = null;
  clearModalContent();
}

export async function showModalWithCustomUi(
  title_i18n = { i18n: "" },
  body_i18n = { i18n: "" },
  footer_i18n = { i18n: "" },
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
  return await showModal(
    title_i18n,
    body_i18n,
    footer_i18n,
    false,
    onClose,
    closeOnClickOutside
  );
}

function footerButton(data = {}) {
  var button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn");
  button.setAttribute("data-bs-dismiss", "modal");

  Object.entries(data).forEach(([key, value]) => {
    button.setAttribute(`data-${key}`, value);
  });
  return button;
}

export async function showModalWithFooterButtons(
  title_i18n = { i18n: "" },
  body_i18n = { i18n: "" },
  bodyUi = null,
  buttons = [{ action: "cancel", i18n: "cancel", username: "Username" }],
  onClose = null,
  closeOnClickOutside = true
) {
  var buttonsElements = [];
  buttons.forEach((param) => {
    buttonsElements.push(footerButton(param));
  });

  return await showModalWithCustomUi(
    title_i18n,
    body_i18n,
    null,
    bodyUi,
    buttonsElements,
    onClose,
    closeOnClickOutside
  );
}

export default showModal;

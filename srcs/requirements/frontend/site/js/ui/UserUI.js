export const UserUI = {
  ACTION_BUTTONS: {
    friends: [{ type: "delete-friend", icon: "remove", class: "btn-red" }],
    pending: [
      { type: "accept-request", icon: "check", class: "btn-green" },
      { type: "decline-request", icon: "close", class: "btn-red" },
    ],
    blocked: [{ type: "unblock-user", icon: "remove", class: "btn-red" }],
    all: [
      { type: "send-request", icon: "add", class: "btn-green" },
      { type: "block-user", icon: "block", class: "btn-red" },
    ],
  },

  VIEW_STATS_BUTTON: { type: "view-stats", icon: "emoji_events", class: "" },

  createButton({ type, icon, class: btnClass }, action) {
    return `
		<button type="button" class="btn ${btnClass}" data-action="${action}" data-type="${type}">
		  <span class="material-symbols-outlined">${icon}</span>
		</button>
	  `;
  },

  getUserCardButtons(tabKey) {
    const viewStatsButton = this.createButton(this.VIEW_STATS_BUTTON, "view-stats");
    const buttons = this.ACTION_BUTTONS[tabKey] || [];
    const actionButtons = buttons
      .map((btn) => this.createButton(btn, "friend-action"))
      .join("");
    return viewStatsButton + actionButtons;
  },

  createUserCard(user, tabKey) {
    let msgButton = "";
    if (tabKey !== "blocked") {
      msgButton = `
		  <button type="button" class="btn chat-btn" data-action="open-chat" 
		  data-id="${user.id}" data-username="${user.username}">
			<span class="material-symbols-outlined">chat</span>
		  </button>`;
    }
    return `
		<div class="card card-user neon-border mt-4 gap-3" data-user-id="${user.id}">
		  <div class="card-body">
			<div class="d-flex justify-content-between align-items-center">
			  <div class="d-flex align-items-center">
				<img src="${user.avatar_url}" alt="${user.username}" class="avatar-80 img-fluid" />
				<div class="infos ms-3">
				  <div class="username">${user.username}</div>
				  <div class="mail">${user.email}</div>
				</div>
			  </div>
			  <div class="button-container">
				${msgButton}    
				${this.getUserCardButtons(tabKey)}
			  </div>
			</div>
		  </div>
		</div>
	  `;
  },
};

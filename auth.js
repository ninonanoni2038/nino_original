const STORAGE_KEY = "marubatsu_user";

const loginArea = document.getElementById("loginArea");
const userArea = document.getElementById("userArea");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const signOutBtn = document.getElementById("signOutBtn");

function decodeJwt(token) {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decodeURIComponent(escape(json)));
}

function showUser(user) {
  userAvatar.src = user.picture;
  userAvatar.alt = user.name;
  userName.textContent = user.name;
  loginArea.hidden = true;
  userArea.hidden = false;
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: { user } }));
}

function showLogin() {
  loginArea.hidden = false;
  userArea.hidden = true;
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: { user: null } }));
}

function handleCredentialResponse(response) {
  try {
    const payload = decodeJwt(response.credential);
    const user = {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    showUser(user);
  } catch (e) {
    console.error("Failed to decode credential", e);
  }
}

function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  showLogin();
}

function initGoogleSignIn() {
  const clientId = window.APP_CONFIG?.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith("YOUR_")) {
    loginArea.innerHTML =
      '<p class="login-note">⚠️ config.js に Google Client ID を設定してください</p>';
    return;
  }
  if (!window.google?.accounts?.id) {
    setTimeout(initGoogleSignIn, 100);
    return;
  }
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse,
    auto_select: false,
  });
  window.google.accounts.id.renderButton(
    document.getElementById("gSignInBtn"),
    { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill" }
  );
}

function restoreSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    showLogin();
    return;
  }
  try {
    const user = JSON.parse(raw);
    showUser(user);
  } catch {
    showLogin();
  }
}

signOutBtn.addEventListener("click", signOut);
restoreSession();
window.addEventListener("load", initGoogleSignIn);

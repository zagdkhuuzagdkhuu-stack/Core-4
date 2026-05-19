import { TOKEN_KEY, USER_KEY } from "./api";

export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userValue = localStorage.getItem(USER_KEY);

  return {
    token,
    user: userValue ? JSON.parse(userValue) : null,
  };
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

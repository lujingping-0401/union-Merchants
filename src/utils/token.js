const TOKEN_KEY = 'token';

/**
 * 获取 token
 * @returns {string|null} token
 */
export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 token
 * @param {string} token 
 */
export function setToken(token) {
	localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除 token
 */
export function removeToken() {
	localStorage.removeItem(TOKEN_KEY);
}
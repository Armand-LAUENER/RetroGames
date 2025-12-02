const API_URL = 'http://localhost:3000/api';

/**
 * Service to handle all HTTP requests to the backend API.
 * Manages authentication tokens and request headers.
 */
class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Stores the JWT token in local storage and updates the instance.
   * @param {string} token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  /**
   * Clears the authentication token.
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  /**
   * Generic request handler wrapper.
   * Automatically adds Authorization header if token exists.
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // --- Auth Endpoints ---

  async register(userData) {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(credentials) {
    const data = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async getAllUsers() {
    return await this.request('/users/users');
  }

  // --- Game Endpoints ---

  async startGame(gameId) {
    return await this.request('/users/game/start', {
      method: 'POST',
      body: JSON.stringify({ gameId })
    });
  }

  async updateScore(sessionId, score, duration = 0) {
    return await this.request('/users/game/score', {
      method: 'POST',
      body: JSON.stringify({ sessionId, score, duration })
    });
  }

  async getGameLeaderboard(gameId) {
    return await this.request(`/users/leaderboard/${gameId}`);
  }

  logout() {
    this.clearToken();
  }
}

export default new ApiService();
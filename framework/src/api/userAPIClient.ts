import { BaseAPIClient } from './baseAPIClient';

/**
 * User API Client
 * 
 * Provides methods for interacting with user-related API endpoints.
 * Example implementation of BaseAPIClient.
 * 
 * Endpoints are defined as static constants to avoid hardcoding in tests.
 */

export class UserAPIClient extends BaseAPIClient {
  // API Endpoints
  static readonly ENDPOINTS = {
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    USER_CREATE: '/users',
  };

  /**
   * Create a new user
   * 
   * @param userData - User data to create
   * @returns API response
   */
  async createUser(userData: {
    name: string;
    email: string;
    age?: number;
  }) {
    return this.post(UserAPIClient.ENDPOINTS.USER_CREATE, userData);
  }

  /**
   * Get all users
   * 
   * @returns API response with list of users
   */
  async getUsers() {
    return this.get(UserAPIClient.ENDPOINTS.USERS);
  }

  /**
   * Get a specific user by ID
   * 
   * @param id - User ID
   * @returns API response with user data
   */
  async getUserById(id: number) {
    return this.get(UserAPIClient.ENDPOINTS.USER_BY_ID(id));
  }
}

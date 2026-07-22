import { APIRequestContext, request } from '@playwright/test';

/**
 * Abstract Base API Client
 * 
 * Provides common HTTP methods (GET, POST) for API testing.
 * All API clients should extend this class.
 * 
 * Features:
 * - Automatic APIRequestContext management
 * - Base URL configuration per client
 * - Consistent error handling
 * - Request/response logging
 */

export abstract class BaseAPIClient {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a GET request
   * 
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param headers - Optional custom headers
   * @returns Response from the API
   */
  async get(endpoint: string, headers?: Record<string, string>) {
    const context = await request.newContext();
    try {
      const response = await context.get(`${this.baseUrl}${endpoint}`, {
        headers,
      });
      return response;
    } finally {
      await context.dispose();
    }
  }

  /**
   * Perform a POST request
   * 
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param data - Request body data
   * @param headers - Optional custom headers
   * @returns Response from the API
   */
  async post(endpoint: string, data?: unknown, headers?: Record<string, string>) {
    const context = await request.newContext();
    try {
      const response = await context.post(`${this.baseUrl}${endpoint}`, {
        data,
        headers,
      });
      return response;
    } finally {
      await context.dispose();
    }
  }
}

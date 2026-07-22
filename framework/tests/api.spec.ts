import { test, expect } from '../src/fixtures/commonFixture';

test.describe('@API - User API Tests', () => {
  /**
   * Test: Create a new user (POST request)
   * 
   * Demonstrates:
   * - Using injected userApi client
   * - Making POST requests
   * - Validating response status
   * - Parsing response JSON
   */
  test('POST - Create a new user', async ({ userApi }) => {
    // Prepare test data
    const newUser = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
    };

    // Make POST request
    const response = await userApi.createUser(newUser);

    // Validate response status
    expect(response.status()).toBe(200);

    // Optionally validate response body
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  /**
   * Test: Retrieve all users (GET request)
   * 
   * Demonstrates:
   * - Making GET requests
   * - Validating response status
   * - Validating response structure and fields
   */
  test('GET - Retrieve all users', async ({ userApi }) => {
    // Make GET request
    const response = await userApi.getUsers();

    // Validate response status
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();
    
    // Example validations
    expect(responseBody).toBeDefined();
    expect(Array.isArray(responseBody)).toBeTruthy();
  });

  /**
   * Test: Retrieve a specific user by ID (GET request)
   * 
   * Demonstrates:
   * - Passing parameters to API methods
   * - Making parameterized GET requests
   * - Validating specific response fields
   */
  test('GET - Retrieve user by ID', async ({ userApi }) => {
    // Make GET request with user ID
    const userId = 1;
    const response = await userApi.getUserById(userId);

    // Validate response status
    expect(response.status()).toBe(200);

    // Validate response body structure
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('email');
  });
});

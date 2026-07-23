Feature: Register a new user
  As a visitor
  I want to create an account
  So that I can sign in and use the app

  Scenario: Successful registration redirects to login
    Given I am on the register page
    When I submit the registration form with full name "Damian Test", email "AUTO_EMAIL", password "Password123!", and confirm password "Password123!"
    Then I should be redirected to the login page

  Scenario: Validation errors are shown for invalid registration data
    Given I am on the register page
    When I submit the registration form with full name " ", email "invalid-email", password "short", and confirm password "different"
    Then I should see the validation error "Full name is required." for the "fullName" field
    And I should see the validation error "Invalid email address" for the "email" field
    And I should see the validation error "Password must be at least 9 characters and include uppercase, lowercase, and a special character" for the "password" field
    And I should see the validation error "Password must be at least 9 characters and include uppercase, lowercase, and a special character" for the "confirmPassword" field

  Scenario: Duplicate email does not create a second user
    Given I have already attempted registration with full name "Damian Test", email "AUTO_EMAIL", password "Password123!", and confirm password "Password123!"
    When I submit the registration form with full name "Damian Test", email "AUTO_EMAIL", password "Password123!", and confirm password "Password123!"
    Then I should remain on the register page

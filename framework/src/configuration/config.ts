import dotenv from 'dotenv';
import path from 'path';

/**
 * Configuration Module
 * 
 * Manages environment variables and configuration for the framework.
 * 
 * Environment is controlled by the ENV variable.
 * If ENV is not set, an error will be thrown.
 * 
 * Usage:
 *   import { Config } from './config';
 *   
 *   const uiBaseUrl = Config.get(Config.EnvironmentVariables.UI_BASE_URL);
 *   const apiBaseUrl = Config.get(Config.EnvironmentVariables.API_BASE_URL);
 */

export class Config {
  /**
   * Enum for environment variable keys.
   * Add new variables here when needed.
   */
  static readonly EnvironmentVariables = {
    UI_BASE_URL: 'UI_BASE_URL',
    API_BASE_URL: 'API_BASE_URL',
  } as const;

  /**
   * Default configuration values.
   * These are used when environment variables are not found.
   */
  private static readonly defaults: Record<string, string> = {
    [this.EnvironmentVariables.UI_BASE_URL]: 'http://localhost:3000',
    [this.EnvironmentVariables.API_BASE_URL]: 'http://localhost:4000/api',
  };

  /**
   * Initialize configuration based on ENV variable.
   * This is called automatically when the module is loaded.
   */
  private static initializeConfig(): void {
    const environment = process.env.ENV;

    if (!environment) {
      throw new Error(
        'Environment variable ENV is not set. Please set ENV to one of: local, dev, staging, production'
      );
    }

    const validEnvironments = ['local', 'dev', 'staging', 'production'];
    if (!validEnvironments.includes(environment)) {
      throw new Error(
        `Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`
      );
    }

    // Load the appropriate .env file
    const envFile = path.resolve(__dirname, `../../.env.${environment}`);
    dotenv.config({ path: envFile });
  }

  /**
   * Get configuration value by key.
   * 
   * Priority:
   * 1. Process environment variable (process.env)
   * 2. Default value from defaults dictionary
   * 3. Throws error if neither exists
   * 
   * @param key - Configuration key from EnvironmentVariables enum
   * @returns Configuration value
   * @throws Error if configuration not found
   */
  static get(key: string): string {
    const value = process.env[key];

    if (value) {
      return value;
    }

    const defaultValue = this.defaults[key];
    if (defaultValue) {
      return defaultValue;
    }

    throw new Error(
      `Configuration key "${key}" not found in environment variables or defaults. ` +
      `Please add it to the .env.${process.env.ENV} file or set it as an environment variable.`
    );
  }
}

// Initialize configuration when module is imported
Config['initializeConfig']();

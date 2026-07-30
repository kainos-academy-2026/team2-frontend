variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.resource_group_name == null || (length(var.resource_group_name) >= 1 && length(var.resource_group_name) <= 90)
    error_message = "Resource group name must be between 1 and 90 characters."
  }
}

variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "UK South"

  validation {
    condition     = length(var.location) > 0
    error_message = "Location must not be empty."
  }
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "team2-frontend"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must only contain lowercase letters, numbers, and hyphens."
  }
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    ManagedBy = "Terraform"
  }
}

variable "acr_name" {
  description = "Name of the existing Azure Container Registry"
  type        = string
  default     = "acraiacademy26"
}

variable "acr_resource_group_name" {
  description = "Resource group of the ACR. Defaults to the project resource group when null."
  type        = string
  default     = null
  nullable    = true
}

variable "frontend_image" {
  description = "Frontend image name and tag in ACR (e.g. team2-frontend:latest)"
  type        = string
  default     = "team2-frontend:latest"
}

variable "backend_url" {
  description = "Full URL of the backend API — set once the backend is deployed"
  type        = string
  default     = "http://localhost:3001"
}

variable "mocked_authentication" {
  description = "Set to 'true' to enable the mock authentication feature flag"
  type        = string
  default     = "false"

  validation {
    condition     = contains(["true", "false"], var.mocked_authentication)
    error_message = "mocked_authentication must be 'true' or 'false'."
  }
}
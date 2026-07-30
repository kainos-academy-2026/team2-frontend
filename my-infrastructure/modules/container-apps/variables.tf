variable "name" {
  description = "Base name prefix for container app resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
}

variable "container_app_environment_id" {
  description = "Resource ID of the Container App Environment"
  type        = string
}

variable "managed_identity_id" {
  description = "Full resource ID of the user-assigned managed identity"
  type        = string
}

variable "managed_identity_principal_id" {
  description = "Principal ID of the managed identity (used for role assignments)"
  type        = string
}

variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
}

variable "acr_resource_group_name" {
  description = "Resource group containing the ACR"
  type        = string
}

variable "frontend_image" {
  description = "Frontend image name and tag in ACR (e.g. team2-frontend:latest)"
  type        = string
}

variable "backend_url" {
  description = "Full URL of the backend API (e.g. https://team2-backend.example.azurecontainerapps.io)"
  type        = string
}

variable "mocked_authentication" {
  description = "Value for the MOCKED_AUTHENTICATION feature flag environment variable"
  type        = string
  default     = "false"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

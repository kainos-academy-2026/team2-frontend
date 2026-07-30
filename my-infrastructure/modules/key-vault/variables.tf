variable "key_vault_name" {
  description = "Globally unique name for the Key Vault (3-24 chars, alphanumeric and hyphens)"
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{1,22}[a-zA-Z0-9]$", var.key_vault_name))
    error_message = "Key Vault name must be 3-24 characters, start with a letter, and contain only alphanumerics and hyphens."
  }
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "managed_identity_principal_id" {
  description = "Principal ID of the managed identity granted Key Vault Secrets User role"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the Key Vault"
  type        = map(string)
  default     = {}
}

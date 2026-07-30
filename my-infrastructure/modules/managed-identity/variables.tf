variable "name" {
  description = "Base name prefix for the managed identity resource"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the managed identity"
  type        = map(string)
  default     = {}
}

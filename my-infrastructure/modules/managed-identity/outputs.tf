output "id" {
  description = "The resource ID of the managed identity"
  value       = azurerm_user_assigned_identity.this.id
}

output "principal_id" {
  description = "The principal ID used for role assignments"
  value       = azurerm_user_assigned_identity.this.principal_id
}

output "client_id" {
  description = "The client ID of the managed identity"
  value       = azurerm_user_assigned_identity.this.client_id
}

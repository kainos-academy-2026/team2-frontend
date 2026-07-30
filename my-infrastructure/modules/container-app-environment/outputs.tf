output "id" {
  description = "The resource ID of the Container App Environment"
  value       = azurerm_container_app_environment.this.id
}

output "default_domain" {
  description = "The default domain of the Container App Environment"
  value       = azurerm_container_app_environment.this.default_domain
}

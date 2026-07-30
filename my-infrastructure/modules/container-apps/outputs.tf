output "frontend_fqdn" {
  description = "The public FQDN of the frontend container app"
  value       = azurerm_container_app.frontend.ingress[0].fqdn
}

output "backend_fqdn" {
  description = "The internal FQDN of the backend container app"
  value       = azurerm_container_app.backend.ingress[0].fqdn
}

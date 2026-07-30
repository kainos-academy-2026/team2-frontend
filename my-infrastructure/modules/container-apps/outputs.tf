output "frontend_fqdn" {
  description = "The public FQDN of the frontend container app"
  value       = azurerm_container_app.frontend.ingress[0].fqdn
}

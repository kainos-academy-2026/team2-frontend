output "name" {
  description = "Name of the Azure resource group"
  value       = azurerm_resource_group.this.name
}

output "id" {
  description = "The ID of the created resource group"
  value       = azurerm_resource_group.this.id
}

output "location" {
  description = "The location of the resource group"
  value       = azurerm_resource_group.this.location
}
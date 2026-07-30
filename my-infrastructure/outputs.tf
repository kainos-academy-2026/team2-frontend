output "resource_group_name" {
  description = "Name of the Azure resource group"
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "The ID of the created resource group"
  value       = module.resource_group.id
}

output "location" {
  description = "The location of the resource group"
  value       = module.resource_group.location
}

output "key_vault_name" {
  description = "Name of the Key Vault — add secrets manually in the Azure portal"
  value       = module.key_vault.name
}

output "frontend_url" {
  description = "Public URL of the frontend container app"
  value       = "https://${module.container_apps.frontend_fqdn}"
}
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
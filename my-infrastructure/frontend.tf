# frontend.tf
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

locals {
  default_resource_group_name   = "${var.project_name}-${var.environment}-rg"
  effective_resource_group_name = coalesce(var.resource_group_name, local.default_resource_group_name)
  name_prefix                   = "${var.project_name}-${var.environment}"
  acr_resource_group            = coalesce(var.acr_resource_group_name, local.effective_resource_group_name)
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.effective_resource_group_name
  location            = var.location
  environment         = var.environment
  tags                = var.tags
}

module "managed_identity" {
  source = "./modules/managed-identity"

  name                = local.name_prefix
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = var.tags
}

module "key_vault" {
  source = "./modules/key-vault"

  key_vault_name                = "${local.name_prefix}-kv"
  resource_group_name           = module.resource_group.name
  location                      = module.resource_group.location
  managed_identity_principal_id = module.managed_identity.principal_id
  tags                          = var.tags
}

module "container_app_environment" {
  source = "./modules/container-app-environment"

  name                = local.name_prefix
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = var.tags
}

module "container_apps" {
  source = "./modules/container-apps"

  name                          = local.name_prefix
  resource_group_name           = module.resource_group.name
  container_app_environment_id  = module.container_app_environment.id
  managed_identity_id           = module.managed_identity.id
  managed_identity_principal_id = module.managed_identity.principal_id
  acr_name                      = var.acr_name
  acr_resource_group_name       = local.acr_resource_group
  frontend_image                = var.frontend_image
  backend_url                   = var.backend_url
  mocked_authentication         = var.mocked_authentication
  tags                          = var.tags

  depends_on = [module.key_vault]
}
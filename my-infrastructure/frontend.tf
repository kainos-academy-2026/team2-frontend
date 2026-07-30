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
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.effective_resource_group_name
  location            = var.location
  environment         = var.environment
  tags                = var.tags
}
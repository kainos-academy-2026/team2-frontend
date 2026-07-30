data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

# Grant managed identity permission to pull images from ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = var.managed_identity_principal_id
}

resource "azurerm_container_app" "backend" {
  name                         = "${var.name}-backend"
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = "${var.acr_name}.azurecr.io"
    identity = var.managed_identity_id
  }

  ingress {
    external_enabled = false
    target_port      = var.backend_port
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "backend"
      image  = "${var.acr_name}.azurecr.io/${var.backend_image}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}

resource "azurerm_container_app" "frontend" {
  name                         = "${var.name}-frontend"
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = "${var.acr_name}.azurecr.io"
    identity = var.managed_identity_id
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${var.key_vault_vault_uri}secrets/SessionSecret"
    identity            = var.managed_identity_id
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "frontend"
      image  = "${var.acr_name}.azurecr.io/${var.frontend_image}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "BACKEND_URL"
        value = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
      }

      env {
        name  = "MOCKED_AUTHENTICATION"
        value = var.mocked_authentication
      }

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }
    }
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}

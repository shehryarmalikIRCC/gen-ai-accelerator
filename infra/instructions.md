Login into Azure and set your working subscription

```
az login --tenant <tenant-id>
az account set -s "<subscription-name>"
```

Ensure you have a resource group created.

```
az deployment group create --resource-group <resource-group-name> --template-file deploy.bicep
```

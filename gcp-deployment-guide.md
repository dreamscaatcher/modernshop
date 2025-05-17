# GCP Deployment Guide for ModernShop

This guide outlines the complete process for deploying your Next.js e-commerce application to Google Cloud Platform.

## Prerequisites

1. [Install Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. [Install Docker](https://docs.docker.com/get-docker/)
3. Create a Google Cloud project:
   ```bash
   gcloud projects create modernshop-project --name="ModernShop E-commerce"
   gcloud config set project modernshop-project
   ```

## Step 1: Enable Required Services

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com
```

## Step 2: Set Up Database

Follow instructions in `db-setup.md` to:
1. Create a Cloud SQL PostgreSQL instance
2. Create database and user
3. Store connection string in Secret Manager

## Step 3: Configure Secrets

Follow instructions in `env-secrets-setup.md` to:
1. Create all required secrets in Secret Manager
2. Grant access to service accounts

## Step 4: Deploy with Cloud Build

1. **Configure Cloud Build service account permissions**:
   ```bash
   # Get the Cloud Build service account
   PROJECT_ID=$(gcloud config get-value project)
   PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
   CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
   
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$CLOUDBUILD_SA" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$CLOUDBUILD_SA" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$CLOUDBUILD_SA" \
     --role="roles/cloudsql.client"
   
   gcloud iam service-accounts add-iam-policy-binding \
     $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
     --member="serviceAccount:$CLOUDBUILD_SA" \
     --role="roles/iam.serviceAccountUser"
   ```

2. **Submit the build**:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

## Step 5: Configure Domain and HTTPS

1. **Get the Cloud Run URL**:
   ```bash
   gcloud run services describe modernshop --format='value(status.url)'
   ```

2. **Map your custom domain** (optional):
   ```bash
   gcloud beta run domain-mappings create \
     --service=modernshop \
     --domain=your-domain.com
   ```

3. **Update the NEXTAUTH_URL environment variable**:
   ```bash
   gcloud run services update modernshop \
     --set-env-vars=NEXTAUTH_URL=https://your-domain.com
   ```

## Step 6: Configure Continuous Deployment

1. **Connect your GitHub repository to Cloud Build**:
   ```bash
   gcloud beta builds triggers create github \
     --repo-name=modernshop \
     --repo-owner=YOUR_GITHUB_USERNAME \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. **Verify the trigger**:
   ```bash
   gcloud beta builds triggers list
   ```

## Step 7: Monitoring and Maintenance

1. **Set up logging**:
   ```bash
   gcloud logging metrics create modernshop-errors \
     --description="ModernShop application errors" \
     --log-filter="resource.type=cloud_run_revision AND resource.labels.service_name=modernshop AND severity>=ERROR"
   ```

2. **Create alerts** (optional):
   ```bash
   gcloud alpha monitoring alerting policies create \
     --display-name="ModernShop Error Rate Alert" \
     --condition-filter="metric.type=\"logging.googleapis.com/user/modernshop-errors\" resource.type=\"cloud_run_revision\"" \
     --condition-threshold-value=10 \
     --condition-threshold-duration=5m \
     --notification-channels=YOUR_NOTIFICATION_CHANNEL_ID
   ```

## Step 8: Cost Optimization

1. **Enable autoscaling limits**:
   ```bash
   gcloud run services update modernshop \
     --min-instances=1 \
     --max-instances=10
   ```

2. **Configure database instance schedule** (for non-production environments):
   ```bash
   gcloud sql instances patch modernshop-db --activation-policy=NEVER
   ```

## Manual Deployment Testing

To test deployment without Cloud Build:

1. **Build the Docker image locally**:
   ```bash
   docker build -t gcr.io/${PROJECT_ID}/modernshop:latest .
   ```

2. **Push to Container Registry**:
   ```bash
   docker push gcr.io/${PROJECT_ID}/modernshop:latest
   ```

3. **Deploy to Cloud Run manually**:
   ```bash
   gcloud run deploy modernshop \
     --image=gcr.io/${PROJECT_ID}/modernshop:latest \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated
   ```

## Troubleshooting

1. **View logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=modernshop" --limit=50
   ```

2. **Check container startup**:
   ```bash
   gcloud run services describe modernshop
   ```

3. **Test the database connection**:
   ```bash
   gcloud sql connect modernshop-db --user=modernshop-app
   ```
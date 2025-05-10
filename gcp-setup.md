# Google Cloud Platform Deployment Guide

This guide outlines the steps to deploy the ModernShop e-commerce platform on Google Cloud Platform.

## Prerequisites

1. A Google Cloud Platform account
2. Google Cloud SDK installed
3. Docker installed locally
4. Git repository for the project

## Deployment Steps

### Step 1: Set up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use an existing one)
gcloud projects create modernshop-app --name="ModernShop E-commerce"

# Set the project as the default
gcloud config set project modernshop-app

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step 2: Set up Cloud SQL (PostgreSQL)

```bash
# Create a PostgreSQL instance
gcloud sql instances create modernshop-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=<secure-password> \
  --storage-size=10GB

# Create the database
gcloud sql databases create modernshop --instance=modernshop-db

# Create a user for the application
gcloud sql users create modernshop-app \
  --instance=modernshop-db \
  --password=<secure-password>
```

### Step 3: Set up Secret Manager for environment variables

```bash
# Create secrets for sensitive information
echo -n "postgresql://<user>:<password>@<connection-string>/modernshop" | \
  gcloud secrets create database-url --data-file=-

echo -n "<your-jwt-secret>" | \
  gcloud secrets create jwt-secret --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding database-url \
  --member=serviceAccount:modernshop-app@modernshop-app.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding jwt-secret \
  --member=serviceAccount:modernshop-app@modernshop-app.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Step 4: Set up Container Registry

```bash
# Create a repository in Artifact Registry
gcloud artifacts repositories create modernshop \
  --repository-format=docker \
  --location=us-central1 \
  --description="ModernShop Docker repository"
```

### Step 5: Build and Push Docker image

```bash
# Navigate to your project directory
cd /path/to/modernshop

# Build the Docker image
docker build -t us-central1-docker.pkg.dev/modernshop-app/modernshop/app:v1 .

# Push the image to Artifact Registry
docker push us-central1-docker.pkg.dev/modernshop-app/modernshop/app:v1
```

### Step 6: Deploy to Cloud Run

```bash
# Deploy the application
gcloud run deploy modernshop \
  --image=us-central1-docker.pkg.dev/modernshop-app/modernshop/app:v1 \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --update-secrets=DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest \
  --set-env-vars=NODE_ENV=production
```

### Step 7: Set up Cloud Build for CI/CD

Create a `cloudbuild.yaml` file in your repository:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/modernshop/app:$COMMIT_SHA', '.']
  
  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/modernshop/app:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'modernshop'
      - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/modernshop/app:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
  
  # Apply database migrations
  - name: 'us-central1-docker.pkg.dev/$PROJECT_ID/modernshop/app:$COMMIT_SHA'
    entrypoint: npx
    args: ['prisma', 'migrate', 'deploy']
    secretEnv: ['DATABASE_URL']

substitutions:
  _REGION: us-central1

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/database-url/versions/latest
      env: 'DATABASE_URL'

images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/modernshop/app:$COMMIT_SHA'
```

Then set up a Cloud Build trigger:

```bash
gcloud builds triggers create github \
  --name=modernshop-main \
  --repo=<owner/repository> \
  --branch-pattern=main \
  --build-config=cloudbuild.yaml
```

## Database Migrations and Seeding

```bash
# Connect to Cloud SQL using Cloud SQL Proxy
cloud_sql_proxy -instances=modernshop-app:us-central1:modernshop-db=tcp:5432

# Apply migrations
DATABASE_URL="postgresql://modernshop-app:<password>@localhost:5432/modernshop" npx prisma migrate deploy

# Seed database (if needed)
DATABASE_URL="postgresql://modernshop-app:<password>@localhost:5432/modernshop" npm run db:seed
```

## Monitoring and Scaling

- Set up Cloud Monitoring for performance tracking
- Configure Cloud Run autoscaling based on traffic patterns
- Implement Cloud Logging for application logs

## Estimated Costs

- Cloud Run: ~$0-5/month for low traffic
- Cloud SQL: ~$25/month for db-f1-micro
- Cloud Storage: ~$1-5/month for storage
- Secret Manager: ~$0-1/month
- Artifact Registry: ~$1-5/month

Total: ~$30-40/month for a basic setup
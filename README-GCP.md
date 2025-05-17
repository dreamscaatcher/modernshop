# ModernShop GCP Deployment

This repository contains the necessary configuration for deploying the ModernShop e-commerce application to Google Cloud Platform.

## Deployment Architecture

The application uses the following GCP services:

- **Cloud Run**: Hosts the containerized Next.js application
- **Cloud SQL**: PostgreSQL database for data storage
- **Secret Manager**: Securely stores environment variables and credentials
- **Cloud Build**: CI/CD pipeline for automated deployments

## Deployment Files

The following files have been created to facilitate deployment:

1. `Dockerfile`: Multi-stage build for the Next.js application
2. `.dockerignore`: Optimizes container size by excluding unnecessary files
3. `cloudbuild.yaml`: Cloud Build configuration for CI/CD
4. `db-setup.md`: Instructions for setting up the PostgreSQL database
5. `env-secrets-setup.md`: Guide for configuring environment variables and secrets
6. `gcp-deployment-guide.md`: Comprehensive deployment workflow instructions

## Getting Started

To deploy this application to GCP:

1. Make sure you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
2. Follow the step-by-step instructions in `gcp-deployment-guide.md`

## Quick Start

```bash
# Set up project and enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com

# Set up database (see db-setup.md for details)
gcloud sql instances create modernshop-db --database-version=POSTGRES_15 --tier=db-g1-small

# Create secrets (see env-secrets-setup.md for details)
openssl rand -base64 32 | gcloud secrets create NEXTAUTH_SECRET --data-file=-

# Deploy the application
gcloud builds submit --config=cloudbuild.yaml
```

## Environment Configuration

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: The base URL of your application
- `STRIPE_SECRET_KEY`: Your Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`: Public key for Stripe.js integration

These are configured using GCP Secret Manager as described in `env-secrets-setup.md`.

## Continuous Deployment

The repository is configured for continuous deployment using Cloud Build. Any push to the main branch will trigger:

1. Building the Docker container
2. Running database migrations
3. Deploying to Cloud Run

See `cloudbuild.yaml` for the detailed configuration.

## Cost Optimization

The deployment is configured for cost optimization with:

- Minimum instances set to 1 to reduce cold starts
- Maximum instances set to 10 to control costs during traffic spikes
- Smallest viable database instance (db-g1-small)

You can adjust these based on your specific requirements and budget.

## Monitoring

Use Google Cloud Monitoring to set up:

- Error rate alerts
- Performance monitoring
- Database metrics

## Troubleshooting

If you encounter issues during deployment, check:

1. Cloud Build logs for build failures
2. Cloud Run logs for application errors
3. Cloud SQL logs for database connection issues

For detailed troubleshooting steps, see the "Troubleshooting" section in `gcp-deployment-guide.md`.
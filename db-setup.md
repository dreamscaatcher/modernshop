# Database Setup on Google Cloud SQL

## Creating a Cloud SQL PostgreSQL Instance

1. **Create the instance via gcloud CLI**:
   ```bash
   gcloud sql instances create modernshop-db \
     --database-version=POSTGRES_15 \
     --tier=db-g1-small \
     --region=us-central1 \
     --storage-size=10GB \
     --storage-type=SSD \
     --availability-type=zonal \
     --backup-start-time=02:00 \
     --backup \
     --allocated-ip-range-name=google-managed
   ```

2. **Create a database**:
   ```bash
   gcloud sql databases create modernshop \
     --instance=modernshop-db
   ```

3. **Create a user for the application**:
   ```bash
   gcloud sql users create modernshop-app \
     --instance=modernshop-db \
     --password=YOUR_SECURE_PASSWORD
   ```

4. **Save the database connection string to Secret Manager**:
   ```bash
   echo "postgresql://modernshop-app:YOUR_SECURE_PASSWORD@/modernshop?host=/cloudsql/PROJECT_ID:us-central1:modernshop-db" | \
   gcloud secrets create DATABASE_URL \
     --data-file=- \
     --replication-policy=automatic
   ```

5. **Configure access for Cloud Run**:
   ```bash
   # Give the Cloud Run service account access to the Secret Manager secret
   gcloud secrets add-iam-policy-binding DATABASE_URL \
     --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
     --role="roles/secretmanager.secretAccessor"
   
   # If using direct connection instead of proxy, set up appropriate network
   gcloud sql instances patch modernshop-db \
     --authorized-networks=CLOUD_RUN_IP_RANGE
   ```

## Database Migration

Before deploying the application, you need to run the database migrations to set up the schema:

1. **Add a step in cloudbuild.yaml for migration**:
   ```yaml
   - name: 'gcr.io/$PROJECT_ID/modernshop:$COMMIT_SHA'
     id: 'Run Database Migrations'
     entrypoint: 'npx'
     args: ['prisma', 'migrate', 'deploy']
     env:
       - 'DATABASE_URL=$$DATABASE_URL'
     secretEnv: ['DATABASE_URL']
   ```

2. **For initial deployment, you can run migrations manually**:
   ```bash
   # Export the database URL from Secret Manager
   export DATABASE_URL=$(gcloud secrets versions access latest --secret=DATABASE_URL)
   
   # Run migrations locally
   npx prisma migrate deploy
   
   # Optionally, seed the database
   npm run db:seed
   ```

## Connection Configuration in Cloud Run

When deploying to Cloud Run, ensure the connection uses the proper format for Cloud SQL:

1. Set the `DATABASE_URL` environment variable in the correct format
2. For direct connection (recommended):
   ```
   postgresql://modernshop-app:YOUR_SECURE_PASSWORD@/modernshop?host=/cloudsql/PROJECT_ID:us-central1:modernshop-db
   ```

3. For connection via proxy:
   ```
   postgresql://modernshop-app:YOUR_SECURE_PASSWORD@127.0.0.1:5432/modernshop
   ```
   And ensure the Cloud SQL Auth Proxy is running alongside your application
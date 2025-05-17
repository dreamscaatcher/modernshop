# Environment Variables and Secrets Setup for GCP Deployment

Your Next.js e-commerce application requires several environment variables to function properly. For security, we'll store these as secrets in Google Cloud Secret Manager.

## Required Environment Variables

Based on your application's code, you need the following environment variables:

1. `DATABASE_URL`: PostgreSQL connection string
2. `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption
3. `NEXTAUTH_URL`: The base URL of your website
4. `STRIPE_SECRET_KEY`: Your Stripe API secret key
5. `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events
6. `STRIPE_PUBLIC_KEY`: Public key for Stripe.js integration

## Creating Secrets in Secret Manager

Run these commands to create the necessary secrets:

```bash
# Create NEXTAUTH_SECRET (generate a random string)
openssl rand -base64 32 | gcloud secrets create NEXTAUTH_SECRET --data-file=-

# Create STRIPE_SECRET_KEY
echo "sk_your_stripe_secret_key" | gcloud secrets create STRIPE_SECRET_KEY --data-file=-

# Create STRIPE_WEBHOOK_SECRET
echo "whsec_your_stripe_webhook_secret" | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-

# Create STRIPE_PUBLIC_KEY
echo "pk_your_stripe_public_key" | gcloud secrets create STRIPE_PUBLIC_KEY --data-file=-
```

## Setting Environment Variables in Cloud Run

In your Cloud Run deployment (already configured in cloudbuild.yaml), we're using the secrets:

```yaml
'--set-secrets=DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest'
```

Additionally, we're setting the public NEXTAUTH_URL directly:

```yaml
'--set-env-vars=NEXTAUTH_URL=https://modernshop-url.a.run.app'
```

## Handling Public Keys in Next.js

For client-side access to public keys (like STRIPE_PUBLIC_KEY), you need to prefix them with `NEXT_PUBLIC_`:

1. Add this to cloudbuild.yaml:
   ```yaml
   '--set-env-vars=NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$(gcloud secrets versions access latest --secret=STRIPE_PUBLIC_KEY)'
   ```

## Local Development vs Production

For local development, create a `.env.local` file (already in .gitignore):

```
DATABASE_URL=postgresql://user:password@localhost:5432/modernshop
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_test_public_key
```

For production, secrets are managed securely in GCP Secret Manager.

## Access Control for Secrets

Ensure your Cloud Run service account has access to the secrets:

```bash
# Get your service account (usually the default compute service account)
SERVICE_ACCOUNT=$(gcloud iam service-accounts list --filter="email~^[0-9]+-compute@" --format="value(email)")

# Grant access to each secret
for SECRET in DATABASE_URL NEXTAUTH_SECRET STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_PUBLIC_KEY; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor"
done
```

## Secret Rotation

For security best practices, rotate your secrets periodically:

1. Create a new version of the secret in Secret Manager
2. Cloud Run will automatically use the latest version

This approach ensures your application keeps running during secret rotation.
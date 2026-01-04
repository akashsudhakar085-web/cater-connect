#!/bin/bash

# Google Cloud Run Deployment Script for Cater Connect

# Configuration
PROJECT_ID="YOUR_PROJECT_ID"  # Replace with your GCP project ID
REGION="us-central1"           # Change to your preferred region
SERVICE_NAME="cater-connect"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Cater Connect to Google Cloud Run"
echo "================================================"

# Step 1: Set the project
echo "📋 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 3: Build the Docker image
echo "🏗️  Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}

# Step 4: Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://raqtqeckmqegboekezsr.supabase.co" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_P_-dpugwbFDsEQvYDv4TEQ_xREqLIj3" \
  --set-env-vars "DATABASE_URL=postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at the URL shown above"

# Cloud Run Deployment

## Project ID
`mira-494609`

## Setup

```bash
# Authenticate
gcloud auth login
gcloud auth configure-docker

# Set project
gcloud config set project mira-494609
```

## Build & Deploy (One-time)

```bash
cd backend
gcloud builds submit --config=../cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY=your_gemini_key
```

## Or Manual Deploy

```bash
cd backend

# Build
docker build -t gcr.io/mira-494609/mira-ai-hub:latest .

# Push
docker push gcr.io/mira-494609/mira-ai-hub:latest

# Deploy
gcloud run deploy mira-ai-hub \
  --image gcr.io/mira-494609/mira-ai-hub:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_key
```

## Get URL

```bash
gcloud run services describe mira-ai-hub --region us-central1 --format='value(status.url)'
```

## Environment Variables

| Variable | Required |
|----------|----------|
| `GEMINI_API_KEY` | Yes |
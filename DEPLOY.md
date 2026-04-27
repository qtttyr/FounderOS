# Cloud Run Deployment

## Project ID
`project-29104ba0-09d7-450d-b36`

## Deploy Commands

```bash
# Set project
gcloud config set project project-29104ba0-09d7-450d-b36

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Deploy backend
cd backend
gcloud builds submit --config=../cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY=AIzaSyCkVk0rWWzTLkhT1xzZO78m9sPcc9p80aY

# Get URL
gcloud run services describe mira-ai-hub --region=us-central1 --format='value(status.url)'
```

## Manual Deploy

```bash
cd backend
docker build -t gcr.io/project-29104ba0-09d7-450d-b36/mira-ai-hub:latest .
docker push gcr.io/project-29104ba0-09d7-450d-b36/mira-ai-hub:latest
gcloud run deploy mira-ai-hub \
  --image gcr.io/project-29104ba0-09d7-450d-b36/mira-ai-hub:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=AIzaSyCkVk0rWWzTLkhT1xzZO78m9sPcc9p80aY
```
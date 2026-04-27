# Cloud Run Deployment

## Setup

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
cd backend
gcloud builds submit --config=../cloudbuild.yaml --substitutions=_GEMINI_API_KEY=your_api_key

# Or with Docker directly:
docker build -t gcr.io/YOUR_PROJECT_ID/mira-ai-hub .
docker push gcr.io/YOUR_PROJECT_ID/mira-ai-hub
gcloud run deploy mira-ai-hub \
  --image gcr.io/YOUR_PROJECT_ID/mira-ai-hub \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_api_key
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## URLs

After deploy, get the URL:
```bash
gcloud run services describe mira-ai-hub --region us-central1 --format='value(status.url)'
```
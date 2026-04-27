FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV GEMINI_API_KEY=dummy-placeholder-for-github-actions

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
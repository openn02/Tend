# Tend - Privacy-First AI Wellbeing Assistant

Tend is an AI-powered wellbeing assistant for remote and hybrid teams that helps identify and prevent burnout through intelligent analysis of work patterns.

## 🌟 Features

- **Privacy-First Design**: No content access, only metadata analysis
- **Smart Integrations**: Slack and Google Workspace (Calendar + Gmail)
- **Personalized Insights**: Private nudges for employees
- **Team Analytics**: Anonymized trend insights for managers
- **GDPR Compliant**: Full user control over data and consent

## 🛠 Tech Stack

- **Backend**: Python (FastAPI), PostgreSQL, Celery
- **Frontend**: React, Tailwind CSS
- **Auth**: OAuth2 + JWT
- **Infrastructure**: AWS/GCP compatible

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Redis (for Celery)

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## 🔒 Privacy & Security

- All user data is encrypted at rest and in transit
- No access to message or email content
- Role-based access control (RBAC)
- Anonymized team-level data for managers
- GDPR-style consent management
- Regular security audits

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests. 
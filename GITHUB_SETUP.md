# GitHub Repository Setup Plan

## 🎯 Repository Strategy

### **Repository Name**: `emerald-hills-weather`
### **Staging Environment**: `emerald-hills-weather/` directory (current)
### **Production Deployment**: Vercel (recommended)

## 📁 Repository Structure

```
emerald-hills-weather/
├── .github/
│   └── workflows/
│       ├── integration.yml      # CI for staging integration
│       └── deploy.yml           # CD for production deployment
├── src/
│   ├── api/                     # Express API endpoints
│   ├── components/              # React components (from frontend agent)
│   ├── pages/                   # Page components
│   ├── services/                # External API integrations
│   ├── models/                  # Database models
│   └── utils/                   # Shared utilities
├── docs/
│   ├── features.md              # Implementation tracking
│   ├── architecture.md          # System design
│   ├── prd.md                   # Product requirements
│   └── api.md                   # API documentation
├── tests/
│   ├── integration/             # Integration tests
│   ├── api/                     # API tests
│   └── components/              # Component tests
├── deployment/
│   ├── vercel.json              # Vercel configuration
│   ├── docker-compose.yml       # Local development
│   └── staging.yml              # Staging environment config
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
├── README.md                    # Public documentation
└── CONTRIBUTING.md              # Development workflow
```

## 🚀 Setup Commands

### 1. Initialize Repository
```bash
cd /Users/urikogan/code/emerald-hills-weather

# Initialize git (if not already done)
git init
git add .
git commit -m "initial: parallel development staging environment"

# Create GitHub repository
gh repo create emerald-hills-weather --public --description "Personalized weather dashboard for SF Peninsula microclimate"

# Set origin and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emerald-hills-weather.git
git push -u origin main
```

### 2. Set up Branch Protection
```bash
# Protect main branch - require PR reviews
gh api repos/:owner/emerald-hills-weather/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/integration"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

### 3. Environment Variables for Deployment
```bash
# Set secrets for CI/CD
gh secret set OPENWEATHER_API_KEY --body "your_api_key_here"
gh secret set VERCEL_TOKEN --body "your_vercel_token"
```

## 🔄 Integration Workflow

### Current Agent Work → Staging Integration
```bash
# After ticket completion:
cd /Users/urikogan/code/emerald-hills-weather

# Integrate backend changes
cp -r ../emerald-hills-weather-backend/src/* src/
git add src/
git commit -m "integrate: backend E1-T2 data collection system"

# Integrate frontend changes  
cp -r ../emerald-hills-weather-frontend/src/* src/
git add src/
git commit -m "integrate: frontend E2-T2 current conditions display"

# Test integration
npm test
npm run dev

# Push to staging
git push origin main
```

### Staging → Production Deployment
```bash
# After QA approval:
git tag -a v1.0.0 -m "release: E1 Data Foundation complete"
git push origin v1.0.0

# Vercel automatically deploys from main branch
```

## 🧪 CI/CD Pipeline

### Integration Testing (`.github/workflows/integration.yml`)
```yaml
name: Integration Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
      - name: Test Weather APIs
        env:
          OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}
        run: npm run test:integration
```

### Production Deployment (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
    tags: ['v*']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## 📊 Project Management Integration

### GitHub Issues + PM System
```bash
# Create issues from PM tickets
python3 scripts/sync-github-issues.py

# Link commits to tickets
git commit -m "feat(api): implement data collection (E1-T2)

- Add DataCollectionService class
- Implement automated hourly collection
- Add rate limiting and error handling

Closes #12"
```

### Labels for Organization
- `epic:e1` / `epic:e2` - Epic classification
- `agent:backend` / `agent:frontend` / `agent:qa` / `agent:design` - Agent assignment
- `priority:critical` / `priority:high` / `priority:medium` - Priority levels
- `status:in-progress` / `status:review` / `status:testing` - Status tracking

## 🔐 Security Considerations

### Environment Variables
- **Never commit**: API keys, secrets, personal data
- **Use GitHub Secrets**: For CI/CD environment variables
- **Environment templates**: Provide `.env.example` with dummy values

### API Key Management
```bash
# Local development
cp .env.example .env
# Add real API keys to .env (gitignored)

# Production deployment
# Set secrets in Vercel dashboard or via CLI
vercel env add OPENWEATHER_API_KEY
```

## 🎯 Immediate Next Steps

1. **Initialize repository** with current staging code
2. **Set up Vercel project** for automatic deployments
3. **Configure CI/CD** with GitHub Actions
4. **Integrate completed agent work** following new workflow
5. **Train agents** on new integration process

**This setup provides professional deployment pipeline while maintaining parallel development workflow!**
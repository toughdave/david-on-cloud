# CI/CD Pipeline Implementation Guide

This guide will help you set up a complete CI/CD pipeline for your David On Cloud portfolio website.

## 🚀 Quick Start

1. **Push to GitHub**: Commit and push these new files to your repository
2. **Configure Secrets**: Set up GitHub Secrets for your deployment target
3. **Enable Actions**: GitHub Actions will automatically run on push to `main` branch

## 📋 What's Included

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)
- **Code Quality**: HTML, CSS, and JavaScript linting
- **Security Scanning**: Vulnerability detection with Trivy
- **Build & Test**: Validation and artifact creation
- **Docker Build**: Multi-platform container images
- **Deployment**: Automated deployment to staging and production

### Configuration Files
- `.htmlhintrc` - HTML linting rules
- `.stylelintrc.json` - CSS linting configuration
- `.eslintrc.js` - JavaScript linting rules
- `.env.example` - Environment configuration template

### Deployment Script (`scripts/deploy.sh`)
Supports multiple deployment targets:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Azure Blob Storage
- SSH/Traditional hosting

## 🔧 Setup Instructions

### 1. GitHub Repository Settings

Go to your repository → Settings → Secrets and variables → Actions

#### For GitHub Pages Deployment:
```
GITHUB_TOKEN (automatically provided)
```

#### For AWS S3 Deployment:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id (optional)
```

#### For Azure Deployment:
```
AZURE_CREDENTIALS=your_service_principal_json
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_CONTAINER_NAME=$web
```

#### For SSH Deployment:
```
SSH_HOST=your-server.com
SSH_USER=your-username
SSH_PRIVATE_KEY=your_private_key_content
REMOTE_PATH=/var/www/html
```

### 2. Enable GitHub Actions

1. Go to your repository → Actions tab
2. If prompted, click "I understand my workflows and want to enable them"
3. The pipeline will automatically run on the next push to `main`

### 3. Configure Deployment Target

Edit `.github/workflows/ci-cd.yml` and set your preferred deployment method by uncommenting the relevant sections in the deployment jobs.

## 🌟 Pipeline Features

### Code Quality Checks
- **HTML Validation**: Structure and syntax validation
- **CSS Linting**: Style consistency and best practices
- **JavaScript Linting**: Code quality and syntax checking
- **Security Scanning**: Vulnerability detection

### Build Process
- **Artifact Creation**: Optimized build output
- **Docker Images**: Multi-platform container builds
- **Caching**: Optimized build times with layer caching

### Deployment Strategies
- **Staging Environment**: Deploy `develop` branch to staging
- **Production Environment**: Deploy `main` branch to production
- **Rollback Support**: Backup creation before deployment
- **Health Checks**: Post-deployment validation

### Monitoring & Notifications
- **Build Status**: Real-time pipeline status
- **Deployment Logs**: Detailed deployment information
- **Error Reporting**: Automatic issue detection and reporting

## 📱 Supported Deployment Platforms

### 1. GitHub Pages (Recommended for portfolios)
```bash
# Automatically deploys to username.github.io/repository-name
# No additional configuration required
```

### 2. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=build
```

### 3. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 4. AWS S3 + CloudFront
```bash
# Sync to S3 bucket
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### 5. Azure Blob Storage
```bash
# Upload to Azure Storage
az storage blob upload-batch --source build --destination '$web' --account-name your-account
```

## 🔄 Workflow Triggers

The pipeline runs on:
- **Push to main**: Full deployment to production
- **Push to develop**: Deployment to staging
- **Pull requests**: Code quality checks only
- **Manual trigger**: Via GitHub Actions UI

## 📊 Monitoring Your Pipeline

### GitHub Actions Dashboard
1. Go to your repository → Actions tab
2. View running and completed workflows
3. Click on individual runs for detailed logs

### Build Status Badge
Add this to your README.md:
```markdown
![CI/CD Pipeline](https://github.com/toughdave/david-on-cloud/actions/workflows/ci-cd.yml/badge.svg)
```

## 🛠️ Customization

### Adding Custom Tests
Edit `.github/workflows/ci-cd.yml` in the `build-and-test` job:

```yaml
- name: Custom validation
  run: |
    # Add your custom tests here
    echo "Running custom validation..."
```

### Environment-Specific Configuration
1. Copy `.env.example` to `.env`
2. Update with your specific values
3. Add sensitive values as GitHub Secrets

### Deployment Customization
Edit `scripts/deploy.sh` to add custom deployment logic:

```bash
deploy_custom() {
    log "Deploying to custom platform..."
    # Add your deployment commands here
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure GitHub Secrets are properly configured
2. **Build Failures**: Check linting errors in the Actions logs
3. **Deployment Failures**: Verify deployment target configuration

### Debug Mode
Enable debug logging by adding this to your workflow:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

## 📈 Next Steps

1. **Monitor Performance**: Set up web performance monitoring
2. **Add E2E Tests**: Implement Cypress or Playwright tests
3. **CDN Integration**: Configure CDN for better performance
4. **Custom Domain**: Set up your custom domain with SSL

## 🔐 Security Best Practices

- Never commit secrets to your repository
- Use GitHub Secrets for sensitive data
- Regularly update dependencies
- Monitor security advisories
- Use signed commits when possible

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review the troubleshooting section
3. Consult the platform-specific documentation
4. Open an issue in your repository

---

**Happy Deploying! 🚀**

Your portfolio will now automatically deploy whenever you push changes to the main branch!
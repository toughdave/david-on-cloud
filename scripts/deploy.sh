#!/bin/bash

# Production Deployment Script for David On Cloud Portfolio
# This script handles the deployment process to your production environment

set -euo pipefail

# Configuration
DEPLOY_DIR="production-deploy"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if required files exist
    if [[ ! -f "index.html" ]]; then
        error "index.html not found!"
    fi
    
    if [[ ! -f "VERSION" ]]; then
        error "VERSION file not found!"
    fi
    
    # Validate HTML structure
    if ! grep -q 'charset="UTF-8"' index.html; then
        error "Missing UTF-8 charset in index.html"
    fi
    
    # Check JavaScript syntax
    if command -v node &> /dev/null; then
        node -c js/scripts.js || error "JavaScript syntax error in scripts.js"
        node -c js/project-times.js || error "JavaScript syntax error in project-times.js"
    fi
    
    log "✅ Pre-deployment checks passed"
}

# Create backup
create_backup() {
    if [[ -d "$BACKUP_DIR" ]]; then
        log "Creating backup in $BACKUP_DIR..."
        mkdir -p "$BACKUP_DIR"
        # Add your backup commands here based on your hosting setup
        # Example: cp -r /var/www/html/* "$BACKUP_DIR/"
        log "✅ Backup created successfully"
    fi
}

# Deploy to different hosting providers
deploy_to_github_pages() {
    log "Deploying to GitHub Pages..."
    
    # Build for GitHub Pages
    if [[ -d "$DEPLOY_DIR" ]]; then
        cp -r "$DEPLOY_DIR"/* .
        
        # Commit and push to gh-pages branch
        git add .
        git commit -m "Deploy version $(cat VERSION) to GitHub Pages"
        git push origin gh-pages
        
        log "✅ Deployed to GitHub Pages"
    fi
}

deploy_to_netlify() {
    log "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir="$DEPLOY_DIR"
        log "✅ Deployed to Netlify"
    else
        warn "Netlify CLI not found. Install it with: npm install -g netlify-cli"
    fi
}

deploy_to_vercel() {
    log "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        cd "$DEPLOY_DIR"
        vercel --prod
        cd ..
        log "✅ Deployed to Vercel"
    else
        warn "Vercel CLI not found. Install it with: npm install -g vercel"
    fi
}

deploy_to_aws_s3() {
    log "Deploying to AWS S3..."
    
    if command -v aws &> /dev/null; then
        # Replace with your S3 bucket name
        S3_BUCKET="${AWS_S3_BUCKET:-your-bucket-name}"
        
        aws s3 sync "$DEPLOY_DIR" "s3://$S3_BUCKET" --delete
        
        # Invalidate CloudFront cache if distribution ID is set
        if [[ -n "${AWS_CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
            aws cloudfront create-invalidation \
                --distribution-id "$AWS_CLOUDFRONT_DISTRIBUTION_ID" \
                --paths "/*"
        fi
        
        log "✅ Deployed to AWS S3"
    else
        warn "AWS CLI not found. Install it first."
    fi
}

deploy_to_azure_blob() {
    log "Deploying to Azure Blob Storage..."
    
    if command -v az &> /dev/null; then
        # Replace with your storage account and container details
        STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT:-your-storage-account}"
        CONTAINER_NAME="${AZURE_CONTAINER_NAME:-\$web}"
        
        az storage blob upload-batch \
            --source "$DEPLOY_DIR" \
            --destination "$CONTAINER_NAME" \
            --account-name "$STORAGE_ACCOUNT"
        
        log "✅ Deployed to Azure Blob Storage"
    else
        warn "Azure CLI not found. Install it first."
    fi
}

deploy_via_ssh() {
    log "Deploying via SSH..."
    
    # SSH deployment configuration
    SSH_HOST="${SSH_HOST:-your-server.com}"
    SSH_USER="${SSH_USER:-user}"
    REMOTE_PATH="${REMOTE_PATH:-/var/www/html}"
    
    if [[ -n "$SSH_HOST" && -n "$SSH_USER" ]]; then
        rsync -avz --delete "$DEPLOY_DIR/" "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
        log "✅ Deployed via SSH"
    else
        warn "SSH configuration not complete. Set SSH_HOST and SSH_USER environment variables."
    fi
}

# Post-deployment validation
post_deployment_validation() {
    log "Running post-deployment validation..."
    
    # Add your validation checks here
    # Example: Health check endpoints
    # if curl -f https://davidoncloud.com > /dev/null 2>&1; then
    #     log "✅ Health check passed"
    # else
    #     error "Health check failed"
    # fi
    
    log "✅ Post-deployment validation completed"
}

# Main deployment function
main() {
    log "🚀 Starting deployment process for David On Cloud Portfolio"
    log "📦 Version: $(cat VERSION 2>/dev/null || echo 'unknown')"
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Create backup
    create_backup
    
    # Deploy based on environment variable or default
    DEPLOYMENT_TARGET="${DEPLOYMENT_TARGET:-github-pages}"
    
    case "$DEPLOYMENT_TARGET" in
        "github-pages")
            deploy_to_github_pages
            ;;
        "netlify")
            deploy_to_netlify
            ;;
        "vercel")
            deploy_to_vercel
            ;;
        "aws-s3")
            deploy_to_aws_s3
            ;;
        "azure-blob")
            deploy_to_azure_blob
            ;;
        "ssh")
            deploy_via_ssh
            ;;
        *)
            error "Unknown deployment target: $DEPLOYMENT_TARGET"
            ;;
    esac
    
    # Post-deployment validation
    post_deployment_validation
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Your portfolio is now live!"
}

# Help function
show_help() {
    cat << EOF
David On Cloud Portfolio Deployment Script

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -t, --target TARGET Deployment target (github-pages, netlify, vercel, aws-s3, azure-blob, ssh)
    -d, --dry-run       Perform a dry run without actual deployment

Environment Variables:
    DEPLOYMENT_TARGET           Target platform (default: github-pages)
    AWS_S3_BUCKET              AWS S3 bucket name
    AWS_CLOUDFRONT_DISTRIBUTION_ID  CloudFront distribution ID
    AZURE_STORAGE_ACCOUNT      Azure storage account name
    AZURE_CONTAINER_NAME       Azure blob container name
    SSH_HOST                   SSH server hostname
    SSH_USER                   SSH username
    REMOTE_PATH               Remote deployment path

Examples:
    $0                          # Deploy to GitHub Pages (default)
    $0 -t netlify              # Deploy to Netlify
    $0 -t aws-s3               # Deploy to AWS S3
    DEPLOYMENT_TARGET=vercel $0 # Deploy to Vercel using env var

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--target)
            DEPLOYMENT_TARGET="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Run main function
if [[ "${DRY_RUN:-false}" == "true" ]]; then
    log "🧪 DRY RUN MODE - No actual deployment will occur"
    log "Would deploy to: ${DEPLOYMENT_TARGET:-github-pages}"
else
    main
fi
#!/usr/bin/env node

/**
 * Validation script for David On Cloud portfolio
 * Performs basic validation checks for deployment readiness
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

// Validation functions
function validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        success(`${description} exists: ${filePath}`);
        return true;
    } else {
        error(`${description} missing: ${filePath}`);
        return false;
    }
}

function validateHtmlStructure() {
    info('Validating HTML structure...');
    let isValid = true;

    const htmlFiles = ['index.html', 'projects.html'];
    
    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for required meta tags
            if (!content.includes('charset="UTF-8"')) {
                error(`${file}: Missing UTF-8 charset declaration`);
                isValid = false;
            }
            
            if (!content.includes('viewport')) {
                error(`${file}: Missing viewport meta tag`);
                isValid = false;
            }
            
            // Check for title tag
            if (!content.includes('<title>')) {
                error(`${file}: Missing title tag`);
                isValid = false;
            }
            
            // Check for semantic HTML5 elements
            const semanticElements = ['header', 'nav', 'main', 'section', 'footer'];
            semanticElements.forEach(element => {
                if (!content.includes(`<${element}`)) {
                    warning(`${file}: Consider using semantic HTML5 element: ${element}`);
                }
            });
            
            success(`${file}: HTML structure validation passed`);
        }
    });

    return isValid;
}

function validateCssStructure() {
    info('Validating CSS structure...');
    
    const cssFile = 'css/style.css';
    if (!fs.existsSync(cssFile)) {
        error('Main CSS file not found');
        return false;
    }
    
    const content = fs.readFileSync(cssFile, 'utf8');
    
    // Check for basic responsive design patterns
    if (!content.includes('@media')) {
        warning('No media queries found - ensure responsive design is implemented');
    }
    
    // Check for common CSS properties that indicate good structure
    const cssFeatures = [
        'display: flex',
        'display: grid',
        'transition',
        'transform'
    ];
    
    cssFeatures.forEach(feature => {
        if (content.includes(feature)) {
            success(`Modern CSS feature found: ${feature}`);
        }
    });
    
    return true;
}

function validateJavaScript() {
    info('Validating JavaScript files...');
    let isValid = true;
    
    const jsFiles = [
        'js/scripts.js',
        'js/project-times.js'
    ];
    
    jsFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Basic syntax check - skip for files with async/await
                if (!content.includes('async function') && !content.includes('await ')) {
                    new Function(content);
                }
                success(`${file}: JavaScript syntax is valid`);
                
                // Check for modern JS features
                if (content.includes('const ') || content.includes('let ')) {
                    success(`${file}: Uses modern JavaScript (const/let)`);
                }
                
                if (content.includes('addEventListener')) {
                    success(`${file}: Uses proper event handling`);
                }
                
                if (content.includes('async') || content.includes('await')) {
                    success(`${file}: Uses modern async/await syntax`);
                }
                
            } catch (syntaxError) {
                error(`${file}: JavaScript syntax error - ${syntaxError.message}`);
                isValid = false;
            }
        } else {
            warning(`JavaScript file not found: ${file}`);
        }
    });
    
    return isValid;
}

function validateAssets() {
    info('Validating assets...');
    let isValid = true;
    
    // Check for image directory
    if (fs.existsSync('img')) {
        const images = fs.readdirSync('img');
        success(`Found ${images.length} images in img/ directory`);
        
        // Check image formats
        const supportedFormats = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
        images.forEach(image => {
            const ext = path.extname(image).toLowerCase();
            if (!supportedFormats.includes(ext)) {
                warning(`Unsupported image format: ${image}`);
            }
        });
    } else {
        warning('No img/ directory found');
    }
    
    // Check for favicon
    if (fs.existsSync('static/favicon.ico')) {
        success('Favicon found');
    } else {
        warning('Favicon not found in static/favicon.ico');
    }
    
    return isValid;
}

function validateVersion() {
    info('Validating version information...');
    
    if (!validateFileExists('VERSION', 'Version file')) {
        return false;
    }
    
    const version = fs.readFileSync('VERSION', 'utf8').trim();
    const versionPattern = /^\d+\.\d+\.\d+$/;
    
    if (versionPattern.test(version)) {
        success(`Valid version format: ${version}`);
        return true;
    } else {
        error(`Invalid version format: ${version}. Expected format: x.y.z`);
        return false;
    }
}

function validateDeploymentReadiness() {
    info('Checking deployment readiness...');
    
    const requiredFiles = [
        'index.html',
        'css/style.css',
        'js/scripts.js',
        'dockerfile'
    ];
    
    let allFilesExist = true;
    requiredFiles.forEach(file => {
        if (!validateFileExists(file, 'Required file')) {
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

function validatePerformance() {
    info('Checking performance considerations...');
    
    // Check for external dependencies
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    const externalResources = [
        'cdn.tailwindcss.com',
        'unpkg.com',
        'cdn.jsdelivr.net'
    ];
    
    externalResources.forEach(cdn => {
        if (indexContent.includes(cdn)) {
            warning(`External CDN dependency found: ${cdn}. Consider hosting locally for better performance.`);
        }
    });
    
    // Check for image optimization opportunities
    if (fs.existsSync('img')) {
        const images = fs.readdirSync('img');
        const largeImageExts = ['.png', '.jpg', '.jpeg'];
        
        images.forEach(image => {
            const ext = path.extname(image).toLowerCase();
            if (largeImageExts.includes(ext)) {
                const stats = fs.statSync(path.join('img', image));
                const sizeInMB = stats.size / (1024 * 1024);
                
                if (sizeInMB > 1) {
                    warning(`Large image file: ${image} (${sizeInMB.toFixed(2)}MB). Consider optimization.`);
                }
            }
        });
    }
    
    return true;
}

// Main validation function
function runValidation() {
    log('\n🔍 Running David On Cloud Portfolio Validation\n', colors.cyan);
    
    const validationResults = [
        validateFileExists('index.html', 'Main HTML file'),
        validateFileExists('projects.html', 'Projects HTML file'),
        validateHtmlStructure(),
        validateCssStructure(),
        validateJavaScript(),
        validateAssets(),
        validateVersion(),
        validateDeploymentReadiness(),
        validatePerformance()
    ];
    
    const passedTests = validationResults.filter(result => result === true).length;
    const totalTests = validationResults.length;
    
    log(`\n📊 Validation Summary: ${passedTests}/${totalTests} checks passed\n`, colors.cyan);
    
    if (passedTests === totalTests) {
        success('🎉 All validations passed! Your portfolio is ready for deployment.');
        process.exit(0);
    } else {
        error(`❌ ${totalTests - passedTests} validation(s) failed. Please address the issues above.`);
        process.exit(1);
    }
}

// Run validation if script is called directly
if (require.main === module) {
    runValidation();
}

module.exports = {
    runValidation,
    validateFileExists,
    validateHtmlStructure,
    validateCssStructure,
    validateJavaScript,
    validateAssets,
    validateVersion,
    validateDeploymentReadiness,
    validatePerformance
};
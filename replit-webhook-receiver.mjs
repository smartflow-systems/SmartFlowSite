/**
 * SmartFlow Systems - Replit Webhook Receiver
 *
 * This endpoint receives webhooks from GitHub Actions and triggers
 * automatic deployment on Replit.
 *
 * Deploy this to each Replit project at: /api/webhook/github-deploy
 *
 * Environment variables required:
 * - SFS_WEBHOOK_SECRET: Secret to verify GitHub webhook signatures
 * - SFS_PAT: GitHub personal access token (for git operations)
 */

import crypto from 'crypto';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Execute deployment steps
 */
async function deploy(repoName, branch, sha) {
  const steps = [];

  try {
    // Step 1: Pull latest code
    console.log('📥 Pulling latest code from GitHub...');
    execSync('git fetch origin', { stdio: 'inherit' });
    execSync(`git checkout ${branch}`, { stdio: 'inherit' });
    execSync('git pull origin ' + branch, { stdio: 'inherit' });
    steps.push({ step: 'git_pull', status: 'success' });

    // Step 2: Install dependencies
    console.log('📦 Installing dependencies...');
    if (existsSync('package.json')) {
      execSync('npm ci || npm install', { stdio: 'inherit' });
      steps.push({ step: 'npm_install', status: 'success' });
    }

    // Step 3: Run build (if build script exists)
    let packageJson = {};
    try {
      packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
    } catch (e) {
      console.log('⚠️  Could not read package.json');
    }

    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('🔨 Building application...');
      execSync('npm run build', { stdio: 'inherit' });
      steps.push({ step: 'build', status: 'success' });
    }

    // Step 4: Run database migrations (if applicable)
    if (packageJson.scripts && packageJson.scripts.migrate) {
      console.log('🗄️  Running database migrations...');
      execSync('npm run migrate', { stdio: 'inherit' });
      steps.push({ step: 'migrate', status: 'success' });
    }

    // Step 5: Health check
    console.log('🏥 Running health check...');
    const healthCheck = await fetch('http://localhost:' + (process.env.PORT || 5000) + '/health')
      .then(r => r.json())
      .catch(() => ({ ok: false }));

    if (healthCheck.ok) {
      steps.push({ step: 'health_check', status: 'success' });
    } else {
      throw new Error('Health check failed');
    }

    // Step 6: Restart server (handled by Replit automatically on file changes)
    console.log('✅ Deployment complete!');

    return {
      success: true,
      sha,
      branch,
      steps,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    steps.push({ step: 'error', status: 'failed', error: error.message });

    return {
      success: false,
      sha,
      branch,
      steps,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Express middleware for GitHub webhook
 */
export async function handleGitHubWebhook(req, res) {
  try {
    // Verify webhook signature
    const signature = req.headers['x-hub-signature-256'];
    const secret = process.env.SFS_WEBHOOK_SECRET;

    if (!secret) {
      return res.status(500).json({
        error: 'SFS_WEBHOOK_SECRET not configured'
      });
    }

    // Get raw body (Buffer) and convert to string for signature verification
    const rawBody = req.body.toString('utf-8');

    if (!verifyGitHubSignature(rawBody, signature, secret)) {
      return res.status(401).json({
        error: 'Invalid signature'
      });
    }

    // Parse the JSON payload
    const payload = JSON.parse(rawBody);

    // Extract deployment info
    const { repository, ref, after } = payload;
    const branch = ref.replace('refs/heads/', '');
    const sha = after;
    const repoName = repository?.name || 'unknown';

    console.log(`🚀 Deployment triggered for ${repoName}@${branch} (${sha.substring(0, 7)})`);

    // Only deploy on main/master branch
    if (branch !== 'main' && branch !== 'master') {
      return res.json({
        message: `Ignoring deployment for branch: ${branch}`,
        deployed: false
      });
    }

    // Execute deployment
    const result = await deploy(repoName, branch, sha);

    return res.json(result);

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: error.message,
      success: false
    });
  }
}

/**
 * Simple ping endpoint for testing
 */
export function handlePing(req, res) {
  res.json({
    status: 'ok',
    message: 'Replit webhook receiver is running',
    timestamp: new Date().toISOString()
  });
}

const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');

async function run() {
  if (github.context.eventName !== 'pull_request') {
    core.info('Skipping as it is not a pull request');
    return;
  }

  const token = core.getInput('token');
  const packageJsonPath = core.getInput('path') || 'package.json';
  const headers = {};
  if (token) {
    core.setSecret(token);
    core.info('Using specified token');
    headers.Authorization = `token ${token}`;
  }

  const baseSha = github.context.payload.pull_request.base.sha;
  const headSha = github.context.payload.pull_request.head.sha;

  core.info(`Comparing ${headSha} to ${baseSha}`);
  const baseUrl = `https://raw.githubusercontent.com/${github.context.repo.owner}/${github.context.repo.repo}/${baseSha}/${packageJsonPath}`;

  const workspace = process.env.GITHUB_WORKSPACE;
  if (!workspace) {
    throw new Error('GITHUB_WORKSPACE environment variable is not set');
  }

  const localPath = path.resolve(workspace, packageJsonPath);
  if (!localPath.startsWith(path.resolve(workspace) + path.sep)) {
    throw new Error(`Path '${packageJsonPath}' resolves outside the workspace`);
  }

  const localPackage = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  const localVersion = localPackage.version;

  if (!semver.valid(localVersion)) {
    core.setFailed(`Current version '${localVersion}' detected as invalid`);
    return;
  }

  const res = await fetch(baseUrl, { headers });
  if (res.status === 404) {
    core.info(`Base package.json not found — treating as new package with version '${localVersion}'`);
    return;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch base package.json (HTTP ${res.status})`);
  }
  const basePackage = await res.json();
  const baseVersion = basePackage.version;

  if (!semver.valid(baseVersion)) {
    core.setFailed(`Base version '${baseVersion}' detected as invalid`);
    return;
  }

  if (!semver.gt(localVersion, baseVersion)) {
    core.setFailed(`Version '${localVersion}' wasn't detected as greater than '${baseVersion}'`);
  }
}

run().catch(error => core.setFailed(error.message));

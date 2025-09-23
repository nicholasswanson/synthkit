# GitHub Actions Setup for Synthkit

## Required Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Synthkit Dataset Generation"
4. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Add Repository Secrets

1. Go to your `synthkit` repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SYNTHKIT_TOKEN`
5. Value: [paste your token from step 1]
6. Click **Add secret**

### 3. Add Environment Variable for Client

1. In your `synthkit` repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NEXT_PUBLIC_SYNTHKIT_TOKEN`
4. Value: [same token from step 1]
5. Click **Add secret**

### 4. Test the Setup

1. Go to **Actions** tab in your repository
2. Click **Generate Dataset** workflow
3. Click **Run workflow**
4. Fill in the parameters:
   - Business Type: `b2b-saas-subscriptions`
   - Stage: `growth`
   - Scenario ID: `12345`
5. Click **Run workflow**

### 5. Verify Dataset Generation

1. Wait for the workflow to complete (usually 1-2 minutes)
2. Check the **Actions** tab for success/failure
3. Look for the generated dataset in `examples/next-app/public/datasets/`
4. The dataset should be accessible at: `https://raw.githubusercontent.com/nicholasswanson/synthkit/main/datasets/[filename].json`

## How It Works

1. **User clicks "Generate Dataset URL"** in the web app
2. **Client triggers GitHub Actions** via the GitHub API
3. **GitHub Actions runs** on server-grade hardware
4. **Dataset is generated** using the same logic as before
5. **Dataset is uploaded** to the repository
6. **User gets the URL** immediately (dataset available shortly)

## Benefits

- ✅ **No browser performance issues** - generation happens on GitHub's servers
- ✅ **No crashes or timeouts** - server-grade hardware
- ✅ **Same dataset quality** - identical generation logic
- ✅ **Free hosting** - GitHub Actions and Pages
- ✅ **Reliable** - GitHub's infrastructure

## Troubleshooting

### "Failed to trigger dataset generation"
- Check that `NEXT_PUBLIC_SYNTHKIT_TOKEN` is set correctly
- Verify the token has `repo` and `workflow` permissions
- Check the browser console for detailed error messages

### "Workflow failed"
- Check the **Actions** tab for error details
- Verify all dependencies are installed correctly
- Check that the generation script can access the required modules

### "Dataset not accessible"
- Wait a few minutes for the workflow to complete
- Check that the file was created in `public/datasets/`
- Verify the URL format matches the expected pattern

# GitHub Actions Workflows

### 1. Update IOM IDP Data (`update-iom-data.yml`)
**Schedule:** 1st of each month
**Purpose:** Fetches internal displacement data from IOM DTM API for all 53 countries with available data.  
**Output Files:**
- `public/iom-cache.json` - Client-side cache (auto-loaded by app)
- `src/data/iom-idp-data.json` - Development reference

**Manual Trigger:** Yes (via GitHub Actions UI)

### 2. Update UNHCR & UNRWA Data (`update-unhcr-unrwa-data.yml`)
**Schedule:** Yearly (January 25th)  
**Purpose:** Fetches refugee and asylum seeker data from UNHCR API and Palestine refugee data from UNRWA for all years (2000-current).  
**Output Files:**
- `public/unhcr-cache.json` - Cached UNHCR data
- `public/unrwa-cache.json` - Cached UNRWA data
- `src/data/unhcr-data.json` - Development reference
- `src/data/unrwa-data.json` - Development reference

**Manual Trigger:** Yes (via GitHub Actions UI)

## How It Works

1. **Scheduled Execution**: Workflows run automatically based on cron schedules
2. **Data Fetching**: Node.js scripts query external APIs
3. **File Updates**: New data is written to JSON files
4. **Auto-Commit**: Changes are automatically committed and pushed to the repository
5. **Deployment**: Vercel automatically redeploys with updated data

## Manual Execution

To manually trigger a workflow:

1. Go to the **Actions** tab in GitHub
2. Select the workflow (e.g., "Update IOM IDP Data")
3. Click **Run workflow**
4. Select the branch (usually `main`)
5. Click **Run workflow**

## Monitoring

- Check the **Actions** tab for workflow run history
- Each run shows logs for debugging
- Failed runs will appear in the Actions tab
- Successful runs will create a new commit with updated data files

## Notes

- **IOM Data**: Updates monthly to track ongoing displacement situations
- **UNHCR/UNRWA Data**: Updates yearly as annual statistics are typically finalized in January
- All workflows use GitHub Actions Bot for commits
- Workflows require `GITHUB_TOKEN` (automatically provided by GitHub)


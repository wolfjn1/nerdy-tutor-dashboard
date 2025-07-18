# Disconnecting from Vercel

Now that your app is running on Netlify, here's how to properly disconnect from Vercel:

## 1. Remove Vercel Configuration Files

### Delete vercel.json
```bash
rm vercel.json
```

### Remove .vercel directory (if exists)
```bash
rm -rf .vercel
```

## 2. Update package.json

Check if you have any Vercel-specific scripts:
```bash
# Look for vercel-related scripts
grep -i vercel package.json
```

If found, remove lines like:
- `"deploy": "vercel"`
- `"vercel-build": "..."`

## 3. Update Documentation

### Update README.md
Change the live demo URL from:
```
🚀 **Live Demo**: [https://nerdy-tutor-dashboard.vercel.app/](https://nerdy-tutor-dashboard.vercel.app/)
```

To:
```
🚀 **Live Demo**: [https://nerdy-tutor-dashboard.netlify.app/](https://nerdy-tutor-dashboard.netlify.app/)
```

## 4. Remove Vercel Project from Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project: `nerdy-tutor-dashboard` or similar
3. Click on the project
4. Go to **Settings** tab
5. Scroll to the bottom
6. Click **Delete Project**
7. Confirm deletion by typing the project name

## 5. Disconnect GitHub Integration

### In Vercel:
1. Go to [https://vercel.com/account/integrations](https://vercel.com/account/integrations)
2. Find GitHub integration
3. Click **Configure**
4. Remove repository access for `nerdy-tutor-dashboard`

### In GitHub:
1. Go to your repo: `https://github.com/wolfjn1/nerdy-tutor-dashboard`
2. Click **Settings** → **Webhooks**
3. Delete any Vercel webhooks (they usually contain `vercel.com` in the URL)

## 6. Clean Up Old Files

Remove Vercel-specific documentation:
```bash
rm VERCEL_*.md
rm SUPABASE_VERCEL_FIX.md
rm scripts/vercel-deploy.sh
rm app/vercel-test/page.tsx  # if exists
```

## 7. Update .gitignore

The `.vercel` entry can stay (it's harmless), but you can remove it if you want:
```bash
# Edit .gitignore and remove these lines:
# vercel
.vercel
```

## 8. Environment Variables

No action needed - your env vars are already set up in Netlify.

## 9. Domain Management (If Applicable)

If you had a custom domain on Vercel:
1. Remove it from Vercel project settings
2. Update DNS records to point to Netlify instead
3. Add custom domain in Netlify settings

## 10. Final Cleanup Commands

Run these commands to clean everything up:
```bash
# Remove Vercel files
rm vercel.json
rm -rf .vercel
rm VERCEL_*.md
rm SUPABASE_VERCEL_FIX.md
rm scripts/vercel-deploy.sh

# Update README
sed -i '' 's/vercel\.app/netlify.app/g' README.md

# Commit changes
git add -A
git commit -m "Remove Vercel configuration and update to Netlify"
git push
```

## Verification

After completing these steps:
- ✅ No Vercel files in your repo
- ✅ No active Vercel deployments
- ✅ GitHub only triggers Netlify builds
- ✅ All documentation points to Netlify

## Optional: Remove Vercel CLI

If you installed Vercel CLI globally:
```bash
npm uninstall -g vercel
```

Your app is now fully migrated to Netlify! 🎉 
# NiceGuyAPI v5.1 - Deployment & Stripe Setup Script
# Run this in PowerShell from the niceguyapi-repo directory

# Step 1: Install Vercel CLI if needed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    npm i -g vercel
}

# Step 2: Link and deploy
cd "C:\Users\kency\.openclaw\workspace\niceguyapi-repo"
vercel link --yes
vercel --prod

# Step 3: Set Stripe env vars
$SK = Read-Host "Enter your Stripe Secret Key (sk_test_...)" -AsSecureString
$SK_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SK))
$ProPrice = price_1TctExCsjuShhNHg8erhKttP
$PremPrice = price_1TctEyCsjuShhNHgElss8uO0
$WH_Secret = whsec_k6EIJftWmDSgWmyEMYMVQ9DbDpnD0zZR

vercel env add STRIPE_SECRET_KEY production <<< $SK_Plain
vercel env add STRIPE_PRO_PRICE_ID production <<< $ProPrice
vercel env add STRIPE_PREMIUM_PRICE_ID production <<< $PremPrice
vercel env add STRIPE_WEBHOOK_SECRET production <<< $WH_Secret

# Step 4: Redeploy with env vars
vercel --prod

Write-Host "`nDone! NiceGuyAPI v5.1 with Stripe is live."
Write-Host "Pro Price ID: $ProPrice"
Write-Host "Premium Price ID: $PremPrice"
Write-Host "Webhook at: https://niceguyapi-repo.vercel.app/v1/stripe/webhook"

#!/bin/bash

# Setup Script for House Kenya Admin System
# This script sets up the database and creates the original admin account

echo "================================"
echo "House Kenya Admin Setup"
echo "================================"
echo ""

# Step 1: Install dependencies if needed
echo "✓ Checking dependencies..."
cd backend
npm install nodemailer 2>/dev/null || echo "nodemailer already installed"
cd ..

# Step 2: Run the original admin creation script
echo "✓ Setting up admin system..."
cd backend
node scripts/create_original_admin.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Admin system setup complete!"
    echo ""
    echo "Default Admin Credentials:"
    echo "  Email: admin@housekenya.com"
    echo "  Password: Admin@123"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "  1. Change the default password immediately after first login"
    echo "  2. Configure email settings in .env (EMAIL_USER, EMAIL_PASS)"
    echo "  3. Set FRONTEND_URL in .env to your frontend URL"
    echo ""
    echo "To start the backend server, run:"
    echo "  npm start"
else
    echo "✗ Error during setup. Please check the error messages above."
    exit 1
fi

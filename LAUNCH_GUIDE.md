# 🚀 Business Platform Launch Guide

## Quick Start

### 1. **Launch Everything**
```bash
./launch.sh
```

This will:
- ✅ Start the FastAPI backend on port 8000
- ✅ Start the React frontend on port 3000
- ✅ Enable mailbox integration with Mailcow
- ✅ Set up automatic mailbox creation for new users

### 2. **Create Mailboxes for Existing Users**
```bash
cd fastapi-backend
python bulk_create_mailboxes.py
```

This will create mailboxes for all existing users in your database.

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Mailcow Webmail**: https://mail.anyatis.com/SOGo/

## 📧 Mailbox Features

### For New Users
- ✅ Automatic mailbox creation during registration
- ✅ Email: `user@anyatis.com`
- ✅ Password: Same as platform password
- ✅ Quota: 1GB

### For Existing Users
- ✅ Manual mailbox creation via "ПОЧТА" page
- ✅ Password management
- ✅ Webmail access
- ✅ Email client configuration

## 🔧 Configuration

The system is pre-configured with:
- **Mailcow API Key**: `085E5F-93F233-3DE63D-76AA23-366A44`
- **Domain**: `anyatis.com`
- **API URL**: `https://mail.anyatis.com/api/v1`

## 📱 User Experience

1. **New User Registration**:
   - User registers on platform
   - Mailbox automatically created
   - Can access webmail immediately

2. **Existing User**:
   - Goes to "ПОЧТА" page
   - Clicks "Создать почтовый ящик"
   - Sets mailbox password
   - Gets full email access

3. **Email Client Setup**:
   - IMAP: `mail.anyatis.com:993` (SSL/TLS)
   - SMTP: `mail.anyatis.com:587` (STARTTLS)
   - Username: `user@anyatis.com`

## 🛑 Stopping Services

Press `Ctrl+C` in the terminal where you ran `./launch.sh`

## 🔍 Troubleshooting

### Backend Issues
- Check if port 8000 is available
- Verify database connection
- Check Mailcow API key permissions

### Frontend Issues
- Check if port 3000 is available
- Verify Node.js dependencies installed
- Check browser console for errors

### Mailbox Issues
- Verify Mailcow API key is correct
- Check domain configuration
- Test API connectivity

## 📊 Monitoring

- **Backend logs**: Check terminal output
- **Frontend logs**: Check browser console
- **Mailbox creation**: Check Mailcow admin panel

---

**🎉 Your Business Platform with integrated Mailcow mailboxes is ready to use!**



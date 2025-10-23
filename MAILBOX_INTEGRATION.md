# Mailbox Integration with Mailcow

This document describes the integration of Mailcow email service with the Business Platform, providing automatic mailbox creation and management for all users.

## Overview

The mailbox integration provides:
- **Automatic mailbox creation** when users register
- **Webmail access** through Mailcow's SOGo interface
- **Email client configuration** with IMAP/SMTP settings
- **Password management** for mailboxes
- **Seamless user experience** matching the platform's design

## Architecture

### Backend Components

1. **Mailbox API Endpoints** (`/app/api/v1/endpoints/mailbox.py`)
   - `GET /mailbox/info` - Get mailbox information
   - `POST /mailbox/create` - Create new mailbox
   - `POST /mailbox/update-password` - Update mailbox password
   - `GET /mailbox/webmail-url` - Get webmail access URL and settings

2. **Automatic User Creation** (integrated in `auth.py`)
   - Automatically creates Mailcow mailbox during user registration
   - Uses the same email and password as the platform account
   - Handles errors gracefully without blocking registration

3. **Mailcow API Integration**
   - Direct communication with Mailcow API at `mail.anyatis.com`
   - Uses Bearer token authentication
   - Handles mailbox creation, updates, and deletion

### Frontend Components

1. **MailboxPage Component** (`/src/pages/MailboxPage.tsx`)
   - Full-page mailbox management interface
   - Matches platform design and styling
   - Provides mailbox status, settings, and access controls

2. **Navigation Integration**
   - Added "ПОЧТА" (Mail) option to sidebar
   - Integrated with existing routing system
   - Uses Mail icon from Lucide React

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Mailcow Configuration
MAILCOW_API_KEY=your-mailcow-api-key
MAILCOW_DOMAIN=anyatis.com
MAILCOW_API_URL=https://mail.anyatis.com/api/v1
```

### Mailcow API Key Setup

1. Log into your Mailcow admin panel at `https://mail.anyatis.com`
2. Navigate to **API** section
3. Generate a new API key with appropriate permissions:
   - Mailbox management (create, read, update, delete)
   - Domain management (if needed)
4. Copy the API key to your environment configuration

## Features

### Automatic Mailbox Creation

When a user registers on the platform:
1. User account is created in the database
2. Mailcow mailbox is automatically created with:
   - Email: `user@anyatis.com`
   - Password: Same as platform password
   - Quota: 1GB (1024 MB)
   - TLS enforcement enabled
   - Force password update enabled

### Mailbox Management

Users can:
- **View mailbox status** and configuration
- **Access webmail** directly through SOGo interface
- **Change mailbox password** independently from platform password
- **View email client settings** (IMAP/SMTP configuration)
- **Get setup instructions** for email clients

### Email Client Configuration

The system provides ready-to-use settings for email clients:

**IMAP Settings (Incoming Mail):**
- Server: `mail.anyatis.com`
- Port: `993`
- Security: `SSL/TLS`
- Username: `user@anyatis.com`

**SMTP Settings (Outgoing Mail):**
- Server: `mail.anyatis.com`
- Port: `587`
- Security: `STARTTLS`
- Username: `user@anyatis.com`

## API Endpoints

### Get Mailbox Information
```http
GET /mailbox/info
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "mailbox": {
    "email": "user@anyatis.com",
    "status": "active",
    "quota": "1024 MB",
    "webmail_url": "https://mail.anyatis.com/SOGo/",
    "imap_server": "mail.anyatis.com",
    "smtp_server": "mail.anyatis.com",
    "imap_port": 993,
    "smtp_port": 587
  }
}
```

### Create Mailbox
```http
POST /mailbox/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "secure_password"
}
```

### Update Mailbox Password
```http
POST /mailbox/update-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "new_secure_password"
}
```

### Get Webmail URL and Settings
```http
GET /mailbox/webmail-url
Authorization: Bearer <token>
```

## Error Handling

The system handles various error scenarios:

1. **Mailbox Creation Failures**
   - User registration continues even if mailbox creation fails
   - Errors are logged for debugging
   - Users can manually create mailbox later

2. **API Communication Errors**
   - Network timeouts and connection errors
   - Invalid API responses
   - Authentication failures

3. **User Experience**
   - Clear error messages in the UI
   - Fallback options for manual configuration
   - Retry mechanisms for failed operations

## Security Considerations

1. **API Key Security**
   - Store API key securely in environment variables
   - Never expose API key in client-side code
   - Rotate API keys regularly

2. **Password Management**
   - Mailbox passwords are separate from platform passwords
   - Users can change mailbox passwords independently
   - Strong password requirements enforced

3. **TLS/SSL Enforcement**
   - All email communication uses encrypted connections
   - IMAP uses SSL/TLS on port 993
   - SMTP uses STARTTLS on port 587

## Testing

Run the test script to verify functionality:

```bash
cd fastapi-backend
python test_mailbox.py
```

The test script will:
- Check environment configuration
- Test mailbox creation functions
- Verify API endpoint availability
- Display configuration information

## Troubleshooting

### Common Issues

1. **"Mailbox not found" error**
   - Check if user has registered successfully
   - Verify Mailcow API key permissions
   - Check domain configuration

2. **API authentication failures**
   - Verify API key is correct and active
   - Check API key permissions in Mailcow
   - Ensure API key hasn't expired

3. **Mailbox creation failures**
   - Check domain quota limits
   - Verify email format is valid
   - Check Mailcow server status

### Debug Steps

1. Check environment variables are set correctly
2. Test API connectivity to Mailcow
3. Verify user registration process
4. Check application logs for detailed error messages

## Future Enhancements

Potential improvements for the mailbox integration:

1. **Advanced Features**
   - Email forwarding rules
   - Vacation/out-of-office messages
   - Email aliases management
   - Shared mailboxes

2. **User Experience**
   - Inline email preview
   - Email client auto-configuration
   - Mobile app integration
   - Email templates

3. **Administration**
   - Bulk mailbox management
   - Quota monitoring and alerts
   - Usage statistics
   - Backup and restore

## Support

For issues related to:
- **Mailcow configuration**: Contact your system administrator
- **Platform integration**: Check application logs and API responses
- **Email client setup**: Use the provided configuration instructions

---

*This integration ensures every user in the business platform has seamless access to corporate email through Mailcow, maintaining consistency with the platform's design and user experience.*



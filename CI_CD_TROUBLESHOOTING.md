# Business Platform CI/CD Troubleshooting Guide

## 🚀 **New Robust CI/CD Workflow**

I've created a comprehensive CI/CD workflow that includes:

### ✅ **Key Improvements:**

1. **Error Handling**: `set -e` ensures script stops on any error
2. **Comprehensive Logging**: Detailed echo statements for each step
3. **Verification Steps**: Checks for successful builds and deployments
4. **Process Management**: Properly manages serve processes
5. **Testing**: Tests both local and domain connections
6. **Manual Trigger**: Added `workflow_dispatch` for manual runs

### 🔧 **What the Workflow Does:**

1. **Git Operations**:
   - Clones repository if not exists
   - Pulls latest changes with `git reset --hard`
   - Cleans untracked files

2. **Build Process**:
   - Installs npm dependencies
   - Builds React application
   - Verifies build success

3. **Deployment**:
   - Updates static files in `/var/www/business-platform/`
   - Updates serve process directory
   - Restarts serve process properly

4. **Verification**:
   - Tests local server (port 3000)
   - Tests domain (v4.business)
   - Shows deployment summary

### 🛠️ **Manual Deployment**

If CI/CD fails, you can run the manual deployment script:

```bash
# On your server
cd /opt/business-project
chmod +x manual-deploy.sh
./manual-deploy.sh
```

### 🔍 **Troubleshooting Common Issues:**

#### **1. Git Repository Issues**
```bash
# If git repository is corrupted
cd /opt/business-project
rm -rf * .*
git clone https://github.com/codeanyatisone-cmyk/business_platform.git .
```

#### **2. Build Failures**
```bash
# Check npm dependencies
cd /opt/business-project/business-platform
npm install
npm run build
```

#### **3. Serve Process Issues**
```bash
# Kill existing processes
pkill -f 'serve -s build -l 3000'

# Start new process
cd /root/apps/business-platform
nohup serve -s build -l 3000 > /tmp/business-platform.log 2>&1 &
```

#### **4. Permission Issues**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/business-platform
```

### 📊 **Monitoring Deployment**

#### **Check Workflow Status:**
```bash
curl -s "https://api.github.com/repos/codeanyatisone-cmyk/business_platform/actions/runs?per_page=1"
```

#### **Check Server Status:**
```bash
# Check serve process
ps aux | grep serve

# Check logs
tail -f /tmp/business-platform.log

# Test domain
curl -I http://v4.business
```

### 🎯 **Expected Results:**

After successful deployment:
- ✅ GitHub Actions workflow shows "completed" status
- ✅ Serve process running on port 3000
- ✅ Domain `v4.business` serving latest content
- ✅ Static files updated in `/var/www/business-platform/`

### 🚨 **If All Else Fails:**

1. **SSH into server**:
   ```bash
   ssh my-server
   ```

2. **Run manual deployment**:
   ```bash
   cd /opt/business-project
   ./manual-deploy.sh
   ```

3. **Check logs**:
   ```bash
   cat /tmp/business-platform.log
   ```

The new workflow is designed to be robust and handle all edge cases that were causing previous failures.

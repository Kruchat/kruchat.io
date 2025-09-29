// Enhanced Personal Development App with Advanced Features
class EnhancedPersonalDevelopmentApp extends PersonalDevelopmentApp {
    constructor() {
        super();
        this.settings = this.loadData('settings') || {
            notifications: true,
            habitReminderTime: '09:00',
            goalReminderTime: '18:00',
            theme: 'light',
            primaryColor: '#667eea'
        };
        this.notifications = [];
        this.achievements = this.loadData('achievements') || [];
        
        this.initEnhanced();
    }

    initEnhanced() {
        this.setupEnhancedEventListeners();
        this.loadSettings();
        this.setupNotifications();
        this.checkAchievements();
        this.setupReminders();
    }

    setupEnhancedEventListeners() {
        // Progress tab events
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        
        // Settings events
        document.getElementById('enableNotifications').addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('habitReminderTime').addEventListener('change', (e) => {
            this.settings.habitReminderTime = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('goalReminderTime').addEventListener('change', (e) => {
            this.settings.goalReminderTime = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('themeMode').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applyTheme();
            this.saveSettings();
        });
        
        document.getElementById('primaryColor').addEventListener('change', (e) => {
            this.settings.primaryColor = e.target.value;
            this.applyPrimaryColor();
            this.saveSettings();
        });
        
        document.getElementById('backupDataBtn').addEventListener('click', () => this.backupData());
        document.getElementById('restoreDataBtn').addEventListener('click', () => this.restoreData());
        document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
        
        // File input for import
        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });
    }

    switchTab(tabName) {
        super.switchTab(tabName);
        
        if (tabName === 'progress') {
            this.renderProgressCharts();
            this.renderWeeklySummary();
            this.renderRecentAchievements();
        } else if (tabName === 'settings') {
            this.loadSettingsToUI();
        }
    }

    // Notification System
    showNotification(title, message, type = 'info', duration = 5000) {
        if (!this.settings.notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-progress"></div>
        `;
        
        document.getElementById('notificationContainer').appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
        
        this.notifications.push({
            title,
            message,
            type,
            timestamp: new Date().toISOString()
        });
    }

    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Settings Management
    saveSettings() {
        this.saveData('settings', this.settings);
    }

    loadSettings() {
        this.applyTheme();
        this.applyPrimaryColor();
    }

    loadSettingsToUI() {
        document.getElementById('enableNotifications').checked = this.settings.notifications;
        document.getElementById('habitReminderTime').value = this.settings.habitReminderTime;
        document.getElementById('goalReminderTime').value = this.settings.goalReminderTime;
        document.getElementById('themeMode').value = this.settings.theme;
        document.getElementById('primaryColor').value = this.settings.primaryColor;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('th-TH');
    }

    applyTheme() {
        const body = document.body;
        body.setAttribute('data-theme', this.settings.theme);
        
        if (this.settings.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    applyPrimaryColor() {
        document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
    }

    // Data Export/Import
    exportData() {
        const data = {
            goals: this.goals,
            habits: this.habits,
            skills: this.skills,
            habitTracking: this.habitTracking,
            skillProgress: this.skillProgress,
            settings: this.settings,
            achievements: this.achievements,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personal-development-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('สำเร็จ', 'ส่งออกข้อมูลเรียบร้อยแล้ว', 'success');
    }

    importData() {
        document.getElementById('importFileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.version && data.exportDate) {
                    this.goals = data.goals || [];
                    this.habits = data.habits || [];
                    this.skills = data.skills || [];
                    this.habitTracking = data.habitTracking || {};
                    this.skillProgress = data.skillProgress || {};
                    this.settings = { ...this.settings, ...data.settings };
                    this.achievements = data.achievements || [];
                    
                    this.saveData('goals', this.goals);
                    this.saveData('habits', this.habits);
                    this.saveData('skills', this.skills);
                    this.saveData('habitTracking', this.habitTracking);
                    this.saveData('skillProgress', this.skillProgress);
                    this.saveData('settings', this.settings);
                    this.saveData('achievements', this.achievements);
                    
                    this.loadSettings();
                    this.updateStats();
                    this.renderGoals();
                    this.renderHabits();
                    this.renderSkills();
                    
                    this.showNotification('สำเร็จ', 'นำเข้าข้อมูลเรียบร้อยแล้ว', 'success');
                } else {
                    throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
                }
            } catch (error) {
                this.showNotification('ข้อผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลได้: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Backup and Restore
    backupData() {
        this.exportData();
    }

    restoreData() {
        this.importData();
    }

    clearAllData() {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
            localStorage.clear();
            location.reload();
        }
    }

    // Enhanced Goal Management
    updateGoalProgress(id, increment) {
        super.updateGoalProgress(id, increment);
        this.checkGoalAchievements();
    }

    completeGoal(id) {
        super.completeGoal(id);
        this.checkGoalAchievements();
        this.showNotification('ยินดีด้วย!', 'คุณได้บรรลุเป้าหมายแล้ว!', 'success');
    }

    // Enhanced Habit Management
    markHabitComplete(id) {
        super.markHabitComplete(id);
        this.checkHabitAchievements();
        this.showNotification('เยี่ยม!', 'คุณได้ทำนิสัยเสร็จสิ้นแล้ว', 'success');
    }

    // Achievement System
    checkAchievements() {
        this.checkGoalAchievements();
        this.checkHabitAchievements();
        this.checkSkillAchievements();
    }

    checkGoalAchievements() {
        const completedGoals = this.goals.filter(g => g.status === 'completed').length;
        
        if (completedGoals >= 1 && !this.hasAchievement('first_goal')) {
            this.addAchievement('first_goal', 'เป้าหมายแรก', 'คุณได้บรรลุเป้าหมายแรกแล้ว!');
        }
        
        if (completedGoals >= 5 && !this.hasAchievement('goal_master')) {
            this.addAchievement('goal_master', 'ผู้เชี่ยวชาญเป้าหมาย', 'คุณได้บรรลุเป้าหมาย 5 เป้าหมายแล้ว!');
        }
        
        if (completedGoals >= 10 && !this.hasAchievement('goal_champion')) {
            this.addAchievement('goal_champion', 'แชมป์เป้าหมาย', 'คุณได้บรรลุเป้าหมาย 10 เป้าหมายแล้ว!');
        }
    }

    checkHabitAchievements() {
        const maxStreak = Math.max(...this.habits.map(h => h.streak), 0);
        
        if (maxStreak >= 7 && !this.hasAchievement('week_warrior')) {
            this.addAchievement('week_warrior', 'นักสู้สัปดาห์', 'คุณได้ทำนิสัยติดต่อกัน 7 วันแล้ว!');
        }
        
        if (maxStreak >= 30 && !this.hasAchievement('month_master')) {
            this.addAchievement('month_master', 'ผู้เชี่ยวชาญเดือน', 'คุณได้ทำนิสัยติดต่อกัน 30 วันแล้ว!');
        }
        
        if (maxStreak >= 100 && !this.hasAchievement('century_hero')) {
            this.addAchievement('century_hero', 'ฮีโร่ร้อยวัน', 'คุณได้ทำนิสัยติดต่อกัน 100 วันแล้ว!');
        }
    }

    checkSkillAchievements() {
        const maxLevel = Math.max(...this.skills.map(s => s.currentLevel), 0);
        
        if (maxLevel >= 5 && !this.hasAchievement('skill_learner')) {
            this.addAchievement('skill_learner', 'ผู้เรียนรู้', 'คุณได้พัฒนาทักษะถึงระดับ 5 แล้ว!');
        }
        
        if (maxLevel >= 8 && !this.hasAchievement('skill_expert')) {
            this.addAchievement('skill_expert', 'ผู้เชี่ยวชาญ', 'คุณได้พัฒนาทักษะถึงระดับ 8 แล้ว!');
        }
        
        if (maxLevel >= 10 && !this.hasAchievement('skill_master')) {
            this.addAchievement('skill_master', 'ปรมาจารย์', 'คุณได้พัฒนาทักษะถึงระดับ 10 แล้ว!');
        }
    }

    hasAchievement(id) {
        return this.achievements.some(a => a.id === id);
    }

    addAchievement(id, title, description) {
        const achievement = {
            id,
            title,
            description,
            date: new Date().toISOString(),
            icon: this.getAchievementIcon(id)
        };
        
        this.achievements.push(achievement);
        this.saveData('achievements', this.achievements);
        
        this.showNotification('🏆 เกียรติบัตรใหม่!', title, 'success', 8000);
    }

    getAchievementIcon(id) {
        const icons = {
            'first_goal': 'fas fa-bullseye',
            'goal_master': 'fas fa-trophy',
            'goal_champion': 'fas fa-crown',
            'week_warrior': 'fas fa-fire',
            'month_master': 'fas fa-calendar-check',
            'century_hero': 'fas fa-medal',
            'skill_learner': 'fas fa-graduation-cap',
            'skill_expert': 'fas fa-star',
            'skill_master': 'fas fa-gem'
        };
        return icons[id] || 'fas fa-award';
    }

    // Enhanced Progress Charts
    renderWeeklySummary() {
        const container = document.getElementById('weeklySummary');
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        
        let totalHabitsCompleted = 0;
        let totalGoalsProgress = 0;
        let totalSkillsImproved = 0;
        
        // Calculate weekly stats
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            // Count habits completed
            this.habits.forEach(habit => {
                if (this.habitTracking[habit.id] && this.habitTracking[habit.id][dateString]) {
                    totalHabitsCompleted++;
                }
            });
        }
        
        // Calculate goals progress
        this.goals.forEach(goal => {
            totalGoalsProgress += goal.progress;
        });
        
        // Calculate skills improved
        this.skills.forEach(skill => {
            totalSkillsImproved += skill.currentLevel;
        });
        
        const avgGoalProgress = this.goals.length > 0 ? Math.round(totalGoalsProgress / this.goals.length) : 0;
        const avgSkillLevel = this.skills.length > 0 ? Math.round(totalSkillsImproved / this.skills.length) : 0;
        
        container.innerHTML = `
            <div class="weekly-summary-item">
                <span class="weekly-summary-label">นิสัยเสร็จสิ้น (สัปดาห์นี้)</span>
                <span class="weekly-summary-value">${totalHabitsCompleted} ครั้ง</span>
            </div>
            <div class="weekly-summary-item">
                <span class="weekly-summary-label">ความก้าวหน้าเป้าหมายเฉลี่ย</span>
                <span class="weekly-summary-value">${avgGoalProgress}%</span>
            </div>
            <div class="weekly-summary-item">
                <span class="weekly-summary-label">ระดับทักษะเฉลี่ย</span>
                <span class="weekly-summary-value">${avgSkillLevel}/10</span>
            </div>
            <div class="weekly-summary-item">
                <span class="weekly-summary-label">เกียรติบัตรทั้งหมด</span>
                <span class="weekly-summary-value">${this.achievements.length} รายการ</span>
            </div>
        `;
    }

    renderRecentAchievements() {
        const container = document.getElementById('recentAchievements');
        const recentAchievements = this.achievements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentAchievements.length === 0) {
            container.innerHTML = '<p style="color: #718096; text-align: center;">ยังไม่มีเกียรติบัตร</p>';
            return;
        }
        
        container.innerHTML = recentAchievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-date">${new Date(achievement.date).toLocaleDateString('th-TH')}</div>
                </div>
            </div>
        `).join('');
    }

    // Reminder System
    setupReminders() {
        this.checkReminders();
        setInterval(() => this.checkReminders(), 60000); // Check every minute
    }

    checkReminders() {
        if (!this.settings.notifications) return;
        
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        if (currentTime === this.settings.habitReminderTime) {
            this.showHabitReminder();
        }
        
        if (currentTime === this.settings.goalReminderTime) {
            this.showGoalReminder();
        }
    }

    showHabitReminder() {
        const today = new Date().toISOString().split('T')[0];
        const incompleteHabits = this.habits.filter(habit => {
            const tracking = this.habitTracking[habit.id] || {};
            return !tracking[today];
        });
        
        if (incompleteHabits.length > 0) {
            this.showNotification(
                '⏰ แจ้งเตือนนิสัย',
                `คุณยังมีนิสัยที่ต้องทำ ${incompleteHabits.length} รายการ`,
                'info',
                10000
            );
        }
    }

    showGoalReminder() {
        const activeGoals = this.goals.filter(goal => goal.status === 'active');
        
        if (activeGoals.length > 0) {
            this.showNotification(
                '🎯 แจ้งเตือนเป้าหมาย',
                `คุณมีเป้าหมายที่กำลังดำเนินการ ${activeGoals.length} รายการ`,
                'info',
                10000
            );
        }
    }
}

// Initialize the enhanced app
document.addEventListener('DOMContentLoaded', function() {
    window.app = new EnhancedPersonalDevelopmentApp();
});
// Personal Development Tracking App - Complete Version
class PersonalDevelopmentApp {
    constructor() {
        this.goals = this.loadData('goals') || [];
        this.habits = this.loadData('habits') || [];
        this.skills = this.loadData('skills') || [];
        this.habitTracking = this.loadData('habitTracking') || {};
        this.skillProgress = this.loadData('skillProgress') || {};
        
        this.currentEditingId = null;
        this.currentTab = 'dashboard';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.renderDashboard();
        this.updateStats();
        this.setupCharts();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modal buttons
        document.getElementById('addGoalBtn').addEventListener('click', () => this.openModal('goal'));
        document.getElementById('addHabitBtn').addEventListener('click', () => this.openModal('habit'));
        document.getElementById('addSkillBtn').addEventListener('click', () => this.openModal('skill'));

        // Modal close buttons
        document.getElementById('closeGoalModal').addEventListener('click', () => this.closeModal('goal'));
        document.getElementById('closeHabitModal').addEventListener('click', () => this.closeModal('habit'));
        document.getElementById('closeSkillModal').addEventListener('click', () => this.closeModal('skill'));

        // Cancel buttons
        document.getElementById('cancelGoal').addEventListener('click', () => this.closeModal('goal'));
        document.getElementById('cancelHabit').addEventListener('click', () => this.closeModal('habit'));
        document.getElementById('cancelSkill').addEventListener('click', () => this.closeModal('skill'));

        // Forms
        document.getElementById('goalForm').addEventListener('submit', (e) => this.handleGoalSubmit(e));
        document.getElementById('habitForm').addEventListener('submit', (e) => this.handleHabitSubmit(e));
        document.getElementById('skillForm').addEventListener('submit', (e) => this.handleSkillSubmit(e));

        // Skill level sliders
        document.getElementById('skillCurrentLevel').addEventListener('input', (e) => {
            document.getElementById('skillCurrentLevelValue').textContent = e.target.value;
        });
        document.getElementById('skillTargetLevel').addEventListener('input', (e) => {
            document.getElementById('skillTargetLevelValue').textContent = e.target.value;
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id.replace('Modal', ''));
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Render appropriate content
        switch(tabName) {
            case 'dashboard':
                this.renderDashboard();
                this.updateStats();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'habits':
                this.renderHabits();
                this.renderHabitCalendar();
                break;
            case 'skills':
                this.renderSkills();
                break;
            case 'progress':
                this.renderProgressCharts();
                break;
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('th-TH', options);
    }

    // Data Management
    saveData(key, data) {
        localStorage.setItem(`personalDev_${key}`, JSON.stringify(data));
    }

    loadData(key) {
        const data = localStorage.getItem(`personalDev_${key}`);
        return data ? JSON.parse(data) : null;
    }

    // Modal Management
    openModal(type) {
        this.currentEditingId = null;
        document.getElementById(`${type}Modal`).style.display = 'block';
        document.getElementById(`${type}ModalTitle`).textContent = `เพิ่ม${type === 'goal' ? 'เป้าหมาย' : type === 'habit' ? 'นิสัย' : 'ทักษะ'}ใหม่`;
        document.getElementById(`${type}Form`).reset();
        
        if (type === 'skill') {
            document.getElementById('skillCurrentLevelValue').textContent = '1';
            document.getElementById('skillTargetLevelValue').textContent = '5';
        }
    }

    closeModal(type) {
        document.getElementById(`${type}Modal`).style.display = 'none';
        this.currentEditingId = null;
    }

    // Goals Management
    handleGoalSubmit(e) {
        e.preventDefault();
        const goalData = {
            id: this.currentEditingId || Date.now().toString(),
            title: document.getElementById('goalTitle').value,
            description: document.getElementById('goalDescription').value,
            category: document.getElementById('goalCategory').value,
            deadline: document.getElementById('goalDeadline').value,
            priority: document.getElementById('goalPriority').value,
            progress: this.currentEditingId ? this.goals.find(g => g.id === this.currentEditingId)?.progress || 0 : 0,
            createdAt: this.currentEditingId ? this.goals.find(g => g.id === this.currentEditingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            status: 'active'
        };

        if (this.currentEditingId) {
            const index = this.goals.findIndex(g => g.id === this.currentEditingId);
            this.goals[index] = goalData;
        } else {
            this.goals.push(goalData);
        }

        this.saveData('goals', this.goals);
        this.renderGoals();
        this.closeModal('goal');
        this.updateStats();
    }

    renderGoals() {
        const container = document.getElementById('goalsContainer');
        
        if (this.goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>ยังไม่มีเป้าหมาย</h3>
                    <p>เริ่มต้นด้วยการตั้งเป้าหมายใหม่เพื่อการพัฒนาตนเอง</p>
                    <button class="btn btn-primary" onclick="app.openModal('goal')">
                        <i class="fas fa-plus"></i> เพิ่มเป้าหมายแรก
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.goals.map(goal => `
            <div class="goal-card fade-in">
                <div class="card-header">
                    <div>
                        <div class="card-title">${goal.title}</div>
                        <div class="card-category">${this.getCategoryName(goal.category)}</div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-small btn-secondary" onclick="app.editGoal('${goal.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="app.deleteGoal('${goal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-description">${goal.description}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="progress-text">${goal.progress}% เสร็จสิ้น</div>
                <div class="card-meta">
                    <div class="card-deadline">
                        <i class="fas fa-calendar"></i> วันที่เป้าหมาย: ${new Date(goal.deadline).toLocaleDateString('th-TH')}
                    </div>
                    <div class="card-priority priority-${goal.priority}">
                        <i class="fas fa-flag"></i> ${this.getPriorityName(goal.priority)}
                    </div>
                </div>
                <div class="goal-actions" style="margin-top: 15px;">
                    <button class="btn btn-small btn-success" onclick="app.updateGoalProgress('${goal.id}', 10)">
                        <i class="fas fa-plus"></i> +10%
                    </button>
                    <button class="btn btn-small btn-success" onclick="app.updateGoalProgress('${goal.id}', 25)">
                        <i class="fas fa-plus"></i> +25%
                    </button>
                    <button class="btn btn-small btn-success" onclick="app.completeGoal('${goal.id}')">
                        <i class="fas fa-check"></i> เสร็จสิ้น
                    </button>
                </div>
            </div>
        `).join('');
    }

    editGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) return;

        this.currentEditingId = id;
        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalDescription').value = goal.description;
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalDeadline').value = goal.deadline;
        document.getElementById('goalPriority').value = goal.priority;
        
        document.getElementById('goalModalTitle').textContent = 'แก้ไขเป้าหมาย';
        document.getElementById('goalModal').style.display = 'block';
    }

    deleteGoal(id) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบเป้าหมายนี้?')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveData('goals', this.goals);
            this.renderGoals();
            this.updateStats();
        }
    }

    updateGoalProgress(id, increment) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.progress = Math.min(100, goal.progress + increment);
            if (goal.progress >= 100) {
                goal.status = 'completed';
            }
            this.saveData('goals', this.goals);
            this.renderGoals();
            this.updateStats();
        }
    }

    completeGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.progress = 100;
            goal.status = 'completed';
            this.saveData('goals', this.goals);
            this.renderGoals();
            this.updateStats();
        }
    }

    // Habits Management
    handleHabitSubmit(e) {
        e.preventDefault();
        const habitData = {
            id: this.currentEditingId || Date.now().toString(),
            name: document.getElementById('habitName').value,
            description: document.getElementById('habitDescription').value,
            category: document.getElementById('habitCategory').value,
            frequency: document.getElementById('habitFrequency').value,
            target: parseInt(document.getElementById('habitTarget').value),
            createdAt: this.currentEditingId ? this.habits.find(h => h.id === this.currentEditingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            streak: this.currentEditingId ? this.habits.find(h => h.id === this.currentEditingId)?.streak || 0 : 0
        };

        if (this.currentEditingId) {
            const index = this.habits.findIndex(h => h.id === this.currentEditingId);
            this.habits[index] = habitData;
        } else {
            this.habits.push(habitData);
        }

        this.saveData('habits', this.habits);
        this.renderHabits();
        this.closeModal('habit');
        this.updateStats();
    }

    renderHabits() {
        const container = document.getElementById('habitsContainer');
        
        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>ยังไม่มีนิสัย</h3>
                    <p>เริ่มต้นด้วยการสร้างนิสัยใหม่เพื่อการพัฒนาตนเอง</p>
                    <button class="btn btn-primary" onclick="app.openModal('habit')">
                        <i class="fas fa-plus"></i> เพิ่มนิสัยแรก
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.habits.map(habit => `
            <div class="habit-card fade-in">
                <div class="card-header">
                    <div>
                        <div class="card-title">${habit.name}</div>
                        <div class="card-category">${this.getCategoryName(habit.category)}</div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-small btn-secondary" onclick="app.editHabit('${habit.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="app.deleteHabit('${habit.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-description">${habit.description}</div>
                <div class="card-meta">
                    <div>
                        <i class="fas fa-fire"></i> ติดต่อกัน: ${habit.streak} วัน
                    </div>
                    <div>
                        <i class="fas fa-target"></i> เป้าหมาย: ${habit.target} ครั้ง/สัปดาห์
                    </div>
                </div>
                <div class="habit-actions" style="margin-top: 15px;">
                    <button class="btn btn-small btn-success" onclick="app.markHabitComplete('${habit.id}')">
                        <i class="fas fa-check"></i> ทำเสร็จแล้ว
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="app.viewHabitHistory('${habit.id}')">
                        <i class="fas fa-history"></i> ประวัติ
                    </button>
                </div>
            </div>
        `).join('');
    }

    editHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        this.currentEditingId = id;
        document.getElementById('habitName').value = habit.name;
        document.getElementById('habitDescription').value = habit.description;
        document.getElementById('habitCategory').value = habit.category;
        document.getElementById('habitFrequency').value = habit.frequency;
        document.getElementById('habitTarget').value = habit.target;
        
        document.getElementById('habitModalTitle').textContent = 'แก้ไขนิสัย';
        document.getElementById('habitModal').style.display = 'block';
    }

    deleteHabit(id) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบนิสัยนี้?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            delete this.habitTracking[id];
            this.saveData('habits', this.habits);
            this.saveData('habitTracking', this.habitTracking);
            this.renderHabits();
            this.updateStats();
        }
    }

    markHabitComplete(id) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.habitTracking[id]) {
            this.habitTracking[id] = {};
        }
        
        this.habitTracking[id][today] = true;
        this.saveData('habitTracking', this.habitTracking);
        
        // Update streak
        const habit = this.habits.find(h => h.id === id);
        if (habit) {
            habit.streak = this.calculateStreak(id);
            this.saveData('habits', this.habits);
        }
        
        this.renderHabits();
        this.renderHabitCalendar();
        this.updateStats();
    }

    calculateStreak(habitId) {
        const tracking = this.habitTracking[habitId] || {};
        const dates = Object.keys(tracking).filter(date => tracking[date]).sort();
        
        if (dates.length === 0) return 0;
        
        let streak = 0;
        const today = new Date();
        today.setDate(today.getDate() - streak);
        
        for (let i = dates.length - 1; i >= 0; i--) {
            const date = new Date(dates[i]);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - streak);
            
            if (date.toDateString() === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderHabitCalendar() {
        const calendar = document.getElementById('habitCalendar');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Calendar header
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
        
        let calendarHTML = `
            <div class="calendar-header">
                <h4>${monthNames[currentMonth]} ${currentYear}</h4>
            </div>
        `;
        
        // Day headers
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });
        
        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            
            // Check if any habits were completed on this day
            let completedHabits = 0;
            let totalHabits = this.habits.length;
            
            this.habits.forEach(habit => {
                if (this.habitTracking[habit.id] && this.habitTracking[habit.id][dateString]) {
                    completedHabits++;
                }
            });
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (completedHabits > 0) {
                if (completedHabits === totalHabits) {
                    dayClass += ' completed';
                } else {
                    dayClass += ' partial';
                }
            }
            
            calendarHTML += `
                <div class="${dayClass}" title="${completedHabits}/${totalHabits} นิสัยเสร็จสิ้น">
                    ${day}
                </div>
            `;
        }
        
        calendar.innerHTML = calendarHTML;
    }

    // Skills Management
    handleSkillSubmit(e) {
        e.preventDefault();
        const skillData = {
            id: this.currentEditingId || Date.now().toString(),
            name: document.getElementById('skillName').value,
            description: document.getElementById('skillDescription').value,
            category: document.getElementById('skillCategory').value,
            currentLevel: parseInt(document.getElementById('skillCurrentLevel').value),
            targetLevel: parseInt(document.getElementById('skillTargetLevel').value),
            createdAt: this.currentEditingId ? this.skills.find(s => s.id === this.currentEditingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
        };

        if (this.currentEditingId) {
            const index = this.skills.findIndex(s => s.id === this.currentEditingId);
            this.skills[index] = skillData;
        } else {
            this.skills.push(skillData);
        }

        this.saveData('skills', this.skills);
        this.renderSkills();
        this.closeModal('skill');
        this.updateStats();
    }

    renderSkills() {
        const container = document.getElementById('skillsContainer');
        
        if (this.skills.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>ยังไม่มีทักษะ</h3>
                    <p>เริ่มต้นด้วยการเพิ่มทักษะที่ต้องการพัฒนา</p>
                    <button class="btn btn-primary" onclick="app.openModal('skill')">
                        <i class="fas fa-plus"></i> เพิ่มทักษะแรก
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.skills.map(skill => {
            const progress = ((skill.currentLevel - 1) / (skill.targetLevel - 1)) * 100;
            return `
                <div class="skill-card fade-in">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${skill.name}</div>
                            <div class="card-category">${this.getCategoryName(skill.category)}</div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-small btn-secondary" onclick="app.editSkill('${skill.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small btn-danger" onclick="app.deleteSkill('${skill.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-description">${skill.description}</div>
                    <div class="skill-levels">
                        <div class="level-info">
                            <span>ระดับปัจจุบัน: ${skill.currentLevel}/10</span>
                            <span>เป้าหมาย: ${skill.targetLevel}/10</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(100, progress)}%"></div>
                        </div>
                    </div>
                    <div class="skill-actions" style="margin-top: 15px;">
                        <button class="btn btn-small btn-success" onclick="app.improveSkill('${skill.id}')">
                            <i class="fas fa-arrow-up"></i> ปรับปรุง
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="app.viewSkillHistory('${skill.id}')">
                            <i class="fas fa-chart-line"></i> ประวัติ
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    editSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (!skill) return;

        this.currentEditingId = id;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillDescription').value = skill.description;
        document.getElementById('skillCategory').value = skill.category;
        document.getElementById('skillCurrentLevel').value = skill.currentLevel;
        document.getElementById('skillTargetLevel').value = skill.targetLevel;
        document.getElementById('skillCurrentLevelValue').textContent = skill.currentLevel;
        document.getElementById('skillTargetLevelValue').textContent = skill.targetLevel;
        
        document.getElementById('skillModalTitle').textContent = 'แก้ไขทักษะ';
        document.getElementById('skillModal').style.display = 'block';
    }

    deleteSkill(id) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบทักษะนี้?')) {
            this.skills = this.skills.filter(s => s.id !== id);
            delete this.skillProgress[id];
            this.saveData('skills', this.skills);
            this.saveData('skillProgress', this.skillProgress);
            this.renderSkills();
            this.updateStats();
        }
    }

    improveSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (skill && skill.currentLevel < skill.targetLevel) {
            skill.currentLevel = Math.min(skill.targetLevel, skill.currentLevel + 1);
            this.saveData('skills', this.skills);
            this.renderSkills();
            this.updateStats();
        }
    }

    // Dashboard
    renderDashboard() {
        this.renderTodayTasks();
    }

    renderTodayTasks() {
        const container = document.getElementById('todayTasks');
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's habits
        const todayHabits = this.habits.filter(habit => {
            const tracking = this.habitTracking[habit.id] || {};
            return !tracking[today];
        });
        
        // Get active goals
        const activeGoals = this.goals.filter(goal => goal.status === 'active');
        
        if (todayHabits.length === 0 && activeGoals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>เยี่ยมมาก!</h3>
                    <p>คุณได้ทำทุกอย่างเสร็จสิ้นแล้ววันนี้</p>
                </div>
            `;
            return;
        }
        
        let tasksHTML = '';
        
        // Add habit tasks
        todayHabits.forEach(habit => {
            tasksHTML += `
                <div class="task-item">
                    <div class="task-checkbox" onclick="app.markHabitComplete('${habit.id}')">
                        <i class="fas fa-check" style="display: none;"></i>
                    </div>
                    <div class="task-content">
                        <div class="task-title">${habit.name}</div>
                        <div class="task-meta">นิสัย • ${this.getCategoryName(habit.category)}</div>
                    </div>
                </div>
            `;
        });
        
        // Add goal tasks
        activeGoals.forEach(goal => {
            if (goal.progress < 100) {
                tasksHTML += `
                    <div class="task-item">
                        <div class="task-checkbox" onclick="app.updateGoalProgress('${goal.id}', 10)">
                            <i class="fas fa-check" style="display: none;"></i>
                        </div>
                        <div class="task-content">
                            <div class="task-title">${goal.title}</div>
                            <div class="task-meta">เป้าหมาย • ${goal.progress}% เสร็จสิ้น</div>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = tasksHTML;
    }

    updateStats() {
        const activeGoals = this.goals.filter(g => g.status === 'active').length;
        const completedTasks = this.goals.filter(g => g.status === 'completed').length;
        
        // Calculate longest streak
        let maxStreak = 0;
        this.habits.forEach(habit => {
            const streak = this.calculateStreak(habit.id);
            maxStreak = Math.max(maxStreak, streak);
        });
        
        document.getElementById('activeGoals').textContent = activeGoals;
        document.getElementById('streakDays').textContent = maxStreak;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('totalAchievements').textContent = this.goals.filter(g => g.status === 'completed').length;
    }

    setupCharts() {
        this.renderProgressChart();
    }

    renderProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        const completedGoals = this.goals.filter(g => g.status === 'completed').length;
        const activeGoals = this.goals.filter(g => g.status === 'active').length;
        const totalHabits = this.habits.length;
        const completedHabitsToday = this.getCompletedHabitsToday();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['เป้าหมายเสร็จสิ้น', 'เป้าหมายที่กำลังดำเนินการ', 'นิสัยทั้งหมด', 'นิสัยเสร็จสิ้นวันนี้'],
                datasets: [{
                    data: [completedGoals, activeGoals, totalHabits, completedHabitsToday],
                    backgroundColor: [
                        '#48bb78',
                        '#667eea',
                        '#ed8936',
                        '#f56565'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    getCompletedHabitsToday() {
        const today = new Date().toISOString().split('T')[0];
        let completed = 0;
        
        this.habits.forEach(habit => {
            if (this.habitTracking[habit.id] && this.habitTracking[habit.id][today]) {
                completed++;
            }
        });
        
        return completed;
    }

    renderProgressCharts() {
        this.renderGoalsChart();
        this.renderHabitsChart();
        this.renderSkillsChart();
    }

    renderGoalsChart() {
        const ctx = document.getElementById('goalsChart');
        if (!ctx) return;
        
        const categories = ['สุขภาพ', 'อาชีพ', 'การศึกษา', 'ส่วนตัว', 'การเงิน'];
        const data = categories.map(cat => {
            return this.goals.filter(g => this.getCategoryName(g.category) === cat).length;
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'จำนวนเป้าหมาย',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderHabitsChart() {
        const ctx = document.getElementById('habitsChart');
        if (!ctx) return;
        
        const last7Days = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            last7Days.push(date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }));
            
            let completed = 0;
            this.habits.forEach(habit => {
                if (this.habitTracking[habit.id] && this.habitTracking[habit.id][dateString]) {
                    completed++;
                }
            });
            data.push(completed);
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'นิสัยเสร็จสิ้น',
                    data: data,
                    borderColor: 'rgba(72, 187, 120, 1)',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderSkillsChart() {
        const ctx = document.getElementById('skillsChart');
        if (!ctx) return;
        
        const skillNames = this.skills.map(s => s.name);
        const currentLevels = this.skills.map(s => s.currentLevel);
        const targetLevels = this.skills.map(s => s.targetLevel);
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: skillNames,
                datasets: [{
                    label: 'ระดับปัจจุบัน',
                    data: currentLevels,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)'
                }, {
                    label: 'ระดับเป้าหมาย',
                    data: targetLevels,
                    borderColor: 'rgba(237, 137, 54, 1)',
                    backgroundColor: 'rgba(237, 137, 54, 0.2)',
                    pointBackgroundColor: 'rgba(237, 137, 54, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    // Utility functions
    getCategoryName(category) {
        const categories = {
            'health': 'สุขภาพ',
            'career': 'อาชีพ',
            'education': 'การศึกษา',
            'personal': 'ส่วนตัว',
            'financial': 'การเงิน',
            'productivity': 'ประสิทธิภาพ',
            'learning': 'การเรียนรู้',
            'mindfulness': 'สติ',
            'social': 'สังคม',
            'technical': 'เทคนิค',
            'soft': 'ทักษะอ่อน',
            'language': 'ภาษา',
            'creative': 'ความคิดสร้างสรรค์',
            'physical': 'ร่างกาย'
        };
        return categories[category] || category;
    }

    getPriorityName(priority) {
        const priorities = {
            'low': 'ต่ำ',
            'medium': 'ปานกลาง',
            'high': 'สูง'
        };
        return priorities[priority] || priority;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new PersonalDevelopmentApp();
});
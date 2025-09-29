// Additional functionality for Personal Development App

// Skills Management
PersonalDevelopmentApp.prototype.handleSkillSubmit = function(e) {
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
};

PersonalDevelopmentApp.prototype.renderSkills = function() {
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
};

PersonalDevelopmentApp.prototype.editSkill = function(id) {
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
};

PersonalDevelopmentApp.prototype.deleteSkill = function(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบทักษะนี้?')) {
        this.skills = this.skills.filter(s => s.id !== id);
        delete this.skillProgress[id];
        this.saveData('skills', this.skills);
        this.saveData('skillProgress', this.skillProgress);
        this.renderSkills();
        this.updateStats();
    }
};

PersonalDevelopmentApp.prototype.improveSkill = function(id) {
    const skill = this.skills.find(s => s.id === id);
    if (skill && skill.currentLevel < skill.targetLevel) {
        skill.currentLevel = Math.min(skill.targetLevel, skill.currentLevel + 1);
        this.saveData('skills', this.skills);
        this.renderSkills();
        this.updateStats();
    }
};

// Dashboard
PersonalDevelopmentApp.prototype.renderDashboard = function() {
    this.renderTodayTasks();
};

PersonalDevelopmentApp.prototype.renderTodayTasks = function() {
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
};

PersonalDevelopmentApp.prototype.updateStats = function() {
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
};

PersonalDevelopmentApp.prototype.setupCharts = function() {
    this.renderProgressChart();
};

PersonalDevelopmentApp.prototype.renderProgressChart = function() {
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
};

PersonalDevelopmentApp.prototype.getCompletedHabitsToday = function() {
    const today = new Date().toISOString().split('T')[0];
    let completed = 0;
    
    this.habits.forEach(habit => {
        if (this.habitTracking[habit.id] && this.habitTracking[habit.id][today]) {
            completed++;
        }
    });
    
    return completed;
};

PersonalDevelopmentApp.prototype.renderProgressCharts = function() {
    this.renderGoalsChart();
    this.renderHabitsChart();
    this.renderSkillsChart();
};

PersonalDevelopmentApp.prototype.renderGoalsChart = function() {
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
};

PersonalDevelopmentApp.prototype.renderHabitsChart = function() {
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
};

PersonalDevelopmentApp.prototype.renderSkillsChart = function() {
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
};

// Utility functions
PersonalDevelopmentApp.prototype.getCategoryName = function(category) {
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
};

PersonalDevelopmentApp.prototype.getPriorityName = function(priority) {
    const priorities = {
        'low': 'ต่ำ',
        'medium': 'ปานกลาง',
        'high': 'สูง'
    };
    return priorities[priority] || priority;
};
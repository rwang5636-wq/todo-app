// 待办事项应用 - Todo App
class TodoApp {
    constructor() {
        this.todos = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.selectedCategory = null;
        
        this.initializeElements();
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.render();
    }

    // 初始化DOM元素
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.categoryInput = document.getElementById('categoryInput');
        this.categoryList = document.getElementById('categoryList');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.categoryFilters = document.getElementById('categoryFilters');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    // 绑定事件监听器
    attachEventListeners() {
        // 添加待办事项
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 添加分类/标签
        this.categoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCategory();
        });

        // 过滤按钮
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // 操作按钮
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    // 添加待办事项
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            alert('请输入待办事项！');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            tags: [...this.categories],
            createdAt: new Date().toLocaleString('zh-CN')
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.todoInput.focus();
        this.saveToLocalStorage();
        this.render();
    }

    // 添加分类/标签
    addCategory() {
        const category = this.categoryInput.value.trim();
        
        if (!category) return;

        if (!this.categories.includes(category)) {
            this.categories.push(category);
        }
        
        this.categoryInput.value = '';
        this.render();
    }

    // 删除分类/标签
    removeCategory(category) {
        this.categories = this.categories.filter(c => c !== category);
        this.saveToLocalStorage();
        this.render();
    }

    // 删除待办事项
    deleteTodo(id) {
        if (confirm('确定要删除这个待办事项吗？')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 切换待办事项完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 编辑待办事项
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('编辑待办事项:', todo.text);
        if (newText !== null && newText.trim()) {
            todo.text = newText.trim();
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 设置过滤器
    setFilter(filter) {
        this.currentFilter = filter;
        this.selectedCategory = null;
        
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.render();
    }

    // 按分类过滤
    filterByCategory(category) {
        this.selectedCategory = this.selectedCategory === category ? null : category;
        this.currentFilter = 'all';
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        this.render();
    }

    // 获取过滤后的待办事项
    getFilteredTodos() {
        let filtered = this.todos;

        // 按状态过滤
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(todo => !todo.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        }

        // 按分类过滤
        if (this.selectedCategory) {
            filtered = filtered.filter(todo => todo.tags.includes(this.selectedCategory));
        }

        return filtered;
    }

    // 清除已完成的待办事项
    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        
        if (completedCount === 0) {
            alert('没有已完成的待办事项！');
            return;
        }

        if (confirm(`确定要删除 ${completedCount} 个已完成的任务吗？`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 清空全部待办事项
    clearAll() {
        if (this.todos.length === 0) {
            alert('没有待办事项！');
            return;
        }

        if (confirm('确定要删除所有待办事项吗？此操作无法撤销。')) {
            this.todos = [];
            this.categories = [];
            this.saveToLocalStorage();
            this.render();
        }
    }

    // 导出数据
    exportData() {
        const data = {
            todos: this.todos,
            categories: this.categories,
            exportDate: new Date().toLocaleString('zh-CN')
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 更新统计信息
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    // 渲染分类列表
    renderCategoryList() {
        this.categoryList.innerHTML = '';
        this.categories.forEach(category => {
            const tag = document.createElement('div');
            tag.className = 'category-tag';
            tag.innerHTML = `
                ${category}
                <span class="remove-tag">×</span>
            `;
            tag.querySelector('.remove-tag').addEventListener('click', () => {
                this.removeCategory(category);
            });
            this.categoryList.appendChild(tag);
        });
    }

    // 渲染分类过滤按钮
    renderCategoryFilters() {
        this.categoryFilters.innerHTML = '';
        this.categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-filter-btn';
            if (this.selectedCategory === category) {
                btn.classList.add('active');
            }
            btn.textContent = `#${category}`;
            btn.addEventListener('click', () => this.filterByCategory(category));
            this.categoryFilters.appendChild(btn);
        });
    }

    // 渲染待办事项列表
    renderTodoList() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        filteredTodos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const tagsHtml = todo.tags.length > 0
                ? `<div class="todo-tags">${todo.tags.map(tag => `<span class="todo-tag">#${tag}</span>`).join('')}</div>`
                : '';

            item.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    ${tagsHtml}
                </div>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" onclick="app.editTodo(${todo.id})">编辑</button>
                    <button class="todo-btn delete-btn" onclick="app.deleteTodo(${todo.id})">删除</button>
                </div>
            `;

            this.todoList.appendChild(item);
        });
    }

    // HTML转义函数（防止XSS）
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染主界面
    render() {
        this.renderCategoryList();
        this.renderCategoryFilters();
        this.renderTodoList();
        this.updateStats();
    }

    // 保存到本地存储
    saveToLocalStorage() {
        const data = {
            todos: this.todos,
            categories: this.categories
        };
        localStorage.setItem('todoAppData', JSON.stringify(data));
    }

    // 从本地存储加载
    loadFromLocalStorage() {
        const saved = localStorage.getItem('todoAppData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.todos = data.todos || [];
                this.categories = data.categories || [];
            } catch (error) {
                console.error('加载本地存储数据失败:', error);
                this.todos = [];
                this.categories = [];
            }
        }
    }
}

// 初始化应用
const app = new TodoApp();
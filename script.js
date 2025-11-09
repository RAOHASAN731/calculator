let currentOperand = '0';
let previousOperand = '';
let operation = null;
let history = [];
let memory = 0;

// Preferences
let preferences = {
    showHistory: true,
    soundEnabled: false,
    animationsEnabled: true,
    decimalPlaces: 'auto',
    maxHistory: 20,
    primaryColor: '#11998e',
    secondaryColor: '#38ef7d',
    bgColorStart: '#0f2027',
    bgColorEnd: '#2c5364',
    thousandsSeparator: false,
    autoSave: true
};

// Load saved data
function loadData() {
    const savedHistory = localStorage.getItem('calcHistory');
    const savedPreferences = localStorage.getItem('calcPreferences');
    const savedMemory = localStorage.getItem('calcMemory');
    
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
        updateHistoryStats();
    }
    
    if (savedPreferences) {
        preferences = {...preferences, ...JSON.parse(savedPreferences)};
        applyPreferences();
    }

    if (savedMemory) {
        memory = parseFloat(savedMemory);
        updateMemoryIndicator();
    }
}

// Save data
function saveHistory() {
    if (preferences.autoSave) {
        localStorage.setItem('calcHistory', JSON.stringify(history));
    }
}

function savePreferences() {
    localStorage.setItem('calcPreferences', JSON.stringify(preferences));
}

function saveMemory() {
    localStorage.setItem('calcMemory', memory.toString());
}

function applyPreferences() {
    // Apply show history
    const historyPanel = document.getElementById('historyPanel');
    const showHistoryToggle = document.getElementById('showHistoryToggle');
    if (preferences.showHistory) {
        historyPanel.style.display = 'flex';
        showHistoryToggle.classList.add('active');
    } else {
        historyPanel.style.display = 'none';
        showHistoryToggle.classList.remove('active');
    }

    // Apply sound
    const soundToggle = document.getElementById('soundToggle');
    if (preferences.soundEnabled) {
        soundToggle.classList.add('active');
    } else {
        soundToggle.classList.remove('active');
    }

    // Apply animations
    const animationsToggle = document.getElementById('animationsToggle');
    if (preferences.animationsEnabled) {
        animationsToggle.classList.add('active');
        document.body.style.setProperty('--animation-speed', '0.3s');
    } else {
        animationsToggle.classList.remove('active');
        document.body.style.setProperty('--animation-speed', '0s');
    }

    // Apply separator
    const separatorToggle = document.getElementById('separatorToggle');
    if (preferences.thousandsSeparator) {
        separatorToggle.classList.add('active');
    } else {
        separatorToggle.classList.remove('active');
    }

    // Apply auto-save
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    if (preferences.autoSave) {
        autoSaveToggle.classList.add('active');
    } else {
        autoSaveToggle.classList.remove('active');
    }

    // Apply decimal places
    document.getElementById('decimalPlaces').value = preferences.decimalPlaces;

    // Apply max history
    document.getElementById('maxHistory').value = preferences.maxHistory;

    // Apply custom colors
    document.getElementById('primaryColor').value = preferences.primaryColor;
    document.getElementById('secondaryColor').value = preferences.secondaryColor;
    document.getElementById('bgColorStart').value = preferences.bgColorStart;
    document.getElementById('bgColorEnd').value = preferences.bgColorEnd;
    
    applyCustomColors();
}

function formatNumber(num) {
    if (preferences.thousandsSeparator) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num.toString();
}

function updateDisplay() {
    const displayNum = formatNumber(currentOperand);
    document.getElementById('currentOperand').textContent = displayNum;
    if (operation) {
        document.getElementById('previousOperand').textContent = 
            `${formatNumber(previousOperand)} ${operation}`;
    } else {
        document.getElementById('previousOperand').textContent = previousOperand;
    }
}

function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand += number;
    }
    updateDisplay();
}

function chooseOperation(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        calculate();
    }
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    updateDisplay();
}

function formatResult(result) {
    if (preferences.decimalPlaces === 'auto') {
        return result.toString();
    } else {
        const decimals = parseInt(preferences.decimalPlaces);
        return parseFloat(result.toFixed(decimals)).toString();
    }
}

function calculate() {
    let result;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    let expression = `${previousOperand} ${operation} ${currentOperand}`;
    
    switch (operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            if (current === 0) {
                showToast('Cannot divide by zero!', 'error');
                currentOperand = 'Error';
                previousOperand = '';
                operation = null;
                updateDisplay();
                setTimeout(() => {
                    clearAll();
                }, 1500);
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    result = parseFloat(formatResult(result));
    
    // Add to history
    addToHistory(expression, result);
    
    currentOperand = result.toString();
    operation = null;
    previousOperand = '';
    updateDisplay();
}

function calculatePercentage() {
    const num = parseFloat(currentOperand);
    if (isNaN(num)) return;
    
    const result = num / 100;
    addToHistory(`${currentOperand}%`, result);
    currentOperand = result.toString();
    updateDisplay();
}

function calculateSquare() {
    const num = parseFloat(currentOperand);
    if (isNaN(num)) return;
    
    const result = num * num;
    addToHistory(`${currentOperand}²`, result);
    currentOperand = formatResult(result);
    updateDisplay();
}

function calculateSquareRoot() {
    const num = parseFloat(currentOperand);
    if (isNaN(num)) return;
    if (num < 0) {
        showToast('Cannot calculate square root of negative number!', 'error');
        return;
    }
    
    const result = Math.sqrt(num);
    addToHistory(`√${currentOperand}`, result);
    currentOperand = formatResult(result);
    updateDisplay();
}

function memoryRecall() {
    if (memory !== 0) {
        currentOperand = memory.toString();
        updateDisplay();
        showToast('Memory recalled', 'success');
    }
}

function memoryAdd() {
    const num = parseFloat(currentOperand);
    if (!isNaN(num)) {
        memory += num;
        saveMemory();
        updateMemoryIndicator();
        showToast('Added to memory', 'success');
    }
}

function memoryClear() {
    memory = 0;
    saveMemory();
    updateMemoryIndicator();
    showToast('Memory cleared', 'success');
}

function updateMemoryIndicator() {
    const indicator = document.getElementById('memoryIndicator');
    if (memory !== 0) {
        indicator.style.display = 'block';
        indicator.textContent = `M: ${formatNumber(memory.toFixed(2))}`;
    } else {
        indicator.style.display = 'none';
    }
}

function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleString()
    };
    
    history.unshift(historyItem);
    
    // Limit history based on preference
    if (history.length > preferences.maxHistory) {
        history = history.slice(0, preferences.maxHistory);
    }
    
    saveHistory();
    updateHistoryDisplay();
    updateHistoryStats();
}

function updateHistoryStats() {
    const total = history.length;
    const today = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        return itemDate.toDateString() === now.toDateString();
    }).length;

    document.getElementById('totalCalcs').textContent = total;
    document.getElementById('todayCalcs').textContent = today;
}

function updateHistoryDisplay(filteredHistory = null) {
    const historyList = document.getElementById('historyList');
    const displayHistory = filteredHistory || history;
    
    if (displayHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations found</div>';
        return;
    }
    
    historyList.innerHTML = displayHistory.map((item, index) => `
        <div class="history-item" onclick="reuseCalculation('${item.result}')">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">
                = ${formatNumber(item.result)}
                <button class="history-delete" onclick="event.stopPropagation(); deleteHistoryItem(${history.indexOf(item)})">×</button>
            </div>
            <div class="history-timestamp">${item.displayTime}</div>
        </div>
    `).join('');
}

function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    if (searchTerm === '') {
        updateHistoryDisplay();
        return;
    }

    const filtered = history.filter(item => 
        item.expression.toLowerCase().includes(searchTerm) ||
        item.result.toString().includes(searchTerm)
    );

    updateHistoryDisplay(filtered);
}

function reuseCalculation(value) {
    currentOperand = value.toString();
    previousOperand = '';
    operation = null;
    updateDisplay();
    showToast('Calculation loaded', 'success');
}

function deleteHistoryItem(index) {
    history.splice(index, 1);
    saveHistory();
    updateHistoryDisplay();
    updateHistoryStats();
    showToast('Item deleted', 'success');
}

function clearHistory() {
    showConfirmDialog(
        'Clear History',
        'Are you sure you want to clear all calculation history? This action cannot be undone.',
        () => {
            history = [];
            saveHistory();
            updateHistoryDisplay();
            updateHistoryStats();
            document.getElementById('historySearch').value = '';
            closeConfirmDialog();
            showToast('History cleared', 'success');
        }
    );
}

function exportHistory() {
    if (history.length === 0) {
        showToast('No history to export', 'error');
        return;
    }

    let exportText = 'Calculator History Export\n';
    exportText += '========================\n\n';
    
    history.forEach((item, index) => {
        exportText += `${index + 1}. ${item.expression} = ${item.result}\n`;
        exportText += `   Time: ${item.displayTime}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('History exported successfully!', 'success');
}

function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    updateDisplay();
}

function deleteDigit() {
    if (currentOperand === '0' || currentOperand === '') return;
    currentOperand = currentOperand.slice(0, -1);
    if (currentOperand === '') currentOperand = '0';
    updateDisplay();
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const themeBtn = document.querySelector('.theme-toggle');
    
    if (document.body.classList.contains('light-theme')) {
        themeBtn.textContent = '☀️ Light';
        localStorage.setItem('theme', 'light');
        // Reset to default light theme colors
        document.body.style.background = '';
        document.querySelectorAll('.display, .operator').forEach(el => {
            el.style.background = '';
        });
    } else {
        themeBtn.textContent = '🌙 Dark';
        localStorage.setItem('theme', 'dark');
        // Apply custom dark theme colors
        applyCustomColors();
    }
}

// Settings Modal
function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

// Help Modal
function openHelp() {
    document.getElementById('helpModal').classList.add('active');
}

function closeHelp() {
    document.getElementById('helpModal').classList.remove('active');
}

// Confirmation Dialog Functions
function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.onclick = onConfirm;
    
    document.getElementById('confirmDialog').classList.add('active');
}

function closeConfirmDialog() {
    document.getElementById('confirmDialog').classList.remove('active');
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ff6b6b' : type === 'success' ? '#11998e' : '#333';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Preference toggles
function toggleHistoryPanel() {
    preferences.showHistory = !preferences.showHistory;
    savePreferences();
    applyPreferences();
}

function toggleSound() {
    preferences.soundEnabled = !preferences.soundEnabled;
    savePreferences();
    applyPreferences();
}

function toggleAnimations() {
    preferences.animationsEnabled = !preferences.animationsEnabled;
    savePreferences();
    applyPreferences();
}

function toggleSeparator() {
    preferences.thousandsSeparator = !preferences.thousandsSeparator;
    savePreferences();
    applyPreferences();
    updateDisplay();
    updateHistoryDisplay();
}

function toggleAutoSave() {
    preferences.autoSave = !preferences.autoSave;
    savePreferences();
    applyPreferences();
    if (preferences.autoSave) {
        saveHistory();
        showToast('Auto-save enabled', 'success');
    }
}

function updateDecimalPlaces() {
    preferences.decimalPlaces = document.getElementById('decimalPlaces').value;
    savePreferences();
}

function updateMaxHistory() {
    preferences.maxHistory = parseInt(document.getElementById('maxHistory').value);
    
    // Trim history if needed
    if (history.length > preferences.maxHistory) {
        history = history.slice(0, preferences.maxHistory);
        saveHistory();
        updateHistoryDisplay();
    }
    
    savePreferences();
}

// Custom color functions
function applyCustomColors() {
    const root = document.documentElement;
    
    // Only apply custom colors in dark theme
    if (!document.body.classList.contains('light-theme')) {
        root.style.setProperty('--primary-color', preferences.primaryColor);
        root.style.setProperty('--secondary-color', preferences.secondaryColor);
        root.style.setProperty('--bg-start', preferences.bgColorStart);
        root.style.setProperty('--bg-end', preferences.bgColorEnd);
        
        // Apply background gradient
        document.body.style.background = `linear-gradient(135deg, ${preferences.bgColorStart} 0%, ${preferences.bgColorEnd} 100%)`;
        
        // Apply display and operator gradients
        const displays = document.querySelectorAll('.display');
        const operators = document.querySelectorAll('.operator');
        const historyItems = document.querySelectorAll('.history-item');
        const statValues = document.querySelectorAll('.stat-value');
        
        displays.forEach(el => {
            el.style.background = `linear-gradient(135deg, ${preferences.primaryColor} 0%, ${preferences.secondaryColor} 100%)`;
        });
        
        operators.forEach(el => {
            el.style.background = `linear-gradient(135deg, ${preferences.primaryColor} 0%, ${preferences.secondaryColor} 100%)`;
        });
        
        historyItems.forEach(el => {
            el.style.borderLeftColor = preferences.primaryColor;
        });

        statValues.forEach(el => {
            el.style.color = preferences.primaryColor;
        });
        
        // Apply toggle switch color
        const toggleSwitches = document.querySelectorAll('.toggle-switch.active');
        toggleSwitches.forEach(el => {
            el.style.background = preferences.primaryColor;
        });
    }
}

function updatePrimaryColor() {
    preferences.primaryColor = document.getElementById('primaryColor').value;
    savePreferences();
    applyCustomColors();
}

function updateSecondaryColor() {
    preferences.secondaryColor = document.getElementById('secondaryColor').value;
    savePreferences();
    applyCustomColors();
}

function updateBgColors() {
    preferences.bgColorStart = document.getElementById('bgColorStart').value;
    preferences.bgColorEnd = document.getElementById('bgColorEnd').value;
    savePreferences();
    applyCustomColors();
}

function resetColors() {
    preferences.primaryColor = '#11998e';
    preferences.secondaryColor = '#38ef7d';
    preferences.bgColorStart = '#0f2027';
    preferences.bgColorEnd = '#2c5364';
    
    document.getElementById('primaryColor').value = preferences.primaryColor;
    document.getElementById('secondaryColor').value = preferences.secondaryColor;
    document.getElementById('bgColorStart').value = preferences.bgColorStart;
    document.getElementById('bgColorEnd').value = preferences.bgColorEnd;
    
    savePreferences();
    applyCustomColors();
    showToast('Colors reset to default', 'success');
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+' || e.key === '-') chooseOperation(e.key);
    if (e.key === '*') chooseOperation('×');
    if (e.key === '/') {
        e.preventDefault();
        chooseOperation('÷');
    }
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clearAll();
    if (e.key === 'Backspace') deleteDigit();
});

// Close modal on outside click
document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
        closeSettings();
    }
});

document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
        closeHelp();
    }
});

document.getElementById('confirmDialog').addEventListener('click', (e) => {
    if (e.target.id === 'confirmDialog') {
        closeConfirmDialog();
    }
});

// Load saved theme and data
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-toggle').textContent = '☀️ Light';
    }
    
    loadData();
    updateDisplay();
});

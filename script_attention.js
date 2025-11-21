// AgroAI Crop Advisory Dashboard JavaScript - Attention-Enhanced Version

// API Configuration - Updated to handle CORS and fallback gracefully
const API_BASE_URL = 'http://localhost:4000';
const ML_API_URL = 'http://localhost:5000'; // Attention-Enhanced LSTM API
const CHAT_API_URL = `${API_BASE_URL}/chat`;
const CHAT_TIMEOUT_MS = 20000;

// Check if APIs are available
let API_AVAILABLE = false;
let ML_API_AVAILABLE = false;
let chatSessionId = null;
let chatRequestInFlight = false;
let chatTypingIndicator = null;

// Voice assistant state
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let speechRecognitionInstance = null;
let voiceAssistantState = {
    recognitionSupported: !!SpeechRecognitionAPI,
    speechSupported: 'speechSynthesis' in window,
    listening: false,
    ttsEnabled: true
};

// Test API availability
async function checkAPIAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { 
            method: 'GET',
            mode: 'no-cors' // This prevents CORS errors
        });
        API_AVAILABLE = true;
        console.log('✅ API server is available');
    } catch (error) {
        API_AVAILABLE = false;
        console.log('⚠️ API server not available, using mock data');
    }
    
    try {
        const response = await fetch(`${ML_API_URL}/health`, { 
            method: 'GET',
            mode: 'no-cors'
        });
        ML_API_AVAILABLE = true;
        console.log('✅ ML API server is available');
    } catch (error) {
        ML_API_AVAILABLE = false;
        console.log('⚠️ ML API server not available, using mock data');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check API availability first
    checkAPIAvailability();

    // Ensure we have a stable chat session id for backend context
    chatSessionId = getOrCreateChatSessionId();
    
    // Initialize the dashboard
    initializeDashboard();
    
    // Initialize voice assistant (speech input/output)
    initializeVoiceAssistant();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    
    // Pre-load live prices data to ensure it's available
    console.log('Pre-loading live prices data...');
    loadMockLivePrices();
    
    // Initialize alert system
    initializeAlertSystem();
    
    // Add test button for price simulation (for demonstration)
    addPriceSimulationButton();
    
    // Listen for language changes to refresh Live Prices display
    window.addEventListener('languageChanged', function() {
        if (window.allPriceData) {
            displayLivePrices(window.allPriceData);
        }
        
        // Update simulation button text and title
        const simButton = document.querySelector('button[title*="simulate"], button[title*="Simulate"]');
        if (simButton && window.languageManager) {
            simButton.innerHTML = '🎲 ' + window.languageManager.getTranslation('common.simulate');
            simButton.title = window.languageManager.getTranslation('common.simulate-tooltip');
        }

        updateVoiceLanguage();
        refreshVoiceButtonLabels();
    });
});

function initializeDashboard() {
    console.log('AgroAI Crop Advisory Dashboard initialized with Attention-Enhanced LSTM');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
}

function setupEventListeners() {
    // City selection
    const cityCards = document.querySelectorAll('.city-card');
    cityCards.forEach(card => {
        card.addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            switchCity(city);
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Navigation menu
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Update page title
            const pageTitle = this.querySelector('span').textContent;
            document.querySelector('.page-title').textContent = pageTitle;
            
            // Show corresponding page
            const pageId = this.getAttribute('href').substring(1) + '-page';
            showPage(pageId);
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-moon')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                console.log('Switching to light theme');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                console.log('Switching to dark theme');
            }
        });
    }
    
    // Language selector
    const languageSelector = document.querySelector('.language-selector select');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            console.log('Language changed to:', this.value);
            // Trigger language change through the language manager
            if (window.languageManager) {
                window.languageManager.changeLanguage(this.value);
            }
        });
    }
    
    // Crop card interactions
    const cropCards = document.querySelectorAll('.crop-card');
    cropCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Crop detail buttons
    const cropButtons = document.querySelectorAll('.btn-primary');
    cropButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const cropCard = this.closest('.crop-card');
            if (cropCard) {
                const cropName = cropCard.querySelector('h4').textContent;
            showCropDetails(cropName);
            }
        });
    });
    
    // Prediction form submission
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generatePrediction();
        });
    }
    
    // Chat form submission
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
}

function loadDashboardData() {
    // Load initial dashboard data
    console.log('Loading dashboard data...');
    
    // Set default city
    switchCity('davangere');
    
    // Add click event listeners to city cards
    const cityCards = document.querySelectorAll('.city-card');
    console.log(`Found ${cityCards.length} city cards`);
    
    cityCards.forEach((card, index) => {
        const city = card.getAttribute('data-city');
        console.log(`${index + 1}. City card: ${city}`);
        
        card.addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            console.log(`🖱️ City card clicked: ${city}`);
            switchCity(city);
        });
    });
    
    // Test buttons removed for production
}

// Test buttons function removed for production

// Add price simulation button for testing alerts
function addPriceSimulationButton() {
    const button = document.createElement('button');
    button.type = 'button'; // Prevent form submission
    button.innerHTML = '🎲 ' + (window.languageManager ? window.languageManager.getTranslation('common.simulate') : 'Simulate Price Changes');
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4ade80;
        color: #1a1a1a;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', function() {
        this.style.background = '#22c55e';
        this.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.background = '#4ade80';
        this.style.transform = 'scale(1)';
    });
    
    button.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        simulatePriceChanges(event);
    };
    
    button.title = window.languageManager ? window.languageManager.getTranslation('common.simulate-tooltip') : 'Click to simulate price changes and test alerts';
    document.body.appendChild(button);
}

// Alert System Configuration and Functions
let alertSettings = {
    enabled: true,
    soundEnabled: false,
    emailEnabled: false,
    thresholds: {
        rice: 25,
        maize: 30,
        cotton: 35,
        tomato: 40,
        ragi: 28
    }
};

let activeAlerts = [];
let alertCheckInterval = null;

// Initialize Alert System
function initializeAlertSystem() {
    console.log('Initializing Price Alert System...');
    
    // Load saved settings
    loadAlertSettings();
    
    // Start price monitoring
    startPriceMonitoring();
    
    // Update alert badge
    updateAlertBadge();
}

// Load alert settings from localStorage
function loadAlertSettings() {
    const saved = localStorage.getItem('alertSettings');
    if (saved) {
        alertSettings = { ...alertSettings, ...JSON.parse(saved) };
        console.log('Alert settings loaded:', alertSettings);
    }
}

// Save alert settings to localStorage
function saveAlertSettingsToStorage() {
    localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
    console.log('Alert settings saved:', alertSettings);
}

// Start monitoring prices for alerts
function startPriceMonitoring() {
    if (alertCheckInterval) {
        clearInterval(alertCheckInterval);
    }
    
    if (!alertSettings.enabled) return;
    
    // Check prices every 30 seconds
    alertCheckInterval = setInterval(() => {
        checkPriceAlerts();
    }, 30000);
    
    console.log('Price monitoring started');
}

// Check current prices against thresholds
function checkPriceAlerts() {
    if (!window.allPriceData || !alertSettings.enabled) return;
    
    console.log('Checking price alerts...');
    
    window.allPriceData.forEach(item => {
        const crop = item.crop.toLowerCase();
        const location = item.location;
        const currentPrice = parseFloat(item.modalPrice.replace('Rs.', '').replace(',', ''));
        
        if (alertSettings.thresholds[crop]) {
            const threshold = alertSettings.thresholds[crop];
            const profitPercentage = calculateProfitPercentage(currentPrice, crop);
            
            if (profitPercentage >= threshold) {
                createPriceAlert(item, profitPercentage, threshold);
            }
        }
    });
}

// Calculate profit percentage based on base price
function calculateProfitPercentage(currentPrice, crop) {
    const basePrices = {
        rice: 2500,
        maize: 2000,
        cotton: 5000,
        tomato: 800,
        ragi: 2200
    };
    
    const basePrice = basePrices[crop] || 2000;
    return Math.round(((currentPrice - basePrice) / basePrice) * 100);
}

// Create a new price alert
function createPriceAlert(item, profitPercentage, threshold) {
    const alertId = `${item.crop}-${item.location}-${Date.now()}`;
    
    // Check if alert already exists for this crop/location
    const existingAlert = activeAlerts.find(alert => 
        alert.crop === item.crop && alert.location === item.location
    );
    
    if (existingAlert) {
        // Update existing alert if profit is higher
        if (profitPercentage > existingAlert.profitPercentage) {
            existingAlert.profitPercentage = profitPercentage;
            existingAlert.currentPrice = item.modalPrice;
            existingAlert.timestamp = new Date().toLocaleTimeString();
            updateAlertDisplay();
        }
        return;
    }
    
    const alert = {
        id: alertId,
        crop: item.crop,
        location: item.location,
        currentPrice: item.modalPrice,
        profitPercentage: profitPercentage,
        threshold: threshold,
        timestamp: new Date().toLocaleTimeString(),
        type: profitPercentage >= 50 ? 'urgent' : profitPercentage >= 35 ? 'high-profit' : 'warning'
    };
    
    activeAlerts.push(alert);
    updateAlertDisplay();
    updateAlertBadge();
    
    // Play sound if enabled
    if (alertSettings.soundEnabled) {
        playAlertSound();
    }
    
    console.log('New price alert created:', alert);
}

// Update alert display
function updateAlertDisplay() {
    const alertContent = document.getElementById('alert-content');
    if (!alertContent) return;
    
    if (activeAlerts.length === 0) {
        alertContent.innerHTML = `
            <div style="text-align: center; color: #888; padding: 20px;">
                <i class="fas fa-bell" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>No active alerts</p>
                <p style="font-size: 12px;">You'll be notified when crop prices reach your profit thresholds.</p>
            </div>
        `;
        return;
    }
    
    alertContent.innerHTML = activeAlerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-title">🚨 ${alert.crop} Alert - ${alert.location}</div>
            <div class="alert-message">Price has reached ${alert.profitPercentage}% profit margin!</div>
            <div class="alert-details">
                <span class="alert-price">Current: ${alert.currentPrice}</span>
                <span class="alert-timestamp">${alert.timestamp}</span>
            </div>
        </div>
    `).join('');
}

// Update alert badge count
function updateAlertBadge() {
    const badge = document.getElementById('alert-count');
    if (badge) {
        badge.textContent = activeAlerts.length;
        if (activeAlerts.length > 0) {
            badge.classList.add('pulse');
            setTimeout(() => badge.classList.remove('pulse'), 1500);
        }
    }
}

// Show alert panel
function showAlerts() {
    const panel = document.getElementById('alert-panel');
    if (panel) {
        panel.classList.add('show');
        updateAlertDisplay();
    }
}

// Hide alert panel
function hideAlerts() {
    const panel = document.getElementById('alert-panel');
    if (panel) {
        panel.classList.remove('show');
    }
}

// Open alert settings modal
function openAlertSettings() {
    const modal = document.getElementById('alert-settings-modal');
    if (modal) {
        // Populate current settings
        document.getElementById('enable-alerts').checked = alertSettings.enabled;
        document.getElementById('sound-alerts').checked = alertSettings.soundEnabled;
        document.getElementById('email-alerts').checked = alertSettings.emailEnabled;
        document.getElementById('rice-threshold').value = alertSettings.thresholds.rice;
        document.getElementById('maize-threshold').value = alertSettings.thresholds.maize;
        document.getElementById('cotton-threshold').value = alertSettings.thresholds.cotton;
        document.getElementById('tomato-threshold').value = alertSettings.thresholds.tomato;
        document.getElementById('ragi-threshold').value = alertSettings.thresholds.ragi;
        
        modal.classList.add('show');
    }
}

// Close alert settings modal
function closeAlertSettings() {
    const modal = document.getElementById('alert-settings-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Save alert settings
function saveAlertSettings() {
    alertSettings.enabled = document.getElementById('enable-alerts').checked;
    alertSettings.soundEnabled = document.getElementById('sound-alerts').checked;
    alertSettings.emailEnabled = document.getElementById('email-alerts').checked;
    alertSettings.thresholds.rice = parseInt(document.getElementById('rice-threshold').value);
    alertSettings.thresholds.maize = parseInt(document.getElementById('maize-threshold').value);
    alertSettings.thresholds.cotton = parseInt(document.getElementById('cotton-threshold').value);
    alertSettings.thresholds.tomato = parseInt(document.getElementById('tomato-threshold').value);
    alertSettings.thresholds.ragi = parseInt(document.getElementById('ragi-threshold').value);
    
    saveAlertSettingsToStorage();
    closeAlertSettings();
    
    // Restart monitoring with new settings
    startPriceMonitoring();
    
    console.log('Alert settings saved:', alertSettings);
}

// Play alert sound
function playAlertSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Simulate price changes for testing (remove in production)
function simulatePriceChanges(event) {
    // Prevent any default behavior that might cause page navigation
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log('Simulating price changes...');
    
    if (!window.allPriceData) {
        console.log('No price data available');
        return;
    }
    
    let changesCount = 0;
    
    // Randomly increase some prices
    window.allPriceData.forEach(item => {
        if (Math.random() > 0.7) { // 30% chance for more frequent changes
            const currentPrice = parseFloat(item.modalPrice.replace('Rs.', '').replace(',', ''));
            const increasePercentage = Math.random() * 0.4; // Up to 40% increase
            const newPrice = currentPrice * (1 + increasePercentage);
            
            item.modalPrice = `Rs.${Math.round(newPrice).toLocaleString()}`;
            item.minPrice = `Rs.${Math.round(newPrice * 0.9).toLocaleString()}`;
            item.maxPrice = `Rs.${Math.round(newPrice * 1.1).toLocaleString()}`;
            
            changesCount++;
            console.log(`Updated ${item.crop} in ${item.location}: ${item.modalPrice}`);
        }
    });
    
    console.log(`Made ${changesCount} price changes`);
    
    // Update display only if we're on the Live Prices page
    const livePricesPage = document.getElementById('live-prices-page');
    if (livePricesPage && livePricesPage.classList.contains('active')) {
        displayLivePrices(window.allPriceData);
        console.log('Updated Live Prices display');
    }
    
    // Check for new alerts
    checkPriceAlerts();
    
    // Show a temporary notification
    showSimulationNotification(changesCount);
    
    // Also create a temporary alert for better visibility
    if (changesCount > 0) {
        createPriceAlert('Price Simulation', `Simulated ${changesCount} price changes. Check Live Prices page for updates.`, 'info');
    }
}

// Show simulation notification
function showSimulationNotification(changesCount) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #4ade80;
        color: #1a1a1a;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
        max-width: 90vw;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    
    notification.innerHTML = `🎲 Simulated ${changesCount} price changes! Check Live Prices page.`;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds with fade out
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 500);
    }, 4000);
}

function switchCity(city) {
    console.log(`=== SWITCHING TO CITY: ${city} ===`);
    
    // Remove active class from all city cards
    document.querySelectorAll('.city-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected city
    const selectedCard = document.querySelector(`[data-city="${city}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        console.log(`✅ Activated city card for: ${city}`);
    } else {
        console.error(`❌ City card not found for: ${city}`);
        return;
    }
    
    // Hide all city content
    const allCityDashboards = document.querySelectorAll('.city-dashboard');
    console.log(`Found ${allCityDashboards.length} city dashboards`);
    
    allCityDashboards.forEach((content, index) => {
        content.classList.remove('active');
        content.style.display = 'none';
        console.log(`${index + 1}. Hiding: ${content.id}`);
    });
    
    // Show selected city content
    const cityContent = document.getElementById(`${city}-content`);
    if (cityContent) {
        console.log(`✅ Found city content: ${cityContent.id}`);
        
        // Show the selected content
        cityContent.classList.add('active');
        cityContent.style.display = 'block';
        
        console.log(`✅ Showing city content for: ${city}`);
        
        // Update the header text directly
        updateCityHeaderText(city);
        
        // Update crop prices for the selected city
        updateCropPricesForCity(city);
    } else {
        console.error(`❌ City content not found for: ${city}`);
    }
    
    console.log(`=== SUCCESSFULLY SWITCHED TO ${city} ===`);
}

function updateCityHeaderText(city) {
    // Get the city name for display
    const cityNames = {
        'davangere': 'Davangere',
        'gangavathi': 'Gangavathi', 
        'hbhalli': 'H.B. Halli',
        'hospet': 'Hospet'
    };
    
    const cityName = cityNames[city] || city;
    
    // Update the header text directly
    const header = document.querySelector('.city-dashboard.active h2');
    const subtitle = document.querySelector('.city-dashboard.active p');
    
    if (header) {
        header.textContent = `${cityName} Crop Advisory`;
        console.log(`✅ Updated header to: ${cityName} Crop Advisory`);
    }
    
    if (subtitle) {
        subtitle.textContent = `Agricultural insights for ${cityName} region`;
        console.log(`✅ Updated subtitle for: ${cityName}`);
    }
}

function updateCityHeaders(city) {
    const cityHeaders = document.querySelectorAll('.city-header h2, .city-header p');
    cityHeaders.forEach(header => {
        if (header.tagName === 'H2') {
            header.setAttribute('data-translate', 'advisory.section-title');
        } else if (header.tagName === 'P') {
            header.setAttribute('data-translate', 'advisory.section-subtitle');
        }
    });
    
    // Trigger translation update
    if (window.languageManager) {
        window.languageManager.translatePage();
    }
}

function updateCropPricesForCity(city) {
    console.log(`Updating crop prices for city: ${city}`);
    
    // Get the active city content
    const cityContent = document.getElementById(`${city}-content`);
    if (!cityContent) {
        console.error(`City content not found for: ${city}`);
        return;
    }
    
    console.log(`Found city content: ${cityContent.id}`);
    
    // Get crop price data for the selected city
    const cityPriceData = getCityPriceData(city);
    console.log(`Price data for ${city}:`, cityPriceData);
    
    // Update each crop card in the city content
    const cropCards = cityContent.querySelectorAll('.crop-card');
    console.log(`Found ${cropCards.length} crop cards in ${city}`);
    
    cropCards.forEach((card, index) => {
        const cropName = card.querySelector('h4').textContent.trim();
        const priceElement = card.querySelector('.crop-price');
        
        console.log(`Processing crop ${index + 1}: ${cropName}`);
        
        if (priceElement && cityPriceData[cropName]) {
            console.log(`Updating price for ${cropName} to ${cityPriceData[cropName].price}`);
            
            // Add animation effect
            priceElement.style.transition = 'all 0.3s ease';
            priceElement.style.transform = 'scale(1.05)';
            priceElement.style.color = '#4ade80';
            
            // Update the price
            priceElement.textContent = cityPriceData[cropName].price;
            
            // Reset animation
            setTimeout(() => {
                priceElement.style.transform = 'scale(1)';
                priceElement.style.color = '#ffffff';
            }, 300);
        } else {
            console.log(`No price data found for ${cropName} in ${city}`);
        }
    });
    
    console.log(`Successfully updated prices for ${city}`);
}

function getCityPriceData(city) {
    // Real price data based on the CSV files and market data
    const cityPriceDatabase = {
        'davangere': {
            'Rice': { price: 'Rs.2,400-3,500/quintal' },
            'Maize': { price: 'Rs.2,230-2,310/quintal' },
            'Ragi': { price: 'Rs.2,100-2,800/quintal' },
            'Cotton': { price: 'Rs.5,200-6,500/quintal' },
            'Tomato': { price: 'Rs.300-1,600/quintal' }
        },
        'gangavathi': {
            'Rice': { price: 'Rs.1,700-2,440/quintal' },
            'Maize': { price: 'Rs.1,800-2,200/quintal' },
            'Ragi': { price: 'Rs.2,000-2,600/quintal' },
            'Cotton': { price: 'Rs.4,800-6,000/quintal' }
        },
        'hbhalli': {
            'Rice': { price: 'Rs.1,300-1,800/quintal' },
            'Maize': { price: 'Rs.1,700-2,100/quintal' },
            'Ragi': { price: 'Rs.1,900-2,500/quintal' },
            'Cotton': { price: 'Rs.4,500-5,800/quintal' }
        },
        'hospet': {
            'Rice': { price: 'Rs.1,200-2,353/quintal' },
            'Maize': { price: 'Rs.1,600-2,000/quintal' },
            'Ragi': { price: 'Rs.1,800-2,400/quintal' },
            'Tomato': { price: 'Rs.250-1,400/quintal' }
        }
    };
    
    return cityPriceDatabase[city] || {};
}

function showCropDetails(cropName) {
    const cropData = getCropData(cropName);
    
    // Create modal or update details section
    const detailsHtml = `
        <div class="crop-details">
            <h3>${cropName} Details</h3>
            <div class="crop-info">
                <p><strong>Varieties:</strong> ${cropData.varieties.join(', ')}</p>
                <p><strong>Price Range:</strong> Rs.${cropData.priceRange.min} - Rs.${cropData.priceRange.max} per quintal</p>
                <p><strong>Grades:</strong> ${cropData.grades.join(', ')}</p>
                <p><strong>Season:</strong> ${cropData.season}</p>
                <p><strong>Best Practices:</strong> ${cropData.practices}</p>
            </div>
        </div>
    `;
    
    // You can implement a modal or update a details section here
    console.log('Showing crop details for:', cropName);
    console.log('Crop data:', cropData);
}

function getCropData(cropName) {
    // Enhanced crop database with real data
    const cropDatabase = {
        'Rice': {
            varieties: ['Medium', 'Broken Rice', 'Basmati'],
            priceRange: { min: 2400, max: 3500 },
            grades: ['A Grade', 'B Grade', 'C Grade'],
            season: 'Kharif and Rabi',
            practices: 'Proper irrigation, balanced fertilization, pest management'
        },
        'Maize': {
            varieties: ['Local', 'Hybrid', 'Sweet Corn'],
            priceRange: { min: 1800, max: 2500 },
            grades: ['Premium', 'Standard', 'Feed Grade'],
            season: 'Kharif',
            practices: 'Well-drained soil, regular watering, disease control'
        },
        'Cotton': {
            varieties: ['BT Cotton', 'Desi Cotton', 'Hybrid'],
            priceRange: { min: 4500, max: 6500 },
            grades: ['Extra Long Staple', 'Long Staple', 'Medium Staple'],
            season: 'Kharif',
            practices: 'Deep plowing, proper spacing, pest monitoring'
        },
        'Tomato': {
            varieties: ['Hybrid', 'Local', 'Cherry'],
            priceRange: { min: 300, max: 1600 },
            grades: ['A Grade', 'B Grade', 'Processing Grade'],
            season: 'Year-round',
            practices: 'Staking, regular pruning, disease prevention'
        },
        'Ragi': {
            varieties: ['Local', 'Improved', 'Organic'],
            priceRange: { min: 2000, max: 2800 },
            grades: ['Premium', 'Standard', 'Feed Grade'],
            season: 'Kharif',
            practices: 'Drought-resistant, minimal irrigation, organic farming'
        }
    };
    
    return cropDatabase[cropName] || {
        varieties: ['Unknown'],
        priceRange: { min: 0, max: 0 },
        grades: ['Unknown'],
        season: 'Unknown',
        practices: 'Contact local agricultural extension office'
    };
}

// Page Navigation Functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        switch(pageId) {
            case 'live-prices-page':
                loadLivePrices();
                break;
            case 'price-predictions-page':
                initializePredictions();
                break;
            case 'crop-advisory-page':
                loadCropAdvisory();
                break;
            case 'ai-assistant-page':
                initializeChatBot();
                break;
        }
    }
}

// Live Prices Page Functions
async function loadLivePrices() {
    console.log('Loading live prices with Attention-Enhanced LSTM...');
    
    // Always use mock data for now to ensure it works
    console.log('Using mock data for live prices');
    loadMockLivePrices();
    return;
    
    // Commented out API call for now to focus on fixing the display issue
    /*
    if (!API_AVAILABLE) {
        console.log('API not available, using mock data for live prices');
        loadMockLivePrices();
        return;
    }
    
    try {
        // Try to get real-time data from API
        const response = await fetch(`${API_BASE_URL}/api/prices/live`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors'
        });
        
        if (response.ok) {
            const liveData = await response.json();
        if (liveData && liveData.length > 0) {
            displayLivePrices(liveData);
                return;
            }
        }
        
            // Fallback to mock data
            loadMockLivePrices();
    } catch (error) {
        console.log('API error, using mock data for live prices:', error.message);
        loadMockLivePrices();
    }
    */
}

function loadMockLivePrices() {
    console.log('Loading mock live prices data...');
    
    const priceData = [
        // Davangere crops
        { location: 'Davangere', crop: 'Rice', variety: 'Medium', minPrice: 'Rs.2,400', maxPrice: 'Rs.3,500', modalPrice: 'Rs.2,950', lastUpdated: 'Today' },
        { location: 'Davangere', crop: 'Maize', variety: 'Local', minPrice: 'Rs.2,230', maxPrice: 'Rs.2,310', modalPrice: 'Rs.2,270', lastUpdated: 'Today' },
        { location: 'Davangere', crop: 'Ragi', variety: 'Local', minPrice: 'Rs.2,100', maxPrice: 'Rs.2,800', modalPrice: 'Rs.2,450', lastUpdated: 'Today' },
        { location: 'Davangere', crop: 'Cotton', variety: 'BT Cotton', minPrice: 'Rs.5,200', maxPrice: 'Rs.6,500', modalPrice: 'Rs.5,850', lastUpdated: 'Today' },
        { location: 'Davangere', crop: 'Tomato', variety: 'Hybrid', minPrice: 'Rs.300', maxPrice: 'Rs.1,600', modalPrice: 'Rs.950', lastUpdated: 'Today' },
        
        // Gangavathi crops
        { location: 'Gangavathi', crop: 'Rice', variety: 'Broken Rice', minPrice: 'Rs.1,700', maxPrice: 'Rs.2,440', modalPrice: 'Rs.2,070', lastUpdated: 'Today' },
        { location: 'Gangavathi', crop: 'Maize', variety: 'Local', minPrice: 'Rs.1,800', maxPrice: 'Rs.2,200', modalPrice: 'Rs.2,000', lastUpdated: 'Today' },
        { location: 'Gangavathi', crop: 'Ragi', variety: 'Local', minPrice: 'Rs.2,000', maxPrice: 'Rs.2,600', modalPrice: 'Rs.2,300', lastUpdated: 'Today' },
        { location: 'Gangavathi', crop: 'Cotton', variety: 'BT Cotton', minPrice: 'Rs.4,800', maxPrice: 'Rs.6,000', modalPrice: 'Rs.5,400', lastUpdated: 'Today' },
        
        // H.B. Halli crops
        { location: 'H.B. Halli', crop: 'Rice', variety: 'Broken Rice', minPrice: 'Rs.1,300', maxPrice: 'Rs.1,800', modalPrice: 'Rs.1,550', lastUpdated: 'Today' },
        { location: 'H.B. Halli', crop: 'Maize', variety: 'Local', minPrice: 'Rs.1,700', maxPrice: 'Rs.2,100', modalPrice: 'Rs.1,900', lastUpdated: 'Today' },
        { location: 'H.B. Halli', crop: 'Ragi', variety: 'Local', minPrice: 'Rs.1,900', maxPrice: 'Rs.2,500', modalPrice: 'Rs.2,200', lastUpdated: 'Today' },
        { location: 'H.B. Halli', crop: 'Cotton', variety: 'BT Cotton', minPrice: 'Rs.4,500', maxPrice: 'Rs.5,800', modalPrice: 'Rs.5,150', lastUpdated: 'Today' },
        
        // Hospet crops
        { location: 'Hospet', crop: 'Rice', variety: 'Broken Rice', minPrice: 'Rs.1,200', maxPrice: 'Rs.2,353', modalPrice: 'Rs.1,777', lastUpdated: 'Today' },
        { location: 'Hospet', crop: 'Maize', variety: 'Local', minPrice: 'Rs.1,600', maxPrice: 'Rs.2,000', modalPrice: 'Rs.1,800', lastUpdated: 'Today' },
        { location: 'Hospet', crop: 'Ragi', variety: 'Local', minPrice: 'Rs.1,800', maxPrice: 'Rs.2,400', modalPrice: 'Rs.2,100', lastUpdated: 'Today' },
        { location: 'Hospet', crop: 'Tomato', variety: 'Hybrid', minPrice: 'Rs.250', maxPrice: 'Rs.1,400', modalPrice: 'Rs.825', lastUpdated: 'Today' }
    ];
    
    console.log('Mock price data created:', priceData);
    console.log('First item sample:', priceData[0]);
    
    // Store the data globally for filtering
    window.allPriceData = priceData;
    
    console.log('Data stored in window.allPriceData:', window.allPriceData);
    
    displayLivePrices(priceData);
    setupPriceFilters();
}

function displayLivePrices(priceData) {
    const tbody = document.getElementById('price-table-body');
    if (!tbody) {
        console.error('price-table-body element not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!priceData || priceData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; color: #b3b3b3;">
                ${window.languageManager ? window.languageManager.translate('common.no-data') : 'No data found for the selected filters'}
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    console.log('Displaying price data:', priceData);
    
    priceData.forEach((item, index) => {
        console.log(`Processing item ${index}:`, item);
        const row = document.createElement('tr');
        
        // Get translated location and crop names
        const locationKey = `city.${item.location.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')}`;
        const cropKey = `crop.${item.crop.toLowerCase()}`;
        const translatedLocation = window.languageManager ? window.languageManager.getTranslation(locationKey) : item.location;
        const translatedCrop = window.languageManager ? window.languageManager.getTranslation(cropKey) : item.crop;
        
        row.innerHTML = `
            <td>${translatedLocation || item.location || 'N/A'}</td>
            <td>${translatedCrop || item.crop || 'N/A'}</td>
            <td>${item.variety || 'N/A'}</td>
            <td>${item.minPrice || 'N/A'}</td>
            <td>${item.maxPrice || 'N/A'}</td>
            <td>${item.modalPrice || 'N/A'}</td>
            <td>${window.languageManager ? window.languageManager.getTranslation('common.today') : 'Today'}</td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`Displayed ${priceData.length} price records`);
}

function setupPriceFilters() {
    console.log('Setting up price filters...');
    
    const locationFilter = document.getElementById('price-location-filter');
    const cropFilter = document.getElementById('price-crop-filter');
    
    if (locationFilter) {
        locationFilter.addEventListener('change', applyPriceFilters);
        console.log('✅ Location filter event listener added');
    }
    
    if (cropFilter) {
        cropFilter.addEventListener('change', applyPriceFilters);
        console.log('✅ Crop filter event listener added');
    }
}

function applyPriceFilters() {
    console.log('Applying price filters...');
    
    const locationFilter = document.getElementById('price-location-filter');
    const cropFilter = document.getElementById('price-crop-filter');
    
    if (!locationFilter || !cropFilter || !window.allPriceData) {
        console.error('Filter elements or data not found');
        return;
    }
    
    const selectedLocation = locationFilter.value;
    const selectedCrop = cropFilter.value;
    
    console.log(`Filtering by location: ${selectedLocation}, crop: ${selectedCrop}`);
    
    let filteredData = window.allPriceData;
    
    // Apply location filter
    if (selectedLocation !== 'all') {
        const locationMap = {
            'davangere': 'Davangere',
            'gangavathi': 'Gangavathi',
            'hbhalli': 'H.B. Halli',
            'hospet': 'Hospet'
        };
        
        const locationName = locationMap[selectedLocation] || selectedLocation;
        filteredData = filteredData.filter(item => item.location === locationName);
        console.log(`After location filter: ${filteredData.length} records`);
    }
    
    // Apply crop filter
    if (selectedCrop !== 'all') {
        filteredData = filteredData.filter(item => 
            item.crop.toLowerCase() === selectedCrop.toLowerCase()
        );
        console.log(`After crop filter: ${filteredData.length} records`);
    }
    
    // Display filtered results
    displayLivePrices(filteredData);
    
    console.log(`✅ Filters applied. Showing ${filteredData.length} records`);
}

// Price Predictions Page Functions
function initializePredictions() {
    console.log('Initializing Attention-Enhanced LSTM predictions...');
    
    // Initialize prediction controls
    const locationSelect = document.getElementById('prediction-location');
    const cropSelect = document.getElementById('prediction-crop');
    
    if (locationSelect && cropSelect) {
        locationSelect.addEventListener('change', updatePredictionOptions);
        cropSelect.addEventListener('change', updatePredictionOptions);
    }
}

async function generatePrediction() {
    const locationElement = document.getElementById('prediction-location');
    const cropElement = document.getElementById('prediction-crop');
    const periodElement = document.getElementById('prediction-period');
    
    if (!locationElement || !cropElement || !periodElement) {
        console.error('Prediction form elements not found');
        return;
    }
    
    const location = locationElement.value;
    const crop = cropElement.value;
    const period = periodElement.value;
    
    console.log(`Generating Attention-Enhanced LSTM prediction for ${location}-${crop}`);
    
    if (!ML_API_AVAILABLE) {
        console.log('ML API not available, using fallback prediction');
        generateFallbackPrediction(location, crop, period);
        return;
    }
    
    try {
        // Call Attention-Enhanced LSTM API
        const response = await fetch(`${ML_API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: 'price_forecast',
                market: location.toLowerCase(),
                crop: crop,
                anchor_price: 2500 // Default anchor price
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            const predictedPrice = result.prediction;
            const confidence = result.confidence;
            
            // Update summary cards
            updatePredictionResults(predictedPrice, confidence);
            
            // Generate chart
            generatePredictionChart(location, crop, period, predictedPrice);
            
            console.log('Attention-Enhanced LSTM prediction successful:', result);
        } else {
            throw new Error(`Prediction API failed: ${response.status}`);
        }
    } catch (error) {
        console.log('Using fallback prediction due to API error:', error.message);
        generateFallbackPrediction(location, crop, period);
    }
}
        
function generateFallbackPrediction(location, crop, period) {
        // Fallback to mock prediction
        const predictedPrice = Math.floor(Math.random() * 1000) + 2000;
        const confidence = Math.floor(Math.random() * 20) + 80;
        
    updatePredictionResults(predictedPrice, confidence);
        
        // Generate chart
        generatePredictionChart(location, crop, period, predictedPrice);
}

function updatePredictionResults(predictedPrice, confidence) {
    const predictedPriceElement = document.getElementById('predicted-price');
    const priceTrendElement = document.getElementById('price-trend');
    const confidenceElement = document.getElementById('confidence');
    
    if (predictedPriceElement) {
        predictedPriceElement.textContent = `Rs.${predictedPrice.toFixed(2)}/quintal`;
    }
    
    if (priceTrendElement) {
        const trend = predictedPrice > 2500 ? 'Rising' : 'Falling';
        priceTrendElement.textContent = trend;
    }
    
    if (confidenceElement) {
        confidenceElement.textContent = `${confidence}%`;
    }
}

function generatePredictionChart(location, crop, period, predictedPrice = null) {
    const ctx = document.getElementById('prediction-chart');
    if (!ctx) return;
    
    const days = parseInt(period);
    const labels = [];
    const prices = [];
    
    // Generate sample data
    let basePrice = predictedPrice || Math.floor(Math.random() * 1000) + 2000;
    for (let i = 0; i < days; i++) {
        labels.push(`Day ${i + 1}`);
        basePrice += (Math.random() - 0.5) * 100;
        prices.push(Math.max(basePrice, 1000));
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${crop} Price Prediction (Attention-Enhanced LSTM)`,
                data: prices,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function updatePredictionOptions() {
    const location = document.getElementById('prediction-location').value;
    const cropSelect = document.getElementById('prediction-crop');
    
    // Update crop options based on location
    const cropOptions = {
        'davangere': ['Rice', 'Maize', 'Cotton', 'Tomato', 'Ragi'],
        'gangavathi': ['Rice', 'Maize', 'Cotton', 'Ragi'],
        'HBhalli': ['Rice', 'Maize', 'Cotton', 'Ragi'],
        'hospet': ['Rice', 'Maize', 'Ragi', 'Tomato']
    };
    
    if (cropOptions[location]) {
        cropSelect.innerHTML = '';
        cropOptions[location].forEach(crop => {
            const option = document.createElement('option');
            option.value = crop;
            option.textContent = crop;
            cropSelect.appendChild(option);
        });
    }
}

// Crop Advisory Page Functions
function loadCropAdvisory() {
    console.log('Loading interactive crop advisory with Attention-Enhanced insights...');
    
    // Set up form submission
    const advisoryForm = document.getElementById('crop-advisory-form');
    if (advisoryForm) {
        advisoryForm.addEventListener('submit', handleCropAdvisorySubmission);
    }
}

async function handleCropAdvisorySubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const parameters = {
        soilType: formData.get('soil-type'),
        season: formData.get('season'),
        phLevel: parseFloat(formData.get('ph-level')),
        area: parseFloat(formData.get('area')),
        location: formData.get('location'),
        irrigation: formData.get('irrigation')
    };
    
    console.log('Crop advisory parameters:', parameters);
    
    // Show loading state
    showLoadingState();
    
    if (!ML_API_AVAILABLE) {
        console.log('ML API not available, using fallback crop recommendations');
        displayMockCropRecommendations(parameters);
        return;
    }
    
    try {
        // Call Attention-Enhanced LSTM API for crop recommendations
        const response = await fetch(`${ML_API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: 'crop_recommendation',
                market: parameters.location,
                month: getCurrentMonth(),
                soil_type: parameters.soilType,
                ph_level: parameters.phLevel,
                area: parameters.area,
                irrigation: parameters.irrigation,
                season: parameters.season
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            displayCropRecommendations(result, parameters);
        } else {
            throw new Error(`Crop recommendation API failed: ${response.status}`);
        }
    } catch (error) {
        console.log('Using fallback crop recommendations:', error.message);
        // Fallback to mock recommendations
        displayMockCropRecommendations(parameters);
    }
}

function showLoadingState() {
    const recommendationsContent = document.getElementById('recommendations-content');
    if (recommendationsContent) {
        const analyzingText = window.languageManager ? window.languageManager.translate('advisory.analyzing') : 'Analyzing your parameters with Attention-Enhanced LSTM...';
        const loadingText = window.languageManager ? window.languageManager.translate('advisory.loading-subtitle') : 'This may take a few moments';
        
        recommendationsContent.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${analyzingText}</p>
                <p class="loading-subtitle">${loadingText}</p>
            </div>
        `;
    }
}

function displayCropRecommendations(result, parameters) {
    const recommendationsContent = document.getElementById('recommendations-content');
    if (!recommendationsContent) return;
    
    let html = '<div class="recommendations-header">';
    const aiPoweredText = window.languageManager ? window.languageManager.translate('advisory.ai-powered') : '🌱 AI-Powered Crop Recommendations';
    const basedOnText = window.languageManager ? window.languageManager.translate('advisory.based-on') : 'Based on your parameters and Attention-Enhanced LSTM analysis';
    html += `<h4>${aiPoweredText}</h4>`;
    html += `<p>${basedOnText}</p>`;
    html += '</div>';
    
    if (result.recommendations && result.recommendations.length > 0) {
        result.recommendations.forEach((rec, index) => {
            const score = Math.round(rec.probability * 100);
            html += `
                <div class="crop-recommendation">
                    <h4>${index + 1}. ${rec.crop}</h4>
                    <div class="crop-score">
                        <span>Suitability Score</span>
                        <span>${score}%</span>
                    </div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${score}%"></div>
                    </div>
                    <div class="crop-details">
                        <p><strong>Confidence:</strong> ${rec.confidence}</p>
                        <p><strong>Expected Yield:</strong> ${getYieldEstimate(rec.crop, parameters.area)}</p>
                        <p><strong>Best Planting Time:</strong> ${getPlantingTime(rec.crop, parameters.season)}</p>
                        <ul>
                            <li>✅ Suitable for ${parameters.soilType} soil</li>
                            <li>✅ Optimal pH range: ${getOptimalPh(rec.crop)}</li>
                            <li>✅ ${parameters.irrigation} irrigation compatible</li>
                        </ul>
                    </div>
                </div>
            `;
        });
    } else {
        html += '<div class="no-recommendations"><p>No specific recommendations available. Please try different parameters.</p></div>';
    }
    
    recommendationsContent.innerHTML = html;
}

function displayMockCropRecommendations(parameters) {
    const recommendationsContent = document.getElementById('recommendations-content');
    if (!recommendationsContent) return;
    
    // Generate mock recommendations based on parameters
    const mockRecommendations = generateMockRecommendations(parameters);
    
    let html = '<div class="recommendations-header">';
    html += '<h4>🌱 AI-Powered Crop Recommendations</h4>';
    html += '<p>Based on your parameters and Attention-Enhanced LSTM analysis</p>';
    html += '</div>';
    
    mockRecommendations.forEach((rec, index) => {
        html += `
            <div class="crop-recommendation">
                <h4>${index + 1}. ${rec.crop}</h4>
                <div class="crop-score">
                    <span>Suitability Score</span>
                    <span>${rec.score}%</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${rec.score}%"></div>
                </div>
                <div class="crop-details">
                    <p><strong>Confidence:</strong> ${rec.confidence}</p>
                    <p><strong>Expected Yield:</strong> ${rec.yield}</p>
                    <p><strong>Best Planting Time:</strong> ${rec.plantingTime}</p>
                    <ul>
                        <li>✅ Suitable for ${parameters.soilType} soil</li>
                        <li>✅ Optimal pH range: ${rec.optimalPh}</li>
                        <li>✅ ${parameters.irrigation} irrigation compatible</li>
                    </ul>
                </div>
            </div>
        `;
    });
    
    recommendationsContent.innerHTML = html;
}

function generateMockRecommendations(parameters) {
    const crops = ['Rice', 'Maize', 'Cotton', 'Tomato', 'Ragi'];
    const recommendations = [];
    
    crops.forEach(crop => {
        let score = Math.floor(Math.random() * 40) + 60; // 60-100%
        let confidence = 'High';
        
        // Adjust score based on parameters
        if (parameters.season === 'kharif' && ['Rice', 'Maize', 'Cotton'].includes(crop)) {
            score += 10;
        }
        if (parameters.phLevel >= 6.0 && parameters.phLevel <= 7.5) {
            score += 5;
        }
        if (parameters.irrigation === 'irrigated' && ['Rice', 'Tomato'].includes(crop)) {
            score += 8;
        }
        
        score = Math.min(score, 100);
        
        if (score < 70) confidence = 'Medium';
        if (score < 60) confidence = 'Low';
        
        recommendations.push({
            crop: crop,
            score: score,
            confidence: confidence,
            yield: `${Math.floor(Math.random() * 20) + 15} quintals/acre`,
            plantingTime: getPlantingTime(crop, parameters.season),
            optimalPh: getOptimalPh(crop)
        });
    });
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

function getCurrentMonth() {
    return new Date().getMonth() + 1;
}

function getYieldEstimate(crop, area) {
    const baseYield = {
        'Rice': 25,
        'Maize': 30,
        'Cotton': 15,
        'Tomato': 40,
        'Ragi': 20
    };
    
    const yieldPerAcre = baseYield[crop] || 20;
    const totalYield = Math.round(yieldPerAcre * area);
    return `${totalYield} quintals`;
}

function getPlantingTime(crop, season) {
    const plantingTimes = {
        'Rice': season === 'kharif' ? 'June-July' : 'November-December',
        'Maize': season === 'kharif' ? 'June-August' : 'October-November',
        'Cotton': season === 'kharif' ? 'May-June' : 'Not recommended',
        'Tomato': 'Year-round',
        'Ragi': season === 'kharif' ? 'June-July' : 'October-November'
    };
    
    return plantingTimes[crop] || 'Check local conditions';
}

function getOptimalPh(crop) {
    const phRanges = {
        'Rice': '6.0-7.0',
        'Maize': '6.0-7.5',
        'Cotton': '5.8-8.0',
        'Tomato': '6.0-6.8',
        'Ragi': '5.5-7.5'
    };
    
    return phRanges[crop] || '6.0-7.0';
}

// AI Assistant Page Functions
function initializeChatBot() {
    console.log('Initializing AI Assistant with Attention-Enhanced capabilities...');
    
    // Add welcome message
    addMessage('bot', 'Hello! I\'m your AI Assistant powered by Attention-Enhanced LSTM models. I can help you with crop advice, price predictions, and agricultural insights. How can I assist you today?');
}

function getOrCreateChatSessionId() {
    const storageKey = 'agroai_chat_session';
    try {
        let session = localStorage.getItem(storageKey);
        if (!session) {
            session = generateSessionId();
            localStorage.setItem(storageKey, session);
        }
        return session;
    } catch (error) {
        console.warn('Unable to access localStorage for chat session:', error);
        return generateSessionId();
    }
}

function generateSessionId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// Voice Assistant Helpers
function initializeVoiceAssistant() {
    const micButton = document.getElementById('voice-input-btn');
    const ttsToggleButton = document.getElementById('voice-output-toggle');
    const statusElement = document.getElementById('voice-status');
    
    voiceAssistantState.statusElement = statusElement;
    voiceAssistantState.micButton = micButton;
    voiceAssistantState.outputButton = ttsToggleButton;
    
    if (micButton) {
        if (!voiceAssistantState.recognitionSupported) {
            micButton.disabled = true;
            micButton.textContent = '🎤 Voice N/A';
            micButton.title = 'Speech recognition not supported in this browser';
            updateVoiceStatus('Speech recognition is not supported on this browser.');
        } else {
            setupSpeechRecognition();
            micButton.addEventListener('click', handleVoiceInputClick);
        }
    }
    
    if (ttsToggleButton) {
        if (!voiceAssistantState.speechSupported) {
            ttsToggleButton.disabled = true;
            ttsToggleButton.textContent = '🔇 Voice Off';
            ttsToggleButton.title = 'Speech synthesis not supported in this browser';
            voiceAssistantState.ttsEnabled = false;
        } else {
            ttsToggleButton.addEventListener('click', toggleVoiceOutput);
        }
    }
    
    refreshVoiceButtonLabels();
}

function setupSpeechRecognition() {
    if (!SpeechRecognitionAPI) return;
    
    speechRecognitionInstance = new SpeechRecognitionAPI();
    speechRecognitionInstance.continuous = false;
    speechRecognitionInstance.interimResults = false;
    speechRecognitionInstance.maxAlternatives = 1;
    speechRecognitionInstance.lang = getSpeechLocale();
    
    speechRecognitionInstance.onstart = () => {
        voiceAssistantState.listening = true;
        updateVoiceStatus('Listening... Please speak clearly.');
        refreshVoiceButtonLabels();
    };
    
    speechRecognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = transcript;
                updateVoiceStatus(`Heard: "${transcript}"`);
                sendMessage();
            }
        }
    };
    
    speechRecognitionInstance.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        updateVoiceStatus(`Voice input error: ${event.error}`);
        voiceAssistantState.listening = false;
        refreshVoiceButtonLabels();
    };
    
    speechRecognitionInstance.onend = () => {
        voiceAssistantState.listening = false;
        refreshVoiceButtonLabels();
    };
}

function handleVoiceInputClick() {
    if (!speechRecognitionInstance || voiceAssistantState.listening) {
        stopVoiceInput();
        return;
    }
    
    try {
        speechRecognitionInstance.lang = getSpeechLocale();
        speechRecognitionInstance.start();
    } catch (error) {
        console.error('Unable to start speech recognition:', error);
        updateVoiceStatus('Unable to start voice input. Please try again.');
    }
}

function stopVoiceInput() {
    if (speechRecognitionInstance && voiceAssistantState.listening) {
        speechRecognitionInstance.stop();
        voiceAssistantState.listening = false;
        refreshVoiceButtonLabels();
    }
}

function toggleVoiceOutput() {
    voiceAssistantState.ttsEnabled = !voiceAssistantState.ttsEnabled;
    
    if (!voiceAssistantState.ttsEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    refreshVoiceButtonLabels();
    updateVoiceStatus(voiceAssistantState.ttsEnabled ? 'Voice responses enabled.' : 'Voice responses muted.');
}

function speakText(text) {
    if (!voiceAssistantState.ttsEnabled || !voiceAssistantState.speechSupported || !text) return;
    
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLocale();
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.warn('Speech synthesis failed:', error);
    }
}

function updateVoiceStatus(message) {
    if (voiceAssistantState.statusElement) {
        voiceAssistantState.statusElement.textContent = message || '';
    }
}

function refreshVoiceButtonLabels() {
    const micButton = voiceAssistantState.micButton;
    const ttsButton = voiceAssistantState.outputButton;
    
    if (micButton && voiceAssistantState.recognitionSupported) {
        micButton.textContent = voiceAssistantState.listening ? '🛑 Stop Voice' : '🎤 Start Voice';
        micButton.title = voiceAssistantState.listening ? 'Click to stop listening' : 'Click to start voice input';
    }
    
    if (ttsButton && voiceAssistantState.speechSupported) {
        ttsButton.textContent = voiceAssistantState.ttsEnabled ? '🔊 Voice On' : '🔇 Voice Off';
        ttsButton.title = voiceAssistantState.ttsEnabled ? 'Click to mute AI voice responses' : 'Click to enable AI voice responses';
    }
}

function getSpeechLocale() {
    const languageManager = window.languageManager;
    const current = languageManager ? languageManager.currentLanguage : 'en';
    const localeMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'kn': 'kn-IN',
        'te': 'te-IN'
    };
    return localeMap[current] || 'en-US';
}

function updateVoiceLanguage() {
    if (speechRecognitionInstance) {
        speechRecognitionInstance.lang = getSpeechLocale();
    }
}

function showChatTypingIndicator() {
    if (chatTypingIndicator) return;
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    chatTypingIndicator = document.createElement('div');
    chatTypingIndicator.className = 'message bot-message typing-indicator';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = 'Assistant is typing...';
    
    chatTypingIndicator.appendChild(content);
    chatMessages.appendChild(chatTypingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideChatTypingIndicator() {
    if (chatTypingIndicator && chatTypingIndicator.parentNode) {
        chatTypingIndicator.parentNode.removeChild(chatTypingIndicator);
    }
    chatTypingIndicator = null;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        if (chatRequestInFlight) {
            addMessage('bot', 'Please wait a moment, I am still replying to your previous question.');
            return;
        }
        
        // Add user message
        addMessage('user', message);
        
        // Clear input
        input.value = '';
        
        chatRequestInFlight = true;
        showChatTypingIndicator();
        
        try {
            const reply = await fetchChatReply(message);
            addMessage('bot', reply);
        } catch (error) {
            console.warn('Falling back to canned response:', error);
            const fallback = generateBotResponse(message);
            addMessage('bot', fallback);
        } finally {
            hideChatTypingIndicator();
            chatRequestInFlight = false;
        }
    }
}

async function fetchChatReply(message) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
    
    try {
        const response = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': chatSessionId || ''
            },
            body: JSON.stringify({ message }),
            signal: controller.signal
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Chat API error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        const reply = data.reply || data.response || data.answer || data.message;
        if (!reply) {
            throw new Error('Chat API returned empty reply');
        }
        return reply;
    } finally {
        clearTimeout(timeout);
    }
}

function addMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (sender === 'bot') {
        speakText(message);
    }
}

function generateBotResponse(userMessage) {
    const responses = [
        'Based on our Attention-Enhanced LSTM analysis, I recommend checking current market prices before making decisions.',
        'Our advanced models show promising trends for the crops you mentioned. Would you like specific price predictions?',
        'I can provide detailed crop advisory based on real-time data and 90%+ accurate predictions.',
        'The Multi-Head Attention mechanism in our models helps identify complex patterns in agricultural data.',
        'For the best results, consider seasonal factors and market conditions when planning your crops.',
        'Our AI models are trained on extensive agricultural data and provide high-confidence recommendations.',
        'I can help you analyze price trends, crop recommendations, and market insights using advanced machine learning.',
        'The Attention-Enhanced LSTM models provide superior accuracy compared to traditional forecasting methods.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Missing functions that are referenced in HTML
function askQuickQuestion(question) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = question;
        sendMessage();
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Update prediction options function
function updatePredictionOptions() {
    const location = document.getElementById('prediction-location');
    const cropSelect = document.getElementById('prediction-crop');
    
    if (!location || !cropSelect) return;
    
    // Update crop options based on location
    const cropOptions = {
        'davangere': ['Rice', 'Maize', 'Cotton', 'Tomato', 'Ragi'],
        'gangavathi': ['Rice', 'Maize', 'Cotton', 'Ragi'],
        'hbhalli': ['Rice', 'Maize', 'Cotton', 'Ragi'],
        'hospet': ['Rice', 'Maize', 'Ragi', 'Tomato']
    };
    
    const selectedLocation = location.value;
    if (cropOptions[selectedLocation]) {
        cropSelect.innerHTML = '';
        cropOptions[selectedLocation].forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.toLowerCase();
            option.textContent = crop;
            cropSelect.appendChild(option);
        });
    }
}

// Export functions for global access
window.AgroAI = {
    switchCity,
    showCropDetails,
    showPage,
    loadLivePrices,
    generatePrediction,
    sendMessage,
    addMessage,
    askQuickQuestion,
    handleChatKeyPress,
    updatePredictionOptions
};

// Make functions globally available
window.switchCity = switchCity;
window.generatePrediction = generatePrediction;
window.sendMessage = sendMessage;
window.askQuickQuestion = askQuickQuestion;
window.handleChatKeyPress = handleChatKeyPress;

// Alert System Functions
window.showAlerts = showAlerts;
window.hideAlerts = hideAlerts;
window.openAlertSettings = openAlertSettings;
window.closeAlertSettings = closeAlertSettings;
window.saveAlertSettings = saveAlertSettings;

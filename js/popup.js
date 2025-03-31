/**
 * Main Application Entry Point
 * Initializes and coordinates all modules for the password generator extension
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  const passwordGenerator = new PasswordGenerator();
  const strengthAnalyzer = new PasswordStrengthAnalyzer();
  const preferencesManager = new PreferencesManager();
  const copyHandler = new CopyHandler();
  
  // DOM elements
  const elements = {
    passwordOutput: document.getElementById('password-output'),
    lengthSlider: document.getElementById('length-slider'),
    lengthValue: document.getElementById('length-value'),
    strengthMeterBar: document.getElementById('strength-meter-bar'),
    strengthText: document.getElementById('strength-text'),
    crackTimeElement: document.querySelector('#crack-time .info-value'),
    entropyElement: document.querySelector('#entropy .info-value'),
    combinationsElement: document.querySelector('#combinations .info-value'),
    uppercaseCheckbox: document.getElementById('uppercase'),
    lowercaseCheckbox: document.getElementById('lowercase'),
    numbersCheckbox: document.getElementById('numbers'),
    symbolsCheckbox: document.getElementById('symbols'),
    excludeSimilarCheckbox: document.getElementById('exclude-similar')
  };
  
  // Load user preferences
  preferencesManager.loadPreferences().then(prefs => {
    // Apply preferences to UI
    preferencesManager.applyPreferencesToUI(elements);
    
    // Generate initial password
    generateAndUpdatePassword();
    
    // Set up event listeners
    setupEventListeners();
  });
  
  /**
   * Set up event listeners for UI interactions
   */
  function setupEventListeners() {
    // Length slider
    elements.lengthSlider.addEventListener('input', () => {
      elements.lengthValue.textContent = elements.lengthSlider.value;
      generateAndUpdatePassword();
    });
    
    // Checkboxes
    const checkboxes = [
      elements.uppercaseCheckbox, 
      elements.lowercaseCheckbox, 
      elements.numbersCheckbox, 
      elements.symbolsCheckbox, 
      elements.excludeSimilarCheckbox
    ];
    
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Prevent unchecking all character set options
        if (!elements.uppercaseCheckbox.checked && 
            !elements.lowercaseCheckbox.checked && 
            !elements.numbersCheckbox.checked && 
            !elements.symbolsCheckbox.checked) {
          checkbox.checked = true;
          showTooltip(checkbox, "At least one character set must be selected");
        } else {
          generateAndUpdatePassword();
        }
        
        // Save preferences after change
        preferencesManager.updatePreferencesFromUI(elements);
      });
    });
  }
  
  /**
   * Generate a new password and update the UI
   */
  function generateAndUpdatePassword() {
    // Get current options from UI
    const options = {
      length: parseInt(elements.lengthSlider.value),
      uppercase: elements.uppercaseCheckbox.checked,
      lowercase: elements.lowercaseCheckbox.checked,
      numbers: elements.numbersCheckbox.checked,
      symbols: elements.symbolsCheckbox.checked,
      excludeSimilar: elements.excludeSimilarCheckbox.checked
    };
    
    // Update generator options
    passwordGenerator.setOptions(options);
    
    // Generate password
    const password = passwordGenerator.generatePassword();
    elements.passwordOutput.value = password;
    
    // Analyze password strength
    const strengthMetrics = strengthAnalyzer.analyzePassword(password, options);
    
    // Update UI with strength metrics
    updateStrengthUI(strengthMetrics);
    
    // Save preferences
    preferencesManager.updatePreferencesFromUI(elements);
  }
  
  /**
   * Update the UI with password strength metrics
   * @param {Object} metrics - Password strength metrics
   */
  function updateStrengthUI(metrics) {
    // Update strength meter
    elements.strengthMeterBar.style.width = `${metrics.strengthPercentage}%`;
    
    // Update strength text
    elements.strengthText.textContent = capitalizeFirstLetter(metrics.strengthLevel.replace('-', ' '));
    
    // Set color based on strength level
    elements.strengthText.style.color = metrics.strengthColor;
    elements.strengthMeterBar.style.background = metrics.strengthColor;
    
    // Update info elements
    elements.crackTimeElement.textContent = metrics.crackTimeFormatted;
    elements.entropyElement.textContent = `${metrics.entropy} bits`;
    elements.combinationsElement.textContent = metrics.combinationsFormatted;
  }
  
  /**
   * Show a tooltip message
   * @param {HTMLElement} element - Element to show tooltip on
   * @param {string} message - Message to display
   */
  function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dynamic-tooltip';
    tooltip.textContent = message;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.backgroundColor = 'var(--surface-color)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.boxShadow = '0 2px 5px var(--shadow-color)';
    tooltip.style.zIndex = '10';
    
    setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 300);
    }, 2000);
  }
  
  /**
   * Capitalize the first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});

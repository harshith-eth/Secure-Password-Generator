/**
 * User Preferences Module
 * Handles saving and loading user preferences for the password generator
 */

class PreferencesManager {
  constructor() {
    // Default preferences
    this.defaultPreferences = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      theme: 'dark',
      autoGenerate: true
    };
    
    // Initialize
    this.preferences = { ...this.defaultPreferences };
    this.saveTimeout = null;
  }
  
  /**
   * Load user preferences from Chrome storage
   * @returns {Promise} Promise resolving to loaded preferences
   */
  loadPreferences() {
    return new Promise((resolve) => {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('passwordGeneratorPrefs', (data) => {
          if (data && data.passwordGeneratorPrefs) {
            this.preferences = { ...this.defaultPreferences, ...data.passwordGeneratorPrefs };
          }
          resolve(this.preferences);
        });
      } else {
        // Fallback to localStorage if Chrome storage is not available
        try {
          const savedPrefs = localStorage.getItem('passwordGeneratorPrefs');
          if (savedPrefs) {
            this.preferences = { ...this.defaultPreferences, ...JSON.parse(savedPrefs) };
          }
        } catch (e) {
          console.error('Error loading preferences from localStorage:', e);
        }
        resolve(this.preferences);
      }
    });
  }
  
  /**
   * Save user preferences to Chrome storage with debouncing
   * @param {Object} newPreferences - New preferences to save
   * @returns {Promise} Promise resolving when preferences are saved
   */
  savePreferences(newPreferences) {
    // Update current preferences immediately
    this.preferences = { ...this.preferences, ...newPreferences };
    
    // Clear any pending save timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    return new Promise((resolve) => {
      // Debounce the save operation by 1 second
      this.saveTimeout = setTimeout(() => {
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ 'passwordGeneratorPrefs': this.preferences }, () => {
            resolve(this.preferences);
          });
        } else {
          // Fallback to localStorage if Chrome storage is not available
          try {
            localStorage.setItem('passwordGeneratorPrefs', JSON.stringify(this.preferences));
          } catch (e) {
            console.error('Error saving preferences to localStorage:', e);
          }
          resolve(this.preferences);
        }
      }, 1000); // 1 second delay
    });
  }
  
  /**
   * Reset preferences to defaults
   * @returns {Promise} Promise resolving when preferences are reset
   */
  resetToDefaults() {
    return this.savePreferences(this.defaultPreferences);
  }
  
  /**
   * Apply loaded preferences to UI elements
   * @param {Object} elements - Object containing UI element references
   */
  applyPreferencesToUI(elements) {
    // Apply length
    if (elements.lengthSlider && elements.lengthValue) {
      elements.lengthSlider.value = this.preferences.length;
      elements.lengthValue.textContent = this.preferences.length;
    }
    
    // Apply checkboxes
    if (elements.uppercaseCheckbox) {
      elements.uppercaseCheckbox.checked = this.preferences.uppercase;
    }
    
    if (elements.lowercaseCheckbox) {
      elements.lowercaseCheckbox.checked = this.preferences.lowercase;
    }
    
    if (elements.numbersCheckbox) {
      elements.numbersCheckbox.checked = this.preferences.numbers;
    }
    
    if (elements.symbolsCheckbox) {
      elements.symbolsCheckbox.checked = this.preferences.symbols;
    }
    
    if (elements.excludeSimilarCheckbox) {
      elements.excludeSimilarCheckbox.checked = this.preferences.excludeSimilar;
    }
    
    // Apply theme if theme switcher exists
    if (elements.themeSwitcher) {
      elements.themeSwitcher.value = this.preferences.theme;
      this.applyTheme(this.preferences.theme);
    }
    
    // Apply auto-generate setting if it exists
    if (elements.autoGenerateCheckbox) {
      elements.autoGenerateCheckbox.checked = this.preferences.autoGenerate;
    }
  }
  
  /**
   * Apply theme to the UI
   * @param {string} theme - Theme name ('dark' or 'light')
   */
  applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }
  
  /**
   * Get current preferences
   * @returns {Object} Current preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }
  
  /**
   * Update preferences from UI elements
   * @param {Object} elements - Object containing UI element references
   * @returns {Object} Updated preferences
   */
  updatePreferencesFromUI(elements) {
    const updatedPrefs = {};
    
    // Get length
    if (elements.lengthSlider) {
      updatedPrefs.length = parseInt(elements.lengthSlider.value);
    }
    
    // Get checkboxes
    if (elements.uppercaseCheckbox) {
      updatedPrefs.uppercase = elements.uppercaseCheckbox.checked;
    }
    
    if (elements.lowercaseCheckbox) {
      updatedPrefs.lowercase = elements.lowercaseCheckbox.checked;
    }
    
    if (elements.numbersCheckbox) {
      updatedPrefs.numbers = elements.numbersCheckbox.checked;
    }
    
    if (elements.symbolsCheckbox) {
      updatedPrefs.symbols = elements.symbolsCheckbox.checked;
    }
    
    if (elements.excludeSimilarCheckbox) {
      updatedPrefs.excludeSimilar = elements.excludeSimilarCheckbox.checked;
    }
    
    // Get theme if theme switcher exists
    if (elements.themeSwitcher) {
      updatedPrefs.theme = elements.themeSwitcher.value;
    }
    
    // Get auto-generate setting if it exists
    if (elements.autoGenerateCheckbox) {
      updatedPrefs.autoGenerate = elements.autoGenerateCheckbox.checked;
    }
    
    // Save the updated preferences
    this.savePreferences(updatedPrefs);
    
    return this.preferences;
  }
}

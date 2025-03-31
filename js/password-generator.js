/**
 * Password Generator Logic
 * Implements secure random password generation with customizable options
 */

class PasswordGenerator {
  constructor() {
    // Character sets
    this.uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    this.numberChars = '0123456789';
    this.symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    this.similarChars = '1lI0O';
    
    // Default options
    this.options = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false
    };
  }

  /**
   * Set password generation options
   * @param {Object} options - Password generation options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Generate a secure random password based on current options
   * @returns {string} Generated password
   */
  generatePassword() {
    let charset = '';
    let password = '';
    
    // Build character set based on selected options
    if (this.options.uppercase) charset += this.uppercaseChars;
    if (this.options.lowercase) charset += this.lowercaseChars;
    if (this.options.numbers) charset += this.numberChars;
    if (this.options.symbols) charset += this.symbolChars;
    
    // Remove similar characters if option is selected
    if (this.options.excludeSimilar) {
      for (let i = 0; i < this.similarChars.length; i++) {
        charset = charset.replace(this.similarChars[i], '');
      }
    }
    
    // Ensure at least one character set is selected
    if (charset.length === 0) {
      charset = this.lowercaseChars + this.numberChars;
    }
    
    // Generate initial password
    for (let i = 0; i < this.options.length; i++) {
      const randomIndex = this.getSecureRandomInt(0, charset.length - 1);
      password += charset[randomIndex];
    }
    
    // Ensure all selected character types are included
    password = this.ensureAllCharTypes(password, charset);
    
    return password;
  }

  /**
   * Ensure the password contains at least one character from each selected type
   * @param {string} password - Initial password
   * @param {string} charset - Full character set
   * @returns {string} Modified password with all required character types
   */
  ensureAllCharTypes(password, charset) {
    let modifiedPassword = password;
    const requiredSets = [];
    
    if (this.options.uppercase) requiredSets.push(this.uppercaseChars);
    if (this.options.lowercase) requiredSets.push(this.lowercaseChars);
    if (this.options.numbers) requiredSets.push(this.numberChars);
    if (this.options.symbols) requiredSets.push(this.symbolChars);
    
    // Check if each required set is represented in the password
    for (const charSet of requiredSets) {
      let hasCharFromSet = false;
      
      // Skip if we're excluding similar characters and the entire set would be excluded
      if (this.options.excludeSimilar && charSet.split('').every(char => this.similarChars.includes(char))) {
        continue;
      }
      
      // Check if password already has a character from this set
      for (const char of modifiedPassword) {
        if (charSet.includes(char)) {
          hasCharFromSet = true;
          break;
        }
      }
      
      // If not, replace a random character with one from this set
      if (!hasCharFromSet && charSet.length > 0) {
        let validChars = charSet;
        
        // Remove similar characters if option is selected
        if (this.options.excludeSimilar) {
          for (let i = 0; i < this.similarChars.length; i++) {
            validChars = validChars.replace(this.similarChars[i], '');
          }
        }
        
        // Only proceed if we have valid characters after filtering
        if (validChars.length > 0) {
          const randomCharFromSet = validChars[this.getSecureRandomInt(0, validChars.length - 1)];
          const randomPositionToReplace = this.getSecureRandomInt(0, modifiedPassword.length - 1);
          
          modifiedPassword = 
            modifiedPassword.substring(0, randomPositionToReplace) + 
            randomCharFromSet + 
            modifiedPassword.substring(randomPositionToReplace + 1);
        }
      }
    }
    
    return modifiedPassword;
  }

  /**
   * Generate a cryptographically secure random integer
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer between min and max
   */
  getSecureRandomInt(min, max) {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const array = new Uint8Array(bytesNeeded);
    
    window.crypto.getRandomValues(array);
    
    let value = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      value = (value * 256) + array[i];
    }
    
    // Ensure uniform distribution
    if (value >= maxValue - (maxValue % range)) {
      return this.getSecureRandomInt(min, max); // Try again
    }
    
    return min + (value % range);
  }

  /**
   * Calculate password strength and related metrics
   * @param {string} password - Password to analyze
   * @returns {Object} Strength metrics including entropy, crack time, and strength level
   */
  calculateStrength(password) {
    // Calculate character set size
    let charsetSize = 0;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33;
    
    // Calculate entropy (bits)
    const entropy = Math.log2(Math.pow(charsetSize, password.length));
    
    // Estimate crack time (in seconds)
    // Assuming 10 billion guesses per second for a modern attacker
    const guessesPerSecond = 10000000000;
    const possibleCombinations = Math.pow(2, entropy);
    const secondsToCrack = possibleCombinations / guessesPerSecond / 2; // Average case is half of total
    
    // Determine strength level
    let strengthLevel;
    if (entropy < 40) strengthLevel = 'weak';
    else if (entropy < 60) strengthLevel = 'medium';
    else if (entropy < 80) strengthLevel = 'strong';
    else strengthLevel = 'very-strong';
    
    // Format crack time for display
    const crackTimeFormatted = this.formatCrackTime(secondsToCrack);
    
    return {
      entropy: Math.round(entropy),
      possibleCombinations: possibleCombinations,
      crackTime: secondsToCrack,
      crackTimeFormatted: crackTimeFormatted,
      strengthLevel: strengthLevel,
      strengthPercentage: Math.min(100, Math.round((entropy / 100) * 100))
    };
  }

  /**
   * Format crack time in a human-readable format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatCrackTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
      return `${Math.round(seconds / 3600)} hours`;
    } else if (seconds < 31536000) {
      return `${Math.round(seconds / 86400)} days`;
    } else if (seconds < 31536000 * 100) {
      return `${Math.round(seconds / 31536000)} years`;
    } else if (seconds < 31536000 * 1000) {
      return `${Math.round(seconds / 31536000 / 100)} hundred years`;
    } else if (seconds < 31536000 * 1000000) {
      return `${Math.round(seconds / 31536000 / 1000)} thousand years`;
    } else if (seconds < 31536000 * 1000000000) {
      return `${Math.round(seconds / 31536000 / 1000000)} million years`;
    } else {
      return `${Math.round(seconds / 31536000 / 1000000000)} billion years`;
    }
  }

  /**
   * Format a large number with commas for readability
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else if (num < 1000000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num < 1000000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else {
      return `${(num / 1000000000000).toFixed(1)}T`;
    }
  }
}

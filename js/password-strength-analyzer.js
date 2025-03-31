/**
 * Password Strength Analysis Module
 * Provides detailed analysis of password strength and security metrics
 */

class PasswordStrengthAnalyzer {
  constructor() {
    // Constants for strength calculation
    this.GUESSES_PER_SECOND = 10000000000; // 10 billion guesses per second (modern attacker)
    this.STRENGTH_LEVELS = {
      VERY_WEAK: { min: 0, max: 30, label: 'Very Weak', color: '#FF5252' },
      WEAK: { min: 30, max: 50, label: 'Weak', color: '#FF5252' },
      MEDIUM: { min: 50, max: 70, label: 'Medium', color: '#FFAB00' },
      STRONG: { min: 70, max: 90, label: 'Strong', color: '#00C853' },
      VERY_STRONG: { min: 90, max: Infinity, label: 'Very Strong', color: '#64FFDA' }
    };
    
    // Common password patterns
    this.COMMON_PATTERNS = [
      /^[a-z]+$/i, // letters only
      /^[0-9]+$/, // numbers only
      /^[a-z0-9]+$/i, // alphanumeric only
      /^[a-z]{3,8}[0-9]{1,4}$/i, // common pattern: word + numbers
      /^(password|pass|admin|user|login)[0-9]*$/i, // common password words
      /^(qwerty|asdf|zxcv|1234|0000)/, // keyboard patterns
      /(.)\1{2,}/ // repeated characters
    ];
    
    // Security standards
    this.SECURITY_STANDARDS = {
      NIST: { minLength: 8, requiresComplexity: false },
      OWASP: { minLength: 10, requiresComplexity: true },
      MICROSOFT: { minLength: 8, requiresComplexity: true }
    };
  }

  /**
   * Analyze password strength and security
   * @param {string} password - Password to analyze
   * @param {Object} options - Character set options used to generate the password
   * @returns {Object} Comprehensive strength analysis
   */
  analyzePassword(password, options) {
    // Calculate basic metrics
    const entropy = this.calculateEntropy(password);
    const strengthLevel = this.getStrengthLevel(entropy);
    const crackTime = this.calculateCrackTime(entropy);
    const combinations = Math.pow(2, entropy);
    
    // Check for common patterns
    const hasCommonPatterns = this.checkForCommonPatterns(password);
    
    // Check compliance with security standards
    const securityStandardsCompliance = this.checkSecurityStandards(password, options);
    
    // Calculate strength percentage (for UI meter)
    const strengthPercentage = Math.min(100, Math.round((entropy / 100) * 100));
    
    // Detailed analysis with recommendations
    const analysis = this.generateDetailedAnalysis(password, options, entropy, hasCommonPatterns);
    
    return {
      entropy: Math.round(entropy),
      strengthLevel: strengthLevel.label.toLowerCase().replace(' ', '-'),
      strengthColor: strengthLevel.color,
      crackTime: crackTime,
      crackTimeFormatted: this.formatCrackTime(crackTime),
      combinations: combinations,
      combinationsFormatted: this.formatLargeNumber(combinations),
      strengthPercentage: strengthPercentage,
      hasCommonPatterns: hasCommonPatterns,
      securityStandardsCompliance: securityStandardsCompliance,
      analysis: analysis
    };
  }

  /**
   * Calculate password entropy (bits)
   * @param {string} password - Password to analyze
   * @returns {number} Entropy in bits
   */
  calculateEntropy(password) {
    // Calculate character set size
    let charsetSize = 0;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33;
    
    // Apply length-based entropy calculation
    const baseEntropy = Math.log2(Math.pow(charsetSize, password.length));
    
    // Apply penalties for patterns
    let entropyPenalty = 0;
    
    // Check for repeated characters
    const repeatedChars = password.match(/(.)\1+/g);
    if (repeatedChars) {
      entropyPenalty += repeatedChars.reduce((total, match) => total + match.length - 1, 0) * 0.5;
    }
    
    // Check for sequential characters
    const sequentialChars = this.checkForSequentialChars(password);
    entropyPenalty += sequentialChars * 0.8;
    
    // Apply penalty for common patterns
    if (this.checkForCommonPatterns(password)) {
      entropyPenalty += password.length * 0.2;
    }
    
    return Math.max(0, baseEntropy - entropyPenalty);
  }

  /**
   * Check for sequential characters in password
   * @param {string} password - Password to check
   * @returns {number} Number of sequential characters found
   */
  checkForSequentialChars(password) {
    let sequentialCount = 0;
    const lowerPassword = password.toLowerCase();
    
    // Check for alphabetical sequences
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < alphabet.length - 2; i++) {
      const sequence = alphabet.substring(i, i + 3);
      if (lowerPassword.includes(sequence)) {
        sequentialCount += sequence.length;
      }
    }
    
    // Check for numerical sequences
    const numbers = '0123456789';
    for (let i = 0; i < numbers.length - 2; i++) {
      const sequence = numbers.substring(i, i + 3);
      if (password.includes(sequence)) {
        sequentialCount += sequence.length;
      }
    }
    
    return sequentialCount;
  }

  /**
   * Check if password contains common patterns
   * @param {string} password - Password to check
   * @returns {boolean} True if common patterns are found
   */
  checkForCommonPatterns(password) {
    return this.COMMON_PATTERNS.some(pattern => pattern.test(password));
  }

  /**
   * Get strength level based on entropy
   * @param {number} entropy - Password entropy in bits
   * @returns {Object} Strength level object
   */
  getStrengthLevel(entropy) {
    for (const [level, range] of Object.entries(this.STRENGTH_LEVELS)) {
      if (entropy >= range.min && entropy < range.max) {
        return range;
      }
    }
    return this.STRENGTH_LEVELS.VERY_STRONG;
  }

  /**
   * Calculate time to crack password (in seconds)
   * @param {number} entropy - Password entropy in bits
   * @returns {number} Time to crack in seconds
   */
  calculateCrackTime(entropy) {
    const possibleCombinations = Math.pow(2, entropy);
    return possibleCombinations / this.GUESSES_PER_SECOND / 2; // Average case is half of total
  }

  /**
   * Check if password meets common security standards
   * @param {string} password - Password to check
   * @param {Object} options - Character set options
   * @returns {Object} Compliance with security standards
   */
  checkSecurityStandards(password, options) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const hasComplexity = (hasUppercase + hasLowercase + hasNumbers + hasSymbols) >= 3;
    
    return {
      NIST: password.length >= this.SECURITY_STANDARDS.NIST.minLength,
      OWASP: password.length >= this.SECURITY_STANDARDS.OWASP.minLength && 
             (hasComplexity || !this.SECURITY_STANDARDS.OWASP.requiresComplexity),
      MICROSOFT: password.length >= this.SECURITY_STANDARDS.MICROSOFT.minLength && 
                (hasComplexity || !this.SECURITY_STANDARDS.MICROSOFT.requiresComplexity)
    };
  }

  /**
   * Generate detailed analysis with recommendations
   * @param {string} password - Password to analyze
   * @param {Object} options - Character set options
   * @param {number} entropy - Password entropy
   * @param {boolean} hasCommonPatterns - Whether password has common patterns
   * @returns {Object} Detailed analysis with recommendations
   */
  generateDetailedAnalysis(password, options, entropy, hasCommonPatterns) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // Analyze strengths
    if (password.length >= 12) {
      analysis.strengths.push('Good password length');
    }
    
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      analysis.strengths.push('Excellent character diversity');
    } else if ((/[A-Z]/.test(password) || /[a-z]/.test(password)) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      analysis.strengths.push('Good character diversity');
    }
    
    if (!hasCommonPatterns) {
      analysis.strengths.push('No common patterns detected');
    }
    
    // Analyze weaknesses
    if (password.length < 10) {
      analysis.weaknesses.push('Password is too short');
    }
    
    if (!(/[A-Z]/.test(password))) {
      analysis.weaknesses.push('No uppercase letters');
    }
    
    if (!(/[a-z]/.test(password))) {
      analysis.weaknesses.push('No lowercase letters');
    }
    
    if (!(/[0-9]/.test(password))) {
      analysis.weaknesses.push('No numbers');
    }
    
    if (!(/[^A-Za-z0-9]/.test(password))) {
      analysis.weaknesses.push('No special characters');
    }
    
    if (hasCommonPatterns) {
      analysis.weaknesses.push('Contains common patterns');
    }
    
    // Generate recommendations
    if (password.length < 12) {
      analysis.recommendations.push('Increase password length to at least 12 characters');
    }
    
    if (!options.uppercase || !options.lowercase || !options.numbers || !options.symbols) {
      analysis.recommendations.push('Enable all character types for maximum security');
    }
    
    if (hasCommonPatterns) {
      analysis.recommendations.push('Avoid common patterns and sequences');
    }
    
    if (entropy < 70) {
      analysis.recommendations.push('Generate a new password with higher complexity');
    }
    
    return analysis;
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
   * Format a large number with appropriate suffix
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatLargeNumber(num) {
    if (num < 1e3) return num.toString();
    if (num < 1e6) return `${(num / 1e3).toFixed(1)} thousand`;
    if (num < 1e9) return `${(num / 1e6).toFixed(1)} million`;
    if (num < 1e12) return `${(num / 1e9).toFixed(1)} billion`;
    if (num < 1e15) return `${(num / 1e12).toFixed(1)} trillion`;
    if (num < 1e18) return `${(num / 1e15).toFixed(1)} quadrillion`;
    return `${(num / 1e18).toFixed(1)} quintillion`;
  }
}

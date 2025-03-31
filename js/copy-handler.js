/**
 * Copy Functionality Module
 * Handles copying passwords to clipboard with visual feedback
 */

class CopyHandler {
  constructor() {
    this.copyButton = document.getElementById('copy-button');
    this.passwordOutput = document.getElementById('password-output');
    this.copyNotification = document.getElementById('copy-notification');
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize copy functionality
   */
  init() {
    if (this.copyButton) {
      this.copyButton.addEventListener('click', () => this.copyToClipboard());
    }
  }
  
  /**
   * Copy password to clipboard with visual feedback
   */
  copyToClipboard() {
    // Select the password text
    this.passwordOutput.select();
    this.passwordOutput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy to clipboard
    try {
      // Use modern clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.passwordOutput.value)
          .then(() => this.showCopyFeedback())
          .catch(err => this.handleCopyError(err));
      } else {
        // Fallback to document.execCommand
        const successful = document.execCommand('copy');
        if (successful) {
          this.showCopyFeedback();
        } else {
          this.handleCopyError(new Error('execCommand copy failed'));
        }
      }
    } catch (err) {
      this.handleCopyError(err);
    }
  }
  
  /**
   * Show visual feedback after successful copy
   */
  showCopyFeedback() {
    // Button animation
    this.copyButton.classList.add('active');
    setTimeout(() => this.copyButton.classList.remove('active'), 300);
    
    // Add success class to button temporarily
    this.copyButton.classList.add('copy-success');
    setTimeout(() => this.copyButton.classList.remove('copy-success'), 1500);
    
    // Change button text temporarily
    const originalText = this.copyButton.innerHTML;
    this.copyButton.innerHTML = '<span class="button-text">Copied!</span><span class="button-edge"></span><span class="button-shadow"></span>';
    setTimeout(() => {
      this.copyButton.innerHTML = originalText;
    }, 1500);
    
    // Show notification
    this.showNotification('Password copied to clipboard!', 'success');
    
    // Trigger confetti effect
    this.triggerConfettiEffect();
  }
  
  /**
   * Handle copy errors
   * @param {Error} error - The error that occurred
   */
  handleCopyError(error) {
    console.error('Copy failed:', error);
    
    // Show error notification
    this.showNotification('Failed to copy password', 'error');
    
    // Visual feedback for error
    this.copyButton.classList.add('copy-error');
    setTimeout(() => this.copyButton.classList.remove('copy-error'), 1500);
  }
  
  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, warning)
   */
  showNotification(message, type = 'success') {
    // Update notification content
    this.copyNotification.textContent = message;
    
    // Add appropriate class based on type
    this.copyNotification.className = 'copy-notification';
    this.copyNotification.classList.add(`notification-${type}`);
    
    // Show notification
    this.copyNotification.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
      this.copyNotification.classList.remove('show');
    }, 2000);
  }
  
  /**
   * Create a simple confetti effect
   */
  triggerConfettiEffect() {
    // Create confetti container if it doesn't exist
    let confettiContainer = document.getElementById('confetti-container');
    
    if (!confettiContainer) {
      confettiContainer = document.createElement('div');
      confettiContainer.id = 'confetti-container';
      confettiContainer.style.position = 'fixed';
      confettiContainer.style.top = '0';
      confettiContainer.style.left = '0';
      confettiContainer.style.width = '100%';
      confettiContainer.style.height = '100%';
      confettiContainer.style.pointerEvents = 'none';
      confettiContainer.style.zIndex = '9999';
      document.body.appendChild(confettiContainer);
    }
    
    // Clear any existing confetti
    confettiContainer.innerHTML = '';
    
    // Create confetti pieces
    const colors = ['#6200EA', '#FF5722', '#00C853', '#FFAB00', '#64FFDA'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      
      // Random properties
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const width = Math.random() * 10 + 5;
      const height = Math.random() * 6 + 3;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      
      // Style confetti piece
      confetti.style.position = 'absolute';
      confetti.style.backgroundColor = color;
      confetti.style.width = `${width}px`;
      confetti.style.height = `${height}px`;
      confetti.style.left = `${left}%`;
      confetti.style.top = '-20px';
      confetti.style.opacity = '1';
      confetti.style.transform = 'rotate(0deg)';
      confetti.style.borderRadius = '2px';
      confetti.style.animation = `confetti-fall ${duration}s ease-in ${delay}s forwards`;
      
      // Add to container
      confettiContainer.appendChild(confetti);
    }
    
    // Add animation style if not already present
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
      confettiContainer.innerHTML = '';
    }, 5000);
  }
}

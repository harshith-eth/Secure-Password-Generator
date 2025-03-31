/**
 * NeoPop Integration
 * Integrates NeoPop design elements into the password generator UI
 */

document.addEventListener('DOMContentLoaded', () => {
  // Apply NeoPop styling to elements
  applyNeopopStyling();
  
  // Add event listeners for NeoPop effects
  addNeopopEffects();
});

/**
 * Apply NeoPop styling to UI elements
 */
function applyNeopopStyling() {
  // Add NeoPop styling to buttons
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.classList.add('neopop-button');
    
    // Add 3D effect with pseudo-elements
    copyButton.innerHTML = `
      <span class="button-text">Copy</span>
      <span class="button-edge"></span>
      <span class="button-shadow"></span>
    `;
  }
  
  // Add NeoPop styling to slider
  const lengthSlider = document.getElementById('length-slider');
  if (lengthSlider) {
    lengthSlider.classList.add('neopop-slider');
    
    // Create custom slider track and thumb
    const sliderContainer = lengthSlider.parentElement;
    sliderContainer.classList.add('neopop-slider-container');
  }
  
  // Add NeoPop styling to checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const label = checkbox.parentElement;
    label.classList.add('neopop-checkbox-label');
    
    // Create custom checkbox design
    const customCheckbox = document.createElement('span');
    customCheckbox.classList.add('neopop-checkbox');
    checkbox.after(customCheckbox);
    
    // Hide original checkbox
    checkbox.style.opacity = '0';
    checkbox.style.position = 'absolute';
  });
  
  // Add NeoPop styling to password display
  const passwordDisplay = document.querySelector('.password-display');
  if (passwordDisplay) {
    passwordDisplay.classList.add('neopop-display');
  }
  
  // Add NeoPop styling to strength meter
  const strengthMeter = document.querySelector('.meter-container');
  if (strengthMeter) {
    strengthMeter.classList.add('neopop-meter');
  }
}

/**
 * Add NeoPop interaction effects
 */
function addNeopopEffects() {
  // Add click effects to buttons
  const buttons = document.querySelectorAll('.neopop-button');
  buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
      button.classList.add('neopop-pressed');
    });
    
    button.addEventListener('mouseup', () => {
      button.classList.remove('neopop-pressed');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('neopop-pressed');
    });
  });
  
  // Add hover effects to interactive elements
  const interactiveElements = document.querySelectorAll('.neopop-button, .neopop-checkbox-label');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('neopop-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      element.classList.remove('neopop-hover');
    });
  });
  
  // Add custom checkbox behavior
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const customCheckbox = checkbox.nextElementSibling;
    
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        customCheckbox.classList.add('neopop-checked');
      } else {
        customCheckbox.classList.remove('neopop-checked');
      }
    });
    
    // Initialize state
    if (checkbox.checked) {
      customCheckbox.classList.add('neopop-checked');
    }
  });
}

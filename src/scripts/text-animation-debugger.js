/**
 * Text Animation Debugger
 * Interactive panel to test and modify text animation parameters
 */

import { cleanupTextAnimations, initTextAnimations } from './text-animations.js';

class TextAnimationDebugger {
  constructor() {
    this.panel = null;
    this.selectedElement = null;
    this.elements = [];
    this.isMinimized = false;
  }

  /**
   * Initialize the debugger
   */
  init() {
    this.createPanel();
    this.scanElements();
    this.attachEventListeners();
  }

  /**
   * Create the debugger panel UI
   */
  createPanel() {
    // Remove existing panel if any
    const existing = document.querySelector('.text-debugger');
    if (existing) {
      existing.remove();
    }

    const panel = document.createElement('div');
    panel.className = 'text-debugger';
    panel.dataset.lenisPrevent = true;
    panel.innerHTML = `
      <div class="text-debugger-header">
        <h3 class="text-debugger-title">Text Animations</h3>
        <button class="text-debugger-toggle" title="Minimize">−</button>
      </div>

      <div class="text-debugger-content">
        <div class="text-debugger-section">
          <div class="text-debugger-section-title">Elements</div>
          <div class="text-debugger-elements" data-lenis-prevent id="debugger-elements"></div>
        </div>

        <div class="text-debugger-controls" id="debugger-controls">
          <div class="text-debugger-section">
            <div class="text-debugger-section-title">Configuration</div>
            
            <div class="text-debugger-control">
              <label class="text-debugger-label">Split Type</label>
              <select class="text-debugger-select" id="debugger-split">
                <option value="chars">Characters</option>
                <option value="words">Words</option>
                <option value="lines">Lines</option>
              </select>
            </div>

            <div class="text-debugger-control">
              <label class="text-debugger-label">Animation</label>
              <select class="text-debugger-select" id="debugger-animation">
                <option value="fade">Fade</option>
                <option value="slideUp">Slide Up</option>
                <option value="slideDown">Slide Down</option>
                <option value="scale">Scale</option>
              </select>
            </div>

            <div class="text-debugger-control">
              <label class="text-debugger-label">Stagger</label>
              <div class="text-debugger-range-container">
                <input 
                  type="range" 
                  class="text-debugger-range" 
                  id="debugger-stagger"
                  min="0" 
                  max="0.2" 
                  step="0.01" 
                  value="0.02"
                >
                <span class="text-debugger-range-value" id="debugger-stagger-value">0.02s</span>
              </div>
            </div>

            <div class="text-debugger-control">
              <label class="text-debugger-label">Duration</label>
              <div class="text-debugger-range-container">
                <input 
                  type="range" 
                  class="text-debugger-range" 
                  id="debugger-duration"
                  min="0.1" 
                  max="2" 
                  step="0.1" 
                  value="0.6"
                >
                <span class="text-debugger-range-value" id="debugger-duration-value">0.6s</span>
              </div>
            </div>

            <div class="text-debugger-control">
              <label class="text-debugger-label">Trigger</label>
              <select class="text-debugger-select" id="debugger-trigger">
                <option value="scroll">On Scroll</option>
                <option value="load">On Load</option>
              </select>
            </div>

            <button class="text-debugger-button" id="debugger-replay">
              ▶ Replay Animation
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;
  }

  /**
   * Scan for all elements with text animations
   */
  scanElements() {
    const elements = document.querySelectorAll('[data-text-split]');
    this.elements = Array.from(elements);

    const container = document.getElementById('debugger-elements');

    if (this.elements.length === 0) {
      container.innerHTML = '<div class="text-debugger-empty">No animated text elements found</div>';
      return;
    }

    container.innerHTML = '';

    this.elements.forEach((element, index) => {
      const elementDiv = document.createElement('div');
      elementDiv.className = 'text-debugger-element';
      elementDiv.dataset.index = index;

      const text = element.textContent.trim().substring(0, 40);
      const split = element.dataset.textSplit || 'chars';
      const animation = element.dataset.textAnimation || 'fade';

      elementDiv.innerHTML = `
        <span class="text-debugger-element-label">Element ${index + 1}</span>
        <span class="text-debugger-element-info">${text}${text.length >= 40 ? '...' : ''}</span>
        <span class="text-debugger-element-info">${split} • ${animation}</span>
      `;

      elementDiv.addEventListener('click', () => this.selectElement(index));
      container.appendChild(elementDiv);
    });
  }

  /**
   * Select an element for editing
   */
  selectElement(index) {
    // Remove previous highlight
    if (this.selectedElement) {
      this.selectedElement.classList.remove('text-animation-highlight');
    }

    // Update selection
    this.selectedElement = this.elements[index];
    this.selectedElement.classList.add('text-animation-highlight');

    // Update UI
    document.querySelectorAll('.text-debugger-element').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // Show controls
    const controls = document.getElementById('debugger-controls');
    controls.classList.add('active');

    // Load current values
    this.loadElementValues();

    // Scroll element into view
    this.selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Load current element values into controls
   */
  loadElementValues() {
    if (!this.selectedElement) return;

    const split = this.selectedElement.dataset.textSplit || 'chars';
    const animation = this.selectedElement.dataset.textAnimation || 'fade';
    const stagger = parseFloat(this.selectedElement.dataset.textStagger) || 0.02;
    const duration = parseFloat(this.selectedElement.dataset.textDuration) || 0.6;
    const trigger = this.selectedElement.dataset.textTrigger || 'scroll';

    document.getElementById('debugger-split').value = split;
    document.getElementById('debugger-animation').value = animation;
    document.getElementById('debugger-stagger').value = stagger;
    document.getElementById('debugger-stagger-value').textContent = `${stagger}s`;
    document.getElementById('debugger-duration').value = duration;
    document.getElementById('debugger-duration-value').textContent = `${duration}s`;
    document.getElementById('debugger-trigger').value = trigger;
  }

  /**
   * Apply current control values to selected element
   */
  applyValues() {
    if (!this.selectedElement) return;

    const split = document.getElementById('debugger-split').value;
    const animation = document.getElementById('debugger-animation').value;
    const stagger = document.getElementById('debugger-stagger').value;
    const duration = document.getElementById('debugger-duration').value;
    const trigger = document.getElementById('debugger-trigger').value;

    this.selectedElement.dataset.textSplit = split;
    this.selectedElement.dataset.textAnimation = animation;
    this.selectedElement.dataset.textStagger = stagger;
    this.selectedElement.dataset.textDuration = duration;
    this.selectedElement.dataset.textTrigger = trigger;
  }

  /**
   * Replay animation for selected element
   */
  replayAnimation() {
    if (!this.selectedElement) return;

    // Apply current values
    this.applyValues();

    // Clean up and reinitialize animations
    cleanupTextAnimations();
    initTextAnimations();

    // Re-highlight the element (cleanup removes the class)
    setTimeout(() => {
      if (this.selectedElement) {
        this.selectedElement.classList.add('text-animation-highlight');
      }
    }, 100);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle minimize
    const toggleBtn = this.panel.querySelector('.text-debugger-toggle');
    const content = this.panel.querySelector('.text-debugger-content');

    toggleBtn.addEventListener('click', () => {
      this.isMinimized = !this.isMinimized;

      if (this.isMinimized) {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.marginTop = '0';
      } else {
        content.style.maxHeight = '800px';
        content.style.opacity = '1';
        content.style.marginTop = '';
      }

      toggleBtn.textContent = this.isMinimized ? '+' : '−';
      toggleBtn.title = this.isMinimized ? 'Expand' : 'Minimize';
    });

    // Range inputs
    const staggerInput = document.getElementById('debugger-stagger');
    const staggerValue = document.getElementById('debugger-stagger-value');
    staggerInput.addEventListener('input', (e) => {
      staggerValue.textContent = `${e.target.value}s`;
    });

    const durationInput = document.getElementById('debugger-duration');
    const durationValue = document.getElementById('debugger-duration-value');
    durationInput.addEventListener('input', (e) => {
      durationValue.textContent = `${e.target.value}s`;
    });

    // Replay button
    const replayBtn = document.getElementById('debugger-replay');
    replayBtn.addEventListener('click', () => this.replayAnimation());

    // Update element info when controls change
    const controls = ['debugger-split', 'debugger-animation'];
    controls.forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        if (this.selectedElement) {
          this.updateElementInfo();
        }
      });
    });
  }

  /**
   * Update element info display
   */
  updateElementInfo() {
    if (!this.selectedElement) return;

    const index = this.elements.indexOf(this.selectedElement);
    const elementDiv = document.querySelector(`[data-index="${index}"]`);

    if (elementDiv) {
      const split = document.getElementById('debugger-split').value;
      const animation = document.getElementById('debugger-animation').value;
      const infoSpan = elementDiv.querySelector('.text-debugger-element-info:last-child');
      infoSpan.textContent = `${split} • ${animation}`;
    }
  }

  /**
   * Refresh the debugger (useful after page transitions)
   */
  refresh() {
    // Clear previous selection
    if (this.selectedElement) {
      this.selectedElement.classList.remove('text-animation-highlight');
      this.selectedElement = null;
    }

    // Wait a bit for the new page DOM to be fully ready
    setTimeout(() => {
      this.scanElements();

      const controls = document.getElementById('debugger-controls');
      if (controls) {
        controls.classList.remove('active');
      }
    }, 100);
  }

  /**
   * Destroy the debugger
   */
  destroy() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('text-animation-highlight');
    }
    if (this.panel) {
      this.panel.remove();
    }
  }
}

// Create singleton instance
let debuggerInstance = null;

/**
 * Initialize the text animation debugger
 */
export const initTextAnimationDebugger = () => {
  if (!debuggerInstance) {
    debuggerInstance = new TextAnimationDebugger();
  }
  debuggerInstance.init();
};

/**
 * Refresh the debugger (for page transitions)
 */
export const refreshTextAnimationDebugger = () => {
  if (debuggerInstance) {
    debuggerInstance.refresh();
  }
};

/**
 * Destroy the debugger
 */
export const destroyTextAnimationDebugger = () => {
  if (debuggerInstance) {
    debuggerInstance.destroy();
    debuggerInstance = null;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.initTextAnimationDebugger = initTextAnimationDebugger;
  window.refreshTextAnimationDebugger = refreshTextAnimationDebugger;
}

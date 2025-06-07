(function (global) {
    let loaderElement = null;
  
    /**
     * Dynamically injects the loader HTML and CSS into the document.
     */
    function injectLoader() {
      // Inject CSS
      const style = document.createElement('style');
      style.textContent = `
        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .hidden {
            display: none;
        }

        svg {
            width: 150px;
            height: 100px;
        }

        .path-line {
            fill: none;
            stroke: #00ff00;
            stroke-width: 2;
            stroke-linejoin: round;
            stroke-linecap: round;
            filter: drop-shadow(0 0 5px #00ff00);
        }

        .dot {
            fill: #00ff00;
            r: 5;
            filter: drop-shadow(0 0 6px #00ff00) drop-shadow(0 0 12px #00ff00);
        }
        `;
    
      document.head.appendChild(style);
  
      // Inject HTML
      const loaderDiv = document.createElement('div');
      loaderDiv.id = 'dynamicLoader';
      loaderDiv.className = 'loader-container hidden';
      
      loaderDiv.innerHTML = `
            <svg viewBox="0 0 150 100">
            <path id="impulsePath" class="path-line" d="M0,80,L15,80,
                L30,60 L40,80
                L70,20 L100,80
                L120,60 L150,80
                "></path>
            <circle class="dot">
                <animateMotion dur="2s" repeatCount="indefinite" keySplines="0.42 0 0.58 1" calcMode="spline">
                <mpath href="#impulsePath"></mpath>
                </animateMotion>
            </circle>
            </svg>
            `;
      document.body.appendChild(loaderDiv);
  
      loaderElement = loaderDiv;
    }
  
    /**
     * Initializes the loader. Optionally allows setting a custom ID.
     * @param {string} [customId='dynamicLoader'] - Custom ID for the loader element.
     */
    function init(customId = 'dynamicLoader') {
      loaderElement = document.getElementById(customId);
  
      if (!loaderElement) {
        injectLoader();
      }
    }
  
    /**
     * Shows the loader.
     */
    function show() {
      if (!loaderElement) {
        console.error('Loader is not initialized. Call init() first.');
        return;
      }
      loaderElement.classList.remove('hidden');
    }
  
    /**
     * Hides the loader.
     */
    function hide() {
      if (!loaderElement) {
        console.error('Loader is not initialized. Call init() first.');
        return;
      }
      loaderElement.classList.add('hidden');
    }
  
    // Expose the library
    global.Loader = {
      init,
      show,
      hide,
    };
  })(window);
  
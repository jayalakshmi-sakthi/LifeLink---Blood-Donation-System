// Blood Compatibility JavaScript file

// Compatibility data
const bloodCompatibilityData = {
  // Recipient (can receive from) compatibility
  receiving: {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'] // Can only receive O-
  },
  
  // Donor (can donate to) compatibility
  donating: {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal donor
  }
};

// Blood group info
const bloodGroupInfo = {
  'A+': {
    frequency: 'About 34% of the population',
    description: 'Has A antigen and Rh factor',
    fact: 'Most common blood type in many ethnic groups'
  },
  'A-': {
    frequency: 'About 6% of the population',
    description: 'Has A antigen but no Rh factor',
    fact: 'Can donate red blood cells to both A and AB blood types'
  },
  'B+': {
    frequency: 'About 9% of the population',
    description: 'Has B antigen and Rh factor',
    fact: 'More common in Asian populations'
  },
  'B-': {
    frequency: 'About 2% of the population',
    description: 'Has B antigen but no Rh factor',
    fact: 'Can donate red blood cells to both B and AB blood types'
  },
  'AB+': {
    frequency: 'About 3% of the population',
    description: 'Has both A and B antigens and Rh factor',
    fact: 'Universal recipient for red blood cells'
  },
  'AB-': {
    frequency: 'About 1% of the population',
    description: 'Has both A and B antigens but no Rh factor',
    fact: 'Rarest major blood type'
  },
  'O+': {
    frequency: 'About 38% of the population',
    description: 'Has no A or B antigens but has Rh factor',
    fact: 'Most common blood type'
  },
  'O-': {
    frequency: 'About 7% of the population',
    description: 'Has no A or B antigens and no Rh factor',
    fact: 'Universal donor for red blood cells'
  }
};

// Initialize the blood compatibility chart in the home page
function initCompatibilityChart() {
  // Add a blood compatibility section to the home page
  const homeContent = document.querySelector('.about-section:last-child');
  
  if (homeContent) {
    const compatibilitySection = document.createElement('section');
    compatibilitySection.className = 'about-section';
    compatibilitySection.style.backgroundColor = 'white';
    
    compatibilitySection.innerHTML = `
      <div class="container">
        <h2 class="text-center">Blood Type Compatibility</h2>
        <p class="text-center mb-4">Understanding blood type compatibility is crucial for safe blood transfusions.</p>
        
        <div class="compatibility-tool">
          <div class="compatibility-selector">
            <div class="form-group">
              <label for="bloodTypeSelect">Select Your Blood Type:</label>
              <select id="bloodTypeSelect" class="form-control">
                <option value="">Choose Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div class="compatibility-toggle">
              <button class="btn btn-outline active" id="receivingBtn">Who can I receive from?</button>
              <button class="btn btn-outline" id="donatingBtn">Who can I donate to?</button>
            </div>
          </div>
          
          <div class="compatibility-results">
            <div id="bloodTypeInfo" class="blood-type-info"></div>
            
            <div id="compatibilityChart" class="compatibility-chart"></div>
          </div>
        </div>
        
        <div class="compatibility-matrix-container mt-5">
          <h3 class="text-center mb-3">Blood Type Compatibility Matrix</h3>
          
          <div class="compatibility-matrix">
            <div class="matrix-header">
              <div class="matrix-corner">
                <div>Recipient</div>
                <div>Donor</div>
              </div>
              <div class="matrix-blood-types">
                <div>A+</div>
                <div>A-</div>
                <div>B+</div>
                <div>B-</div>
                <div>AB+</div>
                <div>AB-</div>
                <div>O+</div>
                <div>O-</div>
              </div>
            </div>
            
            <div class="matrix-rows">
              ${createCompatibilityMatrix()}
            </div>
          </div>
          
          <div class="text-center mt-3">
            <div class="legend-item"><span class="legend-color compatible"></span> Compatible</div>
            <div class="legend-item"><span class="legend-color incompatible"></span> Incompatible</div>
          </div>
        </div>
      </div>
    `;
    
    // Insert before the footer
    const footer = document.querySelector('.footer');
    if (footer) {
      document.body.insertBefore(compatibilitySection, footer);
      
      // Add event listeners
      setupCompatibilityEventListeners();
    }
  }
}

// Set up event listeners for the compatibility tool
function setupCompatibilityEventListeners() {
  const bloodTypeSelect = document.getElementById('bloodTypeSelect');
  const receivingBtn = document.getElementById('receivingBtn');
  const donatingBtn = document.getElementById('donatingBtn');
  
  if (bloodTypeSelect && receivingBtn && donatingBtn) {
    // Blood type selection change
    bloodTypeSelect.addEventListener('change', () => {
      const bloodType = bloodTypeSelect.value;
      const mode = receivingBtn.classList.contains('active') ? 'receiving' : 'donating';
      
      updateCompatibilityChart(bloodType, mode);
    });
    
    // Mode toggle
    receivingBtn.addEventListener('click', () => {
      receivingBtn.classList.add('active');
      donatingBtn.classList.remove('active');
      
      const bloodType = bloodTypeSelect.value;
      if (bloodType) {
        updateCompatibilityChart(bloodType, 'receiving');
      }
    });
    
    donatingBtn.addEventListener('click', () => {
      donatingBtn.classList.add('active');
      receivingBtn.classList.remove('active');
      
      const bloodType = bloodTypeSelect.value;
      if (bloodType) {
        updateCompatibilityChart(bloodType, 'donating');
      }
    });
  }
}

// Update compatibility chart
function updateCompatibilityChart(bloodType, mode) {
  const bloodTypeInfo = document.getElementById('bloodTypeInfo');
  const compatibilityChart = document.getElementById('compatibilityChart');
  
  if (!bloodType || !bloodTypeInfo || !compatibilityChart) return;
  
  // Update blood type info
  const info = bloodGroupInfo[bloodType];
  bloodTypeInfo.innerHTML = `
    <div class="blood-type-badge large">${bloodType}</div>
    <div class="blood-type-details">
      <h3>${bloodType} Blood Type</h3>
      <p><strong>Frequency:</strong> ${info.frequency}</p>
      <p><strong>Description:</strong> ${info.description}</p>
      <p><strong>Interesting fact:</strong> ${info.fact}</p>
    </div>
  `;
  
  // Update compatibility chart
  const compatibilityData = bloodCompatibilityData[mode][bloodType];
  const incompatibleTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].filter(type => !compatibilityData.includes(type));
  
  const modeText = mode === 'receiving' ? 'receive from' : 'donate to';
  
  compatibilityChart.innerHTML = `
    <div class="compatibility-section">
      <h4>Can ${modeText}:</h4>
      <div class="blood-type-bubbles">
        ${compatibilityData.map(type => `
          <div class="blood-type-bubble compatible">
            <div class="blood-type-badge">${type}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="compatibility-section">
      <h4>Cannot ${modeText}:</h4>
      <div class="blood-type-bubbles">
        ${incompatibleTypes.length > 0 ? incompatibleTypes.map(type => `
          <div class="blood-type-bubble incompatible">
            <div class="blood-type-badge">${type}</div>
          </div>
        `).join('') : '<p>None - can donate to all blood types</p>'}
      </div>
    </div>
  `;
}

// Create compatibility matrix HTML
function createCompatibilityMatrix() {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return bloodTypes.map(recipient => {
    const compatibleDonors = bloodCompatibilityData.receiving[recipient];
    
    return `
      <div class="matrix-row">
        <div class="matrix-row-header">${recipient}</div>
        <div class="matrix-cells">
          ${bloodTypes.map(donor => {
            const isCompatible = compatibleDonors.includes(donor);
            return `<div class="matrix-cell ${isCompatible ? 'compatible' : 'incompatible'}"></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Add compatibility chart CSS
function addCompatibilityStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  
  styleSheet.textContent = `
    /* Compatibility Tool Styles */
    .compatibility-tool {
      background-color: #f9f9f9;
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      padding: 2rem;
      margin-top: 2rem;
    }

    .compatibility-selector {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }

    .compatibility-toggle {
      display: flex;
      gap: 1rem;
    }

    .compatibility-toggle .btn.active {
      background-color: var(--primary-color);
      color: white;
    }

    .compatibility-results {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .blood-type-info {
      flex: 1;
      min-width: 250px;
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .blood-type-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .blood-type-badge.large {
      width: 80px;
      height: 80px;
      font-size: 1.8rem;
    }

    .blood-type-details {
      flex: 1;
    }

    .compatibility-chart {
      flex: 1;
      min-width: 250px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .compatibility-section h4 {
      margin-bottom: 1rem;
    }

    .blood-type-bubbles {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .blood-type-bubble {
      padding: 0.5rem;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blood-type-bubble.compatible {
      background-color: #e6f7e6;
      border: 1px solid #c3e6cb;
    }

    .blood-type-bubble.incompatible {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    /* Compatibility Matrix Styles */
    .compatibility-matrix-container {
      margin-top: 3rem;
    }

    .compatibility-matrix {
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--card-shadow);
      margin: 0 auto;
      max-width: 800px;
    }

    .matrix-header {
      display: flex;
      background-color: #f0f0f0;
    }

    .matrix-corner {
      width: 100px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      position: relative;
    }

    .matrix-corner::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom right, transparent 49.5%, #ddd 49.5%, #ddd 50.5%, transparent 50.5%);
    }

    .matrix-corner div:first-child {
      align-self: flex-start;
    }

    .matrix-corner div:last-child {
      align-self: flex-end;
    }

    .matrix-blood-types {
      display: flex;
      flex: 1;
    }

    .matrix-blood-types div {
      flex: 1;
      padding: 0.75rem 0.5rem;
      text-align: center;
      font-weight: bold;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
    }

    .matrix-blood-types div:last-child {
      border-right: none;
    }

    .matrix-row {
      display: flex;
    }

    .matrix-row-header {
      width: 100px;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      background-color: #f0f0f0;
    }

    .matrix-row:last-child .matrix-row-header {
      border-bottom: none;
    }

    .matrix-cells {
      display: flex;
      flex: 1;
    }

    .matrix-cell {
      flex: 1;
      height: 50px;
      border-right: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
    }

    .matrix-row:last-child .matrix-cell {
      border-bottom: none;
    }

    .matrix-cell:last-child {
      border-right: none;
    }

    .matrix-cell.compatible {
      background-color: #c3e6cb;
    }

    .matrix-cell.incompatible {
      background-color: #f5c6cb;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      margin: 0 1rem;
    }

    .legend-color {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 0.5rem;
      border-radius: 3px;
    }

    .legend-color.compatible {
      background-color: #c3e6cb;
    }

    .legend-color.incompatible {
      background-color: #f5c6cb;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .compatibility-selector {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .compatibility-toggle {
        justify-content: center;
      }
      
      .compatibility-matrix {
        font-size: 0.85rem;
      }
      
      .matrix-corner {
        width: 80px;
      }
      
      .matrix-row-header {
        width: 80px;
      }
    }
  `;
  
  document.head.appendChild(styleSheet);
}

// Initialize compatibility chart when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Add compatibility styles
  addCompatibilityStyles();
  
  // Initialize chart if on home page
  if (window.location.pathname === '/' || window.location.pathname === '') {
    initCompatibilityChart();
  }
  
  // Listen for navigation to home page
  document.addEventListener('pageChanged', (event) => {
    if (event.detail.page === 'home') {
      setTimeout(() => {
        initCompatibilityChart();
      }, 100);
    }
  });
});
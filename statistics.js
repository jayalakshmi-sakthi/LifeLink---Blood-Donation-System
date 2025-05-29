// Statistics JavaScript file

// Global statistics state
const statsState = {
  donorsByBloodGroup: {},
  requestsByUrgency: {},
  requestsByBloodGroup: {},
  fulfillmentRate: 0,
  isLoading: false
};

// Initialize statistics
function initStatistics() {
  // Create dashboard statistics tab
  addStatisticsTab();
  
  // Load statistics data
  loadStatisticsData();
}

// Add statistics tab to dashboard
function addStatisticsTab() {
  const dashboardTabs = document.querySelector('.dashboard-tabs');
  const tabContents = document.querySelector('.dashboard');
  
  if (dashboardTabs && tabContents) {
    // Create new tab button
    const statsTab = document.createElement('button');
    statsTab.className = 'dashboard-tab';
    statsTab.dataset.tab = 'statistics';
    statsTab.textContent = 'Statistics';
    
    // Add tab to tabs container
    dashboardTabs.appendChild(statsTab);
    
    // Create statistics content container
    const statsContent = document.createElement('div');
    statsContent.id = 'statisticsTab';
    statsContent.className = 'tab-content';
    
    // Add content to dashboard
    tabContents.appendChild(statsContent);
    
    // Add statistics tab event listener
    statsTab.addEventListener('click', () => {
      // Set active tab
      document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
      statsTab.classList.add('active');
      
      // Show statistics content
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      statsContent.classList.add('active');
      
      // Load statistics data if needed
      if (Object.keys(statsState.donorsByBloodGroup).length === 0) {
        loadStatisticsData();
      }
    });
  }
}

// Load statistics data from API
async function loadStatisticsData() {
  statsState.isLoading = true;
  
  const statsContainer = document.getElementById('statisticsTab');
  if (statsContainer) {
    statsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  }
  
  try {
    // Load donor statistics
    const donorStats = await apiRequest('/donors/stats');
    if (donorStats.success) {
      statsState.donorsByBloodGroup = donorStats.stats;
    }
    
    // Load request statistics (we'll implement a simple version here)
    await loadRequestStatistics();
    
    // Update the UI with statistics
    updateStatisticsUI();
  } catch (error) {
    console.error('Failed to load statistics data:', error);
    
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="alert alert-danger">
          Failed to load statistics. Please try again later.
        </div>
      `;
    }
  } finally {
    statsState.isLoading = false;
  }
}

// Load request statistics
async function loadRequestStatistics() {
  try {
    // Get all requests (we'll calculate statistics on the client side)
    const allRequests = await apiRequest('/requests?status=all');
    
    if (allRequests.success && allRequests.requests) {
      const requests = allRequests.requests;
      
      // Calculate statistics
      const requestsByBloodGroup = {};
      const requestsByUrgency = {
        normal: 0,
        urgent: 0,
        emergency: 0
      };
      
      let fulfilledCount = 0;
      
      requests.forEach(request => {
        // Count by blood group
        const bloodGroup = request.blood_group;
        requestsByBloodGroup[bloodGroup] = (requestsByBloodGroup[bloodGroup] || 0) + 1;
        
        // Count by urgency
        if (request.urgency in requestsByUrgency) {
          requestsByUrgency[request.urgency]++;
        }
        
        // Count fulfilled requests
        if (request.status === 'fulfilled') {
          fulfilledCount++;
        }
      });
      
      // Calculate fulfillment rate
      statsState.fulfillmentRate = requests.length > 0 ? (fulfilledCount / requests.length) * 100 : 0;
      statsState.requestsByBloodGroup = requestsByBloodGroup;
      statsState.requestsByUrgency = requestsByUrgency;
    }
  } catch (error) {
    console.error('Failed to load request statistics:', error);
  }
}

// Update statistics UI
function updateStatisticsUI() {
  const statsContainer = document.getElementById('statisticsTab');
  
  if (!statsContainer) return;
  
  // Create statistics dashboard
  const dashboard = `
    <div class="statistics-dashboard">
      <h2 class="text-center mb-4">Blood Donation Statistics</h2>
      
      <div class="stats-row">
        <div class="stats-card">
          <h3>Donors by Blood Group</h3>
          <div id="donorsByBloodGroupChart" class="chart-container">
            ${createDonorsByBloodGroupChart()}
          </div>
        </div>
        
        <div class="stats-card">
          <h3>Requests by Urgency</h3>
          <div id="requestsByUrgencyChart" class="chart-container">
            ${createRequestsByUrgencyChart()}
          </div>
        </div>
      </div>
      
      <div class="stats-row">
        <div class="stats-card">
          <h3>Requests by Blood Group</h3>
          <div id="requestsByBloodGroupChart" class="chart-container">
            ${createRequestsByBloodGroupChart()}
          </div>
        </div>
        
        <div class="stats-card">
          <h3>Request Fulfillment Rate</h3>
          <div class="fulfillment-rate">
            <div class="progress-circle">
              <div class="progress-circle-inner">
                <span class="progress-value">${Math.round(statsState.fulfillmentRate)}%</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${statsState.fulfillmentRate}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  statsContainer.innerHTML = dashboard;
}

// Create donors by blood group chart
function createDonorsByBloodGroupChart() {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxValue = Math.max(...bloodGroups.map(bg => statsState.donorsByBloodGroup[bg] || 0));
  
  return `
    <div class="bar-chart">
      ${bloodGroups.map(bloodGroup => {
        const value = statsState.donorsByBloodGroup[bloodGroup] || 0;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return `
          <div class="bar-item">
            <div class="bar-label">${bloodGroup}</div>
            <div class="bar-container">
              <div class="bar" style="height: ${percentage}%">
                <span class="bar-value">${value}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Create requests by urgency chart
function createRequestsByUrgencyChart() {
  const urgencyLevels = ['normal', 'urgent', 'emergency'];
  const colors = {
    normal: '#17a2b8', // info color
    urgent: '#ffc107', // warning color
    emergency: '#dc3545' // danger color
  };
  
  const total = urgencyLevels.reduce((sum, urgency) => sum + (statsState.requestsByUrgency[urgency] || 0), 0);
  
  if (total === 0) {
    return '<p class="no-data">No request data available</p>';
  }
  
  return `
    <div class="pie-chart">
      <div class="pie">
        ${urgencyLevels.map((urgency, index) => {
          const value = statsState.requestsByUrgency[urgency] || 0;
          const percentage = (value / total) * 100;
          
          // Skip if no data for this urgency
          if (percentage === 0) return '';
          
          // Calculate rotation for pie chart slice
          let prevPercentage = 0;
          for (let i = 0; i < index; i++) {
            prevPercentage += (statsState.requestsByUrgency[urgencyLevels[i]] || 0) / total * 100;
          }
          
          return `
            <div class="pie-slice" style="
              --percentage: ${percentage};
              --color: ${colors[urgency]};
              --rotation: ${prevPercentage * 3.6}deg;
            "></div>
          `;
        }).join('')}
      </div>
      
      <div class="pie-legend">
        ${urgencyLevels.map(urgency => {
          const value = statsState.requestsByUrgency[urgency] || 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          
          return `
            <div class="legend-item">
              <span class="legend-color" style="background-color: ${colors[urgency]};"></span>
              <span class="legend-label">${urgency.charAt(0).toUpperCase() + urgency.slice(1)}</span>
              <span class="legend-value">${value} (${Math.round(percentage)}%)</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Create requests by blood group chart
function createRequestsByBloodGroupChart() {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxValue = Math.max(...bloodGroups.map(bg => statsState.requestsByBloodGroup[bg] || 0));
  
  return `
    <div class="horizontal-bar-chart">
      ${bloodGroups.map(bloodGroup => {
        const value = statsState.requestsByBloodGroup[bloodGroup] || 0;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return `
          <div class="horizontal-bar-item">
            <div class="horizontal-bar-label">${bloodGroup}</div>
            <div class="horizontal-bar-container">
              <div class="horizontal-bar" style="width: ${percentage}%"></div>
              <span class="horizontal-bar-value">${value}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Add statistics related CSS
function addStatisticsStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  
  styleSheet.textContent = `
    /* Statistics Dashboard */
    .statistics-dashboard {
      padding: 1rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .stats-card {
      background-color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      padding: 1.5rem;
    }

    .stats-card h3 {
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.2rem;
    }

    .chart-container {
      height: 250px;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 100%;
    }

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    .bar-container {
      width: 40px;
      height: 80%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar {
      width: 100%;
      background-color: var(--primary-color);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 5px;
      transition: height 0.5s ease;
    }

    .bar-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .bar-label {
      margin-top: 8px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Pie Chart */
    .pie-chart {
      display: flex;
      height: 100%;
    }

    .pie {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background-color: #f0f0f0;
    }

    .pie-slice {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
      background-color: var(--color);
      transform: rotate(var(--rotation));
    }

    .pie-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .legend-color {
      width: 15px;
      height: 15px;
      border-radius: 3px;
      margin-right: 0.5rem;
    }

    .legend-label {
      flex: 1;
      font-size: 0.85rem;
    }

    .legend-value {
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Horizontal Bar Chart */
    .horizontal-bar-chart {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .horizontal-bar-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .horizontal-bar-label {
      width: 40px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-right: 0.75rem;
    }

    .horizontal-bar-container {
      flex: 1;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 3px;
      position: relative;
    }

    .horizontal-bar {
      height: 100%;
      background-color: var(--secondary-color);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .horizontal-bar-value {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
    }

    /* Fulfillment Rate */
    .fulfillment-rate {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .progress-circle {
      width: 150px;
      height: 150px;
      background: conic-gradient(
        var(--success-color) ${statsState.fulfillmentRate * 3.6}deg, 
        #f0f0f0 ${statsState.fulfillmentRate * 3.6}deg
      );
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .progress-circle-inner {
      width: 120px;
      height: 120px;
      background-color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--success-color);
    }

    .progress-bar {
      width: 80%;
      height: 10px;
      background-color: #f0f0f0;
      border-radius: 5px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--success-color);
      border-radius: 5px;
      transition: width 0.5s ease;
    }

    .no-data {
      text-align: center;
      color: #666;
      font-style: italic;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
      
      .pie-chart {
        flex-direction: column;
        align-items: center;
      }
      
      .pie-legend {
        margin-left: 0;
        margin-top: 1rem;
      }
    }
  `;
  
  document.head.appendChild(styleSheet);
}

// Call this function when dashboard page loads
document.addEventListener('DOMContentLoaded', () => {
  // Add statistics styles
  addStatisticsStyles();
  
  // Initialize statistics if on dashboard page
  if (appState.currentPage === 'dashboard') {
    initStatistics();
  }
  
  // Listen for navigation to dashboard
  document.addEventListener('pageChanged', (event) => {
    if (event.detail.page === 'dashboard') {
      initStatistics();
    }
  });
});
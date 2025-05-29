// Main application JavaScript file

// Global state for the application
const appState = {
  user: null,
  token: null,
  isLoading: false,
  requests: [],
  currentPage: 'home'
};

// DOM Elements
const appContainer = document.getElementById('appContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const navbarMenu = document.getElementById('navbarMenu');
const navbarToggle = document.getElementById('navbarToggle');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userGreeting = document.getElementById('userGreeting');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardLink = document.getElementById('dashboardLink');
const profileLink = document.getElementById('profileLink');

// API base URL
const API_URL = '/api';

// Initialize the application
function initApp() {
  // Check if user is logged in (token in localStorage)
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      appState.token = token;
      appState.user = JSON.parse(userData);
      
      // Update UI for logged in user
      updateAuthUI(true);
      
      // Load appropriate page based on current URL
      handleRouting();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      updateAuthUI(false);
    }
  } else {
    // User not logged in
    updateAuthUI(false);
    
    // Load home page if not logged in
    if (window.location.pathname !== '/' && 
        !window.location.pathname.startsWith('/about') && 
        !window.location.pathname.startsWith('/contact')) {
      navigateTo('/');
    } else {
      handleRouting();
    }
  }
  
  // Add event listeners
  addEventListeners();
}

// Add event listeners for navigation and UI interaction
function addEventListeners() {
  // Mobile menu toggle
  navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
  });
  
  // Auth buttons
  loginBtn.addEventListener('click', () => openAuthModal('login'));
  registerBtn.addEventListener('click', () => openAuthModal('register'));
  logoutBtn.addEventListener('click', handleLogout);
  
  // Navigation
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/dashboard');
  });
  
  profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/profile');
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', handleRouting);
}

// Handle client-side routing
function handleRouting() {
  const path = window.location.pathname;
  
  // Reset container
  appContainer.innerHTML = '';
  
  // Show loading spinner
  showLoading(true);
  
  // Route to appropriate page
  if (path === '/' || path === '') {
    loadHomePage();
    appState.currentPage = 'home';
  } else if (path === '/dashboard') {
    if (appState.user) {
      loadDashboardPage();
      appState.currentPage = 'dashboard';
    } else {
      navigateTo('/');
      showAlert('Please log in to access the dashboard.', 'warning');
    }
  } else if (path === '/profile') {
    if (appState.user) {
      loadProfilePage();
      appState.currentPage = 'profile';
    } else {
      navigateTo('/');
      showAlert('Please log in to access your profile.', 'warning');
    }
  } else {
    loadNotFoundPage();
  }
  
  // Hide loading spinner after a short delay
  setTimeout(() => {
    showLoading(false);
  }, 500);
}

// Navigate to a new page
function navigateTo(path) {
  window.history.pushState({}, '', path);
  handleRouting();
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
  if (isLoggedIn && appState.user) {
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userGreeting.textContent = `Hello, ${appState.user.fullName || appState.user.email}`;
  } else {
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
  }
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  appState.user = null;
  appState.token = null;
  
  updateAuthUI(false);
  navigateTo('/');
  showAlert('You have been logged out.', 'success');
}

// Load the home page content
function loadHomePage() {
  const homeContent = `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Donate Blood, Save Lives</h1>
          <p>Your donation can save up to three lives. Join our community of donors and help those in need.</p>
          <div class="hero-buttons">
            ${!appState.user ? `
              <button class="btn btn-primary btn-lg" onclick="openAuthModal('register')">Register Now</button>
              <button class="btn btn-outline btn-lg" onclick="openAuthModal('login')">Already a Donor? Login</button>
            ` : appState.user.role === 'donor' ? `
              <button class="btn btn-primary btn-lg" onclick="navigateTo('/dashboard')">View Blood Requests</button>
            ` : `
              <button class="btn btn-primary btn-lg" onclick="navigateTo('/dashboard')">Create Blood Request</button>
            `}
          </div>
        </div>
      </div>
    </section>
    
    <section id="about" class="about-section">
      <div class="container">
        <h2 class="text-center">Why Donate Blood?</h2>
        <p class="text-center">Blood donation is essential for many medical treatments and emergency situations.</p>
        
        <div class="about-cards">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title"><i class="fas fa-heartbeat text-primary"></i> Save Lives</h3>
              <p>One donation can save up to three lives. Every two seconds, someone in the world needs blood.</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body">
              <h3 class="card-title"><i class="fas fa-hospital text-primary"></i> Emergency Cases</h3>
              <p>Blood is needed in emergencies like car accidents, surgeries, childbirth, anemia, and cancer treatments.</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body">
              <h3 class="card-title"><i class="fas fa-sync-alt text-primary"></i> Regular Need</h3>
              <p>Blood has a limited shelf life and must be constantly replenished to maintain adequate supplies.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section id="faq" class="about-section" style="background-color: var(--grey-color);">
      <div class="container">
        <h2 class="text-center">Frequently Asked Questions</h2>
        
        <div class="card" style="margin-top: 2rem;">
          <div class="card-body">
            <h3 class="card-title">Who can donate blood?</h3>
            <p>Most people who are healthy, at least 17 years old, and weigh at least 110 pounds can donate blood.</p>
          </div>
        </div>
        
        <div class="card" style="margin-top: 1rem;">
          <div class="card-body">
            <h3 class="card-title">How often can I donate?</h3>
            <p>You can donate whole blood every 56 days (8 weeks). Plasma can be donated more frequently, as often as twice a week.</p>
          </div>
        </div>
        
        <div class="card" style="margin-top: 1rem;">
          <div class="card-body">
            <h3 class="card-title">Is donating blood safe?</h3>
            <p>Yes, donating blood is safe. The equipment used is sterile and disposed of after a single use.</p>
          </div>
        </div>
      </div>
    </section>
  `;
  
  appContainer.innerHTML = homeContent;
}

// Load the dashboard page
function loadDashboardPage() {
  // Dashboard content will be populated from dashboard.js
  const dashboardContent = `
    <div class="container">
      <div class="dashboard">
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          ${appState.user.role === 'recipient' ? `
            <button class="btn btn-primary" id="createRequestBtn">
              <i class="fas fa-plus"></i> Create Request
            </button>
          ` : ''}
        </div>
        
        <div class="dashboard-tabs">
          ${appState.user.role === 'donor' ? `
            <button class="dashboard-tab active" data-tab="available-requests">Available Requests</button>
            <button class="dashboard-tab" data-tab="my-responses">My Responses</button>
          ` : `
            <button class="dashboard-tab active" data-tab="my-requests">My Requests</button>
            <button class="dashboard-tab" data-tab="request-responses">Request Responses</button>
          `}
        </div>
        
        <div id="availableRequestsTab" class="tab-content active">
          <div class="request-filter" style="margin-bottom: 1.5rem;">
            <div class="form-row">
              <div class="form-group">
                <label for="bloodGroupFilter">Blood Group</label>
                <select id="bloodGroupFilter">
                  <option value="">All Blood Groups</option>
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
              
              <div class="form-group">
                <label for="locationFilter">Location</label>
                <input type="text" id="locationFilter" placeholder="City or Hospital">
              </div>
              
              <div class="form-group">
                <label for="urgencyFilter">Urgency</label>
                <select id="urgencyFilter">
                  <option value="">All Urgency Levels</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
            
            <button class="btn btn-primary" id="applyFiltersBtn">Apply Filters</button>
            <button class="btn btn-outline" id="resetFiltersBtn">Reset</button>
          </div>
          
          <div id="requestsContainer" class="request-cards">
            <!-- Blood requests will be loaded here -->
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
        
        <div id="myResponsesTab" class="tab-content">
          <div id="myResponsesContainer">
            <!-- My responses will be loaded here -->
          </div>
        </div>
        
        <div id="myRequestsTab" class="tab-content">
          <div id="myRequestsContainer">
            <!-- My requests will be loaded here -->
          </div>
        </div>
        
        <div id="requestResponsesTab" class="tab-content">
          <div id="requestResponsesContainer">
            <!-- Request responses will be loaded here -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Blood Request Modal -->
    <div class="modal" id="requestModal">
      <div class="modal-content">
        <span class="close-modal" id="closeRequestModal">&times;</span>
        <h2>Create Blood Request</h2>
        
        <form id="bloodRequestForm" class="request-form">
          <div class="form-row">
            <div class="form-group">
              <label for="patientName">Patient Name</label>
              <input type="text" id="patientName" required>
            </div>
            
            <div class="form-group">
              <label for="requestBloodGroup">Blood Group</label>
              <select id="requestBloodGroup" required>
                <option value="">Select Blood Group</option>
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
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="unitsRequired">Units Required</label>
              <input type="number" id="unitsRequired" min="1" max="10" required>
            </div>
            
            <div class="form-group">
              <label for="requestUrgency">Urgency</label>
              <select id="requestUrgency" required>
                <option value="normal">Normal (Within a week)</option>
                <option value="urgent">Urgent (Within 48 hours)</option>
                <option value="emergency">Emergency (Immediate)</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="hospital">Hospital Name</label>
              <input type="text" id="hospital" required>
            </div>
            
            <div class="form-group">
              <label for="location">Location/City</label>
              <input type="text" id="location" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="requiredDate">Required Date</label>
              <input type="date" id="requiredDate" required>
            </div>
            
            <div class="form-group">
              <label for="contactPhone">Contact Phone</label>
              <input type="tel" id="contactPhone" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="additionalInfo">Additional Information</label>
            <textarea id="additionalInfo" rows="3"></textarea>
          </div>
          
          <div style="text-align: right; margin-top: 1rem;">
            <button type="button" id="cancelRequestBtn" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Request</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Donor Response Modal -->
    <div class="modal" id="responseModal">
      <div class="modal-content">
        <span class="close-modal" id="closeResponseModal">&times;</span>
        <h2>Respond as Donor</h2>
        
        <div id="requestDetails" class="card" style="margin-bottom: 1.5rem;">
          <!-- Request details will be loaded here -->
        </div>
        
        <form id="donorResponseForm">
          <div class="form-group">
            <label for="responseMessage">Your Message</label>
            <textarea id="responseMessage" rows="3" required></textarea>
          </div>
          
          <input type="hidden" id="requestId">
          
          <div style="text-align: right; margin-top: 1rem;">
            <button type="button" id="cancelResponseBtn" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Send Response</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  appContainer.innerHTML = dashboardContent;
  
  // Initialize dashboard functionality
  initDashboard();
}

// Load the profile page
function loadProfilePage() {
  const profileContent = `
    <div class="container">
      <div class="profile">
        <h2 class="text-center mb-4">My Profile</h2>
        
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user"></i>
            </div>
            <h3 class="profile-name">${appState.user.fullName || 'User'}</h3>
            <p class="profile-role">${appState.user.role === 'donor' ? 'Blood Donor' : 'Blood Recipient'}</p>
          </div>
          
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label for="profileName">Full Name</label>
                <input type="text" id="profileName" value="${appState.user.fullName || ''}" required>
              </div>
              
              <div class="form-group">
                <label for="profileEmail">Email</label>
                <input type="email" id="profileEmail" value="${appState.user.email || ''}" disabled>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="profilePhone">Phone Number</label>
                <input type="tel" id="profilePhone" value="${appState.user.phone || ''}">
              </div>
              
              ${appState.user.role === 'donor' ? `
                <div class="form-group">
                  <label for="profileBloodGroup">Blood Group</label>
                  <select id="profileBloodGroup" required>
                    <option value="">Select Blood Group</option>
                    <option value="A+" ${appState.user.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                    <option value="A-" ${appState.user.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                    <option value="B+" ${appState.user.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                    <option value="B-" ${appState.user.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                    <option value="AB+" ${appState.user.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                    <option value="AB-" ${appState.user.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                    <option value="O+" ${appState.user.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                    <option value="O-" ${appState.user.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                  </select>
                </div>
              ` : ''}
            </div>
            
            <div class="form-group">
              <label for="profileAddress">Address</label>
              <textarea id="profileAddress" rows="2">${appState.user.address || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label for="profileCity">City</label>
              <input type="text" id="profileCity" value="${appState.user.city || ''}">
            </div>
            
            ${appState.user.role === 'donor' ? `
              <div class="form-group">
                <label for="lastDonationDate">Last Donation Date</label>
                <input type="date" id="lastDonationDate" value="${appState.user.lastDonationDate || ''}">
              </div>
            ` : ''}
            
            <div style="text-align: right; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  appContainer.innerHTML = profileContent;
  
  // Initialize profile functionality
  initProfile();
}

// Load 404 Not Found page
function loadNotFoundPage() {
  const notFoundContent = `
    <div class="container" style="text-align: center; padding: 4rem 0;">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button class="btn btn-primary" onclick="navigateTo('/')">Go Home</button>
    </div>
  `;
  
  appContainer.innerHTML = notFoundContent;
}

// Show/hide loading spinner
function showLoading(show) {
  appState.isLoading = show;
  loadingSpinner.classList.toggle('hidden', !show);
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  
  // Add to the top of the container
  appContainer.prepend(alertElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    alertElement.remove();
  }, 5000);
}

// Open the auth modal
function openAuthModal(tab = 'login') {
  const authModal = document.getElementById('authModal');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Show modal
  authModal.classList.add('active');
  
  // Set active tab
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// Make an API request with authentication
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // Add authentication token if available
  if (appState.token) {
    options.headers['Authorization'] = `Bearer ${appState.token}`;
  }
  
  // Add body for POST, PUT, PATCH requests
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Handle unauthorized response
    if (response.status === 401) {
      // Clear auth data and update UI
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      appState.user = null;
      appState.token = null;
      updateAuthUI(false);
      
      // Show error message and redirect to home
      showAlert('Session expired. Please log in again.', 'warning');
      navigateTo('/');
      
      throw new Error('Unauthorized');
    }
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
// Authentication JavaScript file

// DOM Elements
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const donorFields = document.getElementById('donorFields');

// Initialize Auth UI
document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners to auth elements
  closeAuthModal.addEventListener('click', closeModal);
  loginTab.addEventListener('click', () => switchTab('login'));
  registerTab.addEventListener('click', () => switchTab('register'));
  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('register');
  });
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('login');
  });
  
  // Handle form submissions
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  
  // Show/hide donor fields based on role selection
  const roleRadios = document.querySelectorAll('input[name="role"]');
  roleRadios.forEach(radio => {
    radio.addEventListener('change', toggleDonorFields);
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeModal();
    }
  });
});

// Switch between login and register tabs
function switchTab(tab) {
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

// Close auth modal
function closeModal() {
  authModal.classList.remove('active');
  loginForm.reset();
  registerForm.reset();
}

// Show/hide donor-specific fields based on role selection
function toggleDonorFields() {
  const role = document.querySelector('input[name="role"]:checked').value;
  if (role === 'donor') {
    donorFields.style.display = 'block';
  } else {
    donorFields.style.display = 'none';
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Basic validation
  if (!email || !password) {
    showAlert('Please enter both email and password.', 'warning');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Make login API request
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    
    // Save auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    }));
    
    // Update app state
    appState.token = data.token;
    appState.user = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    };
    
    // Update UI
    updateAuthUI(true);
    
    // Close modal
    closeModal();
    
    // Show success message
    showAlert('Login successful!', 'success');
    
    // Navigate to dashboard
    navigateTo('/dashboard');
  } catch (error) {
    showAlert(error.message || 'Login failed. Please check your credentials.', 'danger');
  } finally {
    showLoading(false);
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const bloodGroup = document.getElementById('bloodGroup').value;
  
  // Basic validation
  if (!fullName || !email || !password || !confirmPassword) {
    showAlert('Please fill in all required fields.', 'warning');
    return;
  }
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match.', 'warning');
    return;
  }
  
  if (role === 'donor' && !bloodGroup) {
    showAlert('Blood group is required for donors.', 'warning');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Prepare registration data
    const userData = {
      fullName,
      email,
      password,
      role,
      bloodGroup: role === 'donor' ? bloodGroup : undefined
    };
    
    // Make register API request
    const data = await apiRequest('/auth/register', 'POST', userData);
    
    // Save auth data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    }));
    
    // Update app state
    appState.token = data.token;
    appState.user = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    };
    
    // Update UI
    updateAuthUI(true);
    
    // Close modal
    closeModal();
    
    // Show success message
    showAlert('Registration successful!', 'success');
    
    // Navigate to dashboard
    navigateTo('/dashboard');
  } catch (error) {
    showAlert(error.message || 'Registration failed. Please try again.', 'danger');
  } finally {
    showLoading(false);
  }
}
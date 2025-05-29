// Blood Requests JavaScript file

// Handle profile functionality
function initProfile() {
  const profileForm = document.getElementById('profileForm');
  
  if (profileForm) {
    profileForm.addEventListener('submit', updateProfile);
  }
}

// Handle profile update
async function updateProfile(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;
  const address = document.getElementById('profileAddress').value;
  const city = document.getElementById('profileCity').value;
  
  let bloodGroup = '';
  const bloodGroupSelect = document.getElementById('profileBloodGroup');
  if (bloodGroupSelect) {
    bloodGroup = bloodGroupSelect.value;
  }
  
  let lastDonationDate = '';
  const lastDonationDateInput = document.getElementById('lastDonationDate');
  if (lastDonationDateInput) {
    lastDonationDate = lastDonationDateInput.value;
  }
  
  // Basic validation
  if (!fullName) {
    showAlert('Name is required.', 'warning');
    return;
  }
  
  if (appState.user.role === 'donor' && !bloodGroup) {
    showAlert('Blood group is required for donors.', 'warning');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Prepare profile data
    const profileData = {
      fullName,
      bloodGroup,
      phone,
      address,
      city,
      lastDonationDate: lastDonationDate || undefined
    };
    
    // Update profile
    const updatedProfile = await apiRequest('/auth/profile', 'PUT', profileData);
    
    // Update local user data
    const user = {
      ...appState.user,
      fullName,
      bloodGroup,
      phone,
      address,
      city,
      lastDonationDate
    };
    
    appState.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update UI
    userGreeting.textContent = `Hello, ${fullName || user.email}`;
    
    // Show success message
    showAlert('Profile updated successfully!', 'success');
  } catch (error) {
    showAlert(error.message || 'Failed to update profile.', 'danger');
  } finally {
    showLoading(false);
  }
}
// Dashboard JavaScript file

// Dashboard state
const dashboardState = {
  requests: [],
  myRequests: [],
  myResponses: [],
  requestResponses: [],
  filters: {
    bloodGroup: '',
    location: '',
    urgency: ''
  }
};

// Initialize dashboard
function initDashboard() {
  // Get dashboard elements
  const createRequestBtn = document.getElementById('createRequestBtn');
  const dashboardTabs = document.querySelectorAll('.dashboard-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const requestModal = document.getElementById('requestModal');
  const closeRequestModal = document.getElementById('closeRequestModal');
  const bloodRequestForm = document.getElementById('bloodRequestForm');
  const cancelRequestBtn = document.getElementById('cancelRequestBtn');
  const responseModal = document.getElementById('responseModal');
  const closeResponseModal = document.getElementById('closeResponseModal');
  const donorResponseForm = document.getElementById('donorResponseForm');
  const cancelResponseBtn = document.getElementById('cancelResponseBtn');
  const bloodGroupFilter = document.getElementById('bloodGroupFilter');
  const locationFilter = document.getElementById('locationFilter');
  const urgencyFilter = document.getElementById('urgencyFilter');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  
  // Add event listeners
  if (createRequestBtn) {
    createRequestBtn.addEventListener('click', openRequestModal);
  }
  
  if (closeRequestModal) {
    closeRequestModal.addEventListener('click', closeModal);
  }
  
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', handleCreateRequest);
  }
  
  if (cancelRequestBtn) {
    cancelRequestBtn.addEventListener('click', closeModal);
  }
  
  if (closeResponseModal) {
    closeResponseModal.addEventListener('click', () => responseModal.classList.remove('active'));
  }
  
  if (donorResponseForm) {
    donorResponseForm.addEventListener('submit', handleDonorResponse);
  }
  
  if (cancelResponseBtn) {
    cancelResponseBtn.addEventListener('click', () => responseModal.classList.remove('active'));
  }
  
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
  
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
  
  // Tab switching
  dashboardTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      dashboardTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show appropriate content
      const tabId = tab.dataset.tab;
      tabContents.forEach(content => content.classList.remove('active'));
      
      if (tabId === 'available-requests') {
        document.getElementById('availableRequestsTab').classList.add('active');
        loadRequests();
      } else if (tabId === 'my-responses') {
        document.getElementById('myResponsesTab').classList.add('active');
        loadMyResponses();
      } else if (tabId === 'my-requests') {
        document.getElementById('myRequestsTab').classList.add('active');
        loadMyRequests();
      } else if (tabId === 'request-responses') {
        document.getElementById('requestResponsesTab').classList.add('active');
        loadRequestResponses();
      }
    });
  });
  
  // Load appropriate data based on user role
  if (appState.user.role === 'donor') {
    loadRequests();
  } else {
    loadMyRequests();
  }
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === requestModal) {
      closeModal();
    }
    if (e.target === responseModal) {
      responseModal.classList.remove('active');
    }
  });
}

// Open request creation modal
function openRequestModal() {
  const requestModal = document.getElementById('requestModal');
  const bloodRequestForm = document.getElementById('bloodRequestForm');
  
  requestModal.classList.add('active');
  bloodRequestForm.reset();
  
  // Set default required date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('requiredDate').value = tomorrow.toISOString().split('T')[0];
}

// Close modal
function closeModal() {
  const requestModal = document.getElementById('requestModal');
  requestModal.classList.remove('active');
}

// Apply filters to blood requests
function applyFilters() {
  const bloodGroupFilter = document.getElementById('bloodGroupFilter');
  const locationFilter = document.getElementById('locationFilter');
  const urgencyFilter = document.getElementById('urgencyFilter');
  
  dashboardState.filters = {
    bloodGroup: bloodGroupFilter.value,
    location: locationFilter.value,
    urgency: urgencyFilter.value
  };
  
  loadRequests();
}

// Reset all filters
function resetFilters() {
  const bloodGroupFilter = document.getElementById('bloodGroupFilter');
  const locationFilter = document.getElementById('locationFilter');
  const urgencyFilter = document.getElementById('urgencyFilter');
  
  bloodGroupFilter.value = '';
  locationFilter.value = '';
  urgencyFilter.value = '';
  
  dashboardState.filters = {
    bloodGroup: '',
    location: '',
    urgency: ''
  };
  
  loadRequests();
}

// Load all blood requests (with filters)
async function loadRequests() {
  const requestsContainer = document.getElementById('requestsContainer');
  
  // Show loading
  requestsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Build query string from filters
    let queryParams = '';
    if (dashboardState.filters.bloodGroup) {
      queryParams += `bloodGroup=${dashboardState.filters.bloodGroup}&`;
    }
    if (dashboardState.filters.location) {
      queryParams += `location=${encodeURIComponent(dashboardState.filters.location)}&`;
    }
    if (dashboardState.filters.urgency) {
      queryParams += `urgency=${dashboardState.filters.urgency}&`;
    }
    
    // Only show pending requests by default
    queryParams += 'status=pending';
    
    // Fetch requests
    const requests = await apiRequest(`/requests?${queryParams}`);
    dashboardState.requests = requests;
    
    // Display requests
    if (requests.length === 0) {
      requestsContainer.innerHTML = `
        <div class="empty-state">
          <p>No blood requests match your criteria.</p>
          <p>Try adjusting the filters or check back later.</p>
        </div>
      `;
    } else {
      requestsContainer.innerHTML = '';
      
      requests.forEach(request => {
        requestsContainer.appendChild(createRequestCard(request));
      });
    }
  } catch (error) {
    requestsContainer.innerHTML = `
      <div class="alert alert-danger">
        Error loading blood requests: ${error.message}
      </div>
    `;
  }
}

// Create a blood request card
function createRequestCard(request) {
  const card = document.createElement('div');
  card.className = 'request-card';
  
  // Format date
  const createdDate = new Date(request.created_at);
  const requiredDate = new Date(request.required_date);
  const formattedCreatedDate = createdDate.toLocaleDateString();
  const formattedRequiredDate = requiredDate.toLocaleDateString();
  
  // Determine urgency class
  let urgencyClass = '';
  if (request.urgency === 'normal') {
    urgencyClass = 'urgency-normal';
  } else if (request.urgency === 'urgent') {
    urgencyClass = 'urgency-urgent';
  } else if (request.urgency === 'emergency') {
    urgencyClass = 'urgency-emergency';
  }
  
  card.innerHTML = `
    <div class="request-card-header">
      <div class="blood-type-badge">${request.blood_group}</div>
      <span class="urgency-badge ${urgencyClass}">
        ${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
      </span>
    </div>
    
    <div class="request-card-body">
      <h3 class="request-card-title">
        ${request.patient_name}
      </h3>
      
      <div class="request-info">
        <i class="fas fa-hospital"></i>
        <span>${request.hospital}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-map-marker-alt"></i>
        <span>${request.location}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-calendar"></i>
        <span>Required by: ${formattedRequiredDate}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-tint"></i>
        <span>Units needed: ${request.units_required}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-user"></i>
        <span>Requested by: ${request.users?.full_name || 'Anonymous'}</span>
      </div>
    </div>
    
    <div class="request-card-footer">
      <span class="text-muted">
        <i class="fas fa-clock"></i> ${formattedCreatedDate}
      </span>
      
      ${appState.user.role === 'donor' ? `
        <button class="btn btn-primary btn-sm respond-btn" data-id="${request.id}">
          Respond
        </button>
      ` : ''}
    </div>
  `;
  
  // Add respond button event listener
  if (appState.user.role === 'donor') {
    const respondBtn = card.querySelector('.respond-btn');
    respondBtn.addEventListener('click', () => openResponseModal(request));
  }
  
  return card;
}

// Open donor response modal
function openResponseModal(request) {
  const responseModal = document.getElementById('responseModal');
  const requestDetails = document.getElementById('requestDetails');
  const requestId = document.getElementById('requestId');
  const donorResponseForm = document.getElementById('donorResponseForm');
  
  // Format date
  const requiredDate = new Date(request.required_date);
  const formattedRequiredDate = requiredDate.toLocaleDateString();
  
  // Determine urgency class
  let urgencyClass = '';
  if (request.urgency === 'normal') {
    urgencyClass = 'urgency-normal';
  } else if (request.urgency === 'urgent') {
    urgencyClass = 'urgency-urgent';
  } else if (request.urgency === 'emergency') {
    urgencyClass = 'urgency-emergency';
  }
  
  // Populate request details
  requestDetails.innerHTML = `
    <div class="card-body">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h3 class="card-title">${request.patient_name}</h3>
          <div class="blood-type-badge" style="display: inline-block;">${request.blood_group}</div>
          <span class="urgency-badge ${urgencyClass}" style="margin-left: 0.5rem;">
            ${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
          </span>
        </div>
      </div>
      
      <div class="request-info">
        <i class="fas fa-hospital"></i>
        <span>${request.hospital}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-map-marker-alt"></i>
        <span>${request.location}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-calendar"></i>
        <span>Required by: ${formattedRequiredDate}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-tint"></i>
        <span>Units needed: ${request.units_required}</span>
      </div>
      
      <div class="request-info">
        <i class="fas fa-phone"></i>
        <span>Contact: ${request.contact_phone}</span>
      </div>
      
      ${request.additional_info ? `
        <div class="request-info" style="margin-top: 1rem;">
          <p><strong>Additional Information:</strong></p>
          <p>${request.additional_info}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  // Set request ID in hidden field
  requestId.value = request.id;
  
  // Reset form
  donorResponseForm.reset();
  
  // Show modal
  responseModal.classList.add('active');
}

// Handle blood request form submission
async function handleCreateRequest(e) {
  e.preventDefault();
  
  const patientName = document.getElementById('patientName').value;
  const bloodGroup = document.getElementById('requestBloodGroup').value;
  const unitsRequired = document.getElementById('unitsRequired').value;
  const urgency = document.getElementById('requestUrgency').value;
  const hospital = document.getElementById('hospital').value;
  const location = document.getElementById('location').value;
  const requiredDate = document.getElementById('requiredDate').value;
  const contactPhone = document.getElementById('contactPhone').value;
  const additionalInfo = document.getElementById('additionalInfo').value;
  
  // Basic validation
  if (!patientName || !bloodGroup || !unitsRequired || !urgency || 
      !hospital || !location || !requiredDate || !contactPhone) {
    showAlert('Please fill in all required fields.', 'warning');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Prepare request data
    const requestData = {
      patientName,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      urgency,
      hospital,
      location,
      requiredDate,
      contactPhone,
      additionalInfo
    };
    
    // Submit request
    const response = await apiRequest('/requests', 'POST', requestData);
    
    // Close modal and show success message
    closeModal();
    showAlert('Blood request created successfully!', 'success');
    
    // Reload my requests
    if (appState.user.role === 'recipient') {
      loadMyRequests();
    }
  } catch (error) {
    showAlert(error.message || 'Failed to create blood request.', 'danger');
  } finally {
    showLoading(false);
  }
}

// Handle donor response form submission
async function handleDonorResponse(e) {
  e.preventDefault();
  
  const requestId = document.getElementById('requestId').value;
  const message = document.getElementById('responseMessage').value;
  
  // Basic validation
  if (!message) {
    showAlert('Please enter a message for the recipient.', 'warning');
    return;
  }
  
  // Show loading
  showLoading(true);
  
  try {
    // Submit response
    const response = await apiRequest(`/requests/${requestId}/respond`, 'POST', { message });
    
    // Close modal and show success message
    const responseModal = document.getElementById('responseModal');
    responseModal.classList.remove('active');
    
    showAlert('Your response has been sent!', 'success');
    
    // Refresh my responses tab
    loadMyResponses();
  } catch (error) {
    showAlert(error.message || 'Failed to send response.', 'danger');
  } finally {
    showLoading(false);
  }
}

// Load requests created by the current user
async function loadMyRequests() {
  const myRequestsContainer = document.getElementById('myRequestsContainer');
  
  // Show loading
  myRequestsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Fetch my requests
    const requests = await apiRequest('/requests/user/me');
    dashboardState.myRequests = requests;
    
    // Display requests
    if (requests.length === 0) {
      myRequestsContainer.innerHTML = `
        <div class="empty-state">
          <p>You haven't created any blood requests yet.</p>
          <p>Click the "Create Request" button to get started.</p>
        </div>
      `;
    } else {
      myRequestsContainer.innerHTML = `
        <h3 class="mb-4">My Blood Requests</h3>
        <div class="request-cards">
          ${requests.map(request => `
            <div class="request-card">
              <div class="request-card-header">
                <div class="blood-type-badge">${request.blood_group}</div>
                <span class="badge ${getUrgencyClass(request.urgency)}">
                  ${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                </span>
              </div>
              
              <div class="request-card-body">
                <h3 class="request-card-title">${request.patient_name}</h3>
                
                <div class="request-info">
                  <i class="fas fa-hospital"></i>
                  <span>${request.hospital}</span>
                </div>
                
                <div class="request-info">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${request.location}</span>
                </div>
                
                <div class="request-info">
                  <i class="fas fa-calendar"></i>
                  <span>Required by: ${new Date(request.required_date).toLocaleDateString()}</span>
                </div>
                
                <div class="request-info">
                  <i class="fas fa-tint"></i>
                  <span>Units needed: ${request.units_required}</span>
                </div>
                
                <div class="request-info">
                  <i class="fas fa-info-circle"></i>
                  <span>Status: <strong>${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</strong></span>
                </div>
              </div>
              
              <div class="request-card-footer">
                <span class="text-muted">
                  <i class="fas fa-clock"></i> ${new Date(request.created_at).toLocaleDateString()}
                </span>
                
                <div>
                  <button class="btn btn-outline btn-sm view-responses-btn" data-id="${request.id}">
                    View Responses
                  </button>
                  
                  ${request.status === 'pending' ? `
                    <button class="btn btn-danger btn-sm cancel-request-btn" data-id="${request.id}">
                      Cancel
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Add event listeners to the buttons
      document.querySelectorAll('.view-responses-btn').forEach(btn => {
        btn.addEventListener('click', () => viewRequestResponses(btn.dataset.id));
      });
      
      document.querySelectorAll('.cancel-request-btn').forEach(btn => {
        btn.addEventListener('click', () => cancelRequest(btn.dataset.id));
      });
    }
  } catch (error) {
    myRequestsContainer.innerHTML = `
      <div class="alert alert-danger">
        Error loading your requests: ${error.message}
      </div>
    `;
  }
}

// Get urgency badge class
function getUrgencyClass(urgency) {
  if (urgency === 'normal') return 'urgency-normal';
  if (urgency === 'urgent') return 'urgency-urgent';
  if (urgency === 'emergency') return 'urgency-emergency';
  return '';
}

// View responses to a specific request
async function viewRequestResponses(requestId) {
  // Switch to responses tab
  const responsesTab = document.querySelector('[data-tab="request-responses"]');
  responsesTab.click();
  
  // Load responses for this specific request
  await loadRequestResponses(requestId);
}

// Cancel a blood request
async function cancelRequest(requestId) {
  if (!confirm('Are you sure you want to cancel this blood request?')) {
    return;
  }
  
  showLoading(true);
  
  try {
    await apiRequest(`/requests/${requestId}/status`, 'PUT', { status: 'cancelled' });
    showAlert('Blood request cancelled successfully.', 'success');
    loadMyRequests();
  } catch (error) {
    showAlert(error.message || 'Failed to cancel request.', 'danger');
  } finally {
    showLoading(false);
  }
}

// Load donor responses for current user
async function loadMyResponses() {
  const myResponsesContainer = document.getElementById('myResponsesContainer');
  
  // Show loading
  myResponsesContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // We don't have a specific endpoint for this yet, but will use a placeholder
    // In a real app, you would call the appropriate endpoint
    myResponsesContainer.innerHTML = `
      <h3 class="mb-4">My Responses</h3>
      <p>This feature is coming soon. You'll be able to see all the requests you've responded to here.</p>
    `;
  } catch (error) {
    myResponsesContainer.innerHTML = `
      <div class="alert alert-danger">
        Error loading your responses: ${error.message}
      </div>
    `;
  }
}

// Load responses to requests
async function loadRequestResponses(specificRequestId) {
  const requestResponsesContainer = document.getElementById('requestResponsesContainer');
  
  // Show loading
  requestResponsesContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    let requests;
    
    if (specificRequestId) {
      // Load responses for a specific request
      requests = [await apiRequest(`/requests/${specificRequestId}`)];
    } else {
      // Load all user's requests
      requests = await apiRequest('/requests/user/me');
    }
    
    // If no requests found
    if (!requests || requests.length === 0) {
      requestResponsesContainer.innerHTML = `
        <div class="empty-state">
          <p>You don't have any blood requests yet.</p>
          <p>Create a request to receive responses from donors.</p>
        </div>
      `;
      return;
    }
    
    // We don't have a specific endpoint for responses yet, but will use a placeholder
    // In a real app, you would call the appropriate endpoint
    requestResponsesContainer.innerHTML = `
      <h3 class="mb-4">Responses to Your Requests</h3>
      <p>This feature is coming soon. You'll be able to see all the responses to your blood requests here.</p>
    `;
  } catch (error) {
    requestResponsesContainer.innerHTML = `
      <div class="alert alert-danger">
        Error loading request responses: ${error.message}
      </div>
    `;
  }
}
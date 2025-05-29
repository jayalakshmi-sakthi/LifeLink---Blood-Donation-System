// Notifications JavaScript file

// Global notification state
const notificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false
};

// DOM elements will be initialized when the script loads
let notificationBell;
let notificationCounter;
let notificationPanel;
let notificationList;

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
  // Add notification UI elements to the header
  setupNotificationUI();
  
  // Set up event listeners
  addNotificationEventListeners();
  
  // Load notifications if user is logged in
  if (appState.user && appState.token) {
    loadNotifications();
  }
});

// Setup notification UI elements
function setupNotificationUI() {
  // Create notification bell for the header
  const userMenu = document.getElementById('userMenu');
  
  if (userMenu) {
    // Create notification bell container
    const bellContainer = document.createElement('div');
    bellContainer.className = 'notification-bell';
    
    // Create bell icon
    notificationBell = document.createElement('button');
    notificationBell.className = 'btn btn-icon';
    notificationBell.innerHTML = '<i class="fas fa-bell"></i>';
    
    // Create counter badge
    notificationCounter = document.createElement('span');
    notificationCounter.className = 'notification-counter hidden';
    notificationCounter.textContent = '0';
    
    // Create notification panel (hidden by default)
    notificationPanel = document.createElement('div');
    notificationPanel.className = 'notification-panel hidden';
    
    // Panel header
    const panelHeader = document.createElement('div');
    panelHeader.className = 'notification-header';
    panelHeader.innerHTML = `
      <h3>Notifications</h3>
      <button class="btn btn-link mark-all-read">Mark all as read</button>
    `;
    
    // Notification list
    notificationList = document.createElement('div');
    notificationList.className = 'notification-list';
    
    // Add elements to the DOM
    notificationPanel.appendChild(panelHeader);
    notificationPanel.appendChild(notificationList);
    bellContainer.appendChild(notificationBell);
    bellContainer.appendChild(notificationCounter);
    bellContainer.appendChild(notificationPanel);
    
    // Insert before user greeting
    userMenu.insertBefore(bellContainer, userMenu.firstChild);
  }
}

// Add event listeners for notification UI
function addNotificationEventListeners() {
  if (notificationBell) {
    // Toggle notification panel
    notificationBell.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationPanel.classList.toggle('hidden');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!notificationPanel.contains(e.target) && !notificationBell.contains(e.target)) {
        notificationPanel.classList.add('hidden');
      }
    });
    
    // Mark all as read
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }
  }
}

// Load notifications from API
async function loadNotifications() {
  if (!appState.token) return;
  
  notificationState.isLoading = true;
  
  try {
    const response = await apiRequest('/notifications');
    
    if (response.success) {
      notificationState.notifications = response.notifications;
      notificationState.unreadCount = response.notifications.filter(n => !n.read).length;
      
      // Update UI
      updateNotificationUI();
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  } finally {
    notificationState.isLoading = false;
  }
}

// Update notification UI
function updateNotificationUI() {
  // Update counter
  if (notificationCounter) {
    if (notificationState.unreadCount > 0) {
      notificationCounter.textContent = notificationState.unreadCount > 9 ? '9+' : notificationState.unreadCount;
      notificationCounter.classList.remove('hidden');
    } else {
      notificationCounter.classList.add('hidden');
    }
  }
  
  // Update notification list
  if (notificationList) {
    if (notificationState.notifications.length === 0) {
      notificationList.innerHTML = `
        <div class="empty-notifications">
          <p>No notifications yet</p>
        </div>
      `;
    } else {
      notificationList.innerHTML = '';
      
      // Create notification items
      notificationState.notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        notificationItem.setAttribute('data-id', notification.id);
        
        // Get icon based on notification type
        let icon;
        switch (notification.type) {
          case 'success':
            icon = 'fa-check-circle';
            break;
          case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
          case 'error':
            icon = 'fa-times-circle';
            break;
          default:
            icon = 'fa-info-circle';
        }
        
        // Format date
        const formattedDate = new Date(notification.created_at).toLocaleString();
        
        notificationItem.innerHTML = `
          <div class="notification-icon">
            <i class="fas ${icon}"></i>
          </div>
          <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <span class="notification-time">${formattedDate}</span>
          </div>
          ${!notification.read ? `
            <button class="btn btn-icon mark-read" data-id="${notification.id}">
              <i class="fas fa-check"></i>
            </button>
          ` : ''}
        `;
        
        notificationList.appendChild(notificationItem);
      });
      
      // Add event listeners to mark-read buttons
      document.querySelectorAll('.mark-read').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          markNotificationAsRead(btn.getAttribute('data-id'));
        });
      });
      
      // Add event listeners to notification items
      document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
          // Mark as read if unread
          if (item.classList.contains('unread')) {
            markNotificationAsRead(item.getAttribute('data-id'));
          }
          
          // Handle navigation based on notification type if needed
          const notificationId = item.getAttribute('data-id');
          const notification = notificationState.notifications.find(n => n.id.toString() === notificationId);
          
          if (notification && notification.related_entity && notification.entity_id) {
            handleNotificationNavigation(notification);
          }
        });
      });
    }
  }
}

// Mark a notification as read
async function markNotificationAsRead(notificationId) {
  if (!appState.token) return;
  
  try {
    const response = await apiRequest(`/notifications/${notificationId}/read`, 'PUT');
    
    if (response.success) {
      // Update notification state
      const index = notificationState.notifications.findIndex(n => n.id.toString() === notificationId);
      
      if (index !== -1) {
        notificationState.notifications[index].read = true;
        notificationState.unreadCount = Math.max(0, notificationState.unreadCount - 1);
        
        // Update UI
        updateNotificationUI();
      }
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
  if (!appState.token) return;
  
  try {
    const response = await apiRequest('/notifications/read-all', 'PUT');
    
    if (response.success) {
      // Update notification state
      notificationState.notifications.forEach(notification => {
        notification.read = true;
      });
      
      notificationState.unreadCount = 0;
      
      // Update UI
      updateNotificationUI();
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

// Handle navigation based on notification type
function handleNotificationNavigation(notification) {
  // Close notification panel
  notificationPanel.classList.add('hidden');
  
  // Navigate based on entity type
  if (notification.related_entity === 'blood_request') {
    if (appState.user.role === 'recipient') {
      navigateTo('/dashboard');
      // Assuming a function to view responses for a specific request
      setTimeout(() => {
        const myRequestsTab = document.querySelector('[data-tab="my-requests"]');
        if (myRequestsTab) myRequestsTab.click();
      }, 300);
    } else {
      navigateTo('/dashboard');
    }
  } else if (notification.related_entity === 'donor_response') {
    if (appState.user.role === 'donor') {
      navigateTo('/dashboard');
      // Assuming a function to view donor responses
      setTimeout(() => {
        const myResponsesTab = document.querySelector('[data-tab="my-responses"]');
        if (myResponsesTab) myResponsesTab.click();
      }, 300);
    } else {
      navigateTo('/dashboard');
      // Assuming a function to view responses for a specific request
      setTimeout(() => {
        const requestResponsesTab = document.querySelector('[data-tab="request-responses"]');
        if (requestResponsesTab) requestResponsesTab.click();
      }, 300);
    }
  }
}

// Check for new notifications (poll every 60 seconds)
setInterval(() => {
  if (appState.user && appState.token) {
    loadNotifications();
  }
}, 60000);
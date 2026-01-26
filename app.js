// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const authModal = document.getElementById('authModal');
const bookingModal = document.getElementById('bookingModal');
const modalCloseBtns = document.querySelectorAll('.modal-close');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authForm = document.getElementById('authForm');
const bookingForm = document.getElementById('bookingForm');
const toast = document.getElementById('toast');

// User state (simulated)
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  setActiveNav();
});

// Check if user is logged in (from localStorage)
function checkAuth() {
  const savedUser = localStorage.getItem('medibook_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForLoggedInUser();
  }
}

// Set active navigation based on current page
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Auth modal triggers
  if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (getStartedBtn) getStartedBtn.addEventListener('click', () => openAuthModal('signup'));

  // Modal close buttons
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Auth tabs
  if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
  if (signupTab) signupTab.addEventListener('click', () => switchAuthTab('signup'));

  // Auth form submission
  if (authForm) authForm.addEventListener('submit', handleAuth);

  // Booking form submission
  if (bookingForm) bookingForm.addEventListener('submit', handleBooking);

  // Book buttons
  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', handleBookClick);
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Search functionality
  const searchForm = document.getElementById('searchForm');
  if (searchForm) searchForm.addEventListener('submit', handleSearch);

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', handleContact);

  // Filter functionality
  const specialtyFilter = document.getElementById('specialtyFilter');
  const locationFilter = document.getElementById('locationFilter');
  if (specialtyFilter) specialtyFilter.addEventListener('change', filterDoctors);
  if (locationFilter) locationFilter.addEventListener('change', filterDoctors);
}

// Open Auth Modal
function openAuthModal(tab = 'login') {
  if (authModal) {
    authModal.classList.add('active');
    switchAuthTab(tab);
  }
}

// Close All Modals
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Switch Auth Tab
function switchAuthTab(tab) {
  if (tab === 'login') {
    loginTab?.classList.add('active');
    signupTab?.classList.remove('active');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
  } else {
    loginTab?.classList.remove('active');
    signupTab?.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
  }
}

// Handle Authentication
function handleAuth(e) {
  e.preventDefault();
  
  const activeTab = loginTab?.classList.contains('active') ? 'login' : 'signup';
  const emailInput = document.getElementById(activeTab === 'login' ? 'loginEmail' : 'signupEmail');
  const passwordInput = document.getElementById(activeTab === 'login' ? 'loginPassword' : 'signupPassword');
  
  const email = emailInput?.value;
  const password = passwordInput?.value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (activeTab === 'signup') {
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
  }

  // Simulate authentication
  currentUser = {
    email: email,
    name: email.split('@')[0]
  };

  localStorage.setItem('medibook_user', JSON.stringify(currentUser));
  updateUIForLoggedInUser();
  closeAllModals();
  showToast(activeTab === 'login' ? 'Welcome back!' : 'Account created successfully!', 'success');

  // Reset form
  authForm.reset();
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const headerButtons = document.querySelector('.header-buttons');
  if (headerButtons && currentUser) {
    headerButtons.innerHTML = `
      <span style="color: #64748b; margin-right: 1rem;">Hello, ${currentUser.name}</span>
      <button id="logoutBtn" class="btn btn-outline">Logout</button>
    `;
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  }
}

// Handle Logout
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('medibook_user');
  location.reload();
}

// Handle Book Click
function handleBookClick(e) {
  if (!currentUser) {
    openAuthModal('login');
    showToast('Please login to book an appointment', 'error');
    return;
  }

  const card = e.target.closest('.doctor-card');
  const doctorName = card?.querySelector('.doctor-name')?.textContent;
  
  if (bookingModal) {
    document.getElementById('bookingDoctorName').textContent = doctorName || 'Doctor';
    bookingModal.classList.add('active');
  }
}

// Handle Booking
function handleBooking(e) {
  e.preventDefault();
  
  const date = document.getElementById('bookingDate')?.value;
  const time = document.getElementById('bookingTime')?.value;

  if (!date || !time) {
    showToast('Please select date and time', 'error');
    return;
  }

  // Simulate booking
  const appointments = JSON.parse(localStorage.getItem('medibook_appointments') || '[]');
  const doctorName = document.getElementById('bookingDoctorName')?.textContent;
  
  appointments.push({
    id: Date.now(),
    doctor: doctorName,
    date: date,
    time: time,
    status: 'upcoming'
  });

  localStorage.setItem('medibook_appointments', JSON.stringify(appointments));
  
  closeAllModals();
  showToast('Appointment booked successfully!', 'success');
  bookingForm.reset();

  // Redirect to appointments if on doctors page
  setTimeout(() => {
    if (window.location.pathname.includes('doctors')) {
      window.location.href = 'appointments.html';
    }
  }, 1500);
}

// Handle Search
function handleSearch(e) {
  e.preventDefault();
  const query = document.getElementById('searchQuery')?.value;
  const location = document.getElementById('searchLocation')?.value;
  
  window.location.href = `doctors.html?q=${encodeURIComponent(query || '')}&location=${encodeURIComponent(location || '')}`;
}

// Handle Contact Form
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) return; // safety check

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // STOP reload

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !subject || !message) {
      alert("Please fill all fields");
      return;
    }

    // redirect to chat.html
    window.location.href = "chat.html";
  });
});


// Filter Doctors
function filterDoctors() {
  const specialty = document.getElementById('specialtyFilter')?.value || '';
  const location = document.getElementById('locationFilter')?.value || '';
  
  document.querySelectorAll('.doctor-card').forEach(card => {
    const cardSpecialty = card.querySelector('.doctor-specialty')?.textContent.toLowerCase() || '';
    const cardLocation = card.querySelector('.doctor-location')?.textContent.toLowerCase() || '';
    
    const matchesSpecialty = !specialty || cardSpecialty.includes(specialty.toLowerCase());
    const matchesLocation = !location || cardLocation.includes(location.toLowerCase());
    
    card.style.display = matchesSpecialty && matchesLocation ? 'block' : 'none';
  });
}

// Show Toast Notification
function showToast(message, type = 'success') {
  if (toast) {
    toast.textContent = message;
    toast.className = `toast active ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}

// Load appointments on appointments page
if (window.location.pathname.includes('appointments')) {
  loadAppointments();
}

function loadAppointments() {
  const container = document.getElementById('appointmentsList');
  if (!container) return;

  const appointments = JSON.parse(localStorage.getItem('medibook_appointments') || '[]');

  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Appointments Yet</h3>
        <p>Book your first appointment with a doctor</p>
        <a href="doctors.html" class="btn btn-primary btn-large" style="margin-top: 1rem;">Find a Doctor</a>
      </div>
    `;
    return;
  }

  container.innerHTML = appointments.map(apt => `
    <div class="appointment-card">
      <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100" alt="Doctor">
      <div class="appointment-details">
        <div class="appointment-doctor">${apt.doctor}</div>
        <div class="appointment-specialty">General Physician</div>
        <div class="appointment-datetime">📅 ${apt.date} at ${apt.time}</div>
      </div>
      <span class="appointment-status status-${apt.status}">${apt.status}</span>
    </div>
  `).join('');
}
// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav');

if (mobileMenuBtn && navMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active'); // toggle the menu
  });
}

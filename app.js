// ---------------------- DOM Elements ----------------------
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const authModal = document.getElementById('authModal');
const modalCloseBtns = document.querySelectorAll('.modal-close');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const toast = document.getElementById('toast');

// OTP elements
let otpInput, verifyOtpBtn;

// ---------------------- User State ----------------------
let currentUser = null;
let tempSignupData = null;
let generatedOTP = null;

// ---------------------- Initialization ----------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  initMobileMenu();
});

// ---------------------- Functions ----------------------
function checkAuth() {
  const savedUser = localStorage.getItem('medibook_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateUIForLoggedInUser();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('medibook_user');
    }
  }
}

function setupEventListeners() {
  // Auth buttons
  if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (getStartedBtn) getStartedBtn.addEventListener('click', () => openAuthModal('signup'));

  // Modal close buttons
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Tab switching
  if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
  if (signupTab) signupTab.addEventListener('click', () => switchAuthTab('signup'));

  // Form submissions
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', handleLogin);
  }

  if (signupFormElement) {
    signupFormElement.addEventListener('submit', handleSignupContinue);
  }

  // Password toggle
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
        this.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
        this.setAttribute('aria-label', 'Show password');
      }
    });
  });

  // Switch between login/signup forms
  document.querySelector('.switch-to-signup')?.addEventListener('click', () => {
    switchAuthTab('signup');
  });

  document.querySelector('.switch-to-login')?.addEventListener('click', () => {
    switchAuthTab('login');
  });

  // Social login buttons
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
      showToast(`Sign in with ${provider} is not implemented yet`, 'info');
    });
  });
}

function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
      
      const hamburgerIcon = mobileMenuBtn.querySelector('.hamburger-icon');
      if (navMenu.classList.contains('active')) {
        hamburgerIcon.textContent = '✕';
        document.body.style.overflow = 'hidden';
      } else {
        hamburgerIcon.textContent = '☰';
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-container') && navMenu.classList.contains('active')) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        const hamburgerIcon = mobileMenuBtn.querySelector('.hamburger-icon');
        hamburgerIcon.textContent = '☰';
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
          const hamburgerIcon = mobileMenuBtn.querySelector('.hamburger-icon');
          hamburgerIcon.textContent = '☰';
          document.body.style.overflow = '';
        }
      });
    });
  }
}

function openAuthModal(tab = 'login') {
  if (authModal) {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab);
    // Focus on first input
    setTimeout(() => {
      const firstInput = authModal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
  removeOtpInput();
  clearFormErrors();
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    removeOtpInput();
  } else {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    removeOtpInput();
  }
  
  // Update ARIA attributes
  loginTab.setAttribute('aria-selected', tab === 'login');
  signupTab.setAttribute('aria-selected', tab === 'signup');
}

// ---------------------- LOGIN ----------------------
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();
  
  // Clear previous errors
  clearFormErrors();
  
  // Validation
  let isValid = true;
  
  if (!email) {
    showInputError('loginEmail', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showInputError('loginEmail', 'Please enter a valid email');
    isValid = false;
  }
  
  if (!password) {
    showInputError('loginPassword', 'Password is required');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Simulate API call delay
  showLoading(true);
  
  setTimeout(() => {
    const savedUser = JSON.parse(localStorage.getItem('medibook_user'));
    
    if (savedUser && savedUser.email === email && savedUser.password === password) {
      currentUser = savedUser;
      updateUIForLoggedInUser();
      closeAllModals();
      showToast('Welcome back, ' + currentUser.firstName + '!', 'success');
    } else {
      showInputError('loginPassword', 'Invalid email or password');
    }
    
    showLoading(false);
  }, 1000);
}

// ---------------------- SIGNUP ----------------------
function handleSignupContinue(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('firstName')?.value.trim();
  const lastName = document.getElementById('lastName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const password = document.getElementById('signupPassword')?.value.trim();
  const confirmPassword = document.getElementById('confirmPassword')?.value.trim();
  const dob = document.getElementById('dob')?.value;
  
  // Debug log
  console.log("Phone entered:", phone);
  console.log("Phone digits only:", phone ? phone.replace(/\D/g, '') : "empty");
  
  // Clear previous errors
  clearFormErrors();
  
  // Validation
  let isValid = true;
  
  if (!firstName) {
    showInputError('firstName', 'First name is required');
    isValid = false;
  }
  
  if (!lastName) {
    showInputError('lastName', 'Last name is required');
    isValid = false;
  }
  
  if (!email) {
    showInputError('signupEmail', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showInputError('signupEmail', 'Please enter a valid email');
    isValid = false;
  }
  
  // FIXED PHONE VALIDATION - NO isValidPhone CALL
  if (!phone) {
    showInputError('phone', 'Phone number is required');
    isValid = false;
  } else {
    // Simple digit count - only check digits
    const digitsOnly = phone.replace(/\D/g, '');
    console.log("Digit count:", digitsOnly.length);
    
    if (digitsOnly.length < 10) {
      showInputError('phone', 'Phone number must have at least 10 digits');
      isValid = false;
    }
  }
  
  if (!password) {
    showInputError('signupPassword', 'Password is required');
    isValid = false;
  } else if (password.length < 6) {
    showInputError('signupPassword', 'Password must be at least 6 characters');
    isValid = false;
  }
  
  if (!confirmPassword) {
    showInputError('confirmPassword', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirmPassword) {
    showInputError('confirmPassword', 'Passwords do not match');
    isValid = false;
  }
  
  if (!dob) {
    showInputError('dob', 'Date of birth is required');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Save temp data
  tempSignupData = { 
    id: Date.now(),
    email, 
    password, 
    firstName, 
    lastName, 
    phone,
    dob,
    createdAt: new Date().toISOString()
  };
  
  // Show loading
  showLoading(true);
  
  // Simulate OTP generation delay - SEND TO PHONE
  setTimeout(() => {
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    
    // In real app, send OTP via SMS to phone
    console.log('OTP for phone', phone, ':', generatedOTP); // For debugging
    
    // Show success message with phone
    const phoneDigits = phone.replace(/\D/g, '');
    const maskedPhone = '******' + phoneDigits.slice(-4);
    showToast(`OTP has been sent to ${maskedPhone}`, 'success');
    
    showOtpInput();
    
    // Focus on OTP input
    setTimeout(() => {
      if (otpInput) otpInput.focus();
    }, 100);
    
    showLoading(false);
  }, 1500);
}

// ---------------------- OTP ----------------------
function showOtpInput() {
  removeOtpInput();
  
  const otpContainer = document.createElement('div');
  otpContainer.className = 'otp-container';
  otpContainer.innerHTML = `
    <div class="form-group">
      <label for="otpInput">Enter OTP</label>
      <div class="input-with-icon">
        <i class="fas fa-key" aria-hidden="true"></i>
        <input 
          type="text" 
          id="otpInput" 
          placeholder="Enter 6-digit OTP" 
          maxlength="6"
          inputmode="numeric"
          pattern="[0-9]{6}"
          required
        >
      </div>
      <p class="otp-help">OTP sent to your mobile number ending with ${tempSignupData?.phone?.slice(-4) || '****'}</p>
      <p class="demo-otp" style="color: #666; font-size: 0.9rem; margin-top: 5px; background: #f0f0f0; padding: 5px; border-radius: 4px;">
        <strong>Demo OTP:</strong> ${generatedOTP}
      </p>
    </div>
    <button type="button" id="verifyOtpBtn" class="btn btn-primary btn-block">
      <i class="fas fa-check-circle" aria-hidden="true"></i> Verify OTP
    </button>
    <button type="button" id="resendOtpBtn" class="btn btn-outline btn-block" style="margin-top: 0.5rem;">
      <i class="fas fa-redo" aria-hidden="true"></i> Resend OTP
    </button>
  `;
  
  signupFormElement.appendChild(otpContainer);
  
  otpInput = document.getElementById('otpInput');
  verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  
  if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', verifyOtp);
  if (resendOtpBtn) resendOtpBtn.addEventListener('click', resendOtp);
  
  // Auto-submit on 6 digits
  if (otpInput) {
    otpInput.addEventListener('input', function() {
      if (this.value.length === 6) {
        verifyOtp();
      }
    });
  }
}

function removeOtpInput() {
  const otpContainer = document.querySelector('.otp-container');
  if (otpContainer) otpContainer.remove();
}

function verifyOtp() {
  const enteredOtp = otpInput?.value.trim();
  
  if (!enteredOtp || enteredOtp.length !== 6) {
    showToast('Please enter a 6-digit OTP', 'error');
    return;
  }
  
  if (enteredOtp === String(generatedOTP)) {
    // Save user to localStorage
    localStorage.setItem('medibook_user', JSON.stringify(tempSignupData));
    
    // Save to "database" (localStorage array)
    const users = JSON.parse(localStorage.getItem('medibook_users') || '[]');
    users.push(tempSignupData);
    localStorage.setItem('medibook_users', JSON.stringify(users));
    
    currentUser = tempSignupData;
    
    showToast('Account created successfully! Welcome ' + currentUser.firstName, 'success');
    
    closeAllModals();
    updateUIForLoggedInUser();
    
    // Clear temp data
    tempSignupData = null;
    generatedOTP = null;
  } else {
    showToast('Invalid OTP. Please try again.', 'error');
    otpInput.value = '';
    otpInput.focus();
  }
}

function resendOtp() {
  if (!tempSignupData?.phone) return;
  
  generatedOTP = Math.floor(100000 + Math.random() * 900000);
  console.log('Resent OTP for', tempSignupData.phone, ':', generatedOTP);
  
  showToast('New OTP has been sent to your mobile', 'success');
  
  // Update demo OTP text
  const demoOtpText = document.querySelector('.demo-otp');
  if (demoOtpText) {
    demoOtpText.innerHTML = `<strong>Demo OTP:</strong> ${generatedOTP}`;
  }
  
  if (otpInput) {
    otpInput.value = '';
    otpInput.focus();
  }
}

// ---------------------- UI Updates ----------------------
function updateUIForLoggedInUser() {
  const navActions = document.querySelector('.nav-actions');
  if (navActions && currentUser) {
    navActions.innerHTML = `
      <div class="user-dropdown">
        <button class="user-menu-btn" aria-label="User menu">
          <i class="fas fa-user-circle"></i>
          <span>${currentUser.firstName}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown-menu">
          <a href="appointment.html"><i class="fas fa-calendar-alt"></i> My Appointments</a>
          <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
          <div class="divider"></div>
          <button id="logoutBtn" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    `;
    
    // Add dropdown functionality
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const dropdownMenu = document.querySelector('.user-dropdown-menu');
    
    userMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
      dropdownMenu?.classList.remove('show');
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('medibook_user');
  showToast('Logged out successfully', 'success');
  
  // Reload to reset UI
  setTimeout(() => {
    location.reload();
  }, 1000);
}

// ---------------------- HELPER FUNCTIONS ----------------------
function showInputError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;
  
  // Remove existing error
  const existingError = formGroup.querySelector('.error-message');
  if (existingError) existingError.remove();
  
  // Add error class
  input.classList.add('input-error');
  
  // Create error message
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  error.style.color = '#ef4444';
  error.style.fontSize = '0.85rem';
  error.style.marginTop = '0.25rem';
  
  formGroup.appendChild(error);
  
  // Focus on error input
  input.focus();
}

function clearFormErrors() {
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
}

// ---------------------- Toast ----------------------
function showToast(message, type = 'success') {
  if (!toast) return;
  
  // Set message and type
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  
  // Set icon based on type
  let icon = 'fas fa-check-circle';
  if (type === 'error') icon = 'fas fa-exclamation-circle';
  if (type === 'info') icon = 'fas fa-info-circle';
  if (type === 'warning') icon = 'fas fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="${icon}" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  
  // Auto-hide
  setTimeout(() => {
    toast.classList.remove('active');
  }, 4000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key closes modals
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
  .user-dropdown {
    position: relative;
    display: inline-block;
  }
  
  .user-menu-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #334155;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .user-menu-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .user-dropdown-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .user-dropdown-menu a,
  .user-dropdown-menu .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #334155;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  
  .user-dropdown-menu a:hover,
  .user-dropdown-menu .logout-btn:hover {
    background: #f8fafc;
  }
  
  .user-dropdown-menu .divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0;
  }
  
  .logout-btn {
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }
  
  .otp-container {
    animation: fadeIn 0.3s ease;
  }
  
  .otp-help {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 0.25rem;
  }
  
  .input-error {
    border-color: #ef4444 !important;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
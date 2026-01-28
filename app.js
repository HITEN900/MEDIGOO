// ---------------------- DOM Elements ----------------------
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const authModal = document.getElementById('authModal');
const modalCloseBtns = document.querySelectorAll('.modal-close');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
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
});

// ---------------------- Functions ----------------------
function checkAuth() {
  const savedUser = localStorage.getItem('medibook_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForLoggedInUser();
  }
}

function setupEventListeners() {
  if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));
  if (getStartedBtn) getStartedBtn.addEventListener('click', () => openAuthModal('signup'));

  modalCloseBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAllModals(); });
  });

  if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
  if (signupTab) signupTab.addEventListener('click', () => switchAuthTab('signup'));

  // Login Submit
  loginForm.querySelector('button')?.addEventListener('click', handleLogin);

  // Signup Continue
  signupForm.querySelector('button')?.addEventListener('click', handleSignupContinue);
}

function openAuthModal(tab = 'login') {
  if (authModal) {
    authModal.classList.add('active');
    switchAuthTab(tab);
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
  removeOtpInput();
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    removeOtpInput();
  } else {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    removeOtpInput();
  }
}

// ---------------------- LOGIN ----------------------
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const savedUser = JSON.parse(localStorage.getItem('medibook_user'));
  if (savedUser && savedUser.email === email && savedUser.password === password) {
    currentUser = savedUser;
    updateUIForLoggedInUser();
    closeAllModals();
    showToast('Welcome back!', 'success');
  } else {
    showToast('Invalid login credentials', 'error');
  }
}

// ---------------------- SIGNUP ----------------------
function handleSignupContinue(e) {
  e.preventDefault();

  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value.trim();
  const confirmPassword = document.getElementById('confirmPassword')?.value.trim();
  const firstName = document.getElementById('firstName')?.value.trim();
  const lastName = document.getElementById('lastName')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const dob = document.getElementById('dob')?.value;

  if (!email || !password || !confirmPassword || !firstName || !lastName || !phone || !dob) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  // Save temp data
  tempSignupData = { email, password, firstName, lastName, phone, dob };

  // Generate OTP
  generatedOTP = Math.floor(100000 + Math.random() * 900000);
  showToast(`OTP sent: ${generatedOTP}`, 'success'); // For demo

  showOtpInput();
}

// ---------------------- OTP ----------------------
function showOtpInput() {
  removeOtpInput();
  const otpContainer = document.createElement('div');
  otpContainer.id = 'otpContainer';
  otpContainer.innerHTML = `
    <input type="text" id="otpInput" placeholder="Enter OTP" style="width:100%;padding:6px;margin:8px 0;">
    <button type="button" id="verifyOtpBtn" style="width:100%;padding:8px;margin-top:4px;background-color: #4CAF50;color:white;">Verify OTP</button>
  `;
  signupForm.appendChild(otpContainer);

  otpInput = document.getElementById('otpInput');
  verifyOtpBtn = document.getElementById('verifyOtpBtn');
  verifyOtpBtn.addEventListener('click', verifyOtp);
}

function removeOtpInput() {
  const otpContainer = document.getElementById('otpContainer');
  if (otpContainer) otpContainer.remove();
}

function verifyOtp() {
  const enteredOtp = otpInput?.value.trim();
  if (!enteredOtp) {
    showToast('Please enter OTP', 'error');
    return;
  }

  if (enteredOtp === String(generatedOTP)) {
    localStorage.setItem('medibook_user', JSON.stringify(tempSignupData));
    currentUser = tempSignupData;
    showToast('OTP verified! Welcome ' + currentUser.firstName, 'success');
    closeAllModals();
    updateUIForLoggedInUser();
    tempSignupData = null;
    generatedOTP = null;
  } else {
    showToast('Invalid OTP. Try again.', 'error');
  }
}

// ---------------------- UI Updates ----------------------
function updateUIForLoggedInUser() {
  const headerButtons = document.querySelector('.header-buttons');
  if (headerButtons && currentUser) {
    headerButtons.innerHTML = `
      <span style="color: #64748b; margin-right: 1rem;">Hello, ${currentUser.firstName}</span>
      <button id="logoutBtn" class="btn btn-outline">Logout</button>
    `;
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('medibook_user');
  location.reload();
}

// ---------------------- Toast ----------------------
function showToast(message, type = 'success') {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  setTimeout(() => { toast.classList.remove('active'); }, 3000);
}
// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

mobileMenuBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
});

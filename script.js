// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
  
  // Reset forms when navigating away
  if (pageId !== 'registration') {
    document.getElementById('registration-form').reset();
    nextStep(1);
  }
  if (pageId !== 'contact') {
    document.getElementById('contact-form').reset();
  }
}

// ==================== REGISTRATION FORM ====================
let currentStep = 1;
const totalSteps = 4;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwKrXv1ejffyFEGSKPmIGTiwUdL3Ci7eOkOQb5kwPqHMPJ0HjnKX6-XVdlPZibynGbU/exec"; 
// Replace with your deployed web app URL

function nextStep(step) {
  // Validate current step before proceeding
  if (step > currentStep) {
    if (!validateStep(currentStep)) {
      alert('Please fill all required fields correctly before proceeding.');
      return;
    }
  }

  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${step}`).classList.add('active');

  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab[data-step="${step}"]`).classList.add('active');

  currentStep = step;
  updateProgress();
}

function prevStep(step) {
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${step}`).classList.add('active');

  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab[data-step="${step}"]`).classList.add('active');

  currentStep = step;
  updateProgress();
}

function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('name').value;
    const father = document.getElementById('father-name').value;
    const mother = document.getElementById('mother-name').value;
    const gender = document.getElementById('gender').value;
    const bloodGroup = document.getElementById('blood-group').value;

    if (!name || !father || !mother || !gender || !bloodGroup) {
      return false;
    }
  } else if (step === 2) {
    const department = document.getElementById('department').value;
    if (!department) return false;
  } else if (step === 3) {
    const address = document.getElementById('address').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;

    if (!address || !mobile || !email) return false;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    // Basic mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return false;
    }
  }
  return true;
}

function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('registration-progress').style.width = `${progress}%`;
}

// ==================== TOGGLE SUBJECTS ====================
function toggleSubjects() {
  const department = document.getElementById('department').value;

  // Hide all subject groups first
  const groups = ['science-subjects', 'arts-subjects', 'commerce-subjects'];
  groups.forEach(groupId => {
    const group = document.getElementById(groupId);
    group.style.display = 'none';

    // Uncheck all checkboxes inside hidden groups
    group.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  });

  let activeGroup = null;

  // Show only the selected department's subjects
  if (department === 'Science') {
    activeGroup = document.getElementById('science-subjects');
  } else if (department === 'Arts') {
    activeGroup = document.getElementById('arts-subjects');
  } else if (department === 'Commerce') {
    activeGroup = document.getElementById('commerce-subjects');
  }

  if (activeGroup) {
    activeGroup.style.display = 'block';

    // Allow only one subject at a time (radio-like behavior)
    activeGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', function () {
        if (this.checked) {
          activeGroup.querySelectorAll('input[type="checkbox"]').forEach(other => {
            if (other !== this) other.checked = false;
          });
        }
      });
    });
  }
}


// ==================== OTP FUNCTIONS ====================
function sendOTP() {
  const mobile = document.getElementById('mobile').value;
  if (!mobile) {
    alert('Please enter your mobile number first');
    return;
  }

  // TODO: Replace with real OTP API call
  document.getElementById('otp-mobile').textContent = mobile;
  nextStep(4);
  alert(`OTP has been sent to ${mobile}`);
}

async function verifyOTP() {
  const otp = document.getElementById('otp').value;
  if (!otp) {
    alert('Please enter the OTP');
    return;
  }

  // TODO: Replace with real OTP verification
  const success = await saveRegistrationData();
  if (success) {
    alert('Registration successful! You will receive a confirmation email shortly.');
    document.getElementById('registration-form').reset();
    nextStep(1);
    showPage('dashboard');
  } else {
    alert('Registration failed. Please try again.');
  }
}
// ==================== SAVE DATA TO GOOGLE SHEETS ====================
async function saveRegistrationData() {
  const data = {
    type: "registration",
    name: document.getElementById('name').value,
    father: document.getElementById('father-name').value,
    mother: document.getElementById('mother-name').value,
    gender: document.getElementById('gender').value,
    bloodGroup: document.getElementById('blood-group').value,
    department: document.getElementById('department').value,
    mobile: document.getElementById('mobile').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    postOffice: document.getElementById('post-office').value,
    policeStation: document.getElementById('police-station').value,
    district: document.getElementById('district').value,
    state: document.getElementById('state').value,
    pincode: document.getElementById('pincode').value
  };

  try {
    showLoading('Submitting registration...');
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });
    
    hideLoading();
    const result = await response.json();
    
    if (result.result === "success") {
      return true;
    } else {
      console.error("Error saving registration:", result.message);
      return false;
    }
  } catch (err) {
    hideLoading();
    console.error("Error saving registration:", err);
    return false;
  }
}

// Save contact
document.getElementById('contact-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const data = {
    type: "contact",
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    mobile: document.getElementById('contact-mobile').value,
    subject: document.getElementById('contact-subject').value,
    message: document.getElementById('contact-message').value
  };

  // Basic validation
  if (!data.name || !data.email || !data.subject || !data.message) {
    alert('Please fill all required fields.');
    return;
  }

  try {
    showLoading('Sending message...');
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });
    
    hideLoading();
    const result = await response.json();
    
    if (result.result === "success") {
      alert("Message sent successfully! You will receive a confirmation email shortly.");
      this.reset();
    } else {
      alert("Failed to send message. Please try again.");
    }
  } catch (err) {
    hideLoading();
    console.error("Error saving contact:", err);
    alert("Failed to send message. Please check your connection and try again.");
  }
});

// Save collaboration request
document.getElementById('collaboration-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const data = {
    type: "collaboration",
    orgName: document.getElementById('org-name').value,
    orgType: document.getElementById('org-type').value,
    contactPerson: document.getElementById('contact-person').value,
    orgEmail: document.getElementById('org-email').value,
    collabInterest: document.getElementById('collab-interest').value
  };

  try {
    showLoading('Submitting collaboration request...');
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });
    
    hideLoading();
    const result = await response.json();
    
    if (result.result === "success") {
      alert("Collaboration request submitted successfully! We will contact you shortly.");
      this.reset();
    } else {
      alert("Failed to submit request. Please try again.");
    }
  } catch (err) {
    hideLoading();
    console.error("Error saving collaboration:", err);
    alert("Failed to submit request. Please check your connection and try again.");
  }
});

// Loading indicator functions
function showLoading(message = 'Processing...') {
  // Create loading overlay if it doesn't exist
  if (!document.getElementById('loading-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    
    const spinner = document.createElement('div');
    spinner.style.backgroundColor = 'white';
    spinner.style.padding = '20px';
    spinner.style.borderRadius = '8px';
    spinner.style.display = 'flex';
    spinner.style.flexDirection = 'column';
    spinner.style.alignItems = 'center';
    
    const spinnerIcon = document.createElement('div');
    spinnerIcon.className = 'spinner';
    spinnerIcon.style.border = '4px solid #f3f3f3';
    spinnerIcon.style.borderTop = '4px solid #3498db';
    spinnerIcon.style.borderRadius = '50%';
    spinnerIcon.style.width = '30px';
    spinnerIcon.style.height = '30px';
    spinnerIcon.style.animation = 'spin 1s linear infinite';
    
    const text = document.createElement('p');
    text.textContent = message;
    text.style.marginTop = '10px';
    
    spinner.appendChild(spinnerIcon);
    spinner.appendChild(text);
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  } else {
    document.getElementById('loading-overlay').style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function () {
  updateProgress();
  toggleSubjects();
  
  // Add collaboration form event listener if it exists
  const collaborationForm = document.getElementById('collaboration-form');
  if (collaborationForm) {
    collaborationForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      // Handle collaboration form submission
    });
  }

});









// ==================== GALLERY ====================
document.addEventListener("DOMContentLoaded", function () {
    // Sample gallery data with more images
    const photos = [
        // Cleanliness Drive
        {src: "gallery/clean1.jpg", caption: "Campus Cleanup Activity", album: "cleanliness"},
        {src: "gallery/clean2.jpg", caption: "Volunteers Cleaning Surroundings", album: "cleanliness"},
        {src: "gallery/clean3.jpg", caption: "Waste Management Drive", album: "cleanliness"},
        
        // Nss day 2025
        {src: "gallery/NSS1.jpg", caption: "NSS DAY 2025", album: "NSS DAY"},
        {src: "gallery/tree2.jpg", caption: "Sapling Distribution", album: "tree-plantation"},
        {src: "gallery/tree3.jpg", caption: "Green Campus Initiative", album: "tree-plantation"},
        
        // Blood Donation
        {src: "gallery/blood1.jpg", caption: "Blood Donation Camp", album: "blood-donation"},
        {src: "gallery/blood2.jpg", caption: "Volunteers Donating Blood", album: "blood-donation"},
        {src: "gallery/blood3.jpg", caption: "Blood Donation Certificate Distribution", album: "blood-donation"},
        
        // Awareness Camp
        {src: "gallery/awareness1.jpg", caption: "Health Awareness Session", album: "awareness"},
        {src: "gallery/awareness2.jpg", caption: "Community Outreach Program", album: "awareness"},
        {src: "gallery/awareness3.jpg", caption: "Educational Awareness Camp", album: "awareness"},
        
        // NSS Mentor
        {src: "gallery/mentor1.jpg", caption: "NSS Mentor Guidance Session", album: "nss-mentor"},
        {src: "gallery/mentor2.jpg", caption: "Mentor-Volunteer Interaction", album: "nss-mentor"},
        {src: "gallery/mentor3.jpg", caption: "Leadership Training", album: "nss-mentor"},
        
        // Special Camp
        {src: "gallery/camp1.jpg", caption: "7-Day Special Camp", album: "special-camp"},
        {src: "gallery/camp2.jpg", caption: "Camp Activities", album: "special-camp"},
        {src: "gallery/camp3.jpg", caption: "Camp Certificate Distribution", album: "special-camp"}
    ];

    const galleryGrid = document.getElementById("gallery-grid");
    const uploadSection = document.getElementById("upload-section");
    const adminToggle = document.getElementById("admin-toggle");
    const uploadForm = document.getElementById("upload-form");

    let isAdminMode = false;

    // Function to render gallery
    function renderGallery(album = "all") {
        galleryGrid.innerHTML = '';
        
        const filteredPhotos = album === "all" ? photos : photos.filter(photo => photo.album === album);
        
        filteredPhotos.forEach(photo => {
            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-album", photo.album);

            card.innerHTML = `
                <div class="gallery-item">
                    <img src="${photo.src}" alt="${photo.caption}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
                    <div class="gallery-caption">${photo.caption}</div>
                </div>
                <div class="p-4 flex justify-between items-center">
                    <span class="text-gray-700">${photo.caption}</span>
                    <div class="flex space-x-3">
                        <a href="${photo.src}" target="_blank" class="text-blue-600"><i class="fas fa-eye"></i></a>
                        <a href="${photo.src}" download class="text-green-600"><i class="fas fa-download"></i></a>
                        ${isAdminMode ? `<button class="text-red-600 delete-image" data-src="${photo.src}"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </div>
            `;
            galleryGrid.appendChild(card);
        });

        // Add delete event listeners in admin mode
        if (isAdminMode) {
            document.querySelectorAll('.delete-image').forEach(button => {
                button.addEventListener('click', function() {
                    const imageSrc = this.getAttribute('data-src');
                    deleteImage(imageSrc);
                });
            });
        }
    }

    // Function to delete image
    function deleteImage(imageSrc) {
        if (confirm('Are you sure you want to delete this image?')) {
            const index = photos.findIndex(photo => photo.src === imageSrc);
            if (index !== -1) {
                photos.splice(index, 1);
                const currentAlbum = document.querySelector('.tab.active').getAttribute('data-album');
                renderGallery(currentAlbum);
            }
        }
    }

    // Function to handle image upload
    function handleImageUpload(event) {
        event.preventDefault();
        
        const album = document.getElementById('image-album').value;
        const caption = document.getElementById('image-caption').value;
        const files = document.getElementById('image-upload').files;
        
        if (!album || !caption || files.length === 0) {
            alert('Please fill all fields and select at least one image.');
            return;
        }

        // Simulate file upload (in real implementation, you would upload to server)
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const newPhoto = {
                    src: e.target.result,
                    caption: caption + (files.length > 1 ? ` ${i + 1}` : ''),
                    album: album
                };
                
                photos.push(newPhoto);
                
                // If this is the last file, re-render gallery
                if (i === files.length - 1) {
                    const currentAlbum = document.querySelector('.tab.active').getAttribute('data-album');
                    if (currentAlbum === 'all' || currentAlbum === album) {
                        renderGallery(currentAlbum);
                    }
                    
                    // Reset form
                    uploadForm.reset();
                    alert('Images uploaded successfully!');
                }
            };
            
            reader.readAsDataURL(file);
        }
    }

    // Admin mode toggle
    adminToggle.addEventListener('click', function() {
        isAdminMode = !isAdminMode;
        uploadSection.classList.toggle('hidden', !isAdminMode);
        adminToggle.textContent = isAdminMode ? 'User Mode' : 'Admin Mode';
        adminToggle.className = isAdminMode ? 'btn btn-primary' : 'btn btn-secondary';
        
        const currentAlbum = document.querySelector('.tab.active').getAttribute('data-album');
        renderGallery(currentAlbum);
    });

    // Album filtering
    document.querySelectorAll(".tab[data-album]").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const album = this.getAttribute("data-album");
            renderGallery(album);
        });
    });

    // Upload form submission
    uploadForm.addEventListener('submit', handleImageUpload);

    // Initial render
    renderGallery();
});











// ==================== NOTICE SECTION ====================

// Example notice list
const notices = [
  {
    src: "notices/notice1.jpg",
    caption: "Blood Donation Camp - Volunteers Required",
    date: "15 October 2023",
    form: "https://forms.gle/example1"  // Google Form link
  },
  {
    src: "notices/notice2.jpg",
    caption: "Tree Plantation Drive Results",
    date: "8 October 2023",
    form: "" // Registration closed
  },
  {
    src: "notices/notice3.jpg",
    caption: "NSS Annual Meeting Schedule",
    date: "1 October 2023",
    form: "https://forms.gle/example2"
  },
];

// Load notices dynamically (only if #notice-grid exists)
document.addEventListener("DOMContentLoaded", function () {
  const noticeGrid = document.getElementById("notice-grid");
  if (!noticeGrid) return; // skip if not on notice.html

  notices.forEach(notice => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="gallery-item">
        <img src="${notice.src}" alt="${notice.caption}">
        <div class="gallery-caption">${notice.caption}</div>
      </div>
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-semibold">${notice.caption}</h3>
        <p class="text-gray-600 text-sm">Published on: ${notice.date}</p>
        <div class="flex justify-between items-center">
          <div class="flex space-x-3">
            <a href="${notice.src}" target="_blank" class="text-blue-600"><i class="fas fa-eye"></i></a>
            <a href="${notice.src}" download class="text-green-600"><i class="fas fa-download"></i></a>
          </div>
          ${notice.form 
            ? `<a href="${notice.form}" target="_blank" class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">Register</a>` 
            : `<span class="text-gray-400 text-sm">Registration Closed</span>`}
        </div>
      </div>
    `;

    noticeGrid.appendChild(card);
  });
});











// ==================== EVENTS DATA ====================
const events = [
  // ... your existing events data ...
];

// ==================== FUNCTIONS ====================

// Update event status based on current date
function updateEventStatus() {
  const today = new Date();
  events.forEach(event => {
    const eventDate = new Date(event.date + "T" + event.time);
    event.status = eventDate >= today ? "upcoming" : "past";
  });
}

// Render events
function renderEvents(category = "all") {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  updateEventStatus();

  // Sort: upcoming first, past later
  const sorted = [...events].sort((a, b) => {
    if (a.status === b.status) {
      return a.status === "upcoming"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    return a.status === "upcoming" ? -1 : 1;
  });

  sorted.forEach(event => {
    if (category === "all" || event.status === category) {
      const eventDate = new Date(event.date + "T" + event.time);
      const formattedDate = eventDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      const card = document.createElement("div");
      card.className = "card p-6 bg-white shadow rounded-lg";
      card.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">
          <div class="md:w-1/3">
            <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover rounded-lg">
          </div>
          <div class="md:w-2/3">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold">${event.title}</h3>
              <span class="px-3 py-1 rounded-full text-sm ${
                event.status === "upcoming"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }">
                ${event.status === "upcoming" ? "Upcoming" : "Past Event"}
              </span>
            </div>
            <p class="text-gray-600 mb-2"><i class="far fa-calendar-alt mr-2"></i>${formattedDate}</p>
            <p class="text-gray-600 mb-2"><i class="far fa-clock mr-2"></i>${event.time}</p>
            <p class="text-gray-600 mb-4"><i class="fas fa-map-marker-alt mr-2"></i>${event.location}</p>
            <p class="mb-4">${event.description}</p>
            <a href="gallery.html" class="btn btn-secondary bg-blue-600 text-white px-4 py-2 rounded">View Photos</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    }
  });
}

// Setup filter buttons
document.querySelectorAll(".tab[data-category]").forEach(tab => {
  tab.addEventListener("click", function () {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    this.classList.add("active");
    const category = this.getAttribute("data-category");
    renderEvents(category);
  });
});

// Initialize
updateEventStatus();
renderEvents();













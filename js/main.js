/* ==========================================================================
   THE MIST & THE VALLEY — Main Interactive Logic
   ========================================================================== */

import { storeEnquiryInFirestore } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initScrollAnimations();
  initModalManager();
  initFormHandler();
  
  // Render India sourcing map if container exists
  if (typeof renderIndiaSourcingMap === 'function') {
    renderIndiaSourcingMap('india-map-container');
  }
});

/* --------------------------------------------------------------------------
   1. Sticky Header
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => drawer.classList.add('open');
  const closeDrawer = () => drawer.classList.remove('open');

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   3. Scroll Reveal Animations
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   4. Modal / Drawer & Legal Viewer Manager
   -------------------------------------------------------------------------- */
function initModalManager() {
  const modalBackdrop = document.getElementById('enquiry-modal');
  const modalClose = document.getElementById('modal-close');
  const openButtons = document.querySelectorAll('[data-open-modal]');

  // Legal Modal Elements
  const legalModalBackdrop = document.getElementById('legal-modal');
  const legalModalClose = document.getElementById('legal-modal-close');
  const legalTriggers = document.querySelectorAll('[data-open-legal]');

  if (modalBackdrop) {
    const openModal = (categoryName = '') => {
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (categoryName) {
        const modalProductField = document.getElementById('modal-product-req');
        if (modalProductField) {
          modalProductField.value = categoryName;
        }
      }
    };

    const closeModal = () => {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.getAttribute('data-category') || '';
        openModal(cat);
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    window.openSourcingModal = openModal;
  }

  // Legal Viewer Modal Handlers
  if (legalModalBackdrop) {
    const openLegalModal = (docId) => {
      legalModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      switchLegalDoc(docId);
    };

    const closeLegalModal = () => {
      legalModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    legalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const docId = trigger.getAttribute('data-open-legal');
        openLegalModal(docId);
      });
    });

    if (legalModalClose) legalModalClose.addEventListener('click', closeLegalModal);

    legalModalBackdrop.addEventListener('click', (e) => {
      if (e.target === legalModalBackdrop) closeLegalModal();
    });

    // Legal Doc Switcher Tabs
    const tabBtns = document.querySelectorAll('.legal-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetDoc = btn.getAttribute('data-target-doc');
        switchLegalDoc(targetDoc);
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalBackdrop && modalBackdrop.classList.contains('active')) {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (legalModalBackdrop && legalModalBackdrop.classList.contains('active')) {
        legalModalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

function switchLegalDoc(docId) {
  const allDocs = document.querySelectorAll('.legal-doc-content');
  const allTabs = document.querySelectorAll('.legal-tab-btn');

  allDocs.forEach(doc => doc.style.display = 'none');
  allTabs.forEach(tab => tab.classList.remove('active'));

  const activeDoc = document.getElementById(`doc-${docId}`);
  const activeTab = document.querySelector(`.legal-tab-btn[data-target-doc="${docId}"]`);

  if (activeDoc) activeDoc.style.display = 'block';
  if (activeTab) activeTab.classList.add('active');
}


/* --------------------------------------------------------------------------
   5. Form Submissions (Stores in Firebase DB & Displays Feedback)
   -------------------------------------------------------------------------- */
function initFormHandler() {
  const mainForm = document.getElementById('export-enquiry-form');
  const modalForm = document.getElementById('modal-enquiry-form');

  [mainForm, modalForm].forEach(form => {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'SUBMIT';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'SAVING...';
      }

      const formDataObj = {};
      const formData = new FormData(form);
      formData.forEach((val, key) => {
        formDataObj[key] = val;
      });

      formDataObj.form_source = form.id === 'modal-enquiry-form' ? 'Quick Quote Modal' : 'Main Export Enquiry Form';

      // Call Firestore DB store function silently in background
      await storeEnquiryInFirestore(formDataObj);

      const company = formDataObj.company_name || 'Valued Buyer';
      const product = formDataObj.product_required || 'Sourcing Requirement';

      showSubmissionSuccess(company, product);
      form.reset();
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }

      const modalBackdrop = document.getElementById('enquiry-modal');
      if (modalBackdrop && modalBackdrop.classList.contains('active')) {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

function showSubmissionSuccess(company, product) {
  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: #173F35;
    color: #FFFFFF;
    padding: 24px 32px;
    border-radius: 8px;
    border-left: 4px solid #A87845;
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 440px;
    font-family: Inter, sans-serif;
  `;
  
  alertBox.innerHTML = `
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D8C7A5; margin-bottom: 6px; font-weight: 700;">REQUIREMENT SUBMITTED</div>
    <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; margin-bottom: 8px; color: #FFF;">Thank You, ${company}</h4>
    <p style="font-size: 14px; color: rgba(255,255,255,0.88); line-height: 1.5; margin: 0;">
      Your sourcing requirement for <strong>${product}</strong> has been received by our export desk. Our team will review your specifications and contact your business email directly.
    </p>
  `;

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.style.opacity = '0';
    alertBox.style.transition = 'opacity 0.5s ease';
    setTimeout(() => alertBox.remove(), 500);
  }, 7000);
}

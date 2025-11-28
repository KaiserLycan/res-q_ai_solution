// Main dashboard JS — renders the mock calls, transcript, summary and hooks UI

// Mock Data
const activeCalls = [
  {
    id: 'CALL-0001',
    duration: '3:45',
    status: 'AI Handling',
    caller: 'John Martinez',
    transcript: [
      { role: 'caller', message: 'Hello? I need help, someone is breaking into my house!' },
      { role: 'ai', message: 'I understand. I\'m connecting you with emergency services. Can you tell me your location?' },
      { role: 'caller', message: '456 Oak Avenue, apartment 3B' },
      { role: 'ai', message: 'Location confirmed and locked. Police dispatch has been notified. Estimated arrival: 4 minutes. Are you in a safe location?' },
      { role: 'caller', message: 'I\'m in the bedroom with the door locked' },
      { role: 'ai', message: 'Good. Stay on the line and keep the door locked until officers arrive.' }
    ],
    summaryPoints: [
      'Caller Identity: John Martinez',
      'Location Locked: 456 Oak Ave, Unit 3B',
      'Threat Level: High - Break-in Attempt',
      'Police Dispatched: Priority 1',
      'ETA: 4 minutes'
    ],
    conclusion: 'Dispatching Police (Priority 1) - Officers en route'
  },
  {
    id: 'CALL-0002',
    duration: '2:12',
    status: 'Human Monitoring',
    caller: 'Sarah Thompson',
    transcript: [
      { role: 'caller', message: 'Hi, I\'d like to order a large pepperoni pizza with extra cheese' },
      { role: 'ai', message: 'I understand you want to order pizza. However, this is the emergency line. Are you in need of emergency assistance?' },
      { role: 'caller', message: 'Yes, pepperoni, with extra cheese please. Deliver to 321 Elm Street.' },
      { role: 'ai', message: 'I\'ve detected Code Duress - caller is disguising emergency request as pizza order. Analyzing situation...' },
      { role: 'ai', message: 'Domestic Violence Protocol Activated. Location identified: 321 Elm Street. Police dispatch initiated.' },
      { role: 'caller', message: 'Thank you, see you soon' }
    ],
    summaryPoints: [
      'Code Duress Detected: Pizza Order Scenario',
      'Suspected Domestic Violence',
      'Caller Identity: Sarah Thompson',
      'Location Locked: 321 Elm Street',
      'Police Dispatched: Priority 2 - DV Protocol'
    ],
    conclusion: 'Dispatching Police (Priority 2) - Domestic Violence Response'
  },
  {
    id: 'CALL-0003',
    duration: '1:33',
    status: 'AI Handling',
    caller: 'Michael Chen',
    transcript: [
      { role: 'caller', message: 'I think I\'m having a heart attack. I can\'t breathe properly.' },
      { role: 'ai', message: 'Emergency medical situation detected. I\'m dispatching paramedics to your location immediately.' },
      { role: 'caller', message: 'What should I do?' },
      { role: 'ai', message: 'Sit down, try to stay calm. Are you experiencing chest pain?' },
      { role: 'caller', message: 'Yes, severe chest pain and shortness of breath' },
      { role: 'ai', message: 'Paramedics are 3 minutes away. Chew an aspirin if you have one available.' }
    ],
    summaryPoints: [
      'Medical Emergency: Suspected Cardiac Event',
      'Caller Identity: Michael Chen',
      'Paramedics Dispatched: Code 3',
      'ETA: 3 minutes',
      'Caller Status: Stable, awaiting paramedics'
    ],
    conclusion: 'Dispatching Paramedics (Priority 1) - Cardiac Response'
  },
  {
    id: 'CALL-0004',
    duration: '0:47',
    status: 'AI Handling',
    caller: 'Unknown',
    transcript: [
      { role: 'caller', message: 'There\'s a fire in the building!' },
      { role: 'ai', message: 'Fire emergency confirmed. Evacuate the building immediately.' },
      { role: 'ai', message: 'Fire department has been dispatched. What is your location?' },
      { role: 'caller', message: 'Downtown office building, 789 Central Plaza' },
      { role: 'ai', message: 'Confirmed. Fire trucks en route. ETA: 2 minutes. Continue evacuating.' }
    ],
    summaryPoints: [
      'Emergency Type: Structure Fire',
      'Location: 789 Central Plaza',
      'Fire Department: Dispatched Code 3',
      'ETA: 2 minutes',
      'Action: Full Evacuation Protocol'
    ],
    conclusion: 'Dispatching Fire Department (Priority 1) - Full Response'
  }
];

let selectedCallId = 'CALL-0001';

// Update current time
function updateTime() {
  const now = new Date();
  const el = document.getElementById('current-time');
  if (el) el.textContent = now.toLocaleTimeString();
}

// Render call list
function renderCallList() {
  const callList = document.getElementById('call-list');
  if (!callList) return;
  callList.innerHTML = '';

  // Helper: detect masked intent / duress in a call's transcript
  function isMaskedIntent(call) {
    if (!call || !call.transcript) return false;
    return call.transcript.some(m => {
      const t = (m.message || '').toLowerCase();
      return t.includes('code duress') || t.includes('duress') || t.includes('masked intent') || t.includes('masked');
    });
  }

  // Sort calls so masked-intent / duress calls appear first (highest priority)
  const sortedCalls = [...activeCalls].sort((a, b) => {
    const aMask = isMaskedIntent(a) ? 1 : 0;
    const bMask = isMaskedIntent(b) ? 1 : 0;
    if (aMask !== bMask) return bMask - aMask; // duress (1) before normal (0)
    return 0; // preserve original order otherwise
  });

  sortedCalls.forEach(call => {
    const callCard = document.createElement('div');
    callCard.className = `wc-call-card ${selectedCallId === call.id ? 'active' : ''}`;
    callCard.dataset.callId = call.id;
    
    // ✨ DURESS / MASKED INTENT: mark cards that contain duress/masked intent
    if (isMaskedIntent(call)) {
      callCard.dataset.duress = 'true';
      // visually indicate priority
      callCard.classList.add('priority');
    }

    const statusIcon = call.status === 'AI Handling' ? '🤖' : '👤';
    const statusClass = call.status.replace(/\s+/g, '-').toLowerCase();

    callCard.innerHTML = `
      <div class="wc-call-header">
        <span class="wc-call-id">${call.id}</span>
        <span class="wc-call-duration">⏱ ${call.duration}</span>
      </div>
      <div class="wc-call-status">
        <span class="wc-status-icon">${statusIcon}</span>
        <span class="wc-status-badge status-${statusClass}">
          ${call.status}
        </span>
      </div>
      <div class="wc-call-info">
        ${call.caller}
      </div>
    `;

    callCard.addEventListener('click', () => {
      selectCall(call.id);
    });

    callList.appendChild(callCard);
  });

  // Update call count display
  const callCountEl = document.getElementById('call-count');
  if (callCountEl) callCountEl.textContent = `${sortedCalls.length} calls`;
  // Update duress count display
  const duressCount = sortedCalls.filter(c => isMaskedIntent(c)).length;
  const duressEl = document.getElementById('duress-count');
  if (duressEl) duressEl.textContent = duressCount;
}

// Select a call and update middle panel
function selectCall(callId) {
  selectedCallId = callId;
  renderCallList();
  renderMiddlePanel();
}

// Render middle panel (transcript, summary, conclusion)
function renderMiddlePanel() {
  const selectedCall = activeCalls.find(c => c.id === selectedCallId);
  if (!selectedCall) return;

  // Update call ID
  const callIdEl = document.getElementById('transcript-call-id');
  if (callIdEl) callIdEl.textContent = selectedCall.id;

  // Render transcript
  const transcript = document.getElementById('transcript');
  if (!transcript) return;
  transcript.innerHTML = '';

  // Check if this is a duress call (Pizza Order scenario)
  const isDuressCall = selectedCall.id === 'CALL-0002';

  selectedCall.transcript.forEach(msg => {
    const messageDiv = document.createElement('div');
    let messageClass = `wc-message wc-message-${msg.role}`;

    // Handle supervisor role
    if (msg.role === 'supervisor') messageClass = 'wc-message wc-message-supervisor';

    messageDiv.className = messageClass;

    let bubbleHTML;
    if (msg.role === 'ai') {
      const isDuressMsg = isDuressCall && msg.message.includes('Code Duress');
      const bubbleClass = isDuressMsg ? 'wc-message-bubble wc-bubble-ai duress' : 'wc-message-bubble wc-bubble-ai';
      bubbleHTML = `
        <div class="${bubbleClass}">
          <span class="wc-bubble-icon">🤖</span>
          <span class="wc-message-text">${msg.message}</span>
        </div>
      `;
    } else if (msg.role === 'supervisor') {
      bubbleHTML = `
        <div class="wc-message-bubble wc-bubble-supervisor">
          <span class="wc-bubble-icon">👮</span>
          <span class="wc-message-text">${msg.message}</span>
        </div>
      `;
    } else {
      bubbleHTML = `
        <div class="wc-message-bubble wc-bubble-caller">
          <span class="wc-message-text">${msg.message}</span>
        </div>
      `;
    }

    messageDiv.innerHTML = bubbleHTML;
    transcript.appendChild(messageDiv);
  });

  // Scroll to bottom
  transcript.scrollTop = transcript.scrollHeight;

  // Render summary
  const summaryList = document.getElementById('summary-list');
  if (summaryList) {
    summaryList.innerHTML = '';
    selectedCall.summaryPoints.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      summaryList.appendChild(li);
    });
  }

  // Render conclusion
  const conclusionEl = document.getElementById('conclusion-text');
  if (conclusionEl) conclusionEl.textContent = selectedCall.conclusion;
}

// Handle supervisor break-in message
function sendBreakInMessage() {
  const input = document.getElementById('breakin-input');
  if (!input) return;
  const message = input.value.trim();

  if (!message) return;

  // Add supervisor message to current call's transcript
  const selectedCall = activeCalls.find(c => c.id === selectedCallId);
  if (selectedCall) {
    selectedCall.transcript.push({
      role: 'supervisor',
      message: message
    });
    // Re-evaluate call ordering in case a new masked intent/duress indicator was added
    renderCallList();
    renderMiddlePanel();
    input.value = '';
    input.focus();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  setInterval(updateTime, 1000);
  renderCallList();
  renderMiddlePanel();

  // Break-in button and input handler
  const breakinBtn = document.getElementById('breakin-send-btn');
  const breakinInput = document.getElementById('breakin-input');
  const bargeinFullBtn = document.getElementById('bargein-full-btn');

  if (breakinBtn) breakinBtn.addEventListener('click', sendBreakInMessage);
  if (breakinInput) breakinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBreakInMessage();
  });

  if (bargeinFullBtn) {
    bargeinFullBtn.addEventListener('click', () => {
      alert('🚨 FULL TAKEOVER initiated on ' + selectedCallId + '\n\nSupervisor is now handling the call directly.');
    });
  }
});

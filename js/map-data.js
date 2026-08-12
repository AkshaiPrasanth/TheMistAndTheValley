/* ==========================================================================
   THE MIST & THE VALLEY — India Regional Sourcing Hub Data & Interactive SVG Map
   ========================================================================== */

const sourcingHubsData = [
  {
    id: "tn",
    state: "Tamil Nadu",
    x: 48, // Percentage on vector bounding box
    y: 82,
    highlights: ["Tea & Coffee", "Spices (Cardamom, Turmeric)", "Fresh Agricultural Produce", "Textiles & Manufactured Products"],
    note: "Major ports: Chennai, Tuticorin"
  },
  {
    id: "kl",
    state: "Kerala",
    x: 40,
    y: 86,
    highlights: ["Spices (Pepper, Cardamom, Ginger)", "Tea & Coffee", "Coconut & Coir", "Processed Foods"],
    note: "Major port: Cochin"
  },
  {
    id: "ka",
    state: "Karnataka",
    x: 38,
    y: 72,
    highlights: ["Coffee (Arabica/Robusta)", "Spices", "Processed Agricultural Goods", "Grains & Pulses"],
    note: "Major port: New Mangalore"
  },
  {
    id: "ap",
    state: "Andhra Pradesh",
    x: 52,
    y: 68,
    highlights: ["Rice & Grains", "Chilli & Spices", "Fresh Produce & Mangoes", "Agricultural Commodities"],
    note: "Major port: Visakhapatnam"
  },
  {
    id: "tg",
    state: "Telangana",
    x: 48,
    y: 58,
    highlights: ["Turmeric & Spices", "Pulses & Grains", "Processed Food Products"],
    note: "Inland logistics hub"
  },
  {
    id: "mh",
    state: "Maharashtra",
    x: 36,
    y: 52,
    highlights: ["Fresh Produce (Grapes, Pomegranates, Onions)", "Processed Foods", "Manufactured Goods"],
    note: "Major port: JNPT / Nhava Sheva"
  },
  {
    id: "gj",
    state: "Gujarat",
    x: 22,
    y: 42,
    highlights: ["Spices (Cumin, Fennel, Sesame)", "Groundnuts & Oilseeds", "Processed Foods & Commodities"],
    note: "Major ports: Mundra, Kandla"
  },
  {
    id: "pb",
    state: "Punjab",
    x: 32,
    y: 22,
    highlights: ["Basmati Rice", "Wheat & Grains", "Processed Agri Products"],
    note: "Northern agricultural belt"
  },
  {
    id: "del",
    state: "Delhi / NCR",
    x: 38,
    y: 28,
    highlights: ["Trade Coordination", "Quality Verification Hub", "Custom Export Consolidation"],
    note: "Commercial administration & freight coordination"
  }
];

function renderIndiaSourcingMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Build clean minimalist SVG map representation of India with pins
  let pinsHTML = sourcingHubsData.map(hub => `
    <g class="map-hub-pin" data-state="${hub.state}" tabindex="0">
      <circle cx="${hub.x}%" cy="${hub.y}%" r="10" fill="#A87845" opacity="0.3" class="pulse-ring"></circle>
      <circle cx="${hub.x}%" cy="${hub.y}%" r="5" fill="#A87845" stroke="#FFFFFF" stroke-width="1.5" class="pin-core"></circle>
    </g>
  `).join('');

  container.innerHTML = `
    <div style="position: relative; width: 100%; max-width: 480px; margin: 0 auto;">
      <svg viewBox="0 0 400 480" class="india-svg-map" style="width:100%; height:auto; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));">
        <!-- Abstract outline styling of India geography -->
        <path d="M 160,30 L 220,50 L 250,90 L 230,140 L 280,180 L 240,240 L 260,300 L 200,410 L 160,450 L 130,400 L 120,330 L 80,260 L 60,200 L 100,140 L 120,80 Z" 
              fill="#173F35" stroke="#A8B8A8" stroke-width="1" opacity="0.9" />
        
        <!-- Connecting Trade Grid Lines -->
        <path d="M 160,450 L 130,400 M 130,400 L 120,330 M 120,330 L 80,260 M 80,260 L 200,410" 
              stroke="rgba(216, 199, 165, 0.25)" stroke-width="1" stroke-dasharray="4,4" />

        ${sourcingHubsData.map(h => `
          <g class="pin-group" data-id="${h.id}" style="cursor: pointer;">
            <circle cx="${h.x * 3.8 + 10}" cy="${h.y * 4.4 + 20}" r="8" fill="rgba(168, 120, 69, 0.35)"/>
            <circle cx="${h.x * 3.8 + 10}" cy="${h.y * 4.4 + 20}" r="4" fill="#D8C7A5" stroke="#173F35" stroke-width="1.5"/>
            <text x="${h.x * 3.8 + 18}" y="${h.y * 4.4 + 24}" fill="#FAF8F3" font-size="10" font-family="Inter, sans-serif" font-weight="500">${h.state}</text>
          </g>
        `).join('')}
      </svg>
    </div>
  `;

  // Attach click / hover handlers to pins
  const pinGroups = container.querySelectorAll('.pin-group');
  const detailsTarget = document.getElementById('hub-details-box');

  pinGroups.forEach(pin => {
    pin.addEventListener('click', () => {
      const id = pin.getAttribute('data-id');
      const hubData = sourcingHubsData.find(h => h.id === id);
      if (hubData && detailsTarget) {
        detailsTarget.innerHTML = `
          <div style="background: var(--color-white); padding: 24px; border-radius: 8px; border-left: 4px solid var(--color-accent-copper); box-shadow: var(--shadow-card);">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--color-accent-copper); font-weight: 700;">SOURCING REGION</span>
            <h4 style="font-family: var(--font-serif); font-size: 24px; color: var(--color-primary); margin: 4px 0 12px;">${hubData.state}</h4>
            <p style="font-size: 14px; margin-bottom: 12px; color: var(--color-secondary);"><strong>Key Product Capabilities:</strong></p>
            <ul style="padding-left: 18px; font-size: 14px; margin-bottom: 16px; color: rgba(30, 36, 33, 0.8);">
              ${hubData.highlights.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
            </ul>
            <p style="font-size: 12.5px; color: var(--color-accent-copper); font-style: italic;">${hubData.note}</p>
          </div>
        `;
      }
    });
  });
}

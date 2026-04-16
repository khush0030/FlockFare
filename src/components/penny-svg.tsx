export function PennySvg() {
  return (
    <svg
      viewBox="0 0 300 340"
      width="300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Penny the Puffin mascot"
    >
      <defs>
        <radialGradient id="body-g" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#26253A" />
          <stop offset="100%" stopColor="#0E0E18" />
        </radialGradient>
        <radialGradient id="belly-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EFE9D8" />
        </radialGradient>
        <radialGradient id="beak-g" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="50%" stopColor="#FF8A3D" />
          <stop offset="100%" stopColor="#FF4E64" />
        </radialGradient>
        <radialGradient id="cheek-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9AB0" />
          <stop offset="100%" stopColor="#FF6B8A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="150" cy="328" rx="80" ry="10" fill="rgba(0,0,0,.25)" />
      {/* body */}
      <ellipse cx="150" cy="210" rx="95" ry="105" fill="url(#body-g)" stroke="#0B0B0F" strokeWidth="3" />
      {/* belly */}
      <ellipse cx="150" cy="218" rx="54" ry="72" fill="url(#belly-g)" stroke="#0B0B0F" strokeWidth="2" />
      {/* left wing */}
      <path d="M60 200 Q40 235 58 280 Q90 296 108 260 Q108 228 86 210Z" fill="#1A1A2A" stroke="#0B0B0F" strokeWidth="3" />
      {/* right wing */}
      <path d="M240 200 Q260 235 242 280 Q210 296 192 260 Q192 228 214 210Z" fill="#1A1A2A" stroke="#0B0B0F" strokeWidth="3" />
      {/* feet */}
      <rect x="116" y="305" width="36" height="18" rx="9" fill="#FFD166" stroke="#0B0B0F" strokeWidth="2.5" />
      <rect x="152" y="310" width="36" height="18" rx="9" fill="#FFD166" stroke="#0B0B0F" strokeWidth="2.5" />
      {/* head */}
      <ellipse cx="150" cy="130" rx="86" ry="80" fill="url(#body-g)" stroke="#0B0B0F" strokeWidth="3.5" />
      {/* face mask */}
      <ellipse cx="150" cy="145" rx="60" ry="54" fill="url(#belly-g)" stroke="#0B0B0F" strokeWidth="2.5" />
      {/* cheeks */}
      <circle cx="106" cy="158" r="16" fill="url(#cheek-g)" />
      <circle cx="194" cy="158" r="16" fill="url(#cheek-g)" />
      {/* left eye */}
      <ellipse cx="126" cy="132" rx="13" ry="16" fill="#0B0B0F" />
      <ellipse cx="128" cy="128" rx="5" ry="6" fill="#fff" />
      <circle cx="122" cy="138" r="2.5" fill="#fff" />
      {/* right eye */}
      <ellipse cx="174" cy="132" rx="13" ry="16" fill="#0B0B0F" />
      <ellipse cx="176" cy="128" rx="5" ry="6" fill="#fff" />
      <circle cx="170" cy="138" r="2.5" fill="#fff" />
      {/* beak */}
      <path d="M124 164 Q150 152 176 164 Q164 200 150 206 Q136 200 124 164Z" fill="url(#beak-g)" stroke="#0B0B0F" strokeWidth="3" />
      <line x1="124" y1="170" x2="176" y2="170" stroke="#FFD166" strokeWidth="1.5" opacity=".6" />
      <line x1="128" y1="180" x2="172" y2="180" stroke="#FF8A3D" strokeWidth="1.5" opacity=".6" />
      <line x1="135" y1="190" x2="165" y2="190" stroke="#FF4E64" strokeWidth="1.5" opacity=".6" />
      {/* headphones band */}
      <path d="M72 118 Q150 40 228 118" stroke="#6D28FF" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M72 118 Q150 44 228 118" stroke="#D8FF3C" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* headphone ears */}
      <circle cx="68" cy="128" r="20" fill="#6D28FF" stroke="#0B0B0F" strokeWidth="3" />
      <circle cx="68" cy="128" r="10" fill="#D8FF3C" />
      <circle cx="232" cy="128" r="20" fill="#6D28FF" stroke="#0B0B0F" strokeWidth="3" />
      <circle cx="232" cy="128" r="10" fill="#D8FF3C" />
      {/* boarding pass */}
      <g transform="translate(44,250) rotate(-12)">
        <rect width="82" height="42" rx="5" fill="#FFD166" stroke="#0B0B0F" strokeWidth="2.5" />
        <line x1="56" y1="2" x2="56" y2="40" stroke="#0B0B0F" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="8" y="14" fontFamily="'JetBrains Mono',monospace" fontSize="7" fontWeight="800" fill="#0B0B0F">BOARDING</text>
        <text x="8" y="26" fontFamily="'JetBrains Mono',monospace" fontSize="7" fontWeight="700" fill="#0B0B0F">BOM → LHR</text>
        <text x="60" y="22" fontFamily="'JetBrains Mono',monospace" fontSize="11" fontWeight="800" fill="#FF4E64">7A</text>
        <text x="8" y="36" fontFamily="'JetBrains Mono',monospace" fontSize="6" fontWeight="600" fill="#6D28FF">FLOCKFARE</text>
      </g>
      {/* sparkles */}
      <path d="M258 68 l3 9 l9 3 l-9 3 l-3 9 l-3-9 l-9-3 l9-3z" fill="#D8FF3C" stroke="#0B0B0F" strokeWidth="1.5" />
      <path d="M42 54 l2 6 l6 2 l-6 2 l-2 6 l-2-6 l-6-2 l6-2z" fill="#FF4EB4" stroke="#0B0B0F" strokeWidth="1.2" />
      {/* PENNY label */}
      <g transform="translate(150,328)">
        <rect x="-38" y="-12" width="76" height="20" rx="10" fill="#FF4E64" />
        <text x="0" y="2" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fontWeight="700" fill="#fff" letterSpacing="3">PENNY</text>
      </g>
    </svg>
  );
}

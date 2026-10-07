import { useId } from "react";

/** Six distinct editorial illustrations tied to the six benefit messages. */
export function BenefitIllustration({ variant }: { variant: number }) {
  const id = useId().replaceAll(":", "");
  const face = `url(#${id}-face)`;
  const edge = `url(#${id}-edge)`;
  return <svg className="benefit-illustration" viewBox="0 0 320 210" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-face`} x1="65" y1="25" x2="250" y2="190" gradientUnits="userSpaceOnUse"><stop stopColor="#d6eee6" /><stop offset="1" stopColor="#62a3aa" /></linearGradient>
      <linearGradient id={`${id}-edge`} x1="70" y1="60" x2="250" y2="210" gradientUnits="userSpaceOnUse"><stop stopColor="#59959f" /><stop offset="1" stopColor="#153d50" /></linearGradient>
    </defs>
    <ellipse cx="168" cy="191" rx="104" ry="10" fill="#092f4433" />
    {variant === 0 && <g transform="rotate(-6 160 110)">
      <path d="M157 75H256Q274 75 274 94V146Q274 165 255 165H239L218 184V165H157Q139 165 139 146V94Q139 75 157 75Z" fill={edge} />
      <path d="M61 25H195Q217 25 217 47V114Q217 136 195 136H107L78 162V136H61Q39 136 39 114V47Q39 25 61 25Z" fill={edge} transform="translate(6 9)" />
      <path d="M61 25H195Q217 25 217 47V114Q217 136 195 136H107L78 162V136H61Q39 136 39 114V47Q39 25 61 25Z" fill={face} />
      <path d="M74 63H178M74 84H158M74 105H128" stroke="#28616b" strokeWidth="7" strokeLinecap="round" />
      <path d="m218 119 10 10 20-22" stroke="#ffe082" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </g>}
    {variant === 1 && <g transform="rotate(-8 160 110)">
      <rect x="76" y="22" width="130" height="96" rx="10" fill="#f0d884" transform="rotate(12 141 70)" />
      <path d="M55 83Q55 64 76 64H237V178H76Q55 178 55 158Z" fill={edge} transform="translate(7 8)" />
      <path d="M55 83Q55 64 76 64H237V178H76Q55 178 55 158Z" fill={face} />
      <path d="M58 86H235" stroke="#3d7d83" strokeWidth="4" />
      <rect x="187" y="107" width="67" height="47" rx="12" fill="#24616d" stroke="#90c2bf" strokeWidth="3" /><circle cx="204" cy="130" r="5" fill="#ffe082" />
      <circle cx="127" cy="43" r="26" fill="#ffe082" stroke="#b89340" strokeWidth="4" /><path d="M133 34C120 27 117 42 128 43C139 44 135 57 120 51M127 27V59" stroke="#795a21" strokeWidth="3" strokeLinecap="round" />
    </g>}
    {variant === 2 && <g transform="rotate(6 160 110)">
      <rect x="77" y="23" width="144" height="155" rx="17" fill={edge} transform="translate(7 9)" /><rect x="77" y="23" width="144" height="155" rx="17" fill={face} />
      <path d="M103 51H174M103 67H147" stroke="#28616b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="109" cy="97" r="9" stroke="#39747a" strokeWidth="3" /><path d="M132 97H191" stroke="#39747a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="109" cy="131" r="9" stroke="#39747a" strokeWidth="3" /><path d="M132 131H170" stroke="#39747a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="219" cy="151" r="37" fill="#ffe082" stroke="#bca15c" strokeWidth="4" /><path d="m201 151 12 12 23-26" stroke="#315e63" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </g>}
    {variant === 3 && <g>
      {[{ x: 34, y: 49, angle: -10 }, { x: 121, y: 27, angle: 0 }, { x: 205, y: 49, angle: 10 }].map(({ x, y, angle }, index) => <g key={x} transform={`rotate(${angle} ${x + 40} ${y + 60})`}>
        <rect x={x + 5} y={y + 7} width="80" height="126" rx="12" fill={edge} /><rect x={x} y={y} width="80" height="126" rx="12" fill={index === 1 ? "#f5dea0" : face} />
        <path d={`m${x + 26} ${y + 30} 9 9 20-22`} stroke="#306571" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${x + 17} ${y + 62}h46m-46 16h35m-35 16h40`} stroke="#4f8387" strokeWidth="4" strokeLinecap="round" />
      </g>)}
    </g>}
    {variant === 4 && <g>
      <path d="M164 20 258 57V114C258 155 211 187 164 203C117 187 70 155 70 114V57Z" fill={edge} /><path d="M158 14 252 51V108C252 149 205 181 158 197C111 181 64 149 64 108V51Z" fill={face} />
      <circle cx="127" cy="73" r="18" fill="#285f6c" /><circle cx="190" cy="73" r="18" fill="#285f6c" />
      <path d="M99 139V121Q99 99 126 99Q147 99 152 114M217 139V121Q217 99 190 99Q169 99 164 114" fill="#285f6c" /><circle cx="158" cy="112" r="14" fill="#ffe082" /><path d="M135 153V143Q135 127 158 127Q181 127 181 143V153" fill="#ffe082" />
      <path d="M148 46C138 35 145 24 155 32L159 36L163 32C173 24 180 35 170 46L159 57Z" fill="#ffe082" />
    </g>}
    {variant === 5 && <g transform="rotate(-6 160 110)">
      <rect x="47" y="34" width="153" height="137" rx="16" fill={edge} transform="translate(6 9)" /><rect x="47" y="34" width="153" height="137" rx="16" fill={face} />
      <path d="M47 73H200M82 23V48M165 23V48" stroke="#28616b" strokeWidth="8" strokeLinecap="round" />
      {[83,114,145].map(x => <g key={x}><rect x={x-5} y="96" width="10" height="10" rx="3" fill="#35707b" /><rect x={x-5} y="125" width="10" height="10" rx="3" fill="#35707b" /></g>)}
      <circle cx="221" cy="136" r="52" fill={edge} transform="translate(4 7)" /><circle cx="221" cy="136" r="52" fill="#f4dfa1" stroke="#bda163" strokeWidth="4" /><path d="M221 102V136L241 150" stroke="#28616b" strokeWidth="7" strokeLinecap="round" /><circle cx="221" cy="136" r="5" fill="#28616b" />
    </g>}
  </svg>;
}

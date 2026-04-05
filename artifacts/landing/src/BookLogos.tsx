import { SVGProps, FC } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

export function LogoBet365(props: SvgProps) {
  return (
    <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="120" height="40" fill="#00873D" />
      <text x="60" y="28" fontFamily="'Arial Black',Arial,sans-serif" fontSize="23" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="-1.5">bet365</text>
    </svg>
  );
}

export function LogoUnibet(props: SvgProps) {
  return (
    <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="120" height="40" fill="#328200" />
      <path d="M9 9 L9 24 Q9 33 18 33 Q27 33 27 24 L27 9" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="5.5" r="3.2" fill="#FFD700" />
      <text x="73" y="27" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="700" fill="#FFFFFF" textAnchor="middle">unibet</text>
    </svg>
  );
}

export function LogoDraftKings(props: SvgProps) {
  return (
    <svg viewBox="0 0 155 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="155" height="40" fill="#1B1B2F" />
      <rect x="8" y="23" width="22" height="4" rx="1" fill="#53D337" />
      <polygon points="8,23 12.5,14 18,20 23.5,14 30,23" fill="#53D337" />
      <circle cx="18" cy="20" r="2.5" fill="#1B1B2F" />
      <text x="96" y="27" fontFamily="'Arial Black',Arial,sans-serif" fontSize="14" fontWeight="900" fill="#FFFFFF" textAnchor="middle">DraftKings</text>
    </svg>
  );
}

export function LogoFanDuel(props: SvgProps) {
  return (
    <svg viewBox="0 0 125 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="125" height="40" fill="#1176AE" />
      <path d="M15 33 C10 26 3 19 3 10 C9 10 14 14 15 21 C16 14 21 10 27 10 C27 19 20 26 15 33 Z" fill="#FFFFFF" />
      <text x="80" y="28" fontFamily="'Arial Black',Arial,sans-serif" fontSize="16" fontWeight="900" fill="#FFFFFF" textAnchor="middle">FanDuel</text>
    </svg>
  );
}

export function LogoBetsson(props: SvgProps) {
  return (
    <svg viewBox="0 0 130 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="130" height="40" fill="#E40000" />
      <rect x="7" y="6" width="7" height="28" rx="1" fill="#FFFFFF" />
      <path d="M14 6 Q26 6 26 13 Q26 20 14 20 Q26 20 28 27 Q28 34 14 34" stroke="#FFFFFF" strokeWidth="0" fill="#FFFFFF" />
      <text x="81" y="28" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">etsson</text>
    </svg>
  );
}

export function LogoWilliamHill(props: SvgProps) {
  return (
    <svg viewBox="0 0 155 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="155" height="40" fill="#532D80" />
      <path d="M9 7 L30 7 L30 27 Q19 36 9 27 Z" fill="#6B3DA8" />
      <text x="19" y="24" fontFamily="Georgia,serif" fontSize="12" fontWeight="700" fill="#FFFFFF" textAnchor="middle">WH</text>
      <text x="97" y="27" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">William Hill</text>
    </svg>
  );
}

export function LogoBwin(props: SvgProps) {
  return (
    <svg viewBox="0 0 95 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="95" height="40" fill="#CC0000" />
      <rect width="95" height="4" y="36" fill="#AA0000" />
      <rect width="95" height="4" fill="#AA0000" />
      <text x="48" y="29" fontFamily="'Arial Black',Arial,sans-serif" fontSize="26" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="3">bwin</text>
    </svg>
  );
}

export function LogoBetMGM(props: SvgProps) {
  return (
    <svg viewBox="0 0 130 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="130" height="40" fill="#000000" />
      <ellipse cx="20" cy="25" rx="8.5" ry="6.5" fill="#C8AA6E" />
      <circle cx="11.5" cy="16.5" r="4.2" fill="#C8AA6E" />
      <circle cx="20" cy="13.5" r="4.2" fill="#C8AA6E" />
      <circle cx="28.5" cy="16.5" r="4.2" fill="#C8AA6E" />
      <text x="85" y="27" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="700" fill="#C8AA6E" textAnchor="middle" letterSpacing="1">BetMGM</text>
    </svg>
  );
}

export function LogoBetclic(props: SvgProps) {
  return (
    <svg viewBox="0 0 125 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="125" height="40" fill="#E8000B" />
      <path d="M15 4 L15 27 L20 21 L26 31 L29 29 L23 19 L31 19 Z" fill="#FFFFFF" />
      <text x="82" y="28" fontFamily="'Arial Black',Arial,sans-serif" fontSize="17" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">betclic</text>
    </svg>
  );
}

export function LogoTipico(props: SvgProps) {
  return (
    <svg viewBox="0 0 118 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="118" height="40" fill="#006B35" />
      <circle cx="22" cy="20" r="14" fill="#FFFFFF" />
      <polyline points="15,20 20,26 30,12" stroke="#006B35" strokeWidth="3.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="75" y="27" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="700" fill="#FFFFFF" textAnchor="middle">tipico</text>
    </svg>
  );
}

export function Logo888sport(props: SvgProps) {
  return (
    <svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="140" height="40" fill="#FF6600" />
      <g transform="translate(6,8)">
        <rect x="0" y="0" width="8" height="24" rx="4" fill="#FFFFFF" />
        <rect x="6" y="0" width="8" height="12" rx="3" fill="#FFFFFF" />
        <rect x="6" y="12" width="8" height="12" rx="3" fill="#FFFFFF" />
        <rect x="17" y="0" width="8" height="24" rx="4" fill="#FFFFFF" opacity="0.75" />
        <rect x="23" y="0" width="8" height="12" rx="3" fill="#FFFFFF" opacity="0.75" />
        <rect x="23" y="12" width="8" height="12" rx="3" fill="#FFFFFF" opacity="0.75" />
      </g>
      <text x="96" y="27" fontFamily="'Arial Black',Arial,sans-serif" fontSize="16" fontWeight="900" fill="#FFFFFF" textAnchor="middle">sport</text>
    </svg>
  );
}

export function LogoBetway(props: SvgProps) {
  return (
    <svg viewBox="0 0 125 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="125" height="40" fill="#00A651" />
      <polygon points="5,20 18,8 18,15 33,15 33,25 18,25 18,32" fill="#FFFFFF" />
      <text x="82" y="27" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Betway</text>
    </svg>
  );
}

export function LogoLadbrokes(props: SvgProps) {
  return (
    <svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="140" height="40" fill="#CC1A1A" />
      <path d="M7 8 L13 8 L13 30 L26 30 L26 35 L7 35 Z" fill="#FFFFFF" />
      <text x="88" y="27" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Ladbrokes</text>
    </svg>
  );
}

export function LogoCodere(props: SvgProps) {
  return (
    <svg viewBox="0 0 115 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="115" height="40" fill="#0099D6" />
      <circle cx="22" cy="20" r="13" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <ellipse cx="22" cy="20" rx="6" ry="13" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <line x1="9" y1="20" x2="35" y2="20" stroke="#FFFFFF" strokeWidth="1.8" />
      <text x="76" y="27" fontFamily="'Arial Black',Arial,sans-serif" fontSize="17" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">codere</text>
    </svg>
  );
}

export function LogoMarathonbet(props: SvgProps) {
  return (
    <svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="160" height="40" fill="#CC0022" />
      <circle cx="22" cy="8" r="4.5" fill="#FFFFFF" />
      <path d="M22 13 Q26 20 24 30" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 18 Q11 15 9 19" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M25 17 Q31 13 34 15" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 30 Q19 36 17 39" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 30 Q30 35 32 38" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x="103" y="27" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Marathonbet</text>
    </svg>
  );
}

export function LogoInterwetten(props: SvgProps) {
  return (
    <svg viewBox="0 0 155 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="155" height="40" fill="#0B3D91" />
      <polygon points="20,3 23,12 33,12 25,18 28,27 20,21 12,27 15,18 7,12 17,12" fill="#FFD700" />
      <text x="97" y="27" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="700" fill="#FFFFFF" textAnchor="middle">interwetten</text>
    </svg>
  );
}

export function LogoPinnacle(props: SvgProps) {
  return (
    <svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="140" height="40" fill="#111111" />
      <polygon points="20,5 35,33 5,33" fill="none" stroke="#FFC72C" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="20" y1="5" x2="20" y2="33" stroke="#FFC72C" strokeWidth="1.2" opacity="0.35" />
      <text x="92" y="27" fontFamily="'Arial Black',Arial,sans-serif" fontSize="13" fontWeight="900" fill="#FFC72C" textAnchor="middle" letterSpacing="2">PINNACLE</text>
    </svg>
  );
}

export function Logo1xBet(props: SvgProps) {
  return (
    <svg viewBox="0 0 105 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="105" height="40" fill="#0033AA" />
      <text x="28" y="31" fontFamily="'Arial Black',Arial,sans-serif" fontSize="27" fontWeight="900" fill="#FF6600" textAnchor="middle" letterSpacing="-1.5">1x</text>
      <text x="73" y="31" fontFamily="'Arial Black',Arial,sans-serif" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">Bet</text>
    </svg>
  );
}

export function LogoSportsbet(props: SvgProps) {
  return (
    <svg viewBox="0 0 145 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="145" height="40" fill="#0066CC" />
      <ellipse cx="19" cy="23" rx="9" ry="10" fill="#FFFFFF" transform="rotate(-15,19,23)" />
      <ellipse cx="25" cy="11" rx="5" ry="6" fill="#FFFFFF" transform="rotate(10,25,11)" />
      <ellipse cx="28" cy="6" rx="2" ry="4" fill="#FFFFFF" transform="rotate(20,28,6)" />
      <path d="M10 30 Q4 36 6 40" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M18 33 Q18 38 18 40" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M14 31 Q12 37 14 40" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x="96" y="27" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">Sportsbet.io</text>
    </svg>
  );
}

export function LogoSBObet(props: SvgProps) {
  return (
    <svg viewBox="0 0 115 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="115" height="40" fill="#004FA3" />
      <polygon points="20,3 32,10 32,24 20,31 8,24 8,10" fill="#FFD700" />
      <text x="20" y="22" fontFamily="'Arial Black',Arial,sans-serif" fontSize="13" fontWeight="900" fill="#004FA3" textAnchor="middle">S</text>
      <text x="75" y="27" fontFamily="'Arial Black',Arial,sans-serif" fontSize="18" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">BObet</text>
    </svg>
  );
}

export const BOOK_LOGO_COMPONENTS: Record<string, FC<SvgProps>> = {
  "bet365": LogoBet365,
  "Unibet": LogoUnibet,
  "DraftKings": LogoDraftKings,
  "FanDuel": LogoFanDuel,
  "Betsson": LogoBetsson,
  "William Hill": LogoWilliamHill,
  "bwin": LogoBwin,
  "BetMGM": LogoBetMGM,
  "Betclic": LogoBetclic,
  "Tipico": LogoTipico,
  "888sport": Logo888sport,
  "Betway": LogoBetway,
  "Ladbrokes": LogoLadbrokes,
  "Codere": LogoCodere,
  "Marathonbet": LogoMarathonbet,
  "Interwetten": LogoInterwetten,
  "Pinnacle": LogoPinnacle,
  "1xBet": Logo1xBet,
  "Sportsbet": LogoSportsbet,
  "SBObet": LogoSBObet,
};

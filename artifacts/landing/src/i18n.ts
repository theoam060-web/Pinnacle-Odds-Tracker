export type LangCode =
  | "en" | "sv" | "no" | "da" | "de" | "fr" | "es" | "it" | "ja" | "pl" | "pt";

export interface LangMeta {
  code: LangCode;
  name: string;
  flag: string;
  currency: string;
}

export const LANGUAGES: LangMeta[] = [
  { code: "en", name: "English",    flag: "🇬🇧", currency: "GBP / USD" },
  { code: "sv", name: "Svenska",    flag: "🇸🇪", currency: "SEK" },
  { code: "no", name: "Norsk",      flag: "🇳🇴", currency: "NOK" },
  { code: "da", name: "Dansk",      flag: "🇩🇰", currency: "DKK" },
  { code: "de", name: "Deutsch",    flag: "🇩🇪", currency: "CHF / EUR" },
  { code: "fr", name: "Français",   flag: "🇫🇷", currency: "EUR / CHF" },
  { code: "es", name: "Español",    flag: "🇪🇸", currency: "EUR" },
  { code: "it", name: "Italiano",   flag: "🇮🇹", currency: "EUR" },
  { code: "ja", name: "日本語",      flag: "🇯🇵", currency: "JPY" },
  { code: "pl", name: "Polski",     flag: "🇵🇱", currency: "PLN" },
  { code: "pt", name: "Português",  flag: "🇧🇷", currency: "BRL" },
];

export interface Translations {
  nav: {
    features: string;
    why: string;
    pricing: string;
    faq: string;
    login: string;
    signup: string;
    trialBadge: string;
    subscriptions: string;
  };
  hero: {
    monitoring: (count: string) => string;
    connecting: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    stat1: string;
    stat2: string;
    stat3: string;
    cta: string;
    ctaSub: string;
  };
  mobile: {
    badge: string;
    comingSoon: string;
    desc: string;
  };
}

const T: Record<LangCode, Translations> = {
  en: {
    nav: {
      features: "Features",
      why: "Why SharpTracker?",
      pricing: "Pricing",
      faq: "FAQ",
      login: "Log In",
      signup: "Sign Up",
      trialBadge: "14 days free",
      subscriptions: "Subscriptions",
    },
    hero: {
      monitoring: (n) => `Monitoring ${n} live events right now`,
      connecting: "Connecting to live markets…",
      headline1: "When the market moves.",
      headline2: "You move first.",
      subtitle: "Always bet at the right price. We watch the world's sharpest bookmaker 24/7 and alert you the moment the odds drop.",
      stat1: "Made every year by private bettors who follow sharp money",
      stat2: "From the moment a line moves to the moment you get alerted",
      stat3: "Sharp odds drops tracked and logged every single day",
      cta: "Get access",
      ctaSub: "See how it works",
    },
    mobile: {
      badge: "Mobile App",
      comingSoon: "Mobile app — coming soon",
      desc: "The mobile app is on its way. You'll be able to get push notifications directly on your phone the moment an odds drop occurs.",
    },
  },
  sv: {
    nav: {
      features: "Funktioner",
      why: "Varför SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      login: "Logga in",
      signup: "Kom igång",
      trialBadge: "14 dagar gratis",
      subscriptions: "Prenumerationer",
    },
    hero: {
      monitoring: (n) => `Bevakar ${n} livematcher just nu`,
      connecting: "Ansluter till livemarknader…",
      headline1: "När marknaden rör sig.",
      headline2: "Du rör dig först.",
      subtitle: "Spela alltid till rätt odds. Vi bevakar världens skarpaste bookmaker dygnet runt och aviserar dig i samma sekund som oddsen faller.",
      stat1: "Tjänas varje år av privata spelare som följer skarpt kapital",
      stat2: "Från att kursen rör sig tills du får din avisering",
      stat3: "Skarpa oddsrörelser spårade och loggade varje dag",
      cta: "Kom igång",
      ctaSub: "Se hur det fungerar",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — lanseras snart",
      desc: "Mobilappen är på väg. Du kommer att kunna få push-notiser direkt på din telefon så fort en odds-drop inträffar.",
    },
  },
  no: {
    nav: {
      features: "Funksjoner",
      why: "Hvorfor SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      login: "Logg inn",
      signup: "Kom i gang",
      trialBadge: "14 dager gratis",
      subscriptions: "Abonnementer",
    },
    hero: {
      monitoring: (n) => `Overvåker ${n} livekamper nå`,
      connecting: "Kobler til live-markeder…",
      headline1: "Når markedet beveger seg.",
      headline2: "Du beveger deg først.",
      subtitle: "Spill alltid til riktig odds. Vi overvåker verdens skarpeste bookmaker 24/7 og varsler deg i det øyeblikket oddsen faller.",
      stat1: "Tjenes hvert år av private spillere som følger skarpe penger",
      stat2: "Fra linjen beveger seg til du mottar varselet",
      stat3: "Skarpe oddsfall sporet og logget hver eneste dag",
      cta: "Kom i gang",
      ctaSub: "Se hvordan det fungerer",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — kommer snart",
      desc: "Mobilappen er på vei. Du vil kunne motta push-varsler direkte på telefonen din i det øyeblikket en odds-drop inntreffer.",
    },
  },
  da: {
    nav: {
      features: "Funktioner",
      why: "Hvorfor SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      login: "Log ind",
      signup: "Kom i gang",
      trialBadge: "14 dage gratis",
      subscriptions: "Abonnementer",
    },
    hero: {
      monitoring: (n) => `Overvåger ${n} livekampe lige nu`,
      connecting: "Opretter forbindelse til live-markeder…",
      headline1: "Når markedet bevæger sig.",
      headline2: "Du bevæger dig først.",
      subtitle: "Spil altid til den rigtige odds. Vi overvåger verdens skarpeste bookmaker 24/7 og advarer dig i det øjeblik, oddsene falder.",
      stat1: "Tjenes hvert år af private spillere, der følger skarpe penge",
      stat2: "Fra linjen bevæger sig til du modtager advarslen",
      stat3: "Skarpe oddsanfald sporet og logget hver eneste dag",
      cta: "Kom i gang",
      ctaSub: "Se hvordan det virker",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — kommer snart",
      desc: "Mobilappen er på vej. Du vil kunne modtage push-notifikationer direkte på din telefon, så snart et odds-drop sker.",
    },
  },
  de: {
    nav: {
      features: "Funktionen",
      why: "Warum SharpTracker?",
      pricing: "Preise",
      faq: "FAQ",
      login: "Anmelden",
      signup: "Loslegen",
      trialBadge: "14 Tage kostenlos",
      subscriptions: "Abonnements",
    },
    hero: {
      monitoring: (n) => `Beobachtet ${n} Live-Events gerade`,
      connecting: "Verbindung zu Live-Märkten…",
      headline1: "Wenn der Markt sich bewegt.",
      headline2: "Du bewegst dich zuerst.",
      subtitle: "Setze immer zum richtigen Preis. Wir beobachten den schärfsten Buchmacher der Welt rund um die Uhr und benachrichtigen dich sofort, wenn die Quoten fallen.",
      stat1: "Werden jedes Jahr von privaten Wettenden verdient, die scharfem Geld folgen",
      stat2: "Vom Zeitpunkt der Linienveränderung bis zur Benachrichtigung",
      stat3: "Scharfe Quotenstürze täglich verfolgt und protokolliert",
      cta: "Zugang erhalten",
      ctaSub: "Wie es funktioniert",
    },
    mobile: {
      badge: "Mobile App",
      comingSoon: "Mobile App — demnächst verfügbar",
      desc: "Die mobile App ist auf dem Weg. Du wirst direkt auf deinem Telefon benachrichtigt, sobald ein Odds-Drop eintritt.",
    },
  },
  fr: {
    nav: {
      features: "Fonctionnalités",
      why: "Pourquoi SharpTracker ?",
      pricing: "Tarifs",
      faq: "FAQ",
      login: "Connexion",
      signup: "Commencer",
      trialBadge: "14 jours gratuits",
      subscriptions: "Abonnements",
    },
    hero: {
      monitoring: (n) => `Surveillance de ${n} événements en direct`,
      connecting: "Connexion aux marchés en direct…",
      headline1: "Quand le marché bouge.",
      headline2: "Tu bouges en premier.",
      subtitle: "Pariez toujours au bon prix. Nous surveillons le bookmaker le plus sharp du monde 24/7 et vous alertons dès que les cotes chutent.",
      stat1: "Gagnés chaque année par des parieurs privés qui suivent l'argent sharp",
      stat2: "Entre le moment où la cote bouge et celui où vous recevez l'alerte",
      stat3: "Chutes de cotes sharps suivies et enregistrées chaque jour",
      cta: "Accéder",
      ctaSub: "Voir comment ça marche",
    },
    mobile: {
      badge: "Application mobile",
      comingSoon: "Application mobile — bientôt disponible",
      desc: "L'application mobile est en route. Vous pourrez recevoir des notifications push directement sur votre téléphone dès qu'une chute de cote se produit.",
    },
  },
  es: {
    nav: {
      features: "Funciones",
      why: "¿Por qué SharpTracker?",
      pricing: "Precios",
      faq: "FAQ",
      login: "Iniciar sesión",
      signup: "Empezar",
      trialBadge: "14 días gratis",
      subscriptions: "Suscripciones",
    },
    hero: {
      monitoring: (n) => `Monitoreando ${n} eventos en vivo ahora mismo`,
      connecting: "Conectando a mercados en vivo…",
      headline1: "Cuando el mercado se mueve.",
      headline2: "Tú te mueves primero.",
      subtitle: "Apuesta siempre al precio correcto. Vigilamos el bookmaker más sharp del mundo 24/7 y te avisamos en el momento en que las cuotas caen.",
      stat1: "Ganados cada año por apostadores privados que siguen el dinero sharp",
      stat2: "Desde que la línea se mueve hasta que recibes la alerta",
      stat3: "Caídas de cuotas sharps rastreadas y registradas cada día",
      cta: "Obtener acceso",
      ctaSub: "Ver cómo funciona",
    },
    mobile: {
      badge: "App móvil",
      comingSoon: "App móvil — próximamente",
      desc: "La app móvil está en camino. Podrás recibir notificaciones push directamente en tu teléfono en el momento en que caigan las cuotas.",
    },
  },
  it: {
    nav: {
      features: "Funzionalità",
      why: "Perché SharpTracker?",
      pricing: "Prezzi",
      faq: "FAQ",
      login: "Accedi",
      signup: "Inizia",
      trialBadge: "14 giorni gratis",
      subscriptions: "Abbonamenti",
    },
    hero: {
      monitoring: (n) => `Monitorando ${n} eventi live in questo momento`,
      connecting: "Connessione ai mercati live…",
      headline1: "Quando il mercato si muove.",
      headline2: "Tu ti muovi per primo.",
      subtitle: "Scommetti sempre al prezzo giusto. Monitoriamo il bookmaker più sharp del mondo 24/7 e ti avvisiamo nel momento in cui le quote scendono.",
      stat1: "Guadagnati ogni anno da scommettitori privati che seguono i soldi sharp",
      stat2: "Dal momento in cui la quota si muove a quando ricevi l'avviso",
      stat3: "Cali di quote sharp tracciati e registrati ogni giorno",
      cta: "Ottieni accesso",
      ctaSub: "Guarda come funziona",
    },
    mobile: {
      badge: "App mobile",
      comingSoon: "App mobile — prossimamente",
      desc: "L'app mobile è in arrivo. Potrai ricevere notifiche push direttamente sul telefono nel momento in cui le quote scendono.",
    },
  },
  ja: {
    nav: {
      features: "機能",
      why: "なぜSharpTracker？",
      pricing: "料金",
      faq: "よくある質問",
      login: "ログイン",
      signup: "始める",
      trialBadge: "14日間無料",
      subscriptions: "サブスクリプション",
    },
    hero: {
      monitoring: (n) => `現在${n}件のライブイベントを監視中`,
      connecting: "ライブ市場に接続中…",
      headline1: "市場が動くとき。",
      headline2: "あなたが先に動く。",
      subtitle: "常に正しい価格でベットする。世界最鋭のブックメーカーを24時間365日監視し、オッズが下がった瞬間にアラートを送ります。",
      stat1: "シャープマネーを追う個人ベッターが毎年稼ぐ金額",
      stat2: "ラインが動いてからアラートを受け取るまでの時間",
      stat3: "毎日追跡・記録されるシャープなオッズ変動数",
      cta: "アクセスする",
      ctaSub: "仕組みを見る",
    },
    mobile: {
      badge: "モバイルアプリ",
      comingSoon: "モバイルアプリ — 近日公開",
      desc: "モバイルアプリは開発中です。オッズドロップが発生した瞬間に、スマートフォンにプッシュ通知が届くようになります。",
    },
  },
  pl: {
    nav: {
      features: "Funkcje",
      why: "Dlaczego SharpTracker?",
      pricing: "Cennik",
      faq: "FAQ",
      login: "Zaloguj się",
      signup: "Zacznij",
      trialBadge: "14 dni za darmo",
      subscriptions: "Subskrypcje",
    },
    hero: {
      monitoring: (n) => `Monitorowanie ${n} wydarzeń na żywo`,
      connecting: "Łączenie z rynkami na żywo…",
      headline1: "Kiedy rynek się porusza.",
      headline2: "Ty poruszasz się pierwszy.",
      subtitle: "Zawsze obstawiaj po właściwej cenie. Monitorujemy najostrzejszego bukmachera na świecie 24/7 i powiadamiamy cię w chwili, gdy kursy spadną.",
      stat1: "Zarabiane każdego roku przez prywatnych graczy śledzących ostre pieniądze",
      stat2: "Od ruchu linii do momentu otrzymania powiadomienia",
      stat3: "Ostre spadki kursów śledzone i rejestrowane każdego dnia",
      cta: "Uzyskaj dostęp",
      ctaSub: "Zobacz jak to działa",
    },
    mobile: {
      badge: "Aplikacja mobilna",
      comingSoon: "Aplikacja mobilna — wkrótce",
      desc: "Aplikacja mobilna jest w drodze. Będziesz mógł otrzymywać powiadomienia push bezpośrednio na telefon w momencie pojawienia się odds-drop.",
    },
  },
  pt: {
    nav: {
      features: "Recursos",
      why: "Por que SharpTracker?",
      pricing: "Preços",
      faq: "FAQ",
      login: "Entrar",
      signup: "Começar",
      trialBadge: "14 dias grátis",
      subscriptions: "Assinaturas",
    },
    hero: {
      monitoring: (n) => `Monitorando ${n} eventos ao vivo agora`,
      connecting: "Conectando aos mercados ao vivo…",
      headline1: "Quando o mercado se move.",
      headline2: "Você se move primeiro.",
      subtitle: "Aposte sempre no preço certo. Monitoramos o bookmaker mais sharp do mundo 24/7 e alertamos você no momento em que as odds caem.",
      stat1: "Ganhos por apostadores privados que seguem o dinheiro sharp a cada ano",
      stat2: "Do momento em que a linha se move até você receber o alerta",
      stat3: "Quedas de odds sharp rastreadas e registradas todos os dias",
      cta: "Obter acesso",
      ctaSub: "Ver como funciona",
    },
    mobile: {
      badge: "App mobile",
      comingSoon: "App mobile — em breve",
      desc: "O app móvel está a caminho. Você poderá receber notificações push diretamente no seu telefone no momento em que ocorrer uma queda de odds.",
    },
  },
};

export function t(lang: LangCode): Translations {
  return T[lang] ?? T.en;
}

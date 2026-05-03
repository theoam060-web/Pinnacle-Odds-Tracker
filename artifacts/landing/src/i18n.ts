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
    signup: string;
    trialBadge: string;
    subscriptions: string;
    allFeatures: string;
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
  };
  mobile: {
    badge: string;
    comingSoon: string;
    desc: string;
  };
  alertSection: {
    neverMiss: string;
    aDrop: string;
  };
  terminal: {
    heading: string;
    subheading: string;
    eventStream: string;
    seeTheSteam: string;
    seeTheSteamDesc: string;
    priceHistory: string;
    chartSentiment: string;
    chartSentimentDesc: string;
    latestDrops: string;
    live: string;
    liveFeed: string;
    bkCompare: string;
    sports: string;
  };
  features: {
    heading1: string;
    heading2: string;
    subtitle: string;
    steps: Array<{ title: string; description: string }>;
    items: Array<{ name: string; desc: string }>;
  };
  marquee: {
    worksOn: string;
    allBooks: string;
  };
  calc: {
    badge: string;
    heading: string;
    subtitle: string;
    bankrollLabel: string;
    bankrollHint: string;
    usageLabel: string;
    usageHint: string;
    timeframeLabel: string;
    calculateBtn: string;
    estimatedProfit: string;
    roi: string;
    disclaimer: string;
    fillPrompt: string;
    calculatePrompt: string;
    usageOptions: Array<{ value: string; label: string }>;
    timeframeOptions: Array<{ value: string; label: string; weeks: number }>;
  };
  cta: {
    heading: string;
    subtitle: string;
    viewPlans: string;
    startTrial: string;
  };
  footer: {
    desc: string;
    product: string;
    legal: string;
    dashboard: string;
    signUp: string;
    terms: string;
    privacy: string;
    allRights: string;
    disclaimer1: string;
    disclaimer2: string;
  };
  testimonials: {
    badge: string;
    heading: string;
    subtitle: string;
    profitLabel: string;
  };
  faq: {
    badge: string;
    heading: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  betTracker: {
    heading: string;
    subtitle: string;
    date: string;
    matchup: string;
    selection: string;
    odds: string;
    clv: string;
    result: string;
  };
  sharpData: {
    heading: string;
    desc: string;
  };
  multiSport: {
    heading: string;
    subtitle: string;
  };
  featureStrip: {
    heading: string;
    subtitle: string;
    tiles: string[];
  };
  bankroll: {
    badge: string;
    heading: string;
    subtitle: string;
    seeItLive: string;
    cards: Array<{ tag: string; title: string; desc: string }>;
  };
}

const T: Record<LangCode, Translations> = {
  en: {
    nav: {
      features: "Features",
      why: "Why SharpTracker?",
      pricing: "Pricing",
      faq: "FAQ",
      signup: "Sign Up",
      trialBadge: "14 days free",
      subscriptions: "Subscriptions",
      allFeatures: "All Features",
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
    },
    mobile: {
      badge: "Mobile App",
      comingSoon: "Mobile app — coming soon",
      desc: "The mobile app is on its way. You'll be able to get push notifications directly on your phone the moment an odds drop occurs.",
    },
    alertSection: {
      neverMiss: "Never miss",
      aDrop: "a drop.",
    },
    terminal: {
      heading: "Observe the Matrix.",
      subheading: "Stop refreshing sportsbooks. Our terminal ingests thousands of WebSocket events per second, surfacing meaningful price discovery instantly.",
      eventStream: "Event Stream",
      seeTheSteam: "See the steam.",
      seeTheSteamDesc: "When a syndicate hits the market, the line moves across books in milliseconds. SharpTracker visualizes these drops instantly, highlighting significant EV+ opportunities before they disappear.",
      priceHistory: "Price History",
      chartSentiment: "Chart the sentiment.",
      chartSentimentDesc: "Every line movement is charted tick-by-tick. Identify resistance levels in spreads and totals, and understand the narrative arc of the market leading up to gametime.",
      latestDrops: "Latest Sharp Drops",
      live: "LIVE",
      liveFeed: "Live Feed",
      bkCompare: "Bk. Compare",
      sports: "Sports",
    },
    features: {
      heading1: "Your filters.",
      heading2: "Your rules.",
      subtitle: "Tell SharpTracker exactly what matters to you. It watches the markets around the clock and alerts you the moment something moves.",
      steps: [
        { title: "Pick Your Markets", description: "Choose the sports and leagues you follow. Only what you pick gets through — nothing else." },
        { title: "Set Your Minimum Drop", description: "Choose how big a price drop must be before you get an alert. Small moves are ignored. You only hear about the ones that matter." },
        { title: "We Watch 24/7", description: "SharpTracker tracks every market all day and night. The second a line drops, we catch it — no matter when it happens." },
        { title: "You Hear About It First", description: "You get the alert before anyone else. That time gap is your advantage." },
      ],
      items: [
        { name: "Odds Drop Alerts", desc: "Instant push notification when sharp money moves" },
        { name: "Bet Tracker", desc: "Log every bet and track every unit you've ever placed" },
        { name: "Bookmaker Comparison", desc: "Compare live odds across 32+ bookmakers per alert" },
        { name: "Stake Calculator", desc: "Size bets correctly with Kelly criterion built in" },
        { name: "Daily P&L Calendar", desc: "Visual win/loss calendar — spot patterns instantly" },
        { name: "Multi-Sport Coverage", desc: "NFL, NBA, MLB, NHL, Soccer, Tennis and more" },
        { name: "Bankroll Growth", desc: "Catch value before anyone else and watch your edge compound" },
      ],
    },
    marquee: {
      worksOn: "Works on",
      allBooks: "all major books →",
    },
    calc: {
      badge: "Tools",
      heading: "Profit Calculator.",
      subtitle: "See what SharpTracker could do for your bankroll based on how you plan to use it.",
      bankrollLabel: "Initial Bankroll",
      bankrollHint: "We recommend starting with at least €500",
      usageLabel: "Weekly Usage",
      usageHint: "How many hours a week you plan to use SharpTracker",
      timeframeLabel: "Timeframe",
      calculateBtn: "Calculate",
      estimatedProfit: "Estimated Profit",
      roi: "ROI",
      disclaimer: "Data may not reflect actual results. Illustrative purposes only. Past performance does not guarantee future results.",
      fillPrompt: "Fill in your details and press",
      calculatePrompt: "Calculate",
      usageOptions: [
        { value: "light",  label: "Light (2–5 hours / week)" },
        { value: "medium", label: "Medium (5–10 hours / week)" },
        { value: "heavy",  label: "Heavy (10–20 hours / week)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 weeks",  weeks: 2  },
        { value: "1m", label: "1 month",  weeks: 4  },
        { value: "3m", label: "3 months", weeks: 13 },
        { value: "6m", label: "6 months", weeks: 26 },
      ],
    },
    cta: {
      heading: "Stop playing with a handicap.",
      subtitle: "Join the sharpest bettors leveraging real-time sharp market data to find better prices before the market closes.",
      viewPlans: "View Plans",
      startTrial: "Start 14-Day Free Trial",
    },
    footer: {
      desc: "Professional odds tracking and bookmaker comparison terminal.",
      product: "Product",
      legal: "Legal",
      dashboard: "Dashboard",
      signUp: "Sign Up",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      allRights: "All rights reserved.",
      disclaimer1: "SharpTracker is a data and analytics service. This site is strictly for educational and informational purposes only and does not involve real-money betting or facilitate wagering of any kind. References to \"sharp bookmakers\" refer to high-volume, limit-friendly operators whose pricing reflects professional market consensus. No specific operator is endorsed by name.",
      disclaimer2: "Gambling involves risk. Only bet what you can afford to lose. This service is intended for adults aged 18 and over. If you or someone you know has a gambling problem, help is available — visit BeGambleAware.org or contact the Gamblers Anonymous helpline in your country.",
    },
    testimonials: {
      badge: "Real users. Real results.",
      heading: "Hear what others\nare saying.",
      subtitle: "Sharp bettors from across Europe and beyond — all using SharpTracker to catch moves before the market adjusts.",
      profitLabel: "Profit",
    },
    faq: {
      badge: "FAQ",
      heading: "Common questions, honest answers.",
      subtitle: "Everything you need to know before getting started.",
      items: [
        { q: "What exactly is SharpTracker?", a: "SharpTracker monitors odds movements at sharp bookmakers in real time. The moment a line moves significantly, you get an alert — so you can place your bet before softer bookmakers and exchanges catch up and adjust their prices." },
        { q: "How fast are the alerts?", a: "Alerts are delivered within seconds of a line movement being detected. Speed is everything in odds dropping — even a 30-second head start can mean the difference between getting the value price and missing it entirely." },
        { q: "What sports do you cover?", a: "We cover football (soccer), basketball, American football, tennis, ice hockey, and baseball. More sports are added regularly based on user demand." },
        { q: "Do I need to be an expert bettor to use this?", a: "No. The app is built to be clear and simple. If you understand what odds are and want to get better prices on your bets, you can use SharpTracker right away. The CLV and bankroll tools are there when you're ready to go deeper." },
        { q: "What is bookmaker comparison and how does it work?", a: "When a sharp bookmaker like Pinnacle moves its odds, other bookmakers often lag behind. SharpTracker checks 32+ bookmakers in real time for each alert in your live feed and shows you which ones still have the old price — giving you a window to get better odds before they catch up." },
        { q: "Which bookmakers does the data come from?", a: "We pull odds from sharp, high-limits bookmakers that professional bettors rely on as market benchmarks. These are the books that move first — if they move their line, the whole market follows." },
        { q: "Is there a free trial?", a: "Yes — every new account starts with a full 14-day free trial. No credit card required. You get complete access to every feature from day one. After 14 days you can choose a plan, or simply stop — no charge either way." },
        { q: "Can I cancel anytime?", a: "Absolutely. There are no contracts or lock-in periods. You can cancel your subscription at any time from your account settings. You'll keep access until the end of your current billing period." },
        { q: "What is the Stake Calculator for?", a: "The Stake Calculator uses the Kelly Criterion to help you size each bet correctly based on your bankroll and the edge you have. Proper bet sizing is one of the most overlooked parts of profitable betting." },
        { q: "What's the difference between SharpTracker and a tipster service?", a: "We don't tell you who to bet on. We give you the tools to find and act on value yourself — live odds movement data, CLV tracking, and bet analysis. You stay in control of every decision." },
      ],
    },
    betTracker: {
      heading: "Integrated Bet Tracker.",
      subtitle: "Log your bets with one click from the feed. We automatically grade them at game end and map your performance over time.",
      date: "Date",
      matchup: "Matchup",
      selection: "Selection",
      odds: "Odds",
      clv: "CLV",
      result: "Result",
    },
    sharpData: {
      heading: "Powered by Sharp Bookmaker Data.",
      desc: "We track only the sharpest bookmakers — the true market makers where professional money flows. While other services blend data from slow recreational books, SharpTracker isolates the signal from the noise. When the sharp money moves, you see it first.",
    },
    multiSport: {
      heading: "Total Market Coverage.",
      subtitle: "Track line movement across every major sport simultaneously. Our backend processes over 50,000 odds updates per minute across all markets.",
    },
    featureStrip: {
      heading: "Everything you need. Nothing you don't.",
      subtitle: "Six tools built for serious bettors — each one focused, fast, and actionable.",
      tiles: ["Live Odds Drops", "Bet Tracker", "Bookmaker Comparison", "Stake Calculator", "Daily Calendar", "Bankroll Management"],
    },
    bankroll: {
      badge: "Edge Tracking Suite",
      heading: "Follow your edge. Watch your bankroll grow.",
      subtitle: "Every number that matters — tracked for you. No spreadsheets needed.",
      seeItLive: "See it live",
      cards: [
        { tag: "Win Rate", title: "How often do you win?", desc: "Out of every 100 finished bets, how many did you win? SharpTracker counts your wins and losses automatically — no spreadsheet needed." },
        { tag: "Profit & Loss", title: "Are you up or down overall?", desc: "Your total profit or loss across all your bets, shown in units. Green means you're ahead, red means behind — updated the moment each result comes in." },
        { tag: "Return on Investment", title: "How much do you make per $100?", desc: "For every $100 you put on, this tells you how much profit you made back. A positive number means you're coming out ahead over time." },
        { tag: "Bookmaker Comparison", title: "Find the best price instantly.", desc: "When a sharp line moves, not every bookmaker reacts at the same speed. SharpTracker checks 32+ bookmakers so you can see which ones still have the old price — and act before they adjust." },
        { tag: "Daily Calendar", title: "See every day at a glance.", desc: "Green days made money, red days lost it. One look and you know exactly when your bets ran hot — and when it might be time to take a break." },
        { tag: "Bet Log", title: "Every bet saved automatically.", desc: "Each bet is saved with the match, the type of bet, the price, and the result. Your full history in one place — sort, filter, and review any bet you've ever placed." },
        { tag: "Auto-settle", title: "Results update themselves.", desc: "The moment a game ends, SharpTracker logs the result and updates your total. You never have to enter anything by hand." },
        { tag: "Bet Status", title: "Know what's finished and what's still live.", desc: "See at a glance how many bets have a result, how many are still waiting, and how many were cancelled and returned. Everything in one place." },
      ],
    },
  },

  sv: {
    nav: {
      features: "Funktioner",
      why: "Varför SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      signup: "Kom igång",
      trialBadge: "14 dagar gratis",
      subscriptions: "Prenumerationer",
      allFeatures: "Alla funktioner",
    },
    hero: {
      monitoring: (n) => `Bevakar ${n} livematcher just nu`,
      connecting: "Ansluter till livemarknader…",
      headline1: "När marknaden rör sig,",
      headline2: "rör du dig först.",
      subtitle: "Spela alltid till rätt odds. Vi bevakar världens skarpaste bookmaker dygnet runt och aviserar dig i samma sekund som oddsen faller.",
      stat1: "Tjänas varje år av privata spelare som följer skarpt kapital",
      stat2: "Från att kursen rör sig tills du får din avisering",
      stat3: "Skarpa oddsrörelser spårade och loggade varje dag",
      cta: "Kom igång",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — lanseras snart",
      desc: "Mobilappen är på väg. Du kommer att kunna få push-notiser direkt på din telefon så fort en odds-drop inträffar.",
    },
    alertSection: {
      neverMiss: "Missa aldrig",
      aDrop: "ett fall.",
    },
    terminal: {
      heading: "Observera matrisen.",
      subheading: "Sluta uppdatera spelbolagssidor. Vår terminal tar emot tusentals WebSocket-händelser per sekund och lyfter fram prisrörelser direkt.",
      eventStream: "Händelseström",
      seeTheSteam: "Se ångan.",
      seeTheSteamDesc: "När ett syndikat slår till på marknaden rör sig kursen hos alla bolag på millisekunder. SharpTracker visualiserar dessa fall omedelbart och markerar EV+-möjligheter innan de försvinner.",
      priceHistory: "Prishistorik",
      chartSentiment: "Kartlägg stämningen.",
      chartSentimentDesc: "Varje kursrörelse loggas tick för tick. Identifiera motståndsnivåer i spreads och totals, och förstå marknadens berättelse inför speldags.",
      latestDrops: "Senaste skarpa fall",
      live: "LIVE",
      liveFeed: "Livedataström",
      bkCompare: "Bk. Jämför",
      sports: "Sporter",
    },
    features: {
      heading1: "Dina filter.",
      heading2: "Dina regler.",
      subtitle: "Berätta för SharpTracker exakt vad som spelar roll för dig. Systemet bevakar marknaderna dygnet runt och aviserar dig i sekunden något rör sig.",
      steps: [
        { title: "Välj dina marknader", description: "Välj de sporter och ligor du följer. Bara det du väljer kommer igenom — inget annat." },
        { title: "Ange minimalt fall", description: "Välj hur stort prisfallet måste vara för att du ska få en avisering. Små rörelser ignoreras. Du hör bara om dem som spelar roll." },
        { title: "Vi bevakar 24/7", description: "SharpTracker spårar varje marknad hela dagen och natten. I sekunden kursen faller fångar vi det — oavsett när det händer." },
        { title: "Du hör om det först", description: "Du får aviseringen innan någon annan. Det tidsgapet är din fördel." },
      ],
      items: [
        { name: "Oddsfallsvarningar", desc: "Omedelbar push-notis när skarpa pengar rör sig" },
        { name: "Speltips-tracker", desc: "Logga varje spel och spåra varje enhet du någonsin placerat" },
        { name: "Spelbolagsjämförelse", desc: "Jämför liveodds hos 32+ spelbolag per avisering" },
        { name: "Insatskalkylator", desc: "Beräkna korrekt insats med inbyggt Kelly-kriterium" },
        { name: "Daglig V/F-kalender", desc: "Visuell vinst/förlust-kalender — hitta mönster direkt" },
        { name: "Multi-sport täckning", desc: "NFL, NBA, MLB, NHL, fotboll, tennis och mer" },
        { name: "Bankrollsökning", desc: "Fånga värde innan alla andra och se ditt övertag växa" },
      ],
    },
    marquee: {
      worksOn: "Fungerar hos",
      allBooks: "alla stora spelbolag →",
    },
    calc: {
      badge: "Verktyg",
      heading: "Vinstkalkylator.",
      subtitle: "Se vad SharpTracker kan göra för din bankroll baserat på hur du planerar att använda det.",
      bankrollLabel: "Startkapital",
      bankrollHint: "Vi rekommenderar att starta med minst €500",
      usageLabel: "Veckoanvändning",
      usageHint: "Hur många timmar i veckan du planerar att använda SharpTracker",
      timeframeLabel: "Tidsperiod",
      calculateBtn: "Beräkna",
      estimatedProfit: "Beräknad vinst",
      roi: "Avkastning",
      disclaimer: "Data kanske inte återspeglar faktiska resultat. Enbart illustrativa syften. Historisk avkastning garanterar inte framtida resultat.",
      fillPrompt: "Fyll i dina uppgifter och tryck",
      calculatePrompt: "Beräkna",
      usageOptions: [
        { value: "light",  label: "Lätt (2–5 timmar / vecka)" },
        { value: "medium", label: "Medel (5–10 timmar / vecka)" },
        { value: "heavy",  label: "Intensiv (10–20 timmar / vecka)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 veckor",  weeks: 2  },
        { value: "1m", label: "1 månad",   weeks: 4  },
        { value: "3m", label: "3 månader", weeks: 13 },
        { value: "6m", label: "6 månader", weeks: 26 },
      ],
    },
    cta: {
      heading: "Sluta spela med ett handikapp.",
      subtitle: "Gå med de skarpaste spelarna som använder realtids-data för att hitta bättre priser innan marknaden stänger.",
      viewPlans: "Se planer",
      startTrial: "Starta 14 dagars gratis provperiod",
    },
    footer: {
      desc: "Professionell oddsspårning och spelbolagsjämförelseterminal.",
      product: "Produkt",
      legal: "Juridik",
      dashboard: "Instrumentpanel",
      signUp: "Registrera dig",
      terms: "Användarvillkor",
      privacy: "Integritetspolicy",
      allRights: "Alla rättigheter förbehållna.",
      disclaimer1: "SharpTracker är en data- och analystjänst. Denna webbplats är strikt för utbildnings- och informationsändamål och involverar inte riktiga pengar eller underlättar vadslagning av något slag.",
      disclaimer2: "Spel innebär risk. Spela bara för pengar du har råd att förlora. Tjänsten är avsedd för vuxna över 18 år. Om du eller någon du känner har ett spelproblem finns hjälp tillgänglig.",
    },
    testimonials: {
      badge: "Riktiga användare. Riktiga resultat.",
      heading: "Hör vad andra\nsäger.",
      subtitle: "Skarpa spelare från hela Europa och världen — alla använder SharpTracker för att fånga rörelser innan marknaden justerar.",
      profitLabel: "Vinst",
    },
    faq: {
      badge: "FAQ",
      heading: "Vanliga frågor, ärliga svar.",
      subtitle: "Allt du behöver veta innan du kommer igång.",
      items: [
        { q: "Vad är SharpTracker exakt?", a: "SharpTracker övervakar oddsrörelser hos skarpa spelbolag i realtid. I samma sekund en kurs rör sig markant får du en avisering — så du kan lägga ditt spel innan mjukare spelbolag och börser hinner justera sina priser." },
        { q: "Hur snabba är aviseringarna?", a: "Aviseringar levereras inom sekunder efter att en kursrörelse detekterats. Hastighet är allt vid oddsfallsspel — till och med ett 30-sekunders försprång kan avgöra om du får värdepriset eller missar det helt." },
        { q: "Vilka sporter täcker ni?", a: "Vi täcker fotboll, basket, amerikansk fotboll, tennis, ishockey och baseball. Fler sporter läggs till regelbundet baserat på användarefterfrågan." },
        { q: "Måste jag vara en expertspelare för att använda detta?", a: "Nej. Appen är byggd för att vara tydlig och enkel. Om du förstår vad odds är och vill få bättre priser på dina spel kan du börja använda SharpTracker direkt. CLV- och bankrollsverktygen finns där när du är redo att gå djupare." },
        { q: "Vad är spelbolagsjämförelse och hur fungerar det?", a: "När ett skarpt spelbolag som Pinnacle rör sina odds är andra spelbolag ofta efter. SharpTracker kontrollerar 32+ spelbolag i realtid för varje avisering och visar vilka som fortfarande har det gamla priset — vilket ger dig ett fönster att få bättre odds." },
        { q: "Varifrån kommer datan?", a: "Vi hämtar odds från skarpa, höglimiterade spelbolag som professionella spelare förlitar sig på som marknadsreferens. Det är de spelbolag som rör sig först — om de ändrar sin kurs följer hela marknaden." },
        { q: "Finns det en gratis provperiod?", a: "Ja — varje nytt konto startar med en fullständig 14-dagars gratis provperiod. Inget kreditkort krävs. Du får fullständig tillgång till alla funktioner från dag ett." },
        { q: "Kan jag avsluta när som helst?", a: "Absolut. Det finns inga kontrakt eller bindningstider. Du kan avsluta din prenumeration när som helst från dina kontoinställningar. Du behåller tillgång tills slutet av din nuvarande faktureringsperiod." },
        { q: "Vad används insatskalkylatorn till?", a: "Insatskalkylatorn använder Kelly-kriteriet för att hjälpa dig att bestämma rätt insatsstorlek baserat på din bankroll och ditt övertag. Korrekt insatsstorlek är en av de mest förbisedda delarna av lönsamt spelande." },
        { q: "Vad skiljer SharpTracker från en tipsservice?", a: "Vi säger inte vem du ska satsa på. Vi ger dig verktygen för att hitta och agera på värde själv — live oddsrörelsedata, CLV-spårning och spelanalys. Du behåller kontrollen över varje beslut." },
      ],
    },
    betTracker: {
      heading: "Integrerad speltracker.",
      subtitle: "Logga dina spel med ett klick från flödet. Vi betygsätter dem automatiskt vid matchslut och mappar din prestation över tid.",
      date: "Datum",
      matchup: "Match",
      selection: "Val",
      odds: "Odds",
      clv: "CLV",
      result: "Resultat",
    },
    sharpData: {
      heading: "Driven av skarpa spelbolagsdata.",
      desc: "Vi spårar bara de skarpaste spelbolagen — de verkliga marknadsaktörerna där professionella pengar flödar. Medan andra tjänster blandar data från långsamma rekreationsspelbolag isolerar SharpTracker signalen från bruset. När de skarpa pengarna rör sig ser du det först.",
    },
    multiSport: {
      heading: "Total marknadstäckning.",
      subtitle: "Spåra kursrörelser i alla stora sporter samtidigt. Vår backend behandlar över 50 000 oddsuppdateringar per minut på alla marknader.",
    },
    featureStrip: {
      heading: "Allt du behöver. Inget du inte behöver.",
      subtitle: "Sex verktyg byggda för seriösa spelare — var och en fokuserad, snabb och handlingsbar.",
      tiles: ["Live oddsfall", "Speltracker", "Spelbolagsjämförelse", "Insatskalkylator", "Daglig kalender", "Bankrollshantering"],
    },
    bankroll: {
      badge: "Övertag-spårningssuite",
      heading: "Följ ditt övertag. Se din bankroll växa.",
      subtitle: "Varje siffra som spelar roll — spårad åt dig. Inga kalkylblad behövs.",
      seeItLive: "Se det live",
      cards: [
        { tag: "Vinstfrekvens", title: "Hur ofta vinner du?", desc: "Av 100 avslutade spel, hur många vann du? SharpTracker räknar dina vinster och förluster automatiskt." },
        { tag: "Vinst & Förlust", title: "Är du på plus eller minus totalt?", desc: "Din totala vinst eller förlust i enheter. Grönt = du leder, rött = du är efter — uppdateras direkt när varje resultat kommer in." },
        { tag: "Avkastning på investering", title: "Hur mycket tjänar du per 100 kr?", desc: "För varje 100 kr du satsar visar detta hur mycket vinst du fått tillbaka. Ett positivt tal innebär att du går med vinst." },
        { tag: "Spelbolagsjämförelse", title: "Hitta det bästa priset direkt.", desc: "När en skarp kurs rör sig reagerar inte alla spelbolag i samma hastighet. SharpTracker kontrollerar 32+ spelbolag direkt." },
        { tag: "Daglig kalender", title: "Se varje dag på ett ögonkast.", desc: "Gröna dagar gav vinst, röda dagar gav förlust. En blick och du vet exakt när dina spel gick bra." },
        { tag: "Spelloggen", title: "Varje spel sparat automatiskt.", desc: "Varje spel sparas med match, speltyp, pris och resultat. Din kompletta historik på ett ställe." },
        { tag: "Auto-avgörande", title: "Resultaten uppdaterar sig själva.", desc: "I sekunden ett spel slutar loggar SharpTracker resultatet och uppdaterar din total. Du behöver aldrig mata in något manuellt." },
        { tag: "Spelstatus", title: "Vet vad som är klart och vad som pågår.", desc: "Se på en gång hur många spel har ett resultat, hur många väntar och hur många ångrades." },
      ],
    },
  },

  no: {
    nav: {
      features: "Funksjoner",
      why: "Hvorfor SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      signup: "Kom i gang",
      trialBadge: "14 dager gratis",
      subscriptions: "Abonnementer",
      allFeatures: "Alle funksjoner",
    },
    hero: {
      monitoring: (n) => `Overvåker ${n} livekamper nå`,
      connecting: "Kobler til live-markeder…",
      headline1: "Når markedet beveger seg,",
      headline2: "beveger du deg først.",
      subtitle: "Spill alltid til riktig odds. Vi overvåker verdens skarpeste bookmaker 24/7 og varsler deg i det øyeblikket oddsen faller.",
      stat1: "Tjenes hvert år av private spillere som følger skarpe penger",
      stat2: "Fra linjen beveger seg til du mottar varselet",
      stat3: "Skarpe oddsfall sporet og logget hver eneste dag",
      cta: "Kom i gang",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — kommer snart",
      desc: "Mobilappen er på vei. Du vil kunne motta push-varsler direkte på telefonen din i det øyeblikket en odds-drop inntreffer.",
    },
    alertSection: {
      neverMiss: "Gå aldri glipp av",
      aDrop: "et fall.",
    },
    terminal: {
      heading: "Observer matrisen.",
      subheading: "Slutt å oppdatere spillsider. Terminalen vår mottar tusenvis av WebSocket-hendelser per sekund og fremhever meningsfulle prisbevegelser øyeblikkelig.",
      eventStream: "Hendelsesstrøm",
      seeTheSteam: "Se dampet.",
      seeTheSteamDesc: "Når et syndikat treffer markedet, beveger linjen seg hos alle bookmakere på millisekunder. SharpTracker visualiserer disse fallene øyeblikkelig.",
      priceHistory: "Prishistorikk",
      chartSentiment: "Kartlegg stemningen.",
      chartSentimentDesc: "Hver kursbevegelse er kartlagt tick for tick. Identifiser motstandsnivåer i spreads og totals, og forstå markedets narrative frem mot kampstart.",
      latestDrops: "Siste skarpe fall",
      live: "LIVE",
      liveFeed: "Direktestrøm",
      bkCompare: "Bk. Sammenlign",
      sports: "Idretter",
    },
    features: {
      heading1: "Dine filtre.",
      heading2: "Dine regler.",
      subtitle: "Fortell SharpTracker nøyaktig hva som er viktig for deg. Den overvåker markedene døgnet rundt og varsler deg i det øyeblikket noe beveger seg.",
      steps: [
        { title: "Velg dine markeder", description: "Velg idrettene og ligaene du følger. Bare det du velger kommer gjennom — ingenting annet." },
        { title: "Angi minimalt fall", description: "Velg hvor stort prisfallet må være før du får et varsel. Små bevegelser ignoreres. Du hører bare om de som betyr noe." },
        { title: "Vi overvåker 24/7", description: "SharpTracker sporer hvert marked hele dagen og natten. Sekundet en linje faller, fanger vi det — uansett når det skjer." },
        { title: "Du hører om det først", description: "Du får varselet før alle andre. Det tidsgapet er din fordel." },
      ],
      items: [
        { name: "Oddsfall-varsler", desc: "Umiddelbar push-varsling når skarpe penger beveger seg" },
        { name: "Spilltracker", desc: "Logg hvert spill og spor hver enhet du noensinne har plassert" },
        { name: "Bookmakersammenligning", desc: "Sammenlign live-odds hos 32+ bookmakere per varsel" },
        { name: "Innsatskalkulator", desc: "Beregn riktig innsatsstørrelse med Kelly-kriteriet innebygd" },
        { name: "Daglig V/T-kalender", desc: "Visuell gevinst/tap-kalender — finn mønstre øyeblikkelig" },
        { name: "Multi-sport dekning", desc: "NFL, NBA, MLB, NHL, fotball, tennis og mer" },
        { name: "Bankrollvekst", desc: "Fang verdi før alle andre og se fordelen din bygge seg opp" },
      ],
    },
    marquee: {
      worksOn: "Fungerer hos",
      allBooks: "alle store bookmakere →",
    },
    calc: {
      badge: "Verktøy",
      heading: "Gevinstkalkulator.",
      subtitle: "Se hva SharpTracker kan gjøre for bankrollen din basert på hvordan du planlegger å bruke det.",
      bankrollLabel: "Startkapital",
      bankrollHint: "Vi anbefaler å starte med minst €500",
      usageLabel: "Ukentlig bruk",
      usageHint: "Hvor mange timer i uken du planlegger å bruke SharpTracker",
      timeframeLabel: "Tidsramme",
      calculateBtn: "Beregn",
      estimatedProfit: "Estimert gevinst",
      roi: "Avkastning",
      disclaimer: "Data gjenspeiler kanskje ikke faktiske resultater. Kun for illustrasjonsformål. Historisk avkastning er ingen garanti for fremtidige resultater.",
      fillPrompt: "Fyll inn opplysningene dine og trykk",
      calculatePrompt: "Beregn",
      usageOptions: [
        { value: "light",  label: "Lett (2–5 timer / uke)" },
        { value: "medium", label: "Middels (5–10 timer / uke)" },
        { value: "heavy",  label: "Intensiv (10–20 timer / uke)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 uker",    weeks: 2  },
        { value: "1m", label: "1 måned",   weeks: 4  },
        { value: "3m", label: "3 måneder", weeks: 13 },
        { value: "6m", label: "6 måneder", weeks: 26 },
      ],
    },
    cta: {
      heading: "Slutt å spille med handikap.",
      subtitle: "Bli med de skarpeste spillerne som bruker sanntidsdata for å finne bedre priser før markedet stenger.",
      viewPlans: "Se planer",
      startTrial: "Start 14 dagers gratis prøveperiode",
    },
    footer: {
      desc: "Profesjonell oddssporing og bookmakersammenligningsterminale.",
      product: "Produkt",
      legal: "Juridisk",
      dashboard: "Instrumentbord",
      signUp: "Registrer deg",
      terms: "Brukervilkår",
      privacy: "Personvernpolicy",
      allRights: "Alle rettigheter forbeholdt.",
      disclaimer1: "SharpTracker er en data- og analysetjeneste. Dette nettstedet er strengt for utdannings- og informasjonsformål og involverer ikke pengespill eller tilrettelegger vadslagning av noe slag.",
      disclaimer2: "Gambling innebærer risiko. Spill bare for penger du har råd til å tape. Tjenesten er ment for voksne over 18 år. Hvis du eller noen du kjenner har et spilleproblem, er hjelp tilgjengelig.",
    },
    testimonials: {
      badge: "Ekte brukere. Ekte resultater.",
      heading: "Hør hva andre\nsier.",
      subtitle: "Skarpe spillere fra hele Europa og verden — alle bruker SharpTracker for å fange bevegelser før markedet justerer.",
      profitLabel: "Gevinst",
    },
    faq: {
      badge: "FAQ",
      heading: "Vanlige spørsmål, ærlige svar.",
      subtitle: "Alt du trenger å vite før du kommer i gang.",
      items: [
        { q: "Hva er SharpTracker?", a: "SharpTracker overvåker oddsbevegelser hos skarpe bookmakere i sanntid. I det øyeblikket en linje beveger seg markant, får du et varsel — slik at du kan plassere spillet ditt før mykere bookmakere og børser rekker å justere prisene sine." },
        { q: "Hvor raske er varslene?", a: "Varsler leveres innen sekunder etter at en kursbevegelse er oppdaget. Hastighet er alt ved oddsfallsspill — selv 30 sekunders forsprang kan bety forskjellen mellom å få verdipris og gå glipp av det." },
        { q: "Hvilke idretter dekker dere?", a: "Vi dekker fotball, basketball, amerikansk fotball, tennis, ishockey og baseball. Flere idretter legges til jevnlig basert på etterspørsel." },
        { q: "Trenger jeg å være ekspertspiller?", a: "Nei. Appen er bygget for å være klar og enkel. Hvis du forstår hva odds er og ønsker bedre priser på spillene dine, kan du bruke SharpTracker med en gang." },
        { q: "Hva er bookmakersammenligning og hvordan fungerer det?", a: "Når en skarp bookmaker som Pinnacle beveger sine odds, henger andre bookmakere ofte etter. SharpTracker sjekker 32+ bookmakere i sanntid og viser deg hvilke som fortsatt har den gamle prisen." },
        { q: "Hvilke bookmakere kommer dataene fra?", a: "Vi henter odds fra skarpe, høylimiterte bookmakere som profesjonelle spillere stoler på som markedsreferanse. Dette er bookmakerne som beveger seg først." },
        { q: "Er det en gratis prøveperiode?", a: "Ja — hver ny konto starter med en full 14 dagers gratis prøveperiode. Ikke kredittkort kreves. Du får full tilgang til alle funksjoner fra dag én." },
        { q: "Kan jeg avbestille når som helst?", a: "Absolutt. Det er ingen kontrakter eller bindingstider. Du kan avbestille abonnementet ditt når som helst fra kontoinnstillingene dine." },
        { q: "Hva er innsatskalkulatoren for?", a: "Innsatskalkulatoren bruker Kelly-kriteriet for å hjelpe deg å beregne riktig innsatsstørrelse basert på bankrollen din og fordelen du har." },
        { q: "Hva er forskjellen mellom SharpTracker og en tipstjeneste?", a: "Vi forteller deg ikke hvem du skal satse på. Vi gir deg verktøyene for å finne og handle på verdi selv — live oddsbevegelsesdata, CLV-sporing og spillanalyse." },
      ],
    },
    betTracker: {
      heading: "Integrert spilltracker.",
      subtitle: "Logg spillene dine med ett klikk fra feeden. Vi beregner dem automatisk ved kampende og kartlegger ytelsen din over tid.",
      date: "Dato",
      matchup: "Kamp",
      selection: "Valg",
      odds: "Odds",
      clv: "CLV",
      result: "Resultat",
    },
    sharpData: {
      heading: "Drevet av skarpe bookmakerdata.",
      desc: "Vi sporer bare de skarpeste bookmakerne — de sanne markedsaktørene der profesjonelle penger flyter. SharpTracker isolerer signalet fra støyen. Når de skarpe pengene beveger seg, ser du det først.",
    },
    multiSport: {
      heading: "Total markedsdekning.",
      subtitle: "Spor kursbevegelser på tvers av alle store idretter samtidig. Vår backend behandler over 50 000 oddsoppdateringer per minutt.",
    },
    featureStrip: {
      heading: "Alt du trenger. Ingenting du ikke trenger.",
      subtitle: "Seks verktøy bygget for seriøse spillere — hvert fokusert, raskt og handlingsbart.",
      tiles: ["Live oddsfall", "Spilltracker", "Bookmakersammenligning", "Innsatskalkulator", "Daglig kalender", "Bankrollstyring"],
    },
    bankroll: {
      badge: "Fordelssporings-suite",
      heading: "Følg fordelen din. Se bankrollen din vokse.",
      subtitle: "Hvert tall som betyr noe — sporet for deg. Ingen regneark nødvendig.",
      seeItLive: "Se det live",
      cards: [
        { tag: "Vinnfrekvens", title: "Hvor ofte vinner du?", desc: "Av 100 ferdige spill, hvor mange vant du? SharpTracker teller gevinster og tap automatisk." },
        { tag: "Gevinst & Tap", title: "Er du i pluss eller minus totalt?", desc: "Din totale gevinst eller tap i enheter. Grønt betyr du leder, rødt betyr du er etter." },
        { tag: "Avkastning på investering", title: "Hvor mye tjener du per 100 kr?", desc: "For hver 100 kr du satser, forteller dette deg hvor mye gevinst du fikk tilbake." },
        { tag: "Bookmakersammenligning", title: "Finn den beste prisen øyeblikkelig.", desc: "Når en skarp linje beveger seg, reagerer ikke alle bookmakere i samme hastighet. SharpTracker sjekker 32+ bookmakere." },
        { tag: "Daglig kalender", title: "Se hver dag på ett blikk.", desc: "Grønne dager ga gevinst, røde dager ga tap. Én titt og du vet nøyaktig når spillene dine gikk bra." },
        { tag: "Spillogg", title: "Hvert spill lagret automatisk.", desc: "Hvert spill lagres med kamp, spilltype, pris og resultat. Din komplette historikk på ett sted." },
        { tag: "Auto-avgjørelse", title: "Resultatene oppdaterer seg selv.", desc: "I det øyeblikket et spill er ferdig, logger SharpTracker resultatet og oppdaterer totalen din." },
        { tag: "Spillstatus", title: "Vet hva som er ferdig og hva som pågår.", desc: "Se på ett blikk hvor mange spill har et resultat, hvor mange venter og hvor mange ble annullert." },
      ],
    },
  },

  da: {
    nav: {
      features: "Funktioner",
      why: "Hvorfor SharpTracker?",
      pricing: "Priser",
      faq: "FAQ",
      signup: "Kom i gang",
      trialBadge: "14 dage gratis",
      subscriptions: "Abonnementer",
      allFeatures: "Alle funktioner",
    },
    hero: {
      monitoring: (n) => `Overvåger ${n} livekampe lige nu`,
      connecting: "Opretter forbindelse til live-markeder…",
      headline1: "Når markedet bevæger sig,",
      headline2: "bevæger du dig først.",
      subtitle: "Spil altid til den rigtige odds. Vi overvåger verdens skarpeste bookmaker 24/7 og advarer dig i det øjeblik, oddsene falder.",
      stat1: "Tjenes hvert år af private spillere, der følger skarpe penge",
      stat2: "Fra linjen bevæger sig til du modtager advarslen",
      stat3: "Skarpe oddsanfald sporet og logget hver eneste dag",
      cta: "Kom i gang",
    },
    mobile: {
      badge: "Mobilapp",
      comingSoon: "Mobilapp — kommer snart",
      desc: "Mobilappen er på vej. Du vil kunne modtage push-notifikationer direkte på din telefon, så snart et odds-drop sker.",
    },
    alertSection: {
      neverMiss: "Gå aldrig glip af",
      aDrop: "et fald.",
    },
    terminal: {
      heading: "Observer matricen.",
      subheading: "Stop med at opdatere spillesider. Vores terminal modtager tusindvis af WebSocket-hændelser per sekund og fremhæver meningsfulde prisbevægelser øjeblikkeligt.",
      eventStream: "Hændelsesstrøm",
      seeTheSteam: "Se dampet.",
      seeTheSteamDesc: "Når et syndikat rammer markedet, bevæger linjen sig hos alle bookmakere på millisekunder. SharpTracker visualiserer disse fald øjeblikkeligt.",
      priceHistory: "Prishistorik",
      chartSentiment: "Kortlæg stemningen.",
      chartSentimentDesc: "Hver kursbevægelse er kortlagt tick for tick. Identificer modstandsniveauer i spreads og totals og forstå markedets narrativ op til kampstart.",
      latestDrops: "Seneste skarpe fald",
      live: "LIVE",
      liveFeed: "Direktestrøm",
      bkCompare: "Bk. Sammenlign",
      sports: "Sporter",
    },
    features: {
      heading1: "Dine filtre.",
      heading2: "Dine regler.",
      subtitle: "Fortæl SharpTracker præcist, hvad der betyder noget for dig. Det overvåger markederne døgnet rundt og advarer dig i det øjeblik, noget bevæger sig.",
      steps: [
        { title: "Vælg dine markeder", description: "Vælg de sporter og ligaer, du følger. Kun det, du vælger, kommer igennem — intet andet." },
        { title: "Angiv minimalt fald", description: "Vælg, hvor stort et prisfald skal være, før du modtager en advarsel. Små bevægelser ignoreres. Du hører kun om dem, der betyder noget." },
        { title: "Vi overvåger 24/7", description: "SharpTracker sporer hvert marked hele dagen og natten. I det sekund en linje falder, fanger vi det — uanset hvornår det sker." },
        { title: "Du hører om det først", description: "Du modtager advarslen før alle andre. Det tidsforspring er din fordel." },
      ],
      items: [
        { name: "Oddsfald-advarsler", desc: "Øjeblikkelig push-notifikation, når skarpe penge bevæger sig" },
        { name: "Spilletracker", desc: "Log hvert spil og spor hver enhed, du nogensinde har placeret" },
        { name: "Bookmakersammenligning", desc: "Sammenlign live-odds hos 32+ bookmakere pr. advarsel" },
        { name: "Indstatskalkulator", desc: "Beregn korrekt indsatsstørrelse med Kelly-kriteriet" },
        { name: "Daglig V/T-kalender", desc: "Visuel gevinst/tab-kalender — find mønstre øjeblikkeligt" },
        { name: "Multi-sport dækning", desc: "NFL, NBA, MLB, NHL, fodbold, tennis og mere" },
        { name: "Bankrollvækst", desc: "Fang værdi før alle andre og se din fordel akkumulere sig" },
      ],
    },
    marquee: {
      worksOn: "Fungerer hos",
      allBooks: "alle store bookmakere →",
    },
    calc: {
      badge: "Værktøjer",
      heading: "Gevinstkalkulator.",
      subtitle: "Se, hvad SharpTracker kan gøre for din bankroll baseret på, hvordan du planlægger at bruge det.",
      bankrollLabel: "Startkapital",
      bankrollHint: "Vi anbefaler at starte med mindst €500",
      usageLabel: "Ugentlig brug",
      usageHint: "Hvor mange timer om ugen du planlægger at bruge SharpTracker",
      timeframeLabel: "Tidsramme",
      calculateBtn: "Beregn",
      estimatedProfit: "Estimeret gevinst",
      roi: "Afkast",
      disclaimer: "Data afspejler muligvis ikke faktiske resultater. Kun til illustrationsformål. Historisk afkast garanterer ikke fremtidige resultater.",
      fillPrompt: "Udfyld dine oplysninger og tryk",
      calculatePrompt: "Beregn",
      usageOptions: [
        { value: "light",  label: "Let (2–5 timer / uge)" },
        { value: "medium", label: "Middel (5–10 timer / uge)" },
        { value: "heavy",  label: "Intensiv (10–20 timer / uge)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 uger",    weeks: 2  },
        { value: "1m", label: "1 måned",   weeks: 4  },
        { value: "3m", label: "3 måneder", weeks: 13 },
        { value: "6m", label: "6 måneder", weeks: 26 },
      ],
    },
    cta: {
      heading: "Stop med at spille med handicap.",
      subtitle: "Vær med de skarpeste spillere, der bruger realtidsdata til at finde bedre priser, før markedet lukker.",
      viewPlans: "Se planer",
      startTrial: "Start 14 dages gratis prøveperiode",
    },
    footer: {
      desc: "Professionel oddssporing og bookmakersammenligningsterminale.",
      product: "Produkt",
      legal: "Juridisk",
      dashboard: "Instrumentbræt",
      signUp: "Tilmeld dig",
      terms: "Servicevilkår",
      privacy: "Fortrolighedspolitik",
      allRights: "Alle rettigheder forbeholdes.",
      disclaimer1: "SharpTracker er en data- og analysetjeneste. Dette websted er udelukkende til uddannelses- og informationsformål og involverer ikke rigtige penge eller tilrettelægger væddemål af nogen art.",
      disclaimer2: "Spil indebærer risiko. Spil kun for penge, du har råd til at tabe. Tjenesten er beregnet til voksne over 18 år. Hvis du eller nogen du kender har et spilleproblem, er der hjælp at hente.",
    },
    testimonials: {
      badge: "Rigtige brugere. Rigtige resultater.",
      heading: "Hør hvad andre\nsiger.",
      subtitle: "Skarpe spillere fra hele Europa og verden — alle bruger SharpTracker til at fange bevægelser, før markedet justerer.",
      profitLabel: "Gevinst",
    },
    faq: {
      badge: "FAQ",
      heading: "Almindelige spørgsmål, ærlige svar.",
      subtitle: "Alt hvad du behøver at vide, før du kommer i gang.",
      items: [
        { q: "Hvad er SharpTracker præcist?", a: "SharpTracker overvåger oddsbevægelser hos skarpe bookmakere i realtid. I det øjeblik en linje bevæger sig markant, modtager du en advarsel — så du kan placere dit spil, før blødere bookmakere og børser når at justere deres priser." },
        { q: "Hvor hurtige er advarslerne?", a: "Advarsler leveres inden for sekunder efter, at en kursbevægelse er opdaget. Hastighed er alt ved oddsfaldsspil — selv 30 sekunders forspring kan gøre forskellen." },
        { q: "Hvilke sporter dækker I?", a: "Vi dækker fodbold, basketball, amerikansk fodbold, tennis, ishockey og baseball. Flere sporter tilføjes løbende baseret på brugerefterspørgsel." },
        { q: "Skal jeg være ekspert-spiller for at bruge dette?", a: "Nej. Appen er bygget til at være klar og enkel. Hvis du forstår, hvad odds er, og ønsker bedre priser, kan du bruge SharpTracker med det samme." },
        { q: "Hvad er bookmakersammenligning, og hvordan fungerer det?", a: "Når en skarp bookmaker som Pinnacle bevæger sine odds, hænger andre bookmakere ofte bagud. SharpTracker tjekker 32+ bookmakere i realtid og viser dig, hvilke der stadig har den gamle pris." },
        { q: "Hvilke bookmakere kommer dataene fra?", a: "Vi henter odds fra skarpe, højtlimiterede bookmakere, som professionelle spillere stoler på som markedsreferencer. Det er de bookmakere, der bevæger sig først." },
        { q: "Er der en gratis prøveperiode?", a: "Ja — hver ny konto starter med en fuld 14-dages gratis prøveperiode. Intet kreditkort kræves. Du får fuld adgang til alle funktioner fra dag ét." },
        { q: "Kan jeg annullere til enhver tid?", a: "Absolut. Der er ingen kontrakter eller bindingsperioder. Du kan annullere dit abonnement til enhver tid fra dine kontoindstillinger." },
        { q: "Hvad bruges indsatskalkulatoren til?", a: "Indsatskalkulatoren bruger Kelly-kriteriet til at hjælpe dig med at bestemme den rigtige indsatsstørrelse baseret på din bankroll og din fordel." },
        { q: "Hvad er forskellen mellem SharpTracker og en tipstjeneste?", a: "Vi fortæller dig ikke, hvem du skal satse på. Vi giver dig værktøjerne til at finde og handle på værdi selv — live oddsbevægelsesdata, CLV-sporing og spilleanalyse." },
      ],
    },
    betTracker: {
      heading: "Integreret spilletracker.",
      subtitle: "Log dine spil med ét klik fra strømmen. Vi bedømmer dem automatisk ved kampens afslutning og kortlægger din præstation over tid.",
      date: "Dato",
      matchup: "Kamp",
      selection: "Valg",
      odds: "Odds",
      clv: "CLV",
      result: "Resultat",
    },
    sharpData: {
      heading: "Drevet af skarpe bookmakerdata.",
      desc: "Vi sporer kun de skarpeste bookmakere — de sande markedsaktører, hvor professionelle penge strømmer. SharpTracker isolerer signalet fra støjen. Når de skarpe penge bevæger sig, ser du det først.",
    },
    multiSport: {
      heading: "Total markedsdækning.",
      subtitle: "Spor kursbevægelser på tværs af alle store sporter samtidigt. Vores backend behandler over 50.000 odds-opdateringer per minut.",
    },
    featureStrip: {
      heading: "Alt hvad du har brug for. Intet du ikke har.",
      subtitle: "Seks værktøjer bygget til seriøse spillere — hvert fokuseret, hurtigt og handlingsorienteret.",
      tiles: ["Live oddsfald", "Spilletracker", "Bookmakersammenligning", "Indsatskalkulator", "Daglig kalender", "Bankrollstyring"],
    },
    bankroll: {
      badge: "Fordels-sporings-suite",
      heading: "Følg din fordel. Se din bankroll vokse.",
      subtitle: "Hvert tal, der betyder noget — sporet for dig. Ingen regneark nødvendigt.",
      seeItLive: "Se det live",
      cards: [
        { tag: "Vindrate", title: "Hvor ofte vinder du?", desc: "Af 100 afsluttede spil, hvor mange vandt du? SharpTracker tæller gevinster og tab automatisk." },
        { tag: "Gevinst & Tab", title: "Er du i plus eller minus samlet?", desc: "Din samlede gevinst eller tab i enheder. Grønt betyder du er foran, rødt betyder du er bagud." },
        { tag: "Afkast på investering", title: "Hvor meget tjener du pr. 100 kr?", desc: "For hver 100 kr du satser, fortæller dette dig, hvor meget gevinst du har fået tilbage." },
        { tag: "Bookmakersammenligning", title: "Find den bedste pris øjeblikkeligt.", desc: "Når en skarp linje bevæger sig, reagerer ikke alle bookmakere i samme hastighed. SharpTracker tjekker 32+ bookmakere." },
        { tag: "Daglig kalender", title: "Se hver dag på ét blik.", desc: "Grønne dage gav gevinst, røde dage gav tab. Ét blik og du ved præcist, hvornår dine spil kørte godt." },
        { tag: "Spillelog", title: "Hvert spil gemt automatisk.", desc: "Hvert spil gemmes med kamp, spilletype, pris og resultat. Din komplette historik på ét sted." },
        { tag: "Auto-afregning", title: "Resultaterne opdaterer sig selv.", desc: "I det øjeblik et spil er slut, logger SharpTracker resultatet og opdaterer din total." },
        { tag: "Spillestatus", title: "Vid hvad der er færdigt og hvad der pågår.", desc: "Se på ét blik, hvor mange spil har et resultat, hvor mange venter og hvor mange er annulleret." },
      ],
    },
  },

  de: {
    nav: {
      features: "Funktionen",
      why: "Warum SharpTracker?",
      pricing: "Preise",
      faq: "FAQ",
      signup: "Loslegen",
      trialBadge: "14 Tage kostenlos",
      subscriptions: "Abonnements",
      allFeatures: "Alle Funktionen",
    },
    hero: {
      monitoring: (n) => `Beobachtet ${n} Live-Events gerade`,
      connecting: "Verbindung zu Live-Märkten…",
      headline1: "Wenn sich der Markt bewegt,",
      headline2: "bewegst du dich zuerst.",
      subtitle: "Setze immer zum richtigen Preis. Wir beobachten den schärfsten Buchmacher der Welt rund um die Uhr und benachrichtigen dich sofort, wenn die Quoten fallen.",
      stat1: "Werden jedes Jahr von privaten Wettenden verdient, die scharfem Geld folgen",
      stat2: "Vom Zeitpunkt der Linienveränderung bis zur Benachrichtigung",
      stat3: "Scharfe Quotenstürze täglich verfolgt und protokolliert",
      cta: "Zugang erhalten",
    },
    mobile: {
      badge: "Mobile App",
      comingSoon: "Mobile App — demnächst verfügbar",
      desc: "Die mobile App ist auf dem Weg. Du wirst direkt auf deinem Telefon benachrichtigt, sobald ein Odds-Drop eintritt.",
    },
    alertSection: {
      neverMiss: "Verpasse nie",
      aDrop: "einen Drop.",
    },
    terminal: {
      heading: "Beobachte die Matrix.",
      subheading: "Höre auf, Wettanbieterseiten zu aktualisieren. Unser Terminal verarbeitet Tausende von WebSocket-Ereignissen pro Sekunde und zeigt bedeutsame Preisbewegungen sofort.",
      eventStream: "Ereignisstrom",
      seeTheSteam: "Sieh den Dampf.",
      seeTheSteamDesc: "Wenn ein Syndikat den Markt trifft, bewegt sich die Linie bei allen Buchmachern in Millisekunden. SharpTracker visualisiert diese Drops sofort und hebt bedeutende EV+-Möglichkeiten hervor.",
      priceHistory: "Preisverlauf",
      chartSentiment: "Kartiere die Stimmung.",
      chartSentimentDesc: "Jede Kursbewegung wird Tick für Tick aufgezeichnet. Erkenne Widerstandslevel bei Spreads und Totals und verstehe die Marktnarrative vor dem Spielbeginn.",
      latestDrops: "Neueste scharfe Drops",
      live: "LIVE",
      liveFeed: "Live-Feed",
      bkCompare: "Bk. Vergleich",
      sports: "Sportarten",
    },
    features: {
      heading1: "Deine Filter.",
      heading2: "Deine Regeln.",
      subtitle: "Sag SharpTracker genau, was dir wichtig ist. Es überwacht die Märkte rund um die Uhr und benachrichtigt dich sofort, wenn sich etwas bewegt.",
      steps: [
        { title: "Wähle deine Märkte", description: "Wähle die Sportarten und Ligen, denen du folgst. Nur was du auswählst kommt durch — nichts anderes." },
        { title: "Minimalen Drop festlegen", description: "Wähle, wie groß ein Preisrückgang sein muss, bevor du eine Benachrichtigung erhältst. Kleine Bewegungen werden ignoriert. Du hörst nur von denen, die wichtig sind." },
        { title: "Wir überwachen 24/7", description: "SharpTracker verfolgt jeden Markt den ganzen Tag und die ganze Nacht. Sobald eine Linie fällt, fangen wir es auf — egal wann es passiert." },
        { title: "Du hörst als Erster davon", description: "Du erhältst die Benachrichtigung vor allen anderen. Dieser Zeitvorsprung ist dein Vorteil." },
      ],
      items: [
        { name: "Quotenfall-Alerts", desc: "Sofortige Push-Benachrichtigung wenn scharfes Geld sich bewegt" },
        { name: "Wetttracker", desc: "Jede Wette loggen und jede gespielte Einheit verfolgen" },
        { name: "Buchmacher-Vergleich", desc: "Live-Quoten von 32+ Buchmachern pro Alert vergleichen" },
        { name: "Einsatzrechner", desc: "Einsätze korrekt berechnen mit Kelly-Kriterium" },
        { name: "Täglicher G/V-Kalender", desc: "Visueller Gewinn/Verlust-Kalender — Muster sofort erkennen" },
        { name: "Multi-Sport Abdeckung", desc: "NFL, NBA, MLB, NHL, Fußball, Tennis und mehr" },
        { name: "Bankroll-Wachstum", desc: "Wert vor allen anderen erkennen und den Vorteil komprimieren" },
      ],
    },
    marquee: {
      worksOn: "Funktioniert bei",
      allBooks: "allen großen Buchmachern →",
    },
    calc: {
      badge: "Werkzeuge",
      heading: "Gewinnrechner.",
      subtitle: "Sieh, was SharpTracker für dein Bankroll tun könnte, basierend auf deiner geplanten Nutzung.",
      bankrollLabel: "Startkapital",
      bankrollHint: "Wir empfehlen mindestens €500 als Startkapital",
      usageLabel: "Wöchentliche Nutzung",
      usageHint: "Wie viele Stunden pro Woche du SharpTracker nutzen möchtest",
      timeframeLabel: "Zeitraum",
      calculateBtn: "Berechnen",
      estimatedProfit: "Geschätzter Gewinn",
      roi: "Rendite",
      disclaimer: "Daten spiegeln möglicherweise keine tatsächlichen Ergebnisse wider. Nur zu Illustrationszwecken. Vergangene Leistung garantiert keine zukünftigen Ergebnisse.",
      fillPrompt: "Fülle deine Angaben aus und drücke",
      calculatePrompt: "Berechnen",
      usageOptions: [
        { value: "light",  label: "Leicht (2–5 Stunden / Woche)" },
        { value: "medium", label: "Mittel (5–10 Stunden / Woche)" },
        { value: "heavy",  label: "Intensiv (10–20 Stunden / Woche)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 Wochen",  weeks: 2  },
        { value: "1m", label: "1 Monat",   weeks: 4  },
        { value: "3m", label: "3 Monate",  weeks: 13 },
        { value: "6m", label: "6 Monate",  weeks: 26 },
      ],
    },
    cta: {
      heading: "Höre auf, mit Handicap zu spielen.",
      subtitle: "Schließe dich den schärfsten Wettern an, die Echtzeit-Marktdaten nutzen, um bessere Preise zu finden, bevor der Markt schließt.",
      viewPlans: "Pläne ansehen",
      startTrial: "14-tägige kostenlose Testphase starten",
    },
    footer: {
      desc: "Professionelles Quoten-Tracking und Buchmacher-Vergleichsterminal.",
      product: "Produkt",
      legal: "Rechtliches",
      dashboard: "Dashboard",
      signUp: "Registrieren",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutzrichtlinie",
      allRights: "Alle Rechte vorbehalten.",
      disclaimer1: "SharpTracker ist ein Daten- und Analysedienst. Diese Website dient ausschließlich Bildungs- und Informationszwecken und beinhaltet kein echtes Geldwetten.",
      disclaimer2: "Glücksspiel birgt Risiken. Setze nur, was du dir leisten kannst zu verlieren. Der Dienst ist für Erwachsene ab 18 Jahren bestimmt. Wenn du ein Glücksspielproblem hast, ist Hilfe verfügbar.",
    },
    testimonials: {
      badge: "Echte Nutzer. Echte Ergebnisse.",
      heading: "Höre, was andere\nsagen.",
      subtitle: "Scharfe Wetter aus ganz Europa und darüber hinaus — alle nutzen SharpTracker, um Bewegungen abzufangen, bevor der Markt sich anpasst.",
      profitLabel: "Gewinn",
    },
    faq: {
      badge: "FAQ",
      heading: "Häufige Fragen, ehrliche Antworten.",
      subtitle: "Alles, was du wissen musst, bevor du anfängst.",
      items: [
        { q: "Was genau ist SharpTracker?", a: "SharpTracker überwacht Quotenbewegungen bei scharfen Buchmachern in Echtzeit. Sobald sich eine Linie deutlich bewegt, erhältst du einen Alert — damit du deine Wette platzieren kannst, bevor weichere Buchmacher und Börsen ihre Preise anpassen." },
        { q: "Wie schnell sind die Alerts?", a: "Alerts werden innerhalb von Sekunden nach einer erkannten Kursbewegung geliefert. Geschwindigkeit ist beim Odds-Dropping alles — selbst 30 Sekunden Vorsprung können den Unterschied ausmachen." },
        { q: "Welche Sportarten deckt ihr ab?", a: "Wir decken Fußball, Basketball, American Football, Tennis, Eishockey und Baseball ab. Weitere Sportarten werden regelmäßig basierend auf Nutzernachfrage hinzugefügt." },
        { q: "Muss ich ein Experte sein, um das zu nutzen?", a: "Nein. Die App ist klar und einfach gestaltet. Wenn du verstehst, was Quoten sind und bessere Preise für deine Wetten möchtest, kannst du SharpTracker sofort nutzen." },
        { q: "Was ist Buchmacher-Vergleich und wie funktioniert er?", a: "Wenn ein scharfer Buchmacher wie Pinnacle seine Quoten bewegt, hinken andere Buchmacher oft hinterher. SharpTracker überprüft 32+ Buchmacher in Echtzeit und zeigt dir, welche noch den alten Preis haben." },
        { q: "Woher kommen die Daten?", a: "Wir beziehen Quoten von scharfen, hochlimitierten Buchmachern, auf die professionelle Wetter als Marktbenchmarks vertrauen. Das sind die Bücher, die sich zuerst bewegen." },
        { q: "Gibt es eine kostenlose Testphase?", a: "Ja — jedes neue Konto beginnt mit einer vollständigen 14-tägigen Testphase. Keine Kreditkarte erforderlich. Du erhältst ab Tag eins vollen Zugang zu allen Funktionen." },
        { q: "Kann ich jederzeit kündigen?", a: "Absolut. Es gibt keine Verträge oder Mindestlaufzeiten. Du kannst dein Abonnement jederzeit in deinen Kontoeinstellungen kündigen." },
        { q: "Wofür ist der Einsatzrechner?", a: "Der Einsatzrechner verwendet das Kelly-Kriterium, um dir zu helfen, jeden Einsatz basierend auf deinem Bankroll und deinem Vorteil korrekt zu berechnen." },
        { q: "Was ist der Unterschied zwischen SharpTracker und einem Tipp-Service?", a: "Wir sagen dir nicht, auf wen du setzen sollst. Wir geben dir die Werkzeuge, um selbst Wert zu finden und darauf zu handeln — Live-Quotenbewegungsdaten, CLV-Tracking und Wettanalyse." },
      ],
    },
    betTracker: {
      heading: "Integrierter Wetttracker.",
      subtitle: "Logge deine Wetten mit einem Klick aus dem Feed. Wir bewerten sie automatisch zum Spielende und kartieren deine Leistung über Zeit.",
      date: "Datum",
      matchup: "Begegnung",
      selection: "Auswahl",
      odds: "Quote",
      clv: "CLV",
      result: "Ergebnis",
    },
    sharpData: {
      heading: "Angetrieben von scharfen Buchmacher-Daten.",
      desc: "Wir verfolgen nur die schärfsten Buchmacher — die wahren Market-Maker, wo professionelles Geld fließt. SharpTracker isoliert das Signal vom Rauschen. Wenn das scharfe Geld sich bewegt, siehst du es als Erster.",
    },
    multiSport: {
      heading: "Vollständige Marktabdeckung.",
      subtitle: "Verfolge Kursbewegungen in allen wichtigen Sportarten gleichzeitig. Unser Backend verarbeitet über 50.000 Quoten-Updates pro Minute.",
    },
    featureStrip: {
      heading: "Alles was du brauchst. Nichts was du nicht brauchst.",
      subtitle: "Sechs Werkzeuge für ernsthafte Wetter — jedes fokussiert, schnell und umsetzbar.",
      tiles: ["Live Quotendrops", "Wetttracker", "Buchmacher-Vergleich", "Einsatzrechner", "Tageskalender", "Bankroll-Management"],
    },
    bankroll: {
      badge: "Vorteil-Tracking-Suite",
      heading: "Folge deinem Vorteil. Sieh dein Bankroll wachsen.",
      subtitle: "Jede wichtige Zahl — für dich verfolgt. Keine Tabellenkalkulationen nötig.",
      seeItLive: "Live ansehen",
      cards: [
        { tag: "Gewinnrate", title: "Wie oft gewinnst du?", desc: "Von 100 abgeschlossenen Wetten, wie viele hast du gewonnen? SharpTracker zählt Gewinne und Verluste automatisch." },
        { tag: "Gewinn & Verlust", title: "Bist du insgesamt im Plus oder Minus?", desc: "Dein Gesamtgewinn oder -verlust in Einheiten. Grün bedeutet du liegst vorne, Rot bedeutet du liegst hinten." },
        { tag: "Return on Investment", title: "Wie viel verdienst du pro €100?", desc: "Für jeden €100 Einsatz zeigt dir das, wie viel Gewinn du zurückbekommen hast." },
        { tag: "Buchmacher-Vergleich", title: "Den besten Preis sofort finden.", desc: "Wenn eine scharfe Linie sich bewegt, reagiert nicht jeder Buchmacher gleich schnell. SharpTracker überprüft 32+ Buchmacher." },
        { tag: "Tageskalender", title: "Jeden Tag auf einen Blick sehen.", desc: "Grüne Tage haben Geld gemacht, rote Tage haben es verloren. Ein Blick und du weißt genau, wann deine Wetten liefen." },
        { tag: "Wettlog", title: "Jede Wette automatisch gespeichert.", desc: "Jede Wette wird mit Spiel, Wetttyp, Preis und Ergebnis gespeichert. Deine komplette Geschichte an einem Ort." },
        { tag: "Auto-Abrechnung", title: "Ergebnisse aktualisieren sich selbst.", desc: "Sobald ein Spiel endet, loggt SharpTracker das Ergebnis und aktualisiert deine Gesamtsumme." },
        { tag: "Wettstatus", title: "Wisse was fertig und was noch live ist.", desc: "Sieh auf einen Blick, wie viele Wetten ein Ergebnis haben, wie viele noch warten und wie viele storniert wurden." },
      ],
    },
  },

  fr: {
    nav: {
      features: "Fonctionnalités",
      why: "Pourquoi SharpTracker ?",
      pricing: "Tarifs",
      faq: "FAQ",
      signup: "Commencer",
      trialBadge: "14 jours gratuits",
      subscriptions: "Abonnements",
      allFeatures: "Toutes les fonctionnalités",
    },
    hero: {
      monitoring: (n) => `Surveillance de ${n} événements en direct`,
      connecting: "Connexion aux marchés en direct…",
      headline1: "Quand le marché bouge,",
      headline2: "tu bouges en premier.",
      subtitle: "Pariez toujours au bon prix. Nous surveillons le bookmaker le plus sharp du monde 24/7 et vous alertons dès que les cotes chutent.",
      stat1: "Gagnés chaque année par des parieurs privés qui suivent l'argent sharp",
      stat2: "Entre le moment où la cote bouge et celui où vous recevez l'alerte",
      stat3: "Chutes de cotes sharps suivies et enregistrées chaque jour",
      cta: "Accéder",
    },
    mobile: {
      badge: "Application mobile",
      comingSoon: "Application mobile — bientôt disponible",
      desc: "L'application mobile est en route. Vous pourrez recevoir des notifications push directement sur votre téléphone dès qu'une chute de cote se produit.",
    },
    alertSection: {
      neverMiss: "Ne ratez jamais",
      aDrop: "une chute.",
    },
    terminal: {
      heading: "Observez la matrice.",
      subheading: "Arrêtez de rafraîchir les sites de paris. Notre terminal ingère des milliers d'événements WebSocket par seconde, révélant instantanément les mouvements de prix significatifs.",
      eventStream: "Flux d'événements",
      seeTheSteam: "Voyez la vapeur.",
      seeTheSteamDesc: "Quand un syndicat frappe le marché, la cote bouge chez tous les bookmakers en millisecondes. SharpTracker visualise ces chutes instantanément, mettant en évidence les opportunités EV+ avant qu'elles disparaissent.",
      priceHistory: "Historique des prix",
      chartSentiment: "Cartographiez le sentiment.",
      chartSentimentDesc: "Chaque mouvement de cote est tracé tick par tick. Identifiez les niveaux de résistance sur les spreads et totaux, et comprenez la narrative du marché jusqu'au coup d'envoi.",
      latestDrops: "Dernières chutes sharps",
      live: "EN DIRECT",
      liveFeed: "Flux en direct",
      bkCompare: "Comp. Books",
      sports: "Sports",
    },
    features: {
      heading1: "Vos filtres.",
      heading2: "Vos règles.",
      subtitle: "Dites à SharpTracker exactement ce qui compte pour vous. Il surveille les marchés 24h/24 et vous alerte dès que quelque chose bouge.",
      steps: [
        { title: "Choisissez vos marchés", description: "Choisissez les sports et ligues que vous suivez. Seul ce que vous choisissez passe — rien d'autre." },
        { title: "Définissez votre chute minimale", description: "Choisissez la taille que doit avoir une baisse de prix avant de recevoir une alerte. Les petits mouvements sont ignorés. Vous n'entendez parler que de ceux qui comptent." },
        { title: "Nous surveillons 24/7", description: "SharpTracker suit chaque marché jour et nuit. La seconde où une cote chute, nous la capturons — peu importe quand cela se produit." },
        { title: "Vous l'apprenez en premier", description: "Vous recevez l'alerte avant tout le monde. Ce décalage est votre avantage." },
      ],
      items: [
        { name: "Alertes de chute de cotes", desc: "Notification push instantanée quand l'argent sharp bouge" },
        { name: "Tracker de paris", desc: "Enregistrez chaque pari et suivez chaque unité placée" },
        { name: "Comparaison de bookmakers", desc: "Comparez les cotes en direct chez 32+ bookmakers par alerte" },
        { name: "Calculateur de mise", desc: "Calculez les mises avec le critère de Kelly intégré" },
        { name: "Calendrier P&G quotidien", desc: "Calendrier visuel gains/pertes — repérez les tendances instantanément" },
        { name: "Couverture multi-sports", desc: "NFL, NBA, MLB, NHL, football, tennis et plus" },
        { name: "Croissance du bankroll", desc: "Captez la valeur avant tout le monde et regardez votre edge s'accumuler" },
      ],
    },
    marquee: {
      worksOn: "Fonctionne chez",
      allBooks: "tous les grands bookmakers →",
    },
    calc: {
      badge: "Outils",
      heading: "Calculateur de profit.",
      subtitle: "Voyez ce que SharpTracker pourrait faire pour votre bankroll selon votre utilisation prévue.",
      bankrollLabel: "Capital de départ",
      bankrollHint: "Nous recommandons de commencer avec au moins €500",
      usageLabel: "Utilisation hebdomadaire",
      usageHint: "Combien d'heures par semaine vous prévoyez d'utiliser SharpTracker",
      timeframeLabel: "Période",
      calculateBtn: "Calculer",
      estimatedProfit: "Profit estimé",
      roi: "ROI",
      disclaimer: "Les données peuvent ne pas refléter les résultats réels. À titre illustratif uniquement. Les performances passées ne garantissent pas les résultats futurs.",
      fillPrompt: "Remplissez vos informations et appuyez sur",
      calculatePrompt: "Calculer",
      usageOptions: [
        { value: "light",  label: "Léger (2–5 heures / semaine)" },
        { value: "medium", label: "Moyen (5–10 heures / semaine)" },
        { value: "heavy",  label: "Intensif (10–20 heures / semaine)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 semaines", weeks: 2  },
        { value: "1m", label: "1 mois",     weeks: 4  },
        { value: "3m", label: "3 mois",     weeks: 13 },
        { value: "6m", label: "6 mois",     weeks: 26 },
      ],
    },
    cta: {
      heading: "Arrêtez de jouer avec un handicap.",
      subtitle: "Rejoignez les parieurs les plus affûtés qui utilisent des données de marché en temps réel pour trouver de meilleurs prix avant que le marché ne ferme.",
      viewPlans: "Voir les offres",
      startTrial: "Commencer l'essai gratuit de 14 jours",
    },
    footer: {
      desc: "Terminal professionnel de suivi des cotes et de comparaison de bookmakers.",
      product: "Produit",
      legal: "Mentions légales",
      dashboard: "Tableau de bord",
      signUp: "S'inscrire",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
      allRights: "Tous droits réservés.",
      disclaimer1: "SharpTracker est un service de données et d'analyses. Ce site est strictement à des fins éducatives et informatives et n'implique pas de paris en argent réel.",
      disclaimer2: "Le jeu comporte des risques. Ne pariez que ce que vous pouvez vous permettre de perdre. Ce service est destiné aux adultes de 18 ans et plus. Si vous avez un problème de jeu, de l'aide est disponible.",
    },
    testimonials: {
      badge: "Vrais utilisateurs. Vrais résultats.",
      heading: "Écoutez ce que\ndisent les autres.",
      subtitle: "Des parieurs sharps de toute l'Europe et au-delà — tous utilisent SharpTracker pour capturer les mouvements avant que le marché s'ajuste.",
      profitLabel: "Profit",
    },
    faq: {
      badge: "FAQ",
      heading: "Questions courantes, réponses honnêtes.",
      subtitle: "Tout ce que vous devez savoir avant de commencer.",
      items: [
        { q: "Qu'est-ce que SharpTracker exactement ?", a: "SharpTracker surveille les mouvements de cotes chez les bookmakers sharps en temps réel. Dès qu'une cote bouge significativement, vous recevez une alerte — pour placer votre pari avant que les bookmakers plus doux ne rattrapent leur retard." },
        { q: "Quelle est la rapidité des alertes ?", a: "Les alertes sont envoyées en quelques secondes après la détection d'un mouvement. La vitesse est cruciale dans le dropping de cotes — même 30 secondes d'avance peuvent faire la différence entre obtenir le prix de valeur et le rater." },
        { q: "Quels sports couvrez-vous ?", a: "Nous couvrons le football, le basketball, le football américain, le tennis, le hockey sur glace et le baseball. D'autres sports sont ajoutés régulièrement selon la demande." },
        { q: "Dois-je être un parieur expert ?", a: "Non. L'application est conçue pour être claire et simple. Si vous comprenez ce que sont les cotes et souhaitez de meilleurs prix, vous pouvez utiliser SharpTracker immédiatement." },
        { q: "Qu'est-ce que la comparaison de bookmakers ?", a: "Quand un bookmaker sharp comme Pinnacle bouge ses cotes, les autres sont souvent en retard. SharpTracker vérifie 32+ bookmakers en temps réel et vous montre lesquels ont encore l'ancien prix." },
        { q: "D'où viennent les données ?", a: "Nous tirons les cotes de bookmakers sharps à hautes limites sur lesquels les parieurs professionnels s'appuient comme références de marché. Ce sont les livres qui bougent en premier." },
        { q: "Y a-t-il un essai gratuit ?", a: "Oui — chaque nouveau compte commence par un essai gratuit complet de 14 jours. Aucune carte bancaire requise. Accès complet à toutes les fonctionnalités dès le premier jour." },
        { q: "Puis-je annuler à tout moment ?", a: "Absolument. Il n'y a pas de contrat ni de période d'engagement. Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres de compte." },
        { q: "À quoi sert le calculateur de mise ?", a: "Le calculateur de mise utilise le critère de Kelly pour vous aider à déterminer la bonne taille de mise en fonction de votre bankroll et de votre edge." },
        { q: "Quelle est la différence avec un service de pronostiqueur ?", a: "Nous ne vous disons pas sur qui parier. Nous vous donnons les outils pour trouver et agir sur la valeur vous-même — données de mouvement de cotes en direct, suivi CLV et analyse des paris." },
      ],
    },
    betTracker: {
      heading: "Tracker de paris intégré.",
      subtitle: "Enregistrez vos paris en un clic depuis le flux. Nous les évaluons automatiquement à la fin du match et cartographions vos performances dans le temps.",
      date: "Date",
      matchup: "Match",
      selection: "Sélection",
      odds: "Cote",
      clv: "CLV",
      result: "Résultat",
    },
    sharpData: {
      heading: "Propulsé par les données de bookmakers sharps.",
      desc: "Nous ne suivons que les bookmakers les plus sharps — les vrais market makers où l'argent professionnel circule. SharpTracker isole le signal du bruit. Quand l'argent sharp bouge, vous le voyez en premier.",
    },
    multiSport: {
      heading: "Couverture totale du marché.",
      subtitle: "Suivez les mouvements de cotes dans tous les grands sports simultanément. Notre backend traite plus de 50 000 mises à jour de cotes par minute.",
    },
    featureStrip: {
      heading: "Tout ce dont vous avez besoin. Rien de superflu.",
      subtitle: "Six outils conçus pour les parieurs sérieux — chacun ciblé, rapide et actionnable.",
      tiles: ["Chutes de cotes en direct", "Tracker de paris", "Comparaison bookmakers", "Calculateur de mise", "Calendrier quotidien", "Gestion du bankroll"],
    },
    bankroll: {
      badge: "Suite de suivi d'edge",
      heading: "Suivez votre edge. Regardez votre bankroll croître.",
      subtitle: "Chaque chiffre qui compte — suivi pour vous. Pas de feuilles de calcul nécessaires.",
      seeItLive: "Voir en direct",
      cards: [
        { tag: "Taux de victoire", title: "À quelle fréquence gagnez-vous ?", desc: "Sur 100 paris terminés, combien avez-vous gagnés ? SharpTracker compte vos victoires et défaites automatiquement." },
        { tag: "Profits & Pertes", title: "Êtes-vous globalement en positif ?", desc: "Votre profit ou perte total en unités. Vert = vous êtes en avance, rouge = vous êtes en retard." },
        { tag: "Retour sur investissement", title: "Combien gagnez-vous pour 100 € ?", desc: "Pour chaque 100 € misés, cela vous indique combien de profit vous avez récupéré." },
        { tag: "Comparaison bookmakers", title: "Trouvez le meilleur prix instantanément.", desc: "Quand une cote sharp bouge, tous les bookmakers ne réagissent pas à la même vitesse. SharpTracker vérifie 32+ bookmakers." },
        { tag: "Calendrier quotidien", title: "Voyez chaque jour d'un coup d'œil.", desc: "Les jours verts ont rapporté de l'argent, les jours rouges en ont perdu. Un regard et vous savez exactement quand vos paris ont bien marché." },
        { tag: "Journal des paris", title: "Chaque pari sauvegardé automatiquement.", desc: "Chaque pari est sauvegardé avec le match, le type de pari, le prix et le résultat. Votre historique complet en un seul endroit." },
        { tag: "Règlement automatique", title: "Les résultats se mettent à jour automatiquement.", desc: "Dès qu'un match se termine, SharpTracker enregistre le résultat et met à jour votre total." },
        { tag: "Statut des paris", title: "Sachez ce qui est terminé et ce qui est en cours.", desc: "Voyez d'un coup d'œil combien de paris ont un résultat, combien attendent et combien ont été annulés." },
      ],
    },
  },

  es: {
    nav: {
      features: "Funciones",
      why: "¿Por qué SharpTracker?",
      pricing: "Precios",
      faq: "FAQ",
      signup: "Empezar",
      trialBadge: "14 días gratis",
      subscriptions: "Suscripciones",
      allFeatures: "Todas las funciones",
    },
    hero: {
      monitoring: (n) => `Monitoreando ${n} eventos en vivo ahora mismo`,
      connecting: "Conectando a mercados en vivo…",
      headline1: "Cuando el mercado se mueve,",
      headline2: "tú te mueves primero.",
      subtitle: "Apuesta siempre al precio correcto. Vigilamos el bookmaker más sharp del mundo 24/7 y te avisamos en el momento en que las cuotas caen.",
      stat1: "Ganados cada año por apostadores privados que siguen el dinero sharp",
      stat2: "Desde que la línea se mueve hasta que recibes la alerta",
      stat3: "Caídas de cuotas sharps rastreadas y registradas cada día",
      cta: "Obtener acceso",
    },
    mobile: {
      badge: "App móvil",
      comingSoon: "App móvil — próximamente",
      desc: "La app móvil está en camino. Podrás recibir notificaciones push directamente en tu teléfono en el momento en que caigan las cuotas.",
    },
    alertSection: {
      neverMiss: "No te pierdas nunca",
      aDrop: "una caída.",
    },
    terminal: {
      heading: "Observa la matriz.",
      subheading: "Deja de actualizar páginas de apuestas. Nuestro terminal ingiere miles de eventos WebSocket por segundo, revelando instantáneamente los movimientos de precios significativos.",
      eventStream: "Flujo de eventos",
      seeTheSteam: "Ve el vapor.",
      seeTheSteamDesc: "Cuando un sindicato golpea el mercado, la línea se mueve en todos los libros en milisegundos. SharpTracker visualiza estas caídas instantáneamente, destacando oportunidades EV+ antes de que desaparezcan.",
      priceHistory: "Historial de precios",
      chartSentiment: "Grafica el sentimiento.",
      chartSentimentDesc: "Cada movimiento de línea se grafica tick a tick. Identifica niveles de resistencia en spreads y totales, y comprende el arco narrativo del mercado hasta el inicio del juego.",
      latestDrops: "Últimas caídas sharps",
      live: "EN VIVO",
      liveFeed: "Feed en vivo",
      bkCompare: "Comp. Casas",
      sports: "Deportes",
    },
    features: {
      heading1: "Tus filtros.",
      heading2: "Tus reglas.",
      subtitle: "Dile a SharpTracker exactamente qué importa para ti. Vigila los mercados las 24 horas del día y te alerta en el momento en que algo se mueve.",
      steps: [
        { title: "Elige tus mercados", description: "Elige los deportes y ligas que sigues. Solo lo que eliges pasa — nada más." },
        { title: "Establece tu caída mínima", description: "Elige cuánto debe caer un precio antes de recibir una alerta. Los movimientos pequeños se ignoran. Solo escuchas sobre los que importan." },
        { title: "Vigilamos 24/7", description: "SharpTracker rastrea cada mercado todo el día y la noche. En el segundo que una línea cae, la capturamos — sin importar cuándo ocurra." },
        { title: "Tú lo sabes primero", description: "Recibes la alerta antes que nadie. Esa brecha de tiempo es tu ventaja." },
      ],
      items: [
        { name: "Alertas de caída de cuotas", desc: "Notificación push instantánea cuando el dinero sharp se mueve" },
        { name: "Rastreador de apuestas", desc: "Registra cada apuesta y sigue cada unidad que has apostado" },
        { name: "Comparación de casas de apuestas", desc: "Compara cuotas en vivo en 32+ casas por alerta" },
        { name: "Calculadora de apuesta", desc: "Calcula apuestas correctamente con el criterio de Kelly" },
        { name: "Calendario P&G diario", desc: "Calendario visual de ganancias/pérdidas — detecta patrones al instante" },
        { name: "Cobertura multi-deporte", desc: "NFL, NBA, MLB, NHL, fútbol, tenis y más" },
        { name: "Crecimiento del bankroll", desc: "Captura valor antes que nadie y ve tu ventaja acumularse" },
      ],
    },
    marquee: {
      worksOn: "Funciona con",
      allBooks: "todas las casas principales →",
    },
    calc: {
      badge: "Herramientas",
      heading: "Calculadora de ganancias.",
      subtitle: "Mira lo que SharpTracker podría hacer por tu bankroll según cómo planeas usarlo.",
      bankrollLabel: "Bankroll inicial",
      bankrollHint: "Recomendamos empezar con al menos €500",
      usageLabel: "Uso semanal",
      usageHint: "Cuántas horas a la semana planeas usar SharpTracker",
      timeframeLabel: "Período",
      calculateBtn: "Calcular",
      estimatedProfit: "Ganancia estimada",
      roi: "ROI",
      disclaimer: "Los datos pueden no reflejar resultados reales. Solo para fines ilustrativos. El rendimiento pasado no garantiza resultados futuros.",
      fillPrompt: "Completa tus datos y pulsa",
      calculatePrompt: "Calcular",
      usageOptions: [
        { value: "light",  label: "Ligero (2–5 horas / semana)" },
        { value: "medium", label: "Medio (5–10 horas / semana)" },
        { value: "heavy",  label: "Intensivo (10–20 horas / semana)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 semanas",  weeks: 2  },
        { value: "1m", label: "1 mes",      weeks: 4  },
        { value: "3m", label: "3 meses",    weeks: 13 },
        { value: "6m", label: "6 meses",    weeks: 26 },
      ],
    },
    cta: {
      heading: "Deja de jugar con desventaja.",
      subtitle: "Únete a los apostadores más agudos que aprovechan datos de mercado en tiempo real para encontrar mejores precios antes de que el mercado cierre.",
      viewPlans: "Ver planes",
      startTrial: "Empezar prueba gratuita de 14 días",
    },
    footer: {
      desc: "Terminal profesional de seguimiento de cuotas y comparación de casas de apuestas.",
      product: "Producto",
      legal: "Legal",
      dashboard: "Panel de control",
      signUp: "Registrarse",
      terms: "Términos de servicio",
      privacy: "Política de privacidad",
      allRights: "Todos los derechos reservados.",
      disclaimer1: "SharpTracker es un servicio de datos y análisis. Este sitio es estrictamente para fines educativos e informativos y no involucra apuestas con dinero real.",
      disclaimer2: "Las apuestas conllevan riesgo. Solo apuesta lo que puedes permitirte perder. Este servicio está destinado a adultos mayores de 18 años. Si tienes un problema con el juego, hay ayuda disponible.",
    },
    testimonials: {
      badge: "Usuarios reales. Resultados reales.",
      heading: "Escucha lo que\ndicen otros.",
      subtitle: "Apostadores agudos de toda Europa y más allá — todos usan SharpTracker para capturar movimientos antes de que el mercado se ajuste.",
      profitLabel: "Ganancia",
    },
    faq: {
      badge: "FAQ",
      heading: "Preguntas comunes, respuestas honestas.",
      subtitle: "Todo lo que necesitas saber antes de empezar.",
      items: [
        { q: "¿Qué es exactamente SharpTracker?", a: "SharpTracker monitorea los movimientos de cuotas en casas de apuestas sharps en tiempo real. En el momento en que una línea se mueve significativamente, recibes una alerta — para que puedas colocar tu apuesta antes de que las casas más suaves ajusten sus precios." },
        { q: "¿Qué tan rápidas son las alertas?", a: "Las alertas se entregan en segundos tras detectar un movimiento de línea. La velocidad lo es todo en el dropping de cuotas — incluso 30 segundos de ventaja pueden marcar la diferencia." },
        { q: "¿Qué deportes cubren?", a: "Cubrimos fútbol, baloncesto, fútbol americano, tenis, hockey sobre hielo y béisbol. Se agregan más deportes regularmente según la demanda." },
        { q: "¿Necesito ser un apostador experto?", a: "No. La app está diseñada para ser clara y simple. Si entiendes qué son las cuotas y quieres mejores precios en tus apuestas, puedes usar SharpTracker de inmediato." },
        { q: "¿Qué es la comparación de casas y cómo funciona?", a: "Cuando una casa sharp como Pinnacle mueve sus cuotas, otras casas suelen quedarse atrás. SharpTracker verifica 32+ casas en tiempo real y te muestra cuáles todavía tienen el precio viejo." },
        { q: "¿De dónde vienen los datos?", a: "Obtenemos cuotas de casas sharps de altos límites que los apostadores profesionales usan como referencias de mercado. Estas son las casas que se mueven primero." },
        { q: "¿Hay una prueba gratuita?", a: "Sí — cada nueva cuenta comienza con una prueba gratuita completa de 14 días. No se requiere tarjeta de crédito. Tienes acceso completo desde el primer día." },
        { q: "¿Puedo cancelar en cualquier momento?", a: "Absolutamente. No hay contratos ni períodos de permanencia. Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta." },
        { q: "¿Para qué sirve la calculadora de apuesta?", a: "La calculadora de apuesta usa el Criterio de Kelly para ayudarte a calcular el tamaño correcto de cada apuesta según tu bankroll y tu ventaja." },
        { q: "¿Cuál es la diferencia entre SharpTracker y un servicio de pronósticos?", a: "No te decimos en quién apostar. Te damos las herramientas para encontrar y actuar sobre el valor tú mismo — datos de movimiento de cuotas en vivo, seguimiento de CLV y análisis de apuestas." },
      ],
    },
    betTracker: {
      heading: "Rastreador de apuestas integrado.",
      subtitle: "Registra tus apuestas con un clic desde el feed. Las calificamos automáticamente al final del partido y trazamos tu rendimiento a lo largo del tiempo.",
      date: "Fecha",
      matchup: "Partido",
      selection: "Selección",
      odds: "Cuota",
      clv: "CLV",
      result: "Resultado",
    },
    sharpData: {
      heading: "Impulsado por datos de casas sharps.",
      desc: "Solo rastreamos las casas más sharps — los verdaderos creadores de mercado donde fluye el dinero profesional. SharpTracker aísla la señal del ruido. Cuando el dinero sharp se mueve, lo ves primero.",
    },
    multiSport: {
      heading: "Cobertura total del mercado.",
      subtitle: "Rastrea los movimientos de línea en todos los deportes principales simultáneamente. Nuestro backend procesa más de 50.000 actualizaciones de cuotas por minuto.",
    },
    featureStrip: {
      heading: "Todo lo que necesitas. Nada que no necesitas.",
      subtitle: "Seis herramientas construidas para apostadores serios — cada una enfocada, rápida y accionable.",
      tiles: ["Caídas de cuotas en vivo", "Rastreador de apuestas", "Comparación de casas", "Calculadora de apuesta", "Calendario diario", "Gestión del bankroll"],
    },
    bankroll: {
      badge: "Suite de seguimiento de ventaja",
      heading: "Sigue tu ventaja. Ve crecer tu bankroll.",
      subtitle: "Cada número que importa — rastreado para ti. Sin hojas de cálculo.",
      seeItLive: "Verlo en vivo",
      cards: [
        { tag: "Tasa de victorias", title: "¿Con qué frecuencia ganas?", desc: "De 100 apuestas terminadas, ¿cuántas ganaste? SharpTracker cuenta tus victorias y derrotas automáticamente." },
        { tag: "Ganancias y Pérdidas", title: "¿Estás en positivo o negativo en general?", desc: "Tu ganancia o pérdida total en unidades. Verde significa que estás adelante, rojo que estás atrás." },
        { tag: "Retorno de inversión", title: "¿Cuánto ganas por cada €100?", desc: "Por cada €100 apostados, esto te dice cuánto beneficio has obtenido." },
        { tag: "Comparación de casas", title: "Encuentra el mejor precio al instante.", desc: "Cuando una línea sharp se mueve, no todas las casas reaccionan a la misma velocidad. SharpTracker verifica 32+ casas." },
        { tag: "Calendario diario", title: "Ve cada día de un vistazo.", desc: "Los días verdes ganaron dinero, los días rojos lo perdieron. Una mirada y sabes exactamente cuándo tus apuestas marcharon bien." },
        { tag: "Registro de apuestas", title: "Cada apuesta guardada automáticamente.", desc: "Cada apuesta se guarda con el partido, el tipo de apuesta, el precio y el resultado. Tu historial completo en un solo lugar." },
        { tag: "Liquidación automática", title: "Los resultados se actualizan solos.", desc: "En el momento en que termina un partido, SharpTracker registra el resultado y actualiza tu total." },
        { tag: "Estado de apuestas", title: "Sabe qué está terminado y qué sigue en juego.", desc: "Ve de un vistazo cuántas apuestas tienen resultado, cuántas esperan y cuántas fueron canceladas." },
      ],
    },
  },

  it: {
    nav: {
      features: "Funzionalità",
      why: "Perché SharpTracker?",
      pricing: "Prezzi",
      faq: "FAQ",
      signup: "Inizia",
      trialBadge: "14 giorni gratis",
      subscriptions: "Abbonamenti",
      allFeatures: "Tutte le funzionalità",
    },
    hero: {
      monitoring: (n) => `Monitorando ${n} eventi live in questo momento`,
      connecting: "Connessione ai mercati live…",
      headline1: "Quando il mercato si muove,",
      headline2: "tu ti muovi per primo.",
      subtitle: "Scommetti sempre al prezzo giusto. Monitoriamo il bookmaker più sharp del mondo 24/7 e ti avvisiamo nel momento in cui le quote scendono.",
      stat1: "Guadagnati ogni anno da scommettitori privati che seguono i soldi sharp",
      stat2: "Dal momento in cui la quota si muove a quando ricevi l'avviso",
      stat3: "Cali di quote sharp tracciati e registrati ogni giorno",
      cta: "Ottieni accesso",
    },
    mobile: {
      badge: "App mobile",
      comingSoon: "App mobile — prossimamente",
      desc: "L'app mobile è in arrivo. Potrai ricevere notifiche push direttamente sul telefono nel momento in cui le quote scendono.",
    },
    alertSection: {
      neverMiss: "Non perdere mai",
      aDrop: "un calo.",
    },
    terminal: {
      heading: "Osserva la matrice.",
      subheading: "Smetti di aggiornare i siti di scommesse. Il nostro terminale elabora migliaia di eventi WebSocket al secondo, evidenziando istantaneamente i movimenti di prezzo significativi.",
      eventStream: "Flusso di eventi",
      seeTheSteam: "Vedi il vapore.",
      seeTheSteamDesc: "Quando un sindacato colpisce il mercato, la linea si muove su tutti i bookmaker in millisecondi. SharpTracker visualizza questi cali istantaneamente, evidenziando opportunità EV+ prima che scompaiano.",
      priceHistory: "Storico prezzi",
      chartSentiment: "Mappa il sentiment.",
      chartSentimentDesc: "Ogni movimento di quota viene tracciato tick per tick. Identifica i livelli di resistenza negli spread e nei totali e comprendi la narrativa del mercato fino all'inizio della partita.",
      latestDrops: "Ultimi cali sharp",
      live: "LIVE",
      liveFeed: "Feed in diretta",
      bkCompare: "Conf. Book",
      sports: "Sport",
    },
    features: {
      heading1: "I tuoi filtri.",
      heading2: "Le tue regole.",
      subtitle: "Dì a SharpTracker esattamente cosa conta per te. Monitora i mercati 24 ore su 24 e ti avvisa nel momento in cui qualcosa si muove.",
      steps: [
        { title: "Scegli i tuoi mercati", description: "Scegli gli sport e le leghe che segui. Solo quello che scegli passa — nient'altro." },
        { title: "Imposta il calo minimo", description: "Scegli quanto deve scendere un prezzo prima di ricevere un avviso. I piccoli movimenti vengono ignorati. Senti parlare solo di quelli che contano." },
        { title: "Monitoriamo 24/7", description: "SharpTracker traccia ogni mercato giorno e notte. Nel secondo in cui una quota scende, la catturiamo — indipendentemente da quando accade." },
        { title: "Tu lo sai per primo", description: "Ricevi l'avviso prima di tutti gli altri. Quel gap di tempo è il tuo vantaggio." },
      ],
      items: [
        { name: "Avvisi di calo quote", desc: "Notifica push istantanea quando il denaro sharp si muove" },
        { name: "Tracker scommesse", desc: "Registra ogni scommessa e traccia ogni unità mai piazzata" },
        { name: "Confronto bookmaker", desc: "Confronta quote live su 32+ bookmaker per avviso" },
        { name: "Calcolatore puntata", desc: "Calcola le puntate correttamente con il criterio di Kelly" },
        { name: "Calendario G/P quotidiano", desc: "Calendario visivo vincite/perdite — individua pattern istantaneamente" },
        { name: "Copertura multi-sport", desc: "NFL, NBA, MLB, NHL, calcio, tennis e altro" },
        { name: "Crescita del bankroll", desc: "Cogli il valore prima di tutti e guarda il tuo vantaggio accumularsi" },
      ],
    },
    marquee: {
      worksOn: "Funziona con",
      allBooks: "tutti i principali bookmaker →",
    },
    calc: {
      badge: "Strumenti",
      heading: "Calcolatore di profitto.",
      subtitle: "Scopri cosa potrebbe fare SharpTracker per il tuo bankroll in base a come prevedi di usarlo.",
      bankrollLabel: "Bankroll iniziale",
      bankrollHint: "Consigliamo di iniziare con almeno €500",
      usageLabel: "Utilizzo settimanale",
      usageHint: "Quante ore a settimana prevedi di usare SharpTracker",
      timeframeLabel: "Periodo",
      calculateBtn: "Calcola",
      estimatedProfit: "Profitto stimato",
      roi: "ROI",
      disclaimer: "I dati potrebbero non riflettere i risultati reali. Solo a scopo illustrativo. Le performance passate non garantiscono risultati futuri.",
      fillPrompt: "Compila i tuoi dati e premi",
      calculatePrompt: "Calcola",
      usageOptions: [
        { value: "light",  label: "Leggero (2–5 ore / settimana)" },
        { value: "medium", label: "Medio (5–10 ore / settimana)" },
        { value: "heavy",  label: "Intensivo (10–20 ore / settimana)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 settimane", weeks: 2  },
        { value: "1m", label: "1 mese",      weeks: 4  },
        { value: "3m", label: "3 mesi",      weeks: 13 },
        { value: "6m", label: "6 mesi",      weeks: 26 },
      ],
    },
    cta: {
      heading: "Smetti di giocare con un handicap.",
      subtitle: "Unisciti ai scommettitori più acuti che sfruttano dati di mercato in tempo reale per trovare prezzi migliori prima che il mercato chiuda.",
      viewPlans: "Vedi piani",
      startTrial: "Inizia la prova gratuita di 14 giorni",
    },
    footer: {
      desc: "Terminale professionale di monitoraggio quote e confronto bookmaker.",
      product: "Prodotto",
      legal: "Note legali",
      dashboard: "Dashboard",
      signUp: "Registrati",
      terms: "Termini di servizio",
      privacy: "Informativa sulla privacy",
      allRights: "Tutti i diritti riservati.",
      disclaimer1: "SharpTracker è un servizio di dati e analisi. Questo sito è strettamente a scopo educativo e informativo e non comporta scommesse con denaro reale.",
      disclaimer2: "Il gioco d'azzardo comporta rischi. Scommetti solo ciò che puoi permetterti di perdere. Questo servizio è destinato agli adulti di età superiore ai 18 anni. Se hai un problema con il gioco, è disponibile aiuto.",
    },
    testimonials: {
      badge: "Utenti reali. Risultati reali.",
      heading: "Ascolta cosa dicono\ngli altri.",
      subtitle: "Scommettitori sharp da tutta Europa e oltre — tutti usano SharpTracker per cogliere i movimenti prima che il mercato si aggiusti.",
      profitLabel: "Profitto",
    },
    faq: {
      badge: "FAQ",
      heading: "Domande comuni, risposte oneste.",
      subtitle: "Tutto quello che devi sapere prima di iniziare.",
      items: [
        { q: "Cos'è esattamente SharpTracker?", a: "SharpTracker monitora i movimenti di quota presso i bookmaker sharp in tempo reale. Nel momento in cui una linea si muove significativamente, ricevi un avviso — per piazzare la tua scommessa prima che i bookmaker più morbidi aggiustino i loro prezzi." },
        { q: "Quanto sono veloci gli avvisi?", a: "Gli avvisi vengono consegnati entro secondi dal rilevamento di un movimento di linea. La velocità è tutto nel dropping delle quote — anche 30 secondi di vantaggio possono fare la differenza." },
        { q: "Quali sport coprite?", a: "Copriamo calcio, basket, football americano, tennis, hockey su ghiaccio e baseball. Altri sport vengono aggiunti regolarmente in base alla domanda degli utenti." },
        { q: "Devo essere un esperto per usarlo?", a: "No. L'app è progettata per essere chiara e semplice. Se capisci cosa sono le quote e vuoi prezzi migliori sulle tue scommesse, puoi usare SharpTracker subito." },
        { q: "Cos'è il confronto bookmaker e come funziona?", a: "Quando un bookmaker sharp come Pinnacle muove le sue quote, gli altri sono spesso in ritardo. SharpTracker controlla 32+ bookmaker in tempo reale e ti mostra quali hanno ancora il vecchio prezzo." },
        { q: "Da dove provengono i dati?", a: "Prendiamo le quote da bookmaker sharp ad alti limiti su cui i scommettitori professionisti si affidano come riferimento di mercato. Questi sono i libri che si muovono per primi." },
        { q: "C'è una prova gratuita?", a: "Sì — ogni nuovo account inizia con una prova gratuita completa di 14 giorni. Nessuna carta di credito richiesta. Hai accesso completo a tutte le funzionalità dal primo giorno." },
        { q: "Posso cancellare in qualsiasi momento?", a: "Assolutamente. Non ci sono contratti o periodi vincolanti. Puoi cancellare il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account." },
        { q: "A cosa serve il calcolatore di puntata?", a: "Il calcolatore di puntata utilizza il Criterio di Kelly per aiutarti a determinare la dimensione corretta di ogni scommessa in base al tuo bankroll e al tuo vantaggio." },
        { q: "Qual è la differenza tra SharpTracker e un servizio di tipster?", a: "Non ti diciamo su chi scommettere. Ti diamo gli strumenti per trovare e agire sul valore da solo — dati di movimento quote live, tracking CLV e analisi delle scommesse." },
      ],
    },
    betTracker: {
      heading: "Tracker scommesse integrato.",
      subtitle: "Registra le tue scommesse con un clic dal feed. Le valutiamo automaticamente a fine partita e mappiamo le tue performance nel tempo.",
      date: "Data",
      matchup: "Partita",
      selection: "Selezione",
      odds: "Quota",
      clv: "CLV",
      result: "Risultato",
    },
    sharpData: {
      heading: "Alimentato da dati di bookmaker sharp.",
      desc: "Tracciamo solo i bookmaker più sharp — i veri market maker dove scorrono i soldi professionali. SharpTracker isola il segnale dal rumore. Quando il denaro sharp si muove, lo vedi per primo.",
    },
    multiSport: {
      heading: "Copertura totale del mercato.",
      subtitle: "Traccia i movimenti di linea in tutti i principali sport contemporaneamente. Il nostro backend elabora oltre 50.000 aggiornamenti di quote al minuto.",
    },
    featureStrip: {
      heading: "Tutto quello che serve. Niente di superfluo.",
      subtitle: "Sei strumenti costruiti per scommettitori seri — ognuno mirato, veloce e utilizzabile.",
      tiles: ["Cali quote live", "Tracker scommesse", "Confronto bookmaker", "Calcolatore puntata", "Calendario quotidiano", "Gestione bankroll"],
    },
    bankroll: {
      badge: "Suite di tracking del vantaggio",
      heading: "Segui il tuo vantaggio. Guarda crescere il tuo bankroll.",
      subtitle: "Ogni numero che conta — tracciato per te. Nessun foglio di calcolo necessario.",
      seeItLive: "Vedi dal vivo",
      cards: [
        { tag: "Tasso di vincita", title: "Con quale frequenza vinci?", desc: "Su 100 scommesse concluse, quante hai vinto? SharpTracker conta le tue vincite e perdite automaticamente." },
        { tag: "Profitti e Perdite", title: "Sei in positivo o negativo in totale?", desc: "Il tuo profitto o perdita totale in unità. Verde significa che sei avanti, rosso che sei indietro." },
        { tag: "Ritorno sull'investimento", title: "Quanto guadagni per €100?", desc: "Per ogni €100 puntati, questo ti dice quanto profitto hai ottenuto in cambio." },
        { tag: "Confronto bookmaker", title: "Trova il miglior prezzo istantaneamente.", desc: "Quando una linea sharp si muove, non tutti i bookmaker reagiscono alla stessa velocità. SharpTracker controlla 32+ bookmaker." },
        { tag: "Calendario quotidiano", title: "Vedi ogni giorno in un colpo d'occhio.", desc: "I giorni verdi hanno guadagnato denaro, i giorni rossi lo hanno perso. Un'occhiata e sai esattamente quando le tue scommesse hanno reso." },
        { tag: "Registro scommesse", title: "Ogni scommessa salvata automaticamente.", desc: "Ogni scommessa viene salvata con la partita, il tipo di scommessa, il prezzo e il risultato. La tua storia completa in un unico posto." },
        { tag: "Liquidazione automatica", title: "I risultati si aggiornano da soli.", desc: "Nel momento in cui una partita finisce, SharpTracker registra il risultato e aggiorna il tuo totale." },
        { tag: "Stato scommesse", title: "Sai cosa è finito e cosa è ancora in gioco.", desc: "Vedi in un colpo d'occhio quante scommesse hanno un risultato, quante aspettano e quante sono state cancellate." },
      ],
    },
  },

  ja: {
    nav: {
      features: "機能",
      why: "なぜSharpTracker？",
      pricing: "料金",
      faq: "よくある質問",
      signup: "始める",
      trialBadge: "14日間無料",
      subscriptions: "サブスクリプション",
      allFeatures: "全機能",
    },
    hero: {
      monitoring: (n) => `現在${n}件のライブイベントを監視中`,
      connecting: "ライブ市場に接続中…",
      headline1: "市場が動くとき、",
      headline2: "あなたが先に動く。",
      subtitle: "常に正しい価格でベットする。世界最鋭のブックメーカーを24時間365日監視し、オッズが下がった瞬間にアラートを送ります。",
      stat1: "シャープマネーを追う個人ベッターが毎年稼ぐ金額",
      stat2: "ラインが動いてからアラートを受け取るまでの時間",
      stat3: "毎日追跡・記録されるシャープなオッズ変動数",
      cta: "アクセスする",
    },
    mobile: {
      badge: "モバイルアプリ",
      comingSoon: "モバイルアプリ — 近日公開",
      desc: "モバイルアプリは開発中です。オッズドロップが発生した瞬間に、スマートフォンにプッシュ通知が届くようになります。",
    },
    alertSection: {
      neverMiss: "ドロップを",
      aDrop: "見逃さない。",
    },
    terminal: {
      heading: "マトリックスを観察する。",
      subheading: "スポーツブックのページを更新するのをやめましょう。当社のターミナルは毎秒数千のWebSocketイベントを処理し、意味のある価格変動を瞬時に表示します。",
      eventStream: "イベントストリーム",
      seeTheSteam: "スチームを見る。",
      seeTheSteamDesc: "シンジケートが市場に参入すると、ラインはミリ秒単位で全ブックメーカーに広がります。SharpTrackerはこれらのドロップを瞬時に可視化し、消える前にEV+のチャンスを強調します。",
      priceHistory: "価格履歴",
      chartSentiment: "センチメントをチャートする。",
      chartSentimentDesc: "すべてのライン変動はティックごとに記録されます。スプレッドとトータルの抵抗レベルを特定し、試合開始までの市場の動きを理解します。",
      latestDrops: "最新のシャープドロップ",
      live: "ライブ",
      liveFeed: "ライブフィード",
      bkCompare: "Bk. 比較",
      sports: "スポーツ",
    },
    features: {
      heading1: "あなたのフィルター。",
      heading2: "あなたのルール。",
      subtitle: "あなたにとって重要なことをSharpTrackerに伝えてください。24時間市場を監視し、何かが動いた瞬間にアラートを送ります。",
      steps: [
        { title: "マーケットを選ぶ", description: "フォローするスポーツとリーグを選んでください。あなたが選んだものだけが通過します — それ以外は何もありません。" },
        { title: "最小ドロップを設定", description: "アラートを受け取るために必要な価格下落の大きさを選んでください。小さな動きは無視されます。重要なものだけ通知されます。" },
        { title: "24/7監視します", description: "SharpTrackerは昼夜を問わず全市場を追跡します。ラインが下落した瞬間、いつ起きても必ず捉えます。" },
        { title: "あなたが最初に知る", description: "アラートは誰よりも先にあなたに届きます。その時間差があなたの優位性です。" },
      ],
      items: [
        { name: "オッズドロップアラート", desc: "シャープマネーが動いた瞬間に即座にプッシュ通知" },
        { name: "ベットトラッカー", desc: "すべてのベットを記録し、すべてのユニットを追跡" },
        { name: "ブックメーカー比較", desc: "アラートごとに32以上のブックメーカーのライブオッズを比較" },
        { name: "ステーク計算機", desc: "ケリー基準で正確なベット額を計算" },
        { name: "日次損益カレンダー", desc: "視覚的な勝敗カレンダー — パターンを即座に把握" },
        { name: "マルチスポーツカバレッジ", desc: "NFL、NBA、MLB、NHL、サッカー、テニスなど" },
        { name: "バンクロール成長", desc: "誰よりも早く価値を捉え、エッジが複利で増える" },
      ],
    },
    marquee: {
      worksOn: "対応済み：",
      allBooks: "全主要ブックメーカー →",
    },
    calc: {
      badge: "ツール",
      heading: "収益計算機。",
      subtitle: "使用計画に基づいてSharpTrackerがバンクロールにどう影響するか確認しましょう。",
      bankrollLabel: "初期バンクロール",
      bankrollHint: "少なくとも€500から始めることをお勧めします",
      usageLabel: "週次使用量",
      usageHint: "SharpTrackerを週に何時間使用する予定か",
      timeframeLabel: "期間",
      calculateBtn: "計算する",
      estimatedProfit: "推定利益",
      roi: "ROI",
      disclaimer: "データは実際の結果を反映していない場合があります。あくまで参考目的です。過去の実績は将来の結果を保証しません。",
      fillPrompt: "詳細を入力して押してください",
      calculatePrompt: "計算する",
      usageOptions: [
        { value: "light",  label: "ライト（週2〜5時間）" },
        { value: "medium", label: "ミディアム（週5〜10時間）" },
        { value: "heavy",  label: "ヘビー（週10〜20時間）" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2週間",  weeks: 2  },
        { value: "1m", label: "1ヶ月",  weeks: 4  },
        { value: "3m", label: "3ヶ月",  weeks: 13 },
        { value: "6m", label: "6ヶ月",  weeks: 26 },
      ],
    },
    cta: {
      heading: "ハンディキャップ付きでプレーするのをやめましょう。",
      subtitle: "市場が閉じる前にリアルタイムのシャープ市場データを活用してより良い価格を見つける、最も鋭いベッターに加わりましょう。",
      viewPlans: "プランを見る",
      startTrial: "14日間無料トライアルを開始",
    },
    footer: {
      desc: "プロフェッショナルなオッズ追跡とブックメーカー比較ターミナル。",
      product: "製品",
      legal: "法的情報",
      dashboard: "ダッシュボード",
      signUp: "サインアップ",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      allRights: "無断転載禁止。",
      disclaimer1: "SharpTrackerはデータ・分析サービスです。このサイトは教育および情報提供のみを目的とし、実際の賭け事や賭け行為の促進は含まれません。",
      disclaimer2: "ギャンブルにはリスクが伴います。失っても許容できる範囲でのみ賭けてください。このサービスは18歳以上の成人を対象としています。ギャンブル依存症の問題がある場合は、支援機関にご連絡ください。",
    },
    testimonials: {
      badge: "リアルユーザー。リアルな結果。",
      heading: "他のユーザーの\n声を聞く。",
      subtitle: "ヨーロッパ各地やそれ以外の地域のシャープなベッター — 全員がSharpTrackerを使って市場が調整する前に動きを捉えています。",
      profitLabel: "利益",
    },
    faq: {
      badge: "よくある質問",
      heading: "よくある質問、正直な答え。",
      subtitle: "始める前に知っておくべきすべてのことがここにあります。",
      items: [
        { q: "SharpTrackerとは何ですか？", a: "SharpTrackerはシャープなブックメーカーでのオッズ変動をリアルタイムで監視します。ラインが大きく動いた瞬間にアラートが届くので、ソフトなブックメーカーや取引所が価格を調整する前にベットを置くことができます。" },
        { q: "アラートの速度はどれくらいですか？", a: "ラインの変動が検出されてから数秒以内にアラートが届きます。オッズドロッピングでは速度がすべてです — 30秒のリードがバリュー価格を得るか逃すかの差を生むこともあります。" },
        { q: "どのスポーツをカバーしていますか？", a: "サッカー、バスケットボール、アメリカンフットボール、テニス、アイスホッケー、野球をカバーしています。ユーザーの需要に基づいて定期的に追加されます。" },
        { q: "専門家でなくても使えますか？", a: "はい。アプリはシンプルで明確に設計されています。オッズが何かを理解し、より良い価格でベットしたいなら、すぐにSharpTrackerを使えます。" },
        { q: "ブックメーカー比較とは何ですか？", a: "Pinnacleのようなシャープなブックメーカーがオッズを動かすと、他のブックメーカーは遅れることが多いです。SharpTrackerはリアルタイムで32以上のブックメーカーを確認し、古い価格を持っているところを表示します。" },
        { q: "データはどこから来ますか？", a: "プロのベッターが市場の基準として信頼するシャープで高リミットのブックメーカーからオッズを取得しています。これらは最初に動くブックメーカーです。" },
        { q: "無料トライアルはありますか？", a: "はい — 新規アカウントはすべて14日間の完全無料トライアルから始まります。クレジットカード不要。初日からすべての機能にアクセスできます。" },
        { q: "いつでもキャンセルできますか？", a: "もちろんです。契約や拘束期間はありません。アカウント設定からいつでもサブスクリプションをキャンセルできます。" },
        { q: "ステーク計算機は何のためですか？", a: "ステーク計算機はケリー基準を使って、バンクロールとエッジに基づいて各ベットの正確なサイズを決定するのに役立ちます。" },
        { q: "SharpTrackerとチップスターサービスの違いは？", a: "誰に賭けるかは教えません。ライブのオッズ変動データ、CLVトラッキング、ベット分析など、自分で価値を見つけ行動するためのツールを提供します。すべての決断はあなたが下します。" },
      ],
    },
    betTracker: {
      heading: "統合ベットトラッカー。",
      subtitle: "フィードからワンクリックでベットを記録できます。試合終了時に自動的に採点し、パフォーマンスを時系列でマッピングします。",
      date: "日付",
      matchup: "対戦",
      selection: "選択",
      odds: "オッズ",
      clv: "CLV",
      result: "結果",
    },
    sharpData: {
      heading: "シャープブックメーカーデータで駆動。",
      desc: "プロのマネーが流れる真のマーケットメーカーである最もシャープなブックメーカーのみを追跡します。SharpTrackerはノイズからシグナルを分離します。シャープマネーが動けば、あなたが最初に見ます。",
    },
    multiSport: {
      heading: "完全な市場カバレッジ。",
      subtitle: "すべての主要スポーツのライン変動を同時に追跡します。バックエンドは全市場で毎分50,000件以上のオッズ更新を処理します。",
    },
    featureStrip: {
      heading: "必要なものすべて。不要なものは何もない。",
      subtitle: "本格的なベッターのために構築された6つのツール — それぞれが焦点を絞り、高速で、実用的です。",
      tiles: ["ライブオッズドロップ", "ベットトラッカー", "ブックメーカー比較", "ステーク計算機", "日次カレンダー", "バンクロール管理"],
    },
    bankroll: {
      badge: "エッジトラッキングスイート",
      heading: "エッジを追う。バンクロールを成長させる。",
      subtitle: "重要なすべての数字 — あなたのために追跡されます。スプレッドシートは不要です。",
      seeItLive: "ライブで見る",
      cards: [
        { tag: "勝率", title: "どれくらいの頻度で勝ちますか？", desc: "100件の決済済みベットのうち何件勝ちましたか？SharpTrackerが自動的に勝敗を集計します。" },
        { tag: "損益", title: "全体的にプラスですか、マイナスですか？", desc: "ユニット単位での総利益または損失。緑は前進、赤は後退 — 各結果が入る瞬間に更新されます。" },
        { tag: "投資収益率", title: "€100ごとにいくら稼ぎますか？", desc: "€100賭けるごとに、どれくらいの利益を得たかを示します。正の数字は長期的に利益が出ていることを意味します。" },
        { tag: "ブックメーカー比較", title: "最良の価格を即座に見つける。", desc: "シャープなラインが動くと、すべてのブックメーカーが同じ速度で反応するわけではありません。SharpTrackerは32以上のブックメーカーを確認します。" },
        { tag: "日次カレンダー", title: "毎日を一目で確認。", desc: "緑の日は利益、赤の日は損失。一目でベットがうまくいった時期がわかります。" },
        { tag: "ベットログ", title: "すべてのベットが自動保存。", desc: "各ベットは試合、ベットタイプ、価格、結果と共に保存されます。完全な履歴が一か所に。" },
        { tag: "自動決済", title: "結果が自動更新される。", desc: "試合終了の瞬間、SharpTrackerが結果を記録して合計を更新します。手動入力は一切不要です。" },
        { tag: "ベットステータス", title: "何が終わったか、何がまだ続いているか把握。", desc: "結果が出たベット、まだ待っているベット、キャンセルされたベットの数を一目で確認できます。" },
      ],
    },
  },

  pl: {
    nav: {
      features: "Funkcje",
      why: "Dlaczego SharpTracker?",
      pricing: "Cennik",
      faq: "FAQ",
      signup: "Zacznij",
      trialBadge: "14 dni za darmo",
      subscriptions: "Subskrypcje",
      allFeatures: "Wszystkie funkcje",
    },
    hero: {
      monitoring: (n) => `Monitorowanie ${n} wydarzeń na żywo`,
      connecting: "Łączenie z rynkami na żywo…",
      headline1: "Kiedy rynek się porusza,",
      headline2: "ty poruszasz się pierwszy.",
      subtitle: "Zawsze obstawiaj po właściwej cenie. Monitorujemy najostrzejszego bukmachera na świecie 24/7 i powiadamiamy cię w chwili, gdy kursy spadną.",
      stat1: "Zarabiane każdego roku przez prywatnych graczy śledzących ostre pieniądze",
      stat2: "Od ruchu linii do momentu otrzymania powiadomienia",
      stat3: "Ostre spadki kursów śledzone i rejestrowane każdego dnia",
      cta: "Uzyskaj dostęp",
    },
    mobile: {
      badge: "Aplikacja mobilna",
      comingSoon: "Aplikacja mobilna — wkrótce",
      desc: "Aplikacja mobilna jest w drodze. Będziesz mógł otrzymywać powiadomienia push bezpośrednio na telefon w momencie pojawienia się odds-drop.",
    },
    alertSection: {
      neverMiss: "Nigdy nie przegap",
      aDrop: "spadku.",
    },
    terminal: {
      heading: "Obserwuj macierz.",
      subheading: "Przestań odświeżać strony bukmacherów. Nasz terminal przetwarza tysiące zdarzeń WebSocket na sekundę, natychmiast ujawniając istotne ruchy cenowe.",
      eventStream: "Strumień zdarzeń",
      seeTheSteam: "Zobacz parę.",
      seeTheSteamDesc: "Gdy syndykat wchodzi na rynek, linia przesuwa się u wszystkich bukmacherów w milisekundach. SharpTracker wizualizuje te spadki natychmiast, wyróżniając okazje EV+ zanim znikną.",
      priceHistory: "Historia cen",
      chartSentiment: "Wykres sentymentu.",
      chartSentimentDesc: "Każdy ruch linii jest wykreślany tik po tiku. Identyfikuj poziomy wsparcia w spreadach i sumach i rozumiej narrację rynku przed początkiem meczu.",
      latestDrops: "Najnowsze ostre spadki",
      live: "NA ŻYWO",
      liveFeed: "Feed na żywo",
      bkCompare: "Porów. Buk.",
      sports: "Sporty",
    },
    features: {
      heading1: "Twoje filtry.",
      heading2: "Twoje zasady.",
      subtitle: "Powiedz SharpTrackerowi dokładnie, co ma znaczenie dla ciebie. Obserwuje rynki całą dobę i ostrzega cię natychmiast, gdy coś się poruszy.",
      steps: [
        { title: "Wybierz swoje rynki", description: "Wybierz sporty i ligi, które śledzisz. Tylko to, co wybierzesz, przechodzi — nic innego." },
        { title: "Ustaw minimalny spadek", description: "Wybierz, jak duży musi być spadek ceny, zanim otrzymasz powiadomienie. Małe ruchy są ignorowane. Słyszysz tylko o tych, które mają znaczenie." },
        { title: "Monitorujemy 24/7", description: "SharpTracker śledzi każdy rynek przez cały dzień i noc. W chwili, gdy linia spada, łapiemy ją — bez względu na to, kiedy to się zdarzy." },
        { title: "Dowiadujesz się jako pierwszy", description: "Otrzymujesz powiadomienie przed wszystkimi innymi. Ta różnica czasowa to twoja przewaga." },
      ],
      items: [
        { name: "Alerty spadku kursów", desc: "Natychmiastowe powiadomienie push gdy ostre pieniądze się poruszają" },
        { name: "Tracker zakładów", desc: "Rejestruj każdy zakład i śledź każdą jednostkę" },
        { name: "Porównanie bukmacherów", desc: "Porównuj kursy na żywo u 32+ bukmacherów na alert" },
        { name: "Kalkulator stawki", desc: "Obliczaj stawki z wbudowanym kryterium Kelly'ego" },
        { name: "Dzienny kalendarz Z/P", desc: "Wizualny kalendarz wygranych/przegranych — znajdź wzorce natychmiast" },
        { name: "Pokrycie wielu sportów", desc: "NFL, NBA, MLB, NHL, piłka nożna, tenis i więcej" },
        { name: "Wzrost bankrolla", desc: "Łap wartość przed wszystkimi innymi i patrz jak twoja przewaga rośnie" },
      ],
    },
    marquee: {
      worksOn: "Działa u",
      allBooks: "wszystkich głównych bukmacherów →",
    },
    calc: {
      badge: "Narzędzia",
      heading: "Kalkulator zysku.",
      subtitle: "Zobacz, co SharpTracker mógłby zrobić dla twojego bankrolla w oparciu o to, jak planujesz go używać.",
      bankrollLabel: "Początkowy bankroll",
      bankrollHint: "Zalecamy zacząć od co najmniej €500",
      usageLabel: "Tygodniowe użycie",
      usageHint: "Ile godzin tygodniowo planujesz używać SharpTracker",
      timeframeLabel: "Okres",
      calculateBtn: "Oblicz",
      estimatedProfit: "Szacowany zysk",
      roi: "ROI",
      disclaimer: "Dane mogą nie odzwierciedlać rzeczywistych wyników. Tylko do celów ilustracyjnych. Wyniki historyczne nie gwarantują przyszłych wyników.",
      fillPrompt: "Wypełnij swoje dane i naciśnij",
      calculatePrompt: "Oblicz",
      usageOptions: [
        { value: "light",  label: "Lekkie (2–5 godzin / tydzień)" },
        { value: "medium", label: "Średnie (5–10 godzin / tydzień)" },
        { value: "heavy",  label: "Intensywne (10–20 godzin / tydzień)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 tygodnie",  weeks: 2  },
        { value: "1m", label: "1 miesiąc",   weeks: 4  },
        { value: "3m", label: "3 miesiące",  weeks: 13 },
        { value: "6m", label: "6 miesięcy",  weeks: 26 },
      ],
    },
    cta: {
      heading: "Przestań grać z handicapem.",
      subtitle: "Dołącz do najostrzejszych graczy, którzy wykorzystują dane rynkowe w czasie rzeczywistym do znalezienia lepszych cen zanim rynek się zamknie.",
      viewPlans: "Zobacz plany",
      startTrial: "Zacznij 14-dniowy darmowy okres próbny",
    },
    footer: {
      desc: "Profesjonalny terminal do śledzenia kursów i porównywania bukmacherów.",
      product: "Produkt",
      legal: "Prawne",
      dashboard: "Panel",
      signUp: "Zarejestruj się",
      terms: "Warunki usługi",
      privacy: "Polityka prywatności",
      allRights: "Wszelkie prawa zastrzeżone.",
      disclaimer1: "SharpTracker to usługa danych i analiz. Ta strona służy wyłącznie celom edukacyjnym i informacyjnym i nie obejmuje zakładów o prawdziwe pieniądze.",
      disclaimer2: "Hazard wiąże się z ryzykiem. Obstawiaj tylko tyle, ile możesz sobie pozwolić stracić. Usługa jest przeznaczona dla dorosłych powyżej 18 roku życia. Jeśli masz problem z hazardem, dostępna jest pomoc.",
    },
    testimonials: {
      badge: "Prawdziwi użytkownicy. Prawdziwe wyniki.",
      heading: "Posłuchaj co mówią\ninni.",
      subtitle: "Ostrzy gracze z całej Europy i nie tylko — wszyscy używają SharpTracker do łapania ruchów zanim rynek się dostosuję.",
      profitLabel: "Zysk",
    },
    faq: {
      badge: "FAQ",
      heading: "Częste pytania, uczciwe odpowiedzi.",
      subtitle: "Wszystko, co musisz wiedzieć przed rozpoczęciem.",
      items: [
        { q: "Czym dokładnie jest SharpTracker?", a: "SharpTracker monitoruje ruchy kursów u ostrych bukmacherów w czasie rzeczywistym. W chwili, gdy linia przesuwa się znacząco, otrzymujesz alert — żebyś mógł złożyć zakład przed tym, jak mięksi bukmacherzy i giełdy dostosują swoje ceny." },
        { q: "Jak szybkie są alerty?", a: "Alerty są dostarczane w ciągu sekund od wykrycia ruchu linii. Szybkość jest wszystkim przy odds-dropping — nawet 30-sekundowa przewaga może oznaczać różnicę między uzyskaniem ceny z wartością a jej przeoczeniem." },
        { q: "Jakie sporty pokrywacie?", a: "Pokrywamy piłkę nożną, koszykówkę, futbol amerykański, tenis, hokej na lodzie i baseball. Kolejne sporty są dodawane regularnie w oparciu o popyt użytkowników." },
        { q: "Czy muszę być ekspertem, żeby to używać?", a: "Nie. Aplikacja jest zaprojektowana tak, aby była jasna i prosta. Jeśli rozumiesz, czym są kursy i chcesz uzyskać lepsze ceny, możesz używać SharpTracker od razu." },
        { q: "Czym jest porównanie bukmacherów i jak działa?", a: "Kiedy ostry bukmacher jak Pinnacle porusza swoje kursy, inni bukmacherzy często zostają w tyle. SharpTracker sprawdza 32+ bukmacherów w czasie rzeczywistym i pokazuje ci, którzy mają jeszcze starą cenę." },
        { q: "Skąd pochodzą dane?", a: "Pobieramy kursy od ostrych bukmacherów z wysokimi limitami, na których zawodowi gracze polegają jako na wzorcach rynkowych. To są bukmacherzy, którzy poruszają się pierwsi." },
        { q: "Czy jest bezpłatny okres próbny?", a: "Tak — każde nowe konto zaczyna się od pełnego 14-dniowego okresu próbnego. Karta kredytowa nie jest wymagana. Masz pełny dostęp do wszystkich funkcji od pierwszego dnia." },
        { q: "Czy mogę anulować w dowolnym momencie?", a: "Absolutnie. Nie ma żadnych umów ani okresów wiązania. Możesz anulować subskrypcję w dowolnym momencie z ustawień konta." },
        { q: "Do czego służy kalkulator stawki?", a: "Kalkulator stawki wykorzystuje Kryterium Kelly'ego, aby pomóc ci określić właściwy rozmiar każdego zakładu w oparciu o twój bankroll i posiadaną przewagę." },
        { q: "Jaka jest różnica między SharpTracker a serwisem z typami?", a: "Nie mówimy ci, na kogo obstawiać. Dajemy ci narzędzia do samodzielnego znajdowania i działania na wartości — dane o ruchach kursów na żywo, śledzenie CLV i analiza zakładów." },
      ],
    },
    betTracker: {
      heading: "Zintegrowany tracker zakładów.",
      subtitle: "Rejestruj zakłady jednym kliknięciem z feedu. Automatycznie oceniamy je po zakończeniu meczu i mapujemy twoje wyniki w czasie.",
      date: "Data",
      matchup: "Mecz",
      selection: "Wybór",
      odds: "Kurs",
      clv: "CLV",
      result: "Wynik",
    },
    sharpData: {
      heading: "Zasilany danymi ostrych bukmacherów.",
      desc: "Śledzimy tylko najostrzejszych bukmacherów — prawdziwych animatorów rynku, gdzie płyną profesjonalne pieniądze. SharpTracker oddziela sygnał od szumu. Gdy ostre pieniądze się poruszają, widzisz to jako pierwszy.",
    },
    multiSport: {
      heading: "Całkowite pokrycie rynku.",
      subtitle: "Śledź ruchy linii we wszystkich głównych sportach jednocześnie. Nasz backend przetwarza ponad 50 000 aktualizacji kursów na minutę.",
    },
    featureStrip: {
      heading: "Wszystko, czego potrzebujesz. Nic, czego nie potrzebujesz.",
      subtitle: "Sześć narzędzi zbudowanych dla poważnych graczy — każde skoncentrowane, szybkie i możliwe do wdrożenia.",
      tiles: ["Spadki kursów na żywo", "Tracker zakładów", "Porównanie bukmacherów", "Kalkulator stawki", "Dzienny kalendarz", "Zarządzanie bankrollem"],
    },
    bankroll: {
      badge: "Pakiet śledzenia przewagi",
      heading: "Śledź swoją przewagę. Patrz jak rośnie twój bankroll.",
      subtitle: "Każda ważna liczba — śledzona dla ciebie. Żadnych arkuszy kalkulacyjnych.",
      seeItLive: "Zobacz na żywo",
      cards: [
        { tag: "Wskaźnik wygranych", title: "Jak często wygrywasz?", desc: "Z 100 rozliczonych zakładów, ile wygrałeś? SharpTracker liczy wygrane i przegrane automatycznie." },
        { tag: "Zysk i strata", title: "Czy jesteś ogółem na plusie?", desc: "Twój łączny zysk lub strata w jednostkach. Zielony oznacza, że jesteś z przodu, czerwony — że z tyłu." },
        { tag: "Zwrot z inwestycji", title: "Ile zarabiasz na każde €100?", desc: "Na każde €100 postawionych, to mówi ci, ile zysku otrzymałeś z powrotem." },
        { tag: "Porównanie bukmacherów", title: "Znajdź najlepszą cenę natychmiast.", desc: "Gdy ostra linia się porusza, nie każdy bukmacher reaguje w tym samym tempie. SharpTracker sprawdza 32+ bukmacherów." },
        { tag: "Dzienny kalendarz", title: "Zobacz każdy dzień na pierwszy rzut oka.", desc: "Zielone dni zarabiały pieniądze, czerwone traciły. Jedno spojrzenie i wiesz dokładnie, kiedy twoje zakłady szły dobrze." },
        { tag: "Dziennik zakładów", title: "Każdy zakład zapisany automatycznie.", desc: "Każdy zakład jest zapisywany z meczem, typem zakładu, ceną i wynikiem. Twoja kompletna historia w jednym miejscu." },
        { tag: "Automatyczne rozliczanie", title: "Wyniki aktualizują się same.", desc: "W chwili zakończenia meczu SharpTracker rejestruje wynik i aktualizuje twój łączny wynik." },
        { tag: "Status zakładów", title: "Wiedz co skończone, a co trwa.", desc: "Jednym rzutem oka sprawdź, ile zakładów ma wynik, ile czeka i ile zostało anulowanych." },
      ],
    },
  },

  pt: {
    nav: {
      features: "Recursos",
      why: "Por que SharpTracker?",
      pricing: "Preços",
      faq: "FAQ",
      signup: "Começar",
      trialBadge: "14 dias grátis",
      subscriptions: "Assinaturas",
      allFeatures: "Todos os recursos",
    },
    hero: {
      monitoring: (n) => `Monitorando ${n} eventos ao vivo agora`,
      connecting: "Conectando aos mercados ao vivo…",
      headline1: "Quando o mercado se move,",
      headline2: "você se move primeiro.",
      subtitle: "Aposte sempre no preço certo. Monitoramos o bookmaker mais sharp do mundo 24/7 e alertamos você no momento em que as odds caem.",
      stat1: "Ganhos por apostadores privados que seguem o dinheiro sharp a cada ano",
      stat2: "Do momento em que a linha se move até você receber o alerta",
      stat3: "Quedas de odds sharp rastreadas e registradas todos os dias",
      cta: "Obter acesso",
    },
    mobile: {
      badge: "App mobile",
      comingSoon: "App mobile — em breve",
      desc: "O app móvel está a caminho. Você poderá receber notificações push diretamente no seu telefone no momento em que ocorrer uma queda de odds.",
    },
    alertSection: {
      neverMiss: "Nunca perca",
      aDrop: "uma queda.",
    },
    terminal: {
      heading: "Observe a matriz.",
      subheading: "Pare de atualizar sites de apostas. Nosso terminal ingere milhares de eventos WebSocket por segundo, revelando movimentos de preço significativos instantaneamente.",
      eventStream: "Fluxo de eventos",
      seeTheSteam: "Veja o vapor.",
      seeTheSteamDesc: "Quando um sindicato atinge o mercado, a linha se move em todos os bookmakers em milissegundos. SharpTracker visualiza essas quedas instantaneamente, destacando oportunidades EV+ antes que desapareçam.",
      priceHistory: "Histórico de preços",
      chartSentiment: "Mapeie o sentimento.",
      chartSentimentDesc: "Cada movimento de linha é traçado tick por tick. Identifique níveis de resistência em spreads e totais e entenda o arco narrativo do mercado até o início do jogo.",
      latestDrops: "Últimas quedas sharps",
      live: "AO VIVO",
      liveFeed: "Feed ao vivo",
      bkCompare: "Comp. Books",
      sports: "Esportes",
    },
    features: {
      heading1: "Seus filtros.",
      heading2: "Suas regras.",
      subtitle: "Diga ao SharpTracker exatamente o que importa para você. Ele monitora os mercados 24 horas por dia e alerta você no momento em que algo se move.",
      steps: [
        { title: "Escolha seus mercados", description: "Escolha os esportes e ligas que você segue. Apenas o que você escolher passa — mais nada." },
        { title: "Defina sua queda mínima", description: "Escolha o tamanho que uma queda de preço deve ter antes de receber um alerta. Pequenos movimentos são ignorados. Você só ouve sobre os que importam." },
        { title: "Monitoramos 24/7", description: "SharpTracker rastreia cada mercado dia e noite. No segundo em que uma linha cai, a capturamos — não importa quando aconteça." },
        { title: "Você fica sabendo primeiro", description: "Você recebe o alerta antes de qualquer outra pessoa. Essa diferença de tempo é sua vantagem." },
      ],
      items: [
        { name: "Alertas de queda de odds", desc: "Notificação push instantânea quando o dinheiro sharp se move" },
        { name: "Rastreador de apostas", desc: "Registre cada aposta e rastreie cada unidade já colocada" },
        { name: "Comparação de bookmakers", desc: "Compare odds ao vivo em 32+ bookmakers por alerta" },
        { name: "Calculadora de stake", desc: "Calcule apostas corretamente com o critério de Kelly" },
        { name: "Calendário P&L diário", desc: "Calendário visual de ganhos/perdas — encontre padrões instantaneamente" },
        { name: "Cobertura multi-esporte", desc: "NFL, NBA, MLB, NHL, futebol, tênis e mais" },
        { name: "Crescimento do bankroll", desc: "Capture valor antes de todos os outros e veja sua vantagem acumular" },
      ],
    },
    marquee: {
      worksOn: "Funciona em",
      allBooks: "todos os principais bookmakers →",
    },
    calc: {
      badge: "Ferramentas",
      heading: "Calculadora de lucro.",
      subtitle: "Veja o que SharpTracker poderia fazer pelo seu bankroll com base em como você planeja usá-lo.",
      bankrollLabel: "Bankroll inicial",
      bankrollHint: "Recomendamos começar com pelo menos €500",
      usageLabel: "Uso semanal",
      usageHint: "Quantas horas por semana você planeja usar o SharpTracker",
      timeframeLabel: "Período",
      calculateBtn: "Calcular",
      estimatedProfit: "Lucro estimado",
      roi: "ROI",
      disclaimer: "Os dados podem não refletir os resultados reais. Apenas para fins ilustrativos. O desempenho passado não garante resultados futuros.",
      fillPrompt: "Preencha seus dados e pressione",
      calculatePrompt: "Calcular",
      usageOptions: [
        { value: "light",  label: "Leve (2–5 horas / semana)" },
        { value: "medium", label: "Médio (5–10 horas / semana)" },
        { value: "heavy",  label: "Intensivo (10–20 horas / semana)" },
      ],
      timeframeOptions: [
        { value: "2w", label: "2 semanas",  weeks: 2  },
        { value: "1m", label: "1 mês",      weeks: 4  },
        { value: "3m", label: "3 meses",    weeks: 13 },
        { value: "6m", label: "6 meses",    weeks: 26 },
      ],
    },
    cta: {
      heading: "Pare de jogar com desvantagem.",
      subtitle: "Junte-se aos apostadores mais afiados que aproveitam dados de mercado em tempo real para encontrar melhores preços antes que o mercado feche.",
      viewPlans: "Ver planos",
      startTrial: "Começar teste gratuito de 14 dias",
    },
    footer: {
      desc: "Terminal profissional de rastreamento de odds e comparação de bookmakers.",
      product: "Produto",
      legal: "Legal",
      dashboard: "Painel",
      signUp: "Cadastrar",
      terms: "Termos de serviço",
      privacy: "Política de privacidade",
      allRights: "Todos os direitos reservados.",
      disclaimer1: "SharpTracker é um serviço de dados e análises. Este site é estritamente para fins educacionais e informativos e não envolve apostas com dinheiro real.",
      disclaimer2: "As apostas envolvem risco. Aposte apenas o que você pode se dar ao luxo de perder. Este serviço é destinado a adultos com mais de 18 anos. Se você tem um problema com jogos, há ajuda disponível.",
    },
    testimonials: {
      badge: "Usuários reais. Resultados reais.",
      heading: "Ouça o que outros\nestão dizendo.",
      subtitle: "Apostadores afiados de toda a Europa e além — todos usando SharpTracker para capturar movimentos antes que o mercado se ajuste.",
      profitLabel: "Lucro",
    },
    faq: {
      badge: "FAQ",
      heading: "Perguntas comuns, respostas honestas.",
      subtitle: "Tudo que você precisa saber antes de começar.",
      items: [
        { q: "O que exatamente é o SharpTracker?", a: "SharpTracker monitora movimentos de odds em bookmakers sharp em tempo real. No momento em que uma linha se move significativamente, você recebe um alerta — para colocar sua aposta antes que bookmakers mais suaves ajustem seus preços." },
        { q: "Quão rápidos são os alertas?", a: "Os alertas são entregues em segundos após a detecção de um movimento de linha. A velocidade é tudo no dropping de odds — mesmo 30 segundos de vantagem podem fazer a diferença." },
        { q: "Quais esportes vocês cobrem?", a: "Cobrimos futebol, basquete, futebol americano, tênis, hóquei no gelo e beisebol. Mais esportes são adicionados regularmente com base na demanda dos usuários." },
        { q: "Preciso ser um apostador especialista?", a: "Não. O app é criado para ser claro e simples. Se você entende o que são odds e quer melhores preços nas suas apostas, pode usar o SharpTracker imediatamente." },
        { q: "O que é comparação de bookmakers e como funciona?", a: "Quando um bookmaker sharp como a Pinnacle move suas odds, outros bookmakers frequentemente ficam para trás. SharpTracker verifica 32+ bookmakers em tempo real e mostra quais ainda têm o preço antigo." },
        { q: "De onde vêm os dados?", a: "Obtemos odds de bookmakers sharp de altos limites nos quais apostadores profissionais confiam como referências de mercado. Esses são os bookmakers que se movem primeiro." },
        { q: "Há um teste gratuito?", a: "Sim — toda nova conta começa com um teste gratuito completo de 14 dias. Sem necessidade de cartão de crédito. Você tem acesso completo a todos os recursos desde o primeiro dia." },
        { q: "Posso cancelar a qualquer momento?", a: "Com certeza. Não há contratos ou períodos de fidelidade. Você pode cancelar sua assinatura a qualquer momento nas configurações da sua conta." },
        { q: "Para que serve a calculadora de stake?", a: "A calculadora de stake usa o Critério de Kelly para ajudá-lo a determinar o tamanho correto de cada aposta com base no seu bankroll e na sua vantagem." },
        { q: "Qual é a diferença entre SharpTracker e um serviço de tipster?", a: "Não dizemos em quem apostar. Damos a você as ferramentas para encontrar e agir sobre o valor por conta própria — dados de movimento de odds ao vivo, rastreamento de CLV e análise de apostas." },
      ],
    },
    betTracker: {
      heading: "Rastreador de apostas integrado.",
      subtitle: "Registre suas apostas com um clique a partir do feed. Nós as avaliamos automaticamente no final do jogo e mapeamos seu desempenho ao longo do tempo.",
      date: "Data",
      matchup: "Partida",
      selection: "Seleção",
      odds: "Odds",
      clv: "CLV",
      result: "Resultado",
    },
    sharpData: {
      heading: "Alimentado por dados de bookmakers sharp.",
      desc: "Rastreamos apenas os bookmakers mais sharp — os verdadeiros market makers onde o dinheiro profissional flui. SharpTracker isola o sinal do ruído. Quando o dinheiro sharp se move, você vê primeiro.",
    },
    multiSport: {
      heading: "Cobertura total do mercado.",
      subtitle: "Rastreie movimentos de linha em todos os principais esportes simultaneamente. Nosso backend processa mais de 50.000 atualizações de odds por minuto.",
    },
    featureStrip: {
      heading: "Tudo que você precisa. Nada que não precisa.",
      subtitle: "Seis ferramentas construídas para apostadores sérios — cada uma focada, rápida e acionável.",
      tiles: ["Quedas de odds ao vivo", "Rastreador de apostas", "Comparação de bookmakers", "Calculadora de stake", "Calendário diário", "Gestão do bankroll"],
    },
    bankroll: {
      badge: "Suite de rastreamento de vantagem",
      heading: "Siga sua vantagem. Veja seu bankroll crescer.",
      subtitle: "Cada número que importa — rastreado para você. Sem planilhas necessárias.",
      seeItLive: "Ver ao vivo",
      cards: [
        { tag: "Taxa de vitória", title: "Com que frequência você ganha?", desc: "De 100 apostas concluídas, quantas você ganhou? SharpTracker conta suas vitórias e derrotas automaticamente." },
        { tag: "Lucros e Perdas", title: "Você está no positivo ou negativo?", desc: "Seu lucro ou perda total em unidades. Verde significa que você está na frente, vermelho que você está atrás." },
        { tag: "Retorno sobre investimento", title: "Quanto você ganha por €100?", desc: "Para cada €100 apostados, isso lhe diz quanto de lucro você obteve de volta." },
        { tag: "Comparação de bookmakers", title: "Encontre o melhor preço instantaneamente.", desc: "Quando uma linha sharp se move, nem todos os bookmakers reagem na mesma velocidade. SharpTracker verifica 32+ bookmakers." },
        { tag: "Calendário diário", title: "Veja cada dia de relance.", desc: "Dias verdes ganharam dinheiro, dias vermelhos perderam. Uma olhada e você sabe exatamente quando suas apostas foram bem." },
        { tag: "Registro de apostas", title: "Cada aposta salva automaticamente.", desc: "Cada aposta é salva com a partida, o tipo de aposta, o preço e o resultado. Seu histórico completo em um único lugar." },
        { tag: "Liquidação automática", title: "Os resultados se atualizam sozinhos.", desc: "No momento em que um jogo termina, SharpTracker registra o resultado e atualiza seu total." },
        { tag: "Status das apostas", title: "Saiba o que está concluído e o que ainda está em andamento.", desc: "Veja de relance quantas apostas têm resultado, quantas ainda aguardam e quantas foram canceladas." },
      ],
    },
  },
};

export function t(lang: LangCode): Translations {
  return T[lang] ?? T.en;
}

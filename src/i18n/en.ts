import type { Messages } from './id'

// English (British spelling). Keys follow id.ts.
const en: Messages = {
  nav: {
    home: 'Home',
    booking: 'Book',
    status: 'Queue Status',
    statusShort: 'Status',
    mainMenu: 'Main menu',
    language: 'Language',
  },

  header: {
    openToday: 'Open today {hours}',
    closedNow: 'Closed now',
    logoAlt: '{name} logo',
  },

  wa: {
    ask: 'Hi {name}, I have a question.',
    askService: 'Hi {name}, I have a question about your car wash services.',
    order: 'Hi {name}, I would like to book a car wash.',
    orderPackage: 'Hi {name}, I would like to book {package}.',
    booked: 'Hi {name}, I have booked online with queue number {ticket}.',
  },

  footer: {
    madeWith: 'Made with',
  },

  gate: {
    loading: 'Loading',
    notFound: 'Site not found',
    notFoundText: 'is not registered or has not been published by its owner yet.',
    create: 'Create your car wash site',
    loadFailed: 'Could not load the site',
    checkConnection: 'Check your internet connection, then try again.',
    retry: 'Try again',
  },

  format: {
    minutes: '{count} min',
    hours: '{count} hr|{count} hrs',
    shortMinutes: '{count} min',
    closed: 'Closed',
    packageLabel: '{scope} {category}',
  },

  enums: {
    days: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
    categories: { wash: 'Wash', salon: 'Detailing', coating: 'Coating' },
    scopes: { car: 'Car', motor: 'Motorcycle' },
    colors: {
      white: 'White',
      black: 'Black',
      silver: 'Silver',
      gray: 'Grey',
      red: 'Red',
      maroon: 'Maroon',
      blue: 'Blue',
      navy: 'Navy',
      green: 'Green',
      tosca: 'Teal',
      yellow: 'Yellow',
      orange: 'Orange',
      brown: 'Brown',
      beige: 'Beige',
      pink: 'Pink',
    },
  },

  promo: {
    welcome: 'Car wash & detailing at {name}',
    bookNow: 'Book now',
    carousel: 'Promos',
    slideOf: '{n} of {count}',
    slide: 'Promo {n}',
    previous: 'Previous promo',
    next: 'Next promo',
  },

  package: {
    popular: 'Best seller',
    from: 'From',
    book: 'Book',
  },

  bay: {
    yours: 'Your vehicle',
    remaining: 'about {minutes} min left',
  },

  home: {
    empty: 'Empty',
    queueNow: 'Queue right now',
    queueStats: '{progress} washing · {waiting} waiting',
    waitAbout: 'about {minutes} min wait',
    noWait: 'no wait',
    packagesTitle: 'Service Packages',
    packagesText: 'Car package prices are for a sedan/hatchback; other vehicle types are adjusted.',
    categoriesLabel: 'Service categories',
    all: 'All',
    hours: 'Opening hours',
    location: 'Location',
    directions: 'Get directions',
    chat: 'Chat on WhatsApp',
  },

  booking: {
    title: 'Book Online',
    subtitle: 'Fill in a few details and get your queue number right away.',
    closed: 'We are closed right now. Online booking is available during opening hours.',
    closedToday: 'We are closed right now. Online booking is available during opening hours (today {hours}).',
    step1: 'Your details',
    name: 'Name',
    namePlaceholder: 'Your name',
    phone: 'Phone / WhatsApp',
    privacy: 'The public queue board only shows your first name & initial; your phone number is never shown.',
    step2: 'Vehicle type',
    color: 'Vehicle colour',
    step3: 'Choose a package',
    vehicle: 'Vehicle',
    package: 'Package',
    total: 'Total',
    payOnSite: 'Pay on site when it is done.',
    submit: 'Get a Queue Number',
    offline: 'Cannot connect to the server. Check your connection and try again.',
    tooMany: 'Too many attempts. Please wait a moment and try again.',
    failed: 'Booking failed. Please try again.',
  },

  unavailable: {
    title: 'Book via WhatsApp',
    text: '{name} takes bookings via WhatsApp or walk-ins. Follow the queue on the status page.',
    viewQueue: 'See the queue now',
  },

  success: {
    title: 'Booking confirmed!',
    save: 'Keep your queue number.',
    ticket: 'Queue number',
    position: 'Queue position',
    positionValue: 'No. {n}',
    estimate: 'Estimated start',
    minutes: '~{count} min',
    now: 'Now',
    around: 'around {time}',
    track: 'Follow the queue status',
    confirm: 'Confirm via WhatsApp',
  },

  status: {
    title: 'Wash Queue',
    disconnected: 'Connection lost, retrying…',
    live: 'Live · updates automatically',
    washing: 'Being washed',
    waiting: 'Waiting',
    finishedToday: 'Finished today',
    emptyTitle: 'No one in the queue today',
    emptyText: 'Walk in or take an online queue number now.',
    book: 'Book',
    inProgress: 'Being Washed',
    next: 'Up Next',
    vehicles: '{count} vehicle|{count} vehicles',
    ready: 'Ready for Pickup',
    estStart: 'Est. start',
    now: 'Now',
    nextUp: 'Next',
  },

  myCar: {
    label: 'Your vehicle · {ticket}',
    ready: 'Done! Your vehicle is ready for pickup.',
    washing: 'Being washed · {progress}% · about {minutes} min left',
    washingAt: 'Being washed at Bay {bay} · {progress}% · about {minutes} min left',
    waiting: 'Waiting · position {n} · {when}',
    startsAround: 'starts around {time}',
    soon: 'starting soon',
  },
}

export default en

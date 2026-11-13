<?php

// Teks landing page (resources/views/landing.blade.php). :domain = domain induk tenant, :publish = kata "Publish" yang ditebalkan.
return [
    'meta' => [
        'title' => 'WashWuzz: A Car & Motorbike Wash Website in 5 Minutes',
        'description' => 'WashWuzz: website & online service catalogue for car and motorbike wash businesses. Sign up free, get your own subdomain, manage prices from the dashboard.',
        // Teks gambar pratinjau link (public/og/washwuzz-en.png); ubah gambarnya juga kalau teks ini berubah.
        'image_alt' => 'WashWuzz: your car & motorbike wash, online in 5 minutes. Sign up free at washwuzz.cloudbizz.my.id',
    ],

    'language' => 'Language',

    'announce' => [
        'highlight' => 'Start free',
        'text' => '— upgrade to Pro anytime.',
        'cta' => 'Sign up now →',
    ],

    'nav' => [
        'features' => 'Features',
        'how' => 'How It Works',
        'pricing' => 'Pricing',
        'faq' => 'FAQ',
        'login' => 'Log In',
        'signup' => 'Sign Up Free',
    ],

    'hero' => [
        'badge' => 'For car wash & detailing businesses',
        'title' => 'Your car wash,',
        'title_accent' => 'online in 5 minutes.',
        'lead' => 'Sign up, pick a subdomain, add your services & prices — customers instantly see your packages, prices per vehicle type, opening hours and can chat on WhatsApp from your own business site.',
        'demo' => 'See a Sample Site',
        'points' => ['No coding', 'Your own subdomain', 'Manage from your phone'],
    ],

    'mockup' => [
        'open' => 'Open · 08:00–17:00',
        'tagline' => 'Premium car wash & detailing in Surabaya',
        'packages' => [
            ['Hydraulic Snow Foam Wash', '45 min · Wash', 'Rp65k'],
            ['Wash + Wax & Interior', '75 min · Wash', 'Rp165k'],
            ['Full Interior Detailing', '150 min · Detailing', 'Rp450k'],
        ],
        'popular' => 'Best seller',
        'whatsapp' => 'Chat on WhatsApp',
        'admin' => 'Admin Dashboard',
        'site_status' => 'Site status',
        'active_packages' => '3 active packages',
        'vehicle_prices' => 'Prices per vehicle',
        'online' => '● Online',
    ],

    'stats' => [
        ['5 Minutes', 'From sign-up to online'],
        ['1 Subdomain', 'yourbusiness.:domain'],
        ['7 Classes', 'Prices per vehicle type'],
        ['Rp0', 'To get started'],
    ],

    'features' => [
        'badge' => 'Features',
        'title' => 'Everything a car wash business needs,',
        'title_accent' => 'in one dashboard.',
        'lead' => 'You focus on serving customers — your site, catalogue and prices are managed from a dashboard that works on your phone.',
        'items' => [
            ['Automatic Subdomain', 'Pick a name when you sign up and your site instantly gets its own address, like putrajayawash.:domain.', ['No domain to buy', 'SSL included']],
            ['Package & Price Catalogue', 'Set up wash, detailing and coating packages with duration, features and a best-seller label.', ['Wash', 'Detailing', 'Coating']],
            ['Prices per Vehicle Type', 'One base price, automatically adjusted for sedans, SUVs, MPVs, luxury cars and even motorcycles.', ['Price multiplier', 'Adjustable']],
            ['Service Add-ons', 'Offer extras like engine detailing, rain repellent or fogging with every package.', ['Interior', 'Exterior', 'Protection']],
            ['Opening Hours & Location', 'Daily opening hours, your address and a Google Maps link shown clearly on your site.', ['Monday–Sunday', 'Google Maps']],
            ['WhatsApp Chat', 'A WhatsApp button on your site, so customers can ask questions or book straight to your number.', ['One tap', 'No app needed']],
        ],
    ],

    'how' => [
        'badge' => 'How It Works',
        'title' => 'Four steps,',
        'title_accent' => 'and your site is live.',
        'lead' => 'Watch the whole flow in under a minute, from a customer booking to the money report.',
        'video_note' => 'The video is in Indonesian.',
        'video_label' => 'WashWuzz promo video',
        'play' => 'Play the promo video',
        'steps' => [
            ['Sign up & pick a subdomain', 'Enter your business name and choose your site address, e.g. putrajayawash.:domain.'],
            ['Complete your profile', 'Log in to the dashboard and add your address, WhatsApp, description and opening hours.'],
            ['Set services & prices', 'Edit the ready-made sample packages, or create your own.'],
            ['Publish', 'Click Publish — customers can open your site right away.'],
        ],
    ],

    'pricing' => [
        'title' => 'Start free,',
        'title_accent' => 'no credit card needed.',
        'lead' => 'The Free plan is enough to get online. Upgrade to Pro for online booking, 25 promo photos, unlimited packages, income & expense tracking and accurate monthly reports.',
        'free' => 'Free',
        'per_month' => '/ month',
        'free_items' => ['Business site on your own subdomain', 'Real-time queue board & walk-in customers', 'Up to 3 active service packages', 'Promo slider with 1 photo', 'Profile, opening hours, WhatsApp & Maps'],
        'free_cta' => 'Sign Up Free',
        'popular' => 'Most complete',
        'thousand' => 'k',
        'or_yearly' => 'or Rp:price / year',
        'pro_items' => ['Everything in Free', 'Online booking with queue numbers', 'Promo slider with up to 25 photos', 'Your own logo in the site header', 'Unlimited service packages', 'No "Made with WashWuzz" label'],
        'pro_cta' => 'Start Free, Upgrade Later',
    ],

    'signup' => [
        'badge' => 'Sign up',
        'title' => 'Register your business,',
        'title_accent' => 'pick your site address.',
        'lead' => 'After signing up, log in to the dashboard to complete your profile and prices. Your site only goes public after you click :publish.',
        'publish' => 'Publish',
        'have_account' => 'Already have an account?',
        'login' => 'Log in to the dashboard',
    ],

    'form' => [
        'business_name' => 'Business name',
        'business_placeholder' => 'Putra Jaya Wash',
        'subdomain' => 'Site address (subdomain)',
        'subdomain_hint' => 'Lowercase letters, numbers or hyphens (-).',
        'owner_name' => 'Owner name',
        'phone' => 'WhatsApp number',
        'email' => 'Email (for login)',
        'password' => 'Password',
        'password_confirmation' => 'Repeat password',
        'submit' => 'Sign Up & Create Site',
        'note' => 'You start on the Free plan. Your site stays private until you publish it.',
    ],

    'success' => [
        'title' => 'Registration successful!',
        'url_label' => 'Your site address:',
        'text' => 'Log in to the dashboard to complete your profile & prices, then click :publish.',
        'login' => 'Go to Dashboard →',
    ],

    'faq' => [
        'title' => 'Frequently asked questions',
        'items' => [
            ['Is it really free?', 'Yes. The Free plan can be used forever: your site, the queue board and up to 3 service packages. Upgrade to Pro only if you need online booking, promos and unlimited packages.'],
            ['How do I pay for Pro?', 'In the dashboard, open Subscription, follow the payment instructions, then confirm via WhatsApp. Pro is activated as soon as the admin confirms your payment.'],
            ['Do I need to buy a domain?', 'No. You get your own subdomain, e.g. putrajayawash.:domain, complete with SSL (https).'],
            ['When can customers open my site?', 'Once you have filled in your business name, WhatsApp, address, city, opening hours and at least one active package, click Publish in the dashboard. You can hide it again at any time.'],
            ['Can I change my subdomain?', 'For now the subdomain is chosen once, at sign-up. Contact us if you need to change it.'],
            ['Can customers book online?', 'Yes, on the Pro plan: customers book from your site, get a queue number instantly and follow their vehicle\'s status in real time. On the Free plan, customers book via WhatsApp or walk in.'],
        ],
    ],

    'contact' => [
        'message' => 'Hi ABIE TECHNOLOGY, I have a question about WashWuzz.',
        'label' => 'Chat with ABIE TECHNOLOGY on WhatsApp',
    ],

    'js' => [
        'checking' => 'Checking…',
        'available' => ':name is available',
        'unavailable' => 'Not available',
        'check_failed' => 'Could not check. Try again.',
        'processing' => 'Processing…',
        'too_many' => 'Too many attempts. Please wait a moment and try again.',
        'error' => 'Something went wrong. Please try again.',
        'offline' => 'Cannot connect to the server. Check your connection and try again.',
    ],
];

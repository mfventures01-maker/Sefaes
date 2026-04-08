// Staff Directory - De Facto Lounge & Bar Team

export interface StaffMember {
    id: string;
    name: string;
    role: string;
    trait: string; // One-line personality/work style
    image: string; // Path to local asset
}

export const staffMembers: StaffMember[] = [
    {
        id: 'staff-01',
        name: 'Chidi Okonkwo',
        role: 'General Manager',
        trait: 'Quiet precision. Runs the floor like clockwork.',
        image: '/assets/staff/chidi-okonkwo.jpg'
    },
    {
        id: 'staff-02',
        name: 'Amara Nwosu',
        role: 'Head Chef',
        trait: 'Craft-first. Every plate tells a story.',
        image: '/assets/staff/amara-nwosu.jpg'
    },
    {
        id: 'staff-03',
        name: 'Tunde Adeyemi',
        role: 'Master Mixologist',
        trait: 'Flavor architect. Cocktails are his canvas.',
        image: '/assets/staff/tunde-adeyemi.jpg'
    },
    {
        id: 'staff-04',
        name: 'Ngozi Eze',
        role: 'Bar Supervisor',
        trait: 'Sharp eye, sharper service. Nothing slips past her.',
        image: '/assets/staff/ngozi-eze.jpg'
    },
    {
        id: 'staff-05',
        name: 'Emeka Obi',
        role: 'Floor Lead',
        trait: 'Warm presence, firm standards. Guests feel seen.',
        image: '/assets/staff/emeka-obi.jpg'
    },
    {
        id: 'staff-06',
        name: 'Blessing Okoro',
        role: 'VIP Concierge',
        trait: 'Anticipates needs before they\'re spoken.',
        image: '/assets/staff/blessing-okoro.jpg'
    },
    {
        id: 'staff-07',
        name: 'Kunle Balogun',
        role: 'Security & Protocol',
        trait: 'Discreet strength. Safety without intrusion.',
        image: '/assets/staff/kunle-balogun.jpg'
    },
    {
        id: 'staff-08',
        name: 'Zainab Ibrahim',
        role: 'Events Coordinator',
        trait: 'Turns visions into unforgettable nights.',
        image: '/assets/staff/zainab-ibrahim.jpg'
    }
];

// Contact configuration
export const CONCIERGE_CONTACT = {
    whatsappNumber: '2348000000000', // Update with actual concierge WhatsApp
    name: 'De Facto Concierge',
    defaultMessage: 'Hello! I would like to speak with the concierge about...'
};

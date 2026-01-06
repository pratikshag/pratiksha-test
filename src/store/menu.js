const menus = [
  {
    key: 'sbn',
    title: 'SBN',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_sbn_team'],
    childs: [
      {
        key: 'registration',
        title: 'Registration',
      },
      {
        key: 'commission-list',
        title: 'Commision List',
      },
      {
        key: 'commission-history',
        title: 'Commission History',
      },
      {
        key: 'sbn-jobs',
        title: 'Jobs',
      },
    ],
  },
  {
    key: 'events',
    title: 'Events',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_freebies_team', 'soco_event_team'],
    childs: [
      {
        key: 'event-list',
        sub_key: ['event-detail', 'participant-list'],
        title: 'Event List',
      },
      {
        key: 'add-event',
        title: 'Add Event',
      },
    ],
  },
  {
    key: 'get-member',
    title: 'Get Member',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'leaderboard',
        title: 'Leaderboard',
      },
      {
        key: 'rewards',
        sub_key: ['edit-rewards', 'add-rewards'],
        title: 'MGM Setting',
      },
    ],
  },
  {
    key: 'review',
    title: 'Review',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'badwords-review',
        title: 'Bad Words',
      },
      {
        key: 'product-list',
        sub_key: ['product-form'],
        title: 'Products',
      },
      // {
      //   key: 'brand-list',
      //   sub_key: ['brand-form', 'brand-form-add'],
      //   title: 'Brands',
      // },
      {
        key: 'product-featured-list',
        title: 'Featured Products',
      },
      {
        key: 'category-featured-list',
        title: 'Featured Categories',
      },
      {
        key: 'brand-featured-list',
        title: 'Featured Brands',
      },
    ],
  },
  {
    key: 'gamification',
    title: 'Gamification',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'action-list',
        sub_key: ['edit-action-list'],
        title: 'Action Point Rules',
      },
      {
        key: 'reward-list',
        sub_key: ['view-reward', 'add-reward', 'edit-reward'],
        title: 'Reward',
      },
      {
        key: 'all-faq',
        sub_key: ['edit-faq', 'add-faq'],
        title: 'FAQ',
      },
      {
        key: 'all-tnc',
        sub_key: ['edit-tnc', 'add-tnc'],
        title: 'T&C',
      },
    ],
  },
  {
    key: 'recomendation',
    title: 'Recomendation',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'recomendation-quiz',
        title: 'Quiz',
      },
    ],
  },
  {
    key: 'newsfeed',
    title: 'Newsfeed',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team', 'soco_sbn_team'],
    childs: [
      {
        key: 'newsfeed-list',
        title: 'List Newsfeed',
      },
      {
        key: 'request-delete',
        title: 'Request Delete',
      },
      {
        key: 'newsfeed-report',
        title: 'Report',
      },
      {
        key: 'newsfeed-violation-report',
        title: 'Violation Report',
      },
      {
        key: 'newsfeed-list-deleted',
        title: 'Deleted Newsfeed',
      },
    ],
  },
  {
    key: 'banners',
    title: 'Banner',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'all-banners',
        sub_key: ['edit-banners', 'add-banners'],
        title: 'All Banners',
      },
    ],
  },
  {
    key: 'level',
    title: 'Level',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'all-level',
        title: 'List Level',
      },
    ],
  },
  {
    key: 'reported-comment',
    title: 'Comment',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'list-reported-comment',
        title: 'Reported Comment',
      },
      {
        key: 'list-reported-comment-replies',
        title: 'Reported Comment Replies',
      },
    ],
  },
  {
    key: 'lp-banners',
    title: 'Loyalty Point Banner',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'all-lp-banners',
        title: 'All Banners',
      },
      {
        key: 'add-lp-banners',
        title: 'Add Banner',
      },
    ],
  },
  {
    key: 'emoticons',
    title: 'Emoticons',
    icon_type: 'ion',
    icon: 'happy',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'emoticons',
        title: 'All Emoicons',
      },
    ],
  },
  // {
  //   key: 'horoscope',
  //   title: 'Horoscope',
  //   icon_type: 'vuestic',
  //   icon: 'dashboard',
  //   permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
  //   childs: [
  //     {
  //       key: 'all-horoscope',
  //       title: 'All Horoscope',
  //     },
  //     {
  //       key: 'all-zodiac',
  //       sub_key: ['edit-zodiac'],
  //       title: 'Zodiac',
  //     },
  //   ],
  // },
  // {
  //   key: 'beauty-quotes',
  //   title: 'Beauty Quotes',
  //   icon_type: 'vuestic',
  //   icon: 'dashboard',
  //   permission: ['soco_superadmin'],
  //   childs: [
  //     {
  //       key: 'all-quotes',
  //       sub_key: ['edit-quotes'],
  //       title: 'All Quotes',
  //     },
  //     {
  //       key: 'add-quotes',
  //       title: 'Add Quotes',
  //     },
  //   ],
  // },
  {
    key: 'voucher',
    title: 'Vouchers',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'all-voucher',
        title: 'All Vouchers',
      },
      {
        key: 'add-voucher',
        title: 'Add Voucher',
      },
    ],
  },
  {
    key: 'all-freebies',
    title: 'Freebies',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin', 'soco_freebies_team', 'soco_event_team'],
  },
  // {
  //   key: 'partners',
  //   title: 'Partners',
  //   icon_type: 'vuestic',
  //   icon: 'dashboard',
  //   permission: ['soco_superadmin', 'soco_admin'],
  //   childs: [
  //     {
  //       key: 'all-partners',
  //       title: 'All Partners',
  //     },
  //     {
  //       key: 'add-partners',
  //       title: 'Add Partner',
  //     },
  //   ],
  // },
  {
    key: 'campaign',
    title: 'Campaigns',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'all-campaign',
        title: 'All Campaigns',
      },
      {
        key: 'add-campaign',
        title: 'Add Campaign',
      },
    ],
  },
  {
    key: 'banned-user',
    title: 'Banner User',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'all-banned-user',
        title: 'All Banner User',
      },
    ],
  },
  {
    key: 'users',
    title: 'Users',
    icon_type: 'vuestic',
    icon: 'statistics',
    permission: ['soco_superadmin', 'soco_cs_team', 'soco_sbn_team'],
    childs: [
      {
        key: 'all-users',
        title: 'All Users',
      },
      {
        key: 'acquisition-login',
        title: 'Acquisition Login',
      },
      {
        key: 'acquisition-register',
        title: 'Acquisition Register',
      },
      {
        key: 'reported-users',
        title: 'Reported Users',
      },
      {
        key: 'blocked-users',
        title: 'Blocked Users',
      },
      {
        key: 'recover-users',
        title: 'Recover Users',
      },
      {
        key: 'deletion-users',
        title: 'Account Deletion',
      },
    ],
  },
  // {
  //   key: 'growth',
  //   title: 'Growth',
  //   icon_type: 'vuestic',
  //   icon: 'statistics',
  //   permission: ['soco_superadmin', 'soco_admin'],
  //   childs: [
  //     {
  //       key: 'export-growth',
  //       title: 'Export Growth',
  //     },
  //   ],
  // },
  {
    key: 'feature',
    title: 'Feature',
    icon_type: 'vuestic',
    icon: 'dashboard',
    permission: ['soco_superadmin'],
  },
  {
    key: 'overseas-phone',
    title: 'Overseas Phone',
    icon_type: 'fa',
    icon: 'globe',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'countries',
        title: 'Countries',
      },
    ],
  },
  {
    key: 'soco-point-injection',
    title: 'Soco Point Injection',
    icon_type: 'fa',
    icon: 'life-ring',
    permission: ['soco_superadmin', 'soco_cs_team', 'cs__and__payment_acceptor', 'cs_manager'],
    childs: [
      {
        key: 'injection-list',
        title: 'Injection List',
      },
      {
        key: 'soco-point-injection-report',
        title: 'Report',
      },
    ],
  },
  {
    key: 'admin-users',
    title: 'Admin Users',
    icon_type: 'fa',
    icon: 'life-ring',
    permission: ['soco_superadmin'],
    childs: [
      {
        key: 'admin-users-list',
        title: 'List',
      },
      {
        key: 'admin-users-roles-list',
        title: 'Roles List',
      },
    ],
  },
  {
    key: 'help-page',
    title: 'Help Page',
    icon_type: 'fa',
    icon: 'life-ring',
    permission: ['soco_superadmin', 'soco_cs_team', 'soco_bj_team', 'soco_content_team'],
    childs: [
      {
        key: 'help-categories',
        sub_key: ['help-sub-categories', 'help-category-create', 'help-category-edit', 'help-sub-category-edit'],
        title: 'Categories',
      },
      {
        key: 'help-content',
        sub_key: ['help-content-create', 'help-content-edit'],
        title: 'Content',
      },
      {
        key: 'help-contact-us',
        title: 'Contact Us',
      },
    ],
  },
  {
    key: 'third-party-login',
    title: 'Third Party Login',
    icon_type: 'fa',
    icon: 'life-ring',
    permission: ['soco_superadmin', 'soco_cs_team', 'soco_bj_team', 'soco_content_team'],
  },
];

export default menus;

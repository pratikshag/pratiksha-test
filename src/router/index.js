import Vue from 'vue';
import Router from 'vue-router';
import AppLayout from '../components/admin/AppLayout';
// import AuthLayout from "../components/auth/AuthLayout";
import store from '../app.store';
import lazyLoading from './lazyLoading';
import Paginate from 'vuejs-paginate';
Vue.component('paginate', Paginate);

Vue.use(Router);
Vue.use(Paginate);

const EmptyParentComponent = {
  template: '<router-view></router-view>',
};

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: lazyLoading('auth/login/Login'),
      meta: {
        title: 'Login - SOCO by Sociolla',
        requiresAuth: true,
        header: true,
        footer: false,
      },
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: lazyLoading('auth/unauthorized/unauthorized'),
      meta: {
        title: 'Unauthorized',
        requiresAuth: true,
        header: true,
        footer: false,
      },
    },
    {
      path: '/404',
      component: EmptyParentComponent,
      children: [
        {
          name: 'not-found-advanced',
          path: 'not-found-advanced',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundSearch'),
        },
        {
          name: 'not-found-simple',
          path: 'not-found-simple',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundSimple'),
        },
        {
          name: 'not-found-custom',
          path: 'not-found-custom',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundCustom'),
        },
        {
          name: 'not-found-large-text',
          path: '/pages/not-found-large-text',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundLargeText'),
        },
      ],
    },
    {
      name: 'admin',
      path: '/',
      component: AppLayout,
      children: [
        {
          name: 'emoticons',
          path: 'emoticons',
          component: lazyLoading('emoticons/emoticons-list'),
        },
        {
          name: 'lp-banners',
          path: 'loyalty-point-banners',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-lp-banners',
              path: 'all',
              component: lazyLoading('lp-banners/all/all-banners'),
            },
            {
              name: 'add-lp-banners',
              path: 'add',
              component: lazyLoading('lp-banners/add/add-banners'),
            },
            {
              name: 'edit-lp-banners',
              path: 'edit/:id',
              component: lazyLoading('lp-banners/add/add-banners'),
            },
          ],
        },
        {
          name: 'banners',
          path: 'banners',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-banners',
              path: 'all',
              component: lazyLoading('banners/all/allBanners'),
            },
            {
              name: 'edit-banners',
              path: 'edit/:id',
              component: lazyLoading('banners/form/formBanner'),
              props: true,
            },
            {
              name: 'add-banners',
              path: 'add',
              component: lazyLoading('banners/form/formBanner'),
            },
          ],
        },
        {
          name: 'level',
          path: 'level',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-level',
              path: 'all',
              component: lazyLoading('level/all/allContents'),
            },
            {
              name: 'content-level',
              path: 'content/:id',
              component: lazyLoading('level/form/formContent'),
            },
            {
              name: 'benefit-level',
              path: ':id/benefits',
              component: lazyLoading('level/list-benefit/allContents'),
            },
            {
              name: 'add-benefit-level',
              path: ':id/benefits/add',
              component: lazyLoading('level/form-benefit/formContent'),
            },
            {
              name: 'edit-benefit-level',
              path: ':id/benefits/:benefitId',
              component: lazyLoading('level/form-benefit/formContent'),
            },
          ],
        },
        {
          name: 'newsfeed',
          path: 'newsfeed',
          component: EmptyParentComponent,
          children: [
            {
              name: 'newsfeed-report',
              path: 'report',
              component: lazyLoading('Newsfeed/Report/newsfeedreport'),
            },
            {
              name: 'proceed-report',
              path: 'proceed',
              component: lazyLoading('Newsfeed/Report/proceed/proceedreport'),
            },
            {
              name: 'newsfeed-auto-reshare',
              path: 'autoreshare',
              component: lazyLoading('Newsfeed/AutoReshare/newsfeed-autoreshare'),
            },
            {
              name: 'add-auto-reshare',
              path: 'autoreshare/add',
              component: lazyLoading('Newsfeed/AutoReshare/add/addautoreshare'),
            },
            {
              name: 'request-delete',
              path: 'requestdelete',
              component: lazyLoading('Newsfeed/Requestdelete/requestdelete'),
            },
            {
              name: 'proceed-delete',
              path: 'proceeddelete',
              component: lazyLoading('Newsfeed/Requestdelete/proceed/proceeddelete'),
            },
            {
              name: 'newsfeed-list',
              path: 'list',
              component: lazyLoading('Newsfeed/List/list'),
            },
            {
              name: 'newsfeed-violation-report',
              path: 'violation',
              component: lazyLoading('Newsfeed/ListSpam/listspam'),
            },
            {
              name: 'newsfeed-list-deleted',
              path: 'deleted',
              component: lazyLoading('Newsfeed/DeletedNewsfeed/newsfeeddeleted'),
            },
          ],
        },
        {
          name: 'banned-user',
          path: 'banneduser',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-banned-user',
              path: 'all',
              component: lazyLoading('Banneduser/all/allBanneduser'),
            },
            {
              name: 'edit-banned-user',
              path: 'edit/:id',
              component: lazyLoading('Banneduser/Edit/editBanneduser'),
              props: true,
            },
            {
              name: 'add-banned-user',
              path: 'add',
              component: lazyLoading('Banneduser/add/addBanneduser'),
            },
          ],
        },
        {
          name: 'review',
          path: 'review',
          component: EmptyParentComponent,
          children: [
            // {
            //   name: 'allReview',
            //   path: 'all',
            //   component: lazyLoading('Review/all/allReview'),
            // },
            //  {
            //   name: 'reportReview',
            //   path: 'report',
            //   component: lazyLoading('Review/report/reportReview'),
            // },
            {
              name: 'badwords-review',
              path: 'badwords',
              component: lazyLoading('Review/badwords/badwordsReview'),
            },
            {
              name: 'edit-badwords-review',
              path: 'badwords/edit/:id',
              component: lazyLoading('Review/badwords/form/form'),
              props: true,
            },
            {
              name: 'add-badwords-review',
              path: 'badwords/add',
              component: lazyLoading('Review/badwords/form/form'),
            },
            {
              path: 'product',
              component: EmptyParentComponent,
              children: [
                {
                  name: 'product-list',
                  path: 'list/',
                  component: lazyLoading('Review/products/list'),
                },
                {
                  name: 'product-form',
                  path: ':id/',
                  component: lazyLoading('Review/products/form'),
                },
                {
                  name: 'product-featured-list',
                  path: 'featured/list/',
                  component: lazyLoading('Review/product-featured/list'),
                },
                {
                  name: 'product-review-list',
                  path: 'list/:id/',
                  component: lazyLoading('Review/product-reviews/list'),
                },
              ],
            },
            {
              name: 'category-featured-list',
              path: 'categories/featured/list',
              component: lazyLoading('Review/category-featured/CategoryFeaturedList'),
            },
            {
              path: 'brand',
              component: EmptyParentComponent,
              children: [
                // {
                //   name: 'brand-list',
                //   path: 'list/',
                //   component: lazyLoading('Review/brands/list'),
                // },
                // {
                //   name: 'brand-form',
                //   path: ':id/',
                //   component: lazyLoading('Review/brands/form'),
                // },
                // {
                //   name: 'brand-form-add',
                //   path: 'add',
                //   component: lazyLoading('Review/brands/form'),
                // },
                {
                  name: 'brand-featured-list',
                  path: 'featured/list/',
                  component: lazyLoading('Review/brand-featured/list'),
                },
              ],
            },
          ],
        },
        {
          name: 'horoscope',
          path: 'horoscope',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-horoscope',
              path: 'all',
              component: lazyLoading('Horoscope/horoscope/all/allhoroscope'),
            },
            {
              name: 'edit-horoscope',
              path: 'edit/:id',
              component: lazyLoading('Horoscope/horoscope/form/form'),
              props: true,
            },
            {
              name: 'add-horoscope',
              path: 'add',
              component: lazyLoading('Horoscope/horoscope/form/form'),
            },
            {
              name: 'all-zodiac',
              path: 'zodiac',
              component: lazyLoading('Horoscope/zodiac/all/allzodiac'),
            },
            {
              name: 'edit-zodiac',
              path: 'zodiac/edit/:id',
              component: lazyLoading('Horoscope/zodiac/Edit/editzodiac'),
              props: true,
            },
          ],
        },
        {
          name: 'reported-comment',
          path: 'comment-reported',
          component: EmptyParentComponent,
          children: [
            {
              name: 'list-reported-comment',
              path: 'list-reported-comment',
              component: lazyLoading('Comment/all/listReported'),
            },
            {
              name: 'list-reported-comment-replies',
              path: 'list-reported-comment-replies',
              component: lazyLoading('Comment/all/listReportedReplies'),
            },
            {
              name: 'list-deleted-comment',
              path: 'list-deleted-comment',
              component: lazyLoading('Comment/all/listDeleted'),
            },
          ],
        },
        {
          name: 'freebies',
          path: 'freebies',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-freebies',
              path: 'all',
              component: lazyLoading('Freebies/all/allfreebies'),
            },
            {
              name: 'edit-freebies',
              path: 'edit/:id',
              component: lazyLoading('Freebies/form/formfreebies'),
              props: true,
            },
            {
              name: 'freebies-participant',
              path: 'edit/:id/users',
              props: true,
              component: lazyLoading('Freebies/users/users-list'),
            },
            {
              name: 'freebies-participant-survey',
              path: 'edit/:id/users/survey',
              props: true,
              component: lazyLoading('Freebies/users/user-survey'),
            },
            {
              name: 'add-freebies',
              path: 'add',
              component: lazyLoading('Freebies/form/formfreebies'),
            },
          ],
        },
        {
          name: 'voucher',
          path: 'voucher',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-voucher',
              path: 'all',
              component: lazyLoading('Voucher/all/allvoucher'),
            },
            {
              name: 'edit-voucher',
              path: 'edit/:id',
              component: lazyLoading('Voucher/form/formvoucher'),
              props: true,
            },
            {
              name: 'add-voucher',
              path: 'add',
              component: lazyLoading('Voucher/form/formvoucher'),
            },
          ],
        },
        {
          name: 'beauty-quotes',
          path: 'beauty-quotes',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-quotes',
              path: 'all',
              component: lazyLoading('beauty-quotes/all/allquotes'),
            },
            {
              name: 'edit-quotes',
              path: 'edit/:id',
              component: lazyLoading('beauty-quotes/form/formquotes'),
              props: true,
            },
            {
              name: 'add-quotes',
              path: 'add',
              component: lazyLoading('beauty-quotes/form/formquotes'),
            },
          ],
        },
        // {
        //   name: 'partners',
        //   path: 'partners',
        //   component: EmptyParentComponent,
        //   children: [
        //     {
        //       name: 'all-partners',
        //       path: 'all',
        //       component: lazyLoading('partners/all/allpartners'),
        //     },
        //     {
        //       name: 'edit-partners',
        //       path: 'edit/:id',
        //       component: lazyLoading('partners/form/formpartners'),
        //       props: true,
        //     },
        //     {
        //       name: 'add-partners',
        //       path: 'add',
        //       component: lazyLoading('partners/form/formpartners'),
        //     },
        //   ],
        // },
        {
          name: 'campaign',
          path: 'campaign',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-campaign',
              path: 'all',
              component: lazyLoading('Campaign/all/allcampaign'),
            },
            {
              name: 'edit-campaign',
              path: 'edit/:id',
              component: lazyLoading('Campaign/form/formcampaign'),
              props: true,
            },
            {
              name: 'add-campaign',
              path: 'add',
              component: lazyLoading('Campaign/form/formcampaign'),
            },
          ],
        },
        {
          name: 'users',
          path: 'users',
          component: EmptyParentComponent,
          children: [
            {
              name: 'all-users',
              path: 'all',
              component: lazyLoading('users/all/allUsers'),
            },
            {
              name: 'reported-users',
              path: 'reported',
              component: lazyLoading('users/reported-users/List'),
            },
            {
              name: 'detail-users',
              path: 'detail/:id',
              component: lazyLoading('users/detail/detailUsers'),
            },
            {
              name: 'acquisition-login',
              path: 'acquisition/login',
              component: lazyLoading('acquisition-login/list'),
            },
            {
              name: 'acquisition-register',
              path: 'acquisition/register',
              component: lazyLoading('acquisition-register/list'),
            },
            {
              name: 'blocked-users',
              path: 'blockedUsers',
              component: lazyLoading('users/blocked-users/blocked-users'),
            },
            {
              name: 'recover-users',
              path: 'recover-users',
              component: lazyLoading('users/recover-users/RecoverUsers'),
            },
            {
              name: 'deletion-users',
              path: 'deletion-users',
              component: lazyLoading('users/deletion-users/list'),
            },
          ],
        },
        {
          name: 'gamification',
          path: 'gamification',
          component: EmptyParentComponent,
          children: [
            {
              name: 'action-list',
              path: 'actionlist',
              component: lazyLoading('Gamification/action/actionlist'),
            },
            {
              name: 'edit-action-list',
              path: 'actionlist/edit/:id',
              component: lazyLoading('Gamification/action/Edit/editactionlist'),
              props: true,
            },
            {
              name: 'reward-list',
              path: 'rewardlist',
              component: lazyLoading('Gamification/reward/rewardlist'),
            },
            {
              name: 'view-reward',
              path: 'view/:id',
              component: lazyLoading('Gamification/reward/view/viewreward'),
            },
            {
              name: 'add-reward',
              path: 'add/:id',
              component: lazyLoading('Gamification/reward/add/addreward'),
            },
            {
              name: 'edit-reward',
              path: 'editreward/:id/:id1',
              component: lazyLoading('Gamification/reward/Edit/editreward'),
              props: true,
            },
            {
              name: 'all-faq',
              path: 'faq/all',
              component: lazyLoading('Gamification/faq/all/allFaq'),
            },
            {
              name: 'edit-faq',
              path: 'faq/edit/:id',
              component: lazyLoading('Gamification/faq/form/formFaq'),
              props: true,
            },
            {
              name: 'add-faq',
              path: 'faq/add',
              component: lazyLoading('Gamification/faq/form/formFaq'),
            },
            {
              name: 'all-tnc',
              path: 'tnc/all',
              component: lazyLoading('Gamification/tnc/all/allTnc'),
            },
            {
              name: 'edit-tnc',
              path: 'tnc/edit/:id',
              component: lazyLoading('Gamification/tnc/form/formTnc'),
              props: true,
            },
            {
              name: 'add-tnc',
              path: 'tnc/add',
              component: lazyLoading('Gamification/tnc/form/formTnc'),
            },
          ],
        },
        {
          name: 'recomendation',
          path: 'recommendation',
          component: EmptyParentComponent,
          children: [
            {
              name: 'recomendation-quiz',
              path: 'quiz',
              component: lazyLoading('recommendation-quiz/all/allRecomendationQuiz'),
            },
            {
              name: 'recomendation-quiz-add',
              path: 'quiz/add',
              component: lazyLoading('recommendation-quiz/form/formRecomendationQuiz'),
            },
            {
              name: 'recomendation-quiz-update',
              path: 'quiz/:id',
              component: lazyLoading('recommendation-quiz/form/formRecomendationQuiz'),
            },
          ],
        },
        // {
        //   name: 'growth',
        //   path: 'growth',
        //   component: EmptyParentComponent,
        //   children: [
        //     {
        //       name: 'export-growth',
        //       path: 'export',
        //       component: lazyLoading('growth/list'),
        //     },
        //   ],
        // },
        {
          name: 'sbn',
          path: 'sbn',
          component: EmptyParentComponent,
          children: [
            {
              name: 'registration',
              path: 'users',
              component: lazyLoading('sbn/users-list/users-list'),
            },
            {
              name: 'commission-list',
              path: 'commission',
              component: lazyLoading('sbn/commission-list/commission-list'),
            },
            {
              name: 'commission-history',
              path: 'commission-history',
              component: lazyLoading('sbn/commission-history/commission-history'),
            },
            {
              name: 'sbn-jobs',
              path: 'jobs',
              component: lazyLoading('sbn/jobs/SbnJobs'),
            },
            {
              name: 'sbn-job-create',
              path: 'job/create',
              component: lazyLoading('sbn/jobs/SbnJobsForm'),
            },
            {
              name: 'sbn-job-edit',
              path: 'job/:id/edit',
              props: true,
              component: lazyLoading('sbn/jobs/SbnJobsForm'),
            },
            {
              name: 'sbn-job-participants',
              path: 'job/:id/participants',
              props: true,
              component: lazyLoading('sbn/jobs/SbnJobsParticipants'),
            },
          ],
        },
        {
          name: 'events',
          path: 'events',
          component: EmptyParentComponent,
          children: [
            {
              name: 'event-list',
              path: 'list',
              component: lazyLoading('events/list/list'),
            },
            {
              name: 'add-event',
              path: 'add',
              component: lazyLoading('events/detail/detail'),
            },
            {
              name: 'event-detail',
              path: 'detail/:id',
              component: lazyLoading('events/detail/detail'),
            },
            {
              name: 'participant-list',
              path: 'detail/:id/users',
              component: lazyLoading('events/users-list/users-list'),
            },
          ],
        },
        {
          name: 'get-member',
          path: 'get-member',
          component: EmptyParentComponent,
          children: [
            {
              name: 'leaderboard',
              path: 'leaderboard',
              component: lazyLoading('get-member/leaderboard/leaderboard'),
            },
            {
              name: 'rewards',
              path: 'rewards',
              component: lazyLoading('get-member/rewards/all/all-rewards'),
            },
            {
              name: 'add-rewards',
              path: 'rewards/add',
              component: lazyLoading('get-member/rewards/add/add-rewards'),
            },
            {
              name: 'edit-rewards',
              path: 'rewards/edit/:id',
              component: lazyLoading('get-member/rewards/add/add-rewards'),
            },
          ],
        },
        {
          name: 'feature',
          path: 'feature',
          component: lazyLoading('feature/feature-list'),
        },
        {
          name: 'overseas-phone',
          path: 'overseas-phone',
          component: EmptyParentComponent,
          children: [
            {
              name: 'countries',
              path: 'countries',
              component: EmptyParentComponent,
              children: [
                {
                  name: 'countries',
                  path: '/',
                  component: lazyLoading('overseas-phone/countries'),
                },
                {
                  name: 'add-countries',
                  path: 'add',
                  component: lazyLoading('overseas-phone/add-country'),
                },
                {
                  name: 'edit-countries',
                  path: 'edit/:id',
                  component: lazyLoading('overseas-phone/add-country'),
                },
              ],
            },
          ],
        },
        {
          name: 'soco-point-injection',
          path: 'soco-point-injection',
          component: EmptyParentComponent,
          children: [
            {
              name: 'injection-list',
              path: 'injection-list',
              component: lazyLoading('soco-point-injection/injection-list'),
            },
            {
              name: 'soco-point-injection-report',
              path: 'report',
              component: lazyLoading('soco-point-injection/report'),
            },
            {
              name: 'soco-point-injection-add',
              path: 'add',
              component: lazyLoading('soco-point-injection/add'),
            },
            {
              name: 'soco-point-injection-edit',
              path: 'edit/:id',
              component: lazyLoading('soco-point-injection/add'),
            },
          ],
        },
        {
          name: 'help-page',
          path: 'help',
          component: EmptyParentComponent,
          children: [
            {
              name: 'help-categories',
              path: 'categories',
              component: lazyLoading('help/categories/HelpCategories'),
            },
            {
              name: 'help-sub-categories',
              path: 'categories/:category_id/subcategories',
              props: true,
              component: lazyLoading('help/categories/HelpCategories'),
            },
            {
              name: 'help-category-create',
              path: 'category/create',
              component: lazyLoading('help/categories/HelpCategoriesForm'),
            },
            {
              name: 'help-category-edit',
              path: 'category/:category_id/edit',
              props: true,
              component: lazyLoading('help/categories/HelpCategoriesForm'),
            },
            {
              name: 'help-sub-category-edit',
              path: 'category/:category_id/subcategory/:subcategory_id/edit',
              props: true,
              component: lazyLoading('help/categories/HelpCategoriesForm'),
            },
            {
              name: 'help-content',
              path: 'content',
              component: lazyLoading('help/content/HelpContent'),
            },
            {
              name: 'help-content-create',
              path: 'content/create',
              component: lazyLoading('help/content/HelpContentForm'),
            },
            {
              name: 'help-content-edit',
              path: 'content/:id/edit',
              props: true,
              component: lazyLoading('help/content/HelpContentForm'),
            },
            {
              name: 'help-contact-us',
              path: 'contact-us',
              component: lazyLoading('help/contact-us/HelpContactUs'),
            },
          ],
        },
        {
          name: 'admin-users',
          path: 'admin-users',
          component: EmptyParentComponent,
          children: [
            {
              name: 'admin-users-list',
              path: 'list',
              component: lazyLoading('admin-users/list'),
            },
            {
              name: 'admin-users-roles-list',
              path: 'roles-list',
              component: lazyLoading('admin-users/list-roles'),
            },
          ],
        },
        {
          name: 'third-party-login',
          path: 'third-party-login',
          component: lazyLoading('third-party-login/third-party-login-list'),
        },
      ],
    },
  ],
  mode: 'history',
});

router.beforeEach(async (to, from, next) => {
  const allow = await store.dispatch('checkPermission', to);
  if (!allow && !['admin', 'login', 'unauthorized'].includes(to.name) && store.state.loggedin) {
    next({ name: 'unauthorized' });
  } else {
    next();
  }
});

export default router;

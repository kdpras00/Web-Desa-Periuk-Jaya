import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/views/Dashboard.vue'
import Main from '@/layouts/Main.vue'
import Auth from '@/layouts/Auth.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'
import { can } from '@/helpers/permissionHelper'

import HeadOfFamilies from '@/views/head-of-family/HeadOfFamilies.vue'
import HeadOfFamily from '@/views/head-of-family/HeadOfFamily.vue'
import HeadOfFamilyCreate from '@/views/head-of-family/HeadOfFamilyCreate.vue'
import SocialAssistances from '@/views/social-assistance/SocialAssistances.vue'
import SocialAssistance from '@/views/social-assistance/SocialAssistance.vue'
import SocialAssistanceEdit from '@/views/social-assistance/SocialAssistanceEdit.vue'
import SocialAssistanceCreate from '@/views/social-assistance/SocialAssistanceCreate.vue'
import SocialAssistanceRecipients from '@/views/social-assistance-recipient/SocialAssistanceRecipients.vue'
import SocialAssistanceRecipient from '@/views/social-assistance-recipient/SocialAssistanceRecipient.vue'
import JobVacancies from '@/views/job-vacancy/JobVacancies.vue'
import JobVacancy from '@/views/job-vacancy/JobVacancy.vue'
import JobVacancyCreate from '@/views/job-vacancy/JobVacancyCreate.vue'
import Events from '@/views/event/Events.vue'
import JobVacancyEdit from '@/views/job-vacancy/JobVacancyEdit.vue'
import Event from '@/views/event/Event.vue'
import EventEdit from '@/views/event/EventEdit.vue'
import EventCreate from '@/views/event/EventCreate.vue'
import Profile from '@/views/profile/Profile.vue'
import ProfileCreate from '@/views/profile/ProfileCreate.vue'
import ProfileEdit from '@/views/profile/ProfileEdit.vue'
import FamilyMember from '@/views/family-member/FamilyMember.vue'
import FamilyMembers from '@/views/family-member/FamilyMembers.vue'
import FamilyMemberCreate from '@/views/family-member/FamilyMemberCreate.vue'
import SearchResults from '@/views/SearchResults.vue'
import Notifications from '@/views/Notifications.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Main,
      // children adalah route yang ada di dalam layout main
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
          meta: { requiresAuth: true, permission: 'dashboard-menu' },
        },
        {
          path: 'family-member',
          name: 'family-member',
          component: FamilyMembers,
          meta: { requiresAuth: true, permission: 'family-member-list' },
        },
        {
          path: 'family-member/:id',
          name: 'manage-family-member',
          component: FamilyMember,
          meta: { requiresAuth: true, permission: 'family-member-list' },
        },

        {
          path: 'family-member/create',
          name: 'create-family-member',
          component: FamilyMemberCreate,
          meta: { requiresAuth: true, permission: 'family-member-create' },
        },

        {
          path: 'head-of-family',
          name: 'head-of-family',
          component: HeadOfFamilies,
          meta: { requiresAuth: true, permission: 'head-of-family-list' },
        },

        {
          path: 'head-of-family/:id',
          name: 'manage-head-of-family',
          component: HeadOfFamily,
          meta: { requiresAuth: true, permission: 'head-of-family-list' },
        },
        {
          path: 'head-of-family/create',
          name: 'create-head-of-family',
          component: HeadOfFamilyCreate,
          meta: { requiresAuth: true, permission: 'head-of-family-create' },
        },
        {
          path: 'social-assistance',
          name: 'social-assistance',
          component: SocialAssistances,
          meta: { requiresAuth: true, permission: 'social-assistance-list' },
        },

        {
          path: 'social-assistance/:id',
          name: 'manage-social-assistance',
          component: SocialAssistance,
          meta: { requiresAuth: true, permission: 'social-assistance-list' },
        },

        {
          path: 'social-assistance/edit/:id',
          name: 'edit-social-assistance',
          component: SocialAssistanceEdit,
          meta: { requiresAuth: true, permission: 'social-assistance-edit' },
        },

        {
          path: 'social-assistance/create',
          name: 'create-social-assistance',
          component: SocialAssistanceCreate,
          meta: { requiresAuth: true, permission: 'social-assistance-create' },
        },
        {
          path: 'social-assistance-recipient',
          name: 'social-assistance-recipient',
          component: SocialAssistanceRecipients,
          meta: { requiresAuth: true, permission: 'social-assistance-recipient-list' },
        },

        {
          path: 'social-assistance-recipient/:id',
          name: 'manage-social-assistance-recipient',
          component: SocialAssistanceRecipient,
          meta: { requiresAuth: true, permission: 'social-assistance-recipient-list' },
        },

        {
          path: 'job-vacancy',
          name: 'job-vacancy',
          component: JobVacancies,
          meta: { requiresAuth: true, permission: 'job-vacancy-list' },
        },

        {
          path: 'job-vacancy/:id',
          name: 'manage-job-vacancy',
          component: JobVacancy,
          meta: { requiresAuth: true, permission: 'job-vacancy-list' },
        },

        {
          path: 'job-vacancy/edit/:id',
          name: 'edit-job-vacancy',
          component: JobVacancyEdit,
          meta: { requiresAuth: true, permission: 'job-vacancy-edit' },
        },

        {
          path: 'job-vacancy/create',
          name: 'create-job-vacancy',
          component: JobVacancyCreate,
          meta: { requiresAuth: true, permission: 'job-vacancy-create' },
        },

        {
          path: 'event',
          name: 'event',
          component: Events,
          meta: { requiresAuth: true, permission: 'event-list' },
        },

        {
          path: 'event/:id',
          name: 'manage-event',
          component: Event,
          meta: { requiresAuth: true, permission: 'event-list' },
        },

        {
          path: 'event/edit/:id',
          name: 'edit-event',
          component: EventEdit,
          meta: { requiresAuth: true, permission: 'event-edit' },
        },

        {
          path: 'event/create',
          name: 'create-event',
          component: EventCreate,
          meta: { requiresAuth: true, permission: 'event-create' },
        },

        {
          path: 'profile',
          name: 'profile',
          component: Profile,
          meta: { requiresAuth: true, permission: 'profile-menu' },
        },

        {
          path: 'profile/create',
          name: 'create-profile',
          component: ProfileCreate,
          meta: { requiresAuth: true, permission: 'profile-create' },
        },
        {
          path: 'profile/edit',
          name: 'edit-profile',
          component: ProfileEdit,
          meta: { requiresAuth: true, permission: 'profile-edit' },
        },
        {
          path: 'search',
          name: 'search',
          component: SearchResults,
          meta: { requiresAuth: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: Notifications,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      component: Auth,
      children: [
        {
          path: '',
          name: 'login',
          component: Login,
          meta: { requiresUnauth: true },
        },
      ],
    },
  ],
})

// route untuk dijalankan sebelum route dijalankan
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    // Check if user was previously authenticated (via localStorage flag)
    const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

    if (wasAuthenticated || authStore.isAuthenticated) {
      // If user is already authenticated in store (e.g., just logged in), skip checkAuth
      if (authStore.isAuthenticated) {
        // Skip permission check for dashboard to prevent redirect loops
        // All authenticated users should be able to access dashboard
        if (to.meta.permission && to.name !== 'dashboard' && !can(to.meta.permission)) {
          next({ name: 'dashboard' })
        } else {
          next()
        }
      } else {
        try {
          // Verify authentication status with backend for protected routes
          // This ensures we have the latest auth state after page refreshes
          await authStore.checkAuth()

          // If user is authenticated, allow navigation
          if (authStore.isAuthenticated) {
            // Skip permission check for dashboard to prevent redirect loops
            if (to.meta.permission && to.name !== 'dashboard' && !can(to.meta.permission)) {
              next({ name: 'dashboard' })
            } else {
              next()
            }
          } else {
            next({ name: 'login' })
          }
        } catch (error) {
          // If there's an error checking auth, redirect to login
          next({ name: 'login' })
        }
      }
    } else {
      // No authentication indicator found, redirect to login immediately
      next({ name: 'login' })
    }
  } else if (to.meta.requiresUnauth && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router

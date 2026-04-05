import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/modules/auth/model/store"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/modules/auth/view/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/modules/auth/view/RegisterView.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      component: () => import("@/shared/layouts/AuthenticatedLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "Dashboard",
          component: () => import("@/modules/dashboard/view/DashboardView.vue"),
        },
        {
          path: "accounts-payable",
          name: "AccountsPayable",
          component: () => import("@/modules/accounts-payable/view/AccountsPayableView.vue"),
        },
        {
          path: "transport-card",
          name: "TransportCard",
          component: () => import("@/modules/transport-card/view/TransportCardView.vue"),
        },
      ],
    },
  ],
})

const AUTH_TOKEN_KEY = "auth_token"

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
    authStore.logout(true)
  }
  const requiresAuth = to.meta.requiresAuth === true
  const isPublic = to.meta.public === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: "Login", query: { redirect: to.fullPath } }
  }
  if (isPublic && authStore.isAuthenticated) {
    return { name: "Dashboard" }
  }
  return true
})

export default router

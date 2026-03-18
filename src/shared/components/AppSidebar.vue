<script setup lang="ts">
import { LogOut, Moon, Sun, LayoutDashboard, DollarSign, CreditCard } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/modules/auth/model/store"
import { useTheme } from "@/core/composables/useTheme"
import { Button } from "@/shared/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggle: toggleTheme } = useTheme()

const navItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Accounts payable",
    to: "/accounts-payable",
    icon: DollarSign,
  },
  {
    title: "Transport card",
    to: "/transport-card",
    icon: CreditCard,
  },
]

function logout() {
  authStore.logout()
  router.push({ name: "Login" })
}
</script>

<template>
  <Sidebar side="left">
    <SidebarHeader>
      <div class="flex items-center gap-2 px-2 py-2 font-semibold">
        <span>All-in-One</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.title">
              <SidebarMenuButton as-child :is-active="$route.path === item.to">
                <RouterLink
                  :to="item.to"
                  class="flex items-center gap-2"
                  :data-testid="
                    item.to === '/accounts-payable' ? 'nav-accounts-payable' : undefined
                  "
                >
                  <component :is="item.icon" class="size-4 shrink-0" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <Button variant="ghost" class="w-full justify-start gap-2" @click="toggleTheme">
        <Moon v-if="!isDark" class="size-4 shrink-0" />
        <Sun v-else class="size-4 shrink-0" />
        <span>{{ isDark ? "Light mode" : "Dark mode" }}</span>
      </Button>
      <Button variant="ghost" class="w-full justify-start gap-2" @click="logout">
        <LogOut class="size-4 shrink-0" />
        <span>Log out</span>
      </Button>
    </SidebarFooter>
  </Sidebar>
</template>

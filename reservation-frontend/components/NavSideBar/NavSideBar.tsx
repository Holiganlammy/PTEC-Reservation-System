"use client";

import Link from "next/link";
import {
  User,
  PanelLeft,
  Settings as SettingsIcon,
  LogOut,
  ChevronsUpDown,
  Home,
  Calendar,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  BarChart3,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MENU_CONFIG, findMatchingMenuItem, type MenuItem } from "@/config/permissions";
import { fetchDynamicMenu } from "@/lib/menu";
import { SidebarMenuItem } from "./SidebarMenuItem";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Purethai from "@/image/SHWJSE6g_400x400.jpg";

const ICONS: Record<string, LucideIcon> = {
  Calendar,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
};

const getIcon = (iconName: string) => {
  const Icon = ICONS[iconName] ?? Package;
  return <Icon className="h-4 w-4" />;
};

interface SiteHeaderProps {
  children: React.ReactNode;
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  const { data: session, status: sessionStatus } = useSession({ required: false });
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleId = session?.user?.role_id;
  const staticMenu = useMemo(
    () => MENU_CONFIG.filter((item) => roleId !== undefined && item.roles.includes(roleId)),
    [roleId]
  );

  // source มาจาก claim ที่แต่ละแอปประกาศเองตรงๆ ตอน sign-in (ใน jwt() callback ของตัวเอง)
  // 'portal' = login/เข้ามาทาง Portal → ใช้เมนู dynamic จาก Apps_List_Menu ต่อเนื่อง ให้ดูเนียนเหมือนอยู่ Portal
  // อย่างอื่น (เช่น 'reservation' หรือไม่มีเลย) = เข้าตรงมาที่ reservation → ใช้ staticMenu ทันที ไม่ยิง request หา Portal เลย
  const willTryDynamic = session?.user?.source === "portal";

  const [dynamicMenu, setDynamicMenu] = useState<MenuItem[] | null>(null);
  // "idle" = ยังไม่รู้ต้องลองไหม, "loading" = กำลังยิง Portal อยู่ (ห้ามโชว์ staticMenu แทรกตอนนี้ กันเมนูกระพริบ), "done" = ตัดสินใจแล้วไม่ว่าจะสำเร็จหรือ fallback
  const [dynamicMenuStatus, setDynamicMenuStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const userId = session?.user?.UserID;
    if (!userId) return;

    if (!willTryDynamic) {
      setDynamicMenuStatus("done");
      return;
    }

    let cancelled = false;
    setDynamicMenuStatus("loading");
    fetchDynamicMenu(userId, session?.user?.access_token)
      .then((menu) => {
        if (!cancelled && menu.length > 0) setDynamicMenu(menu);
      })
      .catch(() => {
        // เงียบไว้ — fallback เป็น staticMenu อยู่แล้ว
      })
      .finally(() => {
        if (!cancelled) setDynamicMenuStatus("done");
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.UserID, session?.user?.access_token, willTryDynamic]);

  // ยังโหลด session อยู่ หรือกำลังรอผล dynamic menu จาก Portal — โชว์ skeleton แทน ไม่โชว์ staticMenu แว้บแล้วโดนทับ
  const isMenuLoading = sessionStatus === "loading" || dynamicMenuStatus === "loading";
  const visibleMenu = dynamicMenu ?? staticMenu;
  const currentMenuItem = findMatchingMenuItem(pathname, visibleMenu);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen w-screen overflow-hidden fixed inset-0">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "60px" : "240px" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="bg-[#0a0a0a] border-r border-gray-800 flex flex-col shrink-0 h-full"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-800 min-h-15">
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black overflow-hidden">
                  <Image src={Purethai} alt="Logo" width={32} height={32} className="object-cover rounded-lg" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black overflow-hidden">
                  <Image src={Purethai} alt="Logo" width={32} height={32} className="object-cover rounded-lg" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">PURETHAI ENERGY</span>
                  <span className="text-xs text-gray-400 truncate">Reservation System</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3">
            {!isCollapsed && (
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                Platform
              </h2>
            )}
            <div className="space-y-1">
              {/* Home Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <Button
                      variant="ghost"
                      className={clsx(
                        "w-full h-9 transition-colors",
                        isCollapsed ? "justify-center px-0" : "justify-start gap-2",
                        pathname === "/"
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      <Home className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="text-sm">Home</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>

              {/* Menu Items — จาก Portal (dynamic, มี tree) หรือ MENU_CONFIG (static fallback) */}
              {isMenuLoading ? (
                <MenuSkeleton isCollapsed={isCollapsed} />
              ) : (
                visibleMenu.map((item) => (
                  <SidebarMenuItem
                    key={item.path || item.label}
                    item={item}
                    activePath={pathname}
                    isCollapsed={isCollapsed}
                    getIcon={getIcon}
                  />
                ))
              )}
            </div>
          </div>

          {/* Projects Section */}
          {!isCollapsed && (
            <div className="px-3 mt-6">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                Projects
              </h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-800 h-9"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Design Engineering</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-gray-800 h-9"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Sales & Marketing</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="border-t border-gray-800 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={clsx(
                  "w-full h-auto py-2 hover:bg-gray-800 aria-expanded:bg-gray-800 aria-expanded:text-white",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-2"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={session?.user?.img_profile} />
                  <AvatarFallback className="bg-purple-600">
                    <User className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-start text-left flex-1 min-w-0 overflow-hidden"
                    >
                      <span className="text-sm font-medium text-white truncate w-full">
                        {session?.user?.UserCode || "Guest"}
                      </span>
                      <span className="text-xs text-gray-400 truncate w-full">
                        {session?.user?.Email || "m@example.com"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isCollapsed && <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 bg-[#0a0a0a] border-gray-800 text-white"
              align={isCollapsed ? "end" : "start"}
              side="right"
            >
              <DropdownMenuLabel className="text-gray-400">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">
                    {session?.user ? `${session.user.fristName} ${session.user.lastName}` : "-"}
                  </p>
                  <p className="text-xs text-gray-500">{session?.user?.Email || "m@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 text-gray-300">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 text-gray-300">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-400 hover:bg-gray-800 focus:bg-gray-800"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Top Header */}
        <div className="h-15 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-6 shrink-0 gap-4">
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 shrink-0">
            <PanelLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Reservation System</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              {currentMenuItem?.label ?? (pathname === "/" ? "Home" : pathname.split("/").pop())}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-background">{children}</div>
      </div>
    </div>
  );
}

function MenuSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="space-y-1" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-9 animate-pulse rounded-lg bg-gray-800/60",
            isCollapsed ? "mx-auto w-9" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

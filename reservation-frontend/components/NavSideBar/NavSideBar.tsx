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
  Package,
  BarChart3,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { MENU_CONFIG } from "@/config/permissions";
import { SidebarMenuItem } from "./SidebarMenuItem";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Purethai from "@/image/SHWJSE6g_400x400.jpg";

const ICONS: Record<string, LucideIcon> = {
  Calendar,
};

const getIcon = (iconName: string) => {
  const Icon = ICONS[iconName] ?? Package;
  return <Icon className="h-4 w-4" />;
};

interface SiteHeaderProps {
  children: React.ReactNode;
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  const { data: session } = useSession({ required: false });
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleId = session?.user?.role_id;
  const visibleMenu = useMemo(
    () => MENU_CONFIG.filter((item) => roleId !== undefined && item.roles.includes(roleId)),
    [roleId]
  );

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

              {/* Menu Items — จาก MENU_CONFIG (static), กรองตาม role_id */}
              {visibleMenu.map((item) => (
                <SidebarMenuItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  icon={getIcon(item.icon)}
                  activePath={pathname}
                  isCollapsed={isCollapsed}
                />
              ))}
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
            <span>Building Your Application</span>
            <span>/</span>
            <span className="text-foreground font-medium">{pathname.split("/").pop() || "Home"}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-background">{children}</div>
      </div>
    </div>
  );
}

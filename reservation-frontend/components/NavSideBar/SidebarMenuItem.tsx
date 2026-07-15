"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { normalizePathname, type MenuItem } from "@/config/permissions";

interface SidebarMenuItemProps {
  item: MenuItem;
  activePath: string;
  isCollapsed: boolean;
  getIcon: (iconName: string) => ReactNode;
  level?: number;
}

export function SidebarMenuItem({
  item,
  activePath,
  isCollapsed,
  getIcon,
  level = 0,
}: SidebarMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const hasPath = Boolean(item.path);
  // item.path อาจเป็น URL เต็มคนละ origin (เช่น Portal ชี้มา reservation) — ต้องตัด origin ออกก่อนเทียบ
  const normalizedItemPath = hasPath ? normalizePathname(item.path) : "";
  const isActive =
    hasPath && (activePath === normalizedItemPath || activePath.startsWith(`${normalizedItemPath}/`));

  const paddingLeft = isCollapsed ? 0 : level * 12;

  const toggleOpen = () => {
    if (hasChildren) setIsOpen((v) => !v);
  };

  const buttonContent = (
    <Button
      variant="ghost"
      className={clsx(
        "w-full h-9 transition-colors",
        isCollapsed ? "justify-center px-0" : "justify-start",
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
      style={{ paddingLeft: isCollapsed ? undefined : `${paddingLeft + 10}px` }}
      onClick={(e) => {
        // มี children ทั้ง toggle เปิด/ปิด และมี path จริงด้วย (ไม่ใช่แค่หัวข้อ) — กดแล้ว toggle ไม่ navigate
        if (hasChildren && !isCollapsed && hasPath) {
          e.preventDefault();
          toggleOpen();
        } else if (hasChildren && !hasPath) {
          toggleOpen();
        }
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0">{getIcon(item.icon)}</span>
        {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
      </div>
      {!isCollapsed && hasChildren && (
        <span className="shrink-0 ml-auto">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      )}
    </Button>
  );

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {hasPath ? (
              <Link href={item.path} className="block">
                {buttonContent}
              </Link>
            ) : (
              buttonContent
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>

      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-1 mt-1">
                {item.children?.map((child) => (
                  <SidebarMenuItem
                    key={child.path || child.label}
                    item={child}
                    activePath={activePath}
                    isCollapsed={isCollapsed}
                    getIcon={getIcon}
                    level={level + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JSX } from "react";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarMenuItemProps {
  label: string;
  path: string;
  icon: JSX.Element;
  activePath: string;
  isCollapsed: boolean;
}

export function SidebarMenuItem({
  label,
  path,
  icon,
  activePath,
  isCollapsed,
}: SidebarMenuItemProps) {
  const isActive = activePath === path || activePath.startsWith(`${path}/`);

  const buttonContent = (
    <Button
      variant="ghost"
      className={clsx(
        "w-full h-9 transition-colors",
        isCollapsed ? "justify-center px-0" : "justify-start gap-2",
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {!isCollapsed && <span className="text-sm truncate">{label}</span>}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={path} className="block">
          {buttonContent}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white border-gray-800">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

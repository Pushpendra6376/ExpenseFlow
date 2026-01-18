"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// ---------------- Sidebar Context ----------------

const SidebarContext = createContext(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, style, className, children, ...props }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = useCallback((value) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) setOpenProp(openState)
    else _setOpen(openState)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [setOpenProp, open])

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile(o => !o) : setOpen(o => !o)
  }, [isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = useMemo(() => ({
    state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style }}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// ---------------- Sidebar Base ----------------

function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div className={cn("bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col", className)} {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent data-sidebar="sidebar" className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="group peer text-sidebar-foreground hidden md:block" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
      <div className={cn("relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear")}></div>
      <div className={cn("fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0" : "right-0")}>
        <div className="bg-sidebar flex h-full w-full flex-col">{children}</div>
      </div>
    </div>
  )
}

// ---------------- Sidebar Helpers ----------------

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={(e) => { onClick?.(e); toggleSidebar() }} {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()
  return <button onClick={toggleSidebar} className={cn("absolute inset-y-0 z-20 hidden w-4 sm:flex", className)} {...props} />
}

function SidebarInset({ className, ...props }) {
  return <main className={cn("bg-background relative flex w-full flex-1 flex-col", className)} {...props} />
}

function SidebarInput({ className, ...props }) {
  return <Input className={cn("bg-background h-8 w-full shadow-none", className)} {...props} />
}

function SidebarHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarFooter({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarSeparator({ className, ...props }) {
  return <Separator className={cn("bg-sidebar-border mx-2 w-auto", className)} {...props} />
}

function SidebarContent({ className, ...props }) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)} {...props} />
}

function SidebarGroup({ className, ...props }) {
  return <div className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
}

function SidebarGroupLabel({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "div"
  return <Comp className={cn("text-sidebar-foreground/70 ring-sidebar-ring flex h-8 items-center rounded-md px-2 text-xs font-medium", className)} {...props} />
}

function SidebarGroupAction({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn("absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0", className)} {...props} />
}

function SidebarGroupContent({ className, ...props }) {
  return <div className={cn("w-full text-sm", className)} {...props} />
}

// ---------------- Sidebar Menu ----------------

function SidebarMenu({ className, ...props }) {
  return <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }) {
  return <li className={cn("group/menu-item relative", className)} {...props} />
}

function SidebarMenuButton({ asChild = false, isActive = false, tooltip, className, ...props }) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()
  const button = <Comp className={cn("peer/menu-button flex w-full items-center gap-2 rounded-md p-2", className)} {...props} />
  if (!tooltip) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function SidebarMenuAction({ className, asChild = false, showOnHover = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn("absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0", className)} {...props} />
}

function SidebarMenuBadge({ className, ...props }) {
  return <div className={cn("absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium", className)} {...props} />
}

function SidebarMenuSkeleton({ className, showIcon = false, ...props }) {
  const width = useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])
  return (
    <div className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton className="h-4 max-w-[var(--skeleton-width)] flex-1" style={{ "--skeleton-width": width }} />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }) {
  return <ul className={cn("mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", className)} {...props} />
}

function SidebarMenuSubItem({ className, ...props }) {
  return <li className={cn("group/menu-sub-item relative", className)} {...props} />
}

function SidebarMenuSubButton({ asChild = false, size = "md", isActive = false, className, ...props }) {
  const Comp = asChild ? Slot : "a"
  return <Comp className={cn("flex h-7 items-center gap-2 rounded-md px-2", className)} {...props} />
}

// ---------------- Exports ----------------

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

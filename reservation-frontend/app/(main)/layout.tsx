// app/(main)/layout.tsx
import NavSideBar from "@/components/NavSideBar/NavSideBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <NavSideBar>{children}</NavSideBar>;
}

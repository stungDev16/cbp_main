import type DefaultProps from "@type/pages/defaultProps.interface.ts";
import React from "react";
import { Sidebar } from "@/layout/sidebar/dashboard-sidebar";
import HeaderDashboard from "./header/HeaderDashboard";

function DashboardLayout({
  children,
  ...props
}: DefaultProps & { children?: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen bg-background h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <HeaderDashboard />
          <main className="flex-1 p-7 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 overflow-y-auto">
            {React.Children.map(children, (child) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              React.cloneElement(child as React.ReactElement<any>, { ...props })
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;

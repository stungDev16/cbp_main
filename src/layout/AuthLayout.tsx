import type DefaultProps from "@type/pages/defaultProps.interface.ts";
import { GalleryVerticalEnd } from "lucide-react";
import React from "react";

function AuthLayout({
  children,
  ...props
}: DefaultProps & { children?: React.ReactNode }) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          CloudBoxPhone
        </a>
        {React.Children.map(children, (child) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.cloneElement(child as React.ReactElement<any>, { ...props })
        )}
      </div>
    </div>
  );
}

export default AuthLayout;

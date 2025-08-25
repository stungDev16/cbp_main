import type DefaultProps from "@type/pages/defaultProps.interface.ts";
import React from "react";

export interface RoutesMapInterface {
  link: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Element: React.FC<any>;
  Layout?: React.FC<DefaultProps & { children?: React.ReactNode }>;
  nested?: RoutesMapInterface[];
}

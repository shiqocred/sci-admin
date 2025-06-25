import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { Fragment, ReactNode } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";

export const ContainerPage = ({
  children,
  breadcrumbs,
}: {
  children: ReactNode;
  breadcrumbs?: { label: string; url?: string }[];
}) => {
  return (
    <div className="h-full w-full">
      <div className="w-full flex items-center h-14 border-b border-gray-200 px-4 gap-4">
        <SidebarTrigger />
        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              {breadcrumbs.length === 1 && (
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbs[0].label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              )}
              {breadcrumbs.length >= 2 && (
                <BreadcrumbList>
                  {breadcrumbs
                    .slice(0, breadcrumbs.length - 1)
                    .map((breadcrumb) => (
                      <Fragment key={breadcrumb.label}>
                        <BreadcrumbItem>
                          {breadcrumb.url ? (
                            <BreadcrumbLink href={breadcrumb.url}>
                              {breadcrumb.label}
                            </BreadcrumbLink>
                          ) : (
                            breadcrumb.label
                          )}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </Fragment>
                    ))}
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {breadcrumbs[breadcrumbs.length - 1].label}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              )}
            </Breadcrumb>
          </>
        )}
      </div>
      <div className="flex justify-center px-6 py-8">
        <div className="w-full max-w-6xl">{children}</div>
      </div>
    </div>
  );
};

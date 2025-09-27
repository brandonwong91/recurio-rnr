"use client";

import { cn } from "~/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import rehypeRaw from "rehype-raw";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      rehypePlugins={[rehypeRaw]}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";

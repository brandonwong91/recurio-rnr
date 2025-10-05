import { type ComponentProps, memo } from "react";
import { cn } from "~/lib/utils";
import { View } from "react-native";

// 1. Rename the component type and export
type ResponseViewProps = ComponentProps<typeof View>;

export const ResponseView = memo(
  ({ className, ...props }: ResponseViewProps) => (
    <View
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  // This logic for memoization might need adjustment depending on your actual needs.
  // Using shallow comparison (next vs prev props) is safer than just children:
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

ResponseView.displayName = "ResponseView"; // 2. Update displayName

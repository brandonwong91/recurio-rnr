"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { ChatStatus, FileUIPart } from "ai";
import {
  ImageIcon,
  Loader2Icon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  SquareIcon,
  XIcon,
} from "lucide-react-native";
import { nanoid } from "nanoid";
import {
  type ChangeEventHandler,
  Children,
  type ClipboardEventHandler,
  type ComponentProps,
  createContext,
  Fragment,
  type KeyboardEventHandler,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, Platform, View } from "react-native";

type AttachmentsContext = {
  files: (FileUIPart & { id: string })[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  // Add text state and submit handler
  text: string;
  setText: (text: string) => void;
  submit: () => void;
};

const AttachmentsContext = createContext<AttachmentsContext | null>(null);

export const usePromptInputAttachments = () => {
  const context = useContext(AttachmentsContext);

  if (!context) {
    throw new Error(
      "usePromptInputAttachments must be used within a PromptInput"
    );
  }

  return context;
};

export type PromptInputAttachmentProps = ComponentProps<typeof View> & {
  data: FileUIPart & { id: string };
  className?: string;
};

export function PromptInputAttachment({
  data,
  className,
  ...props
}: PromptInputAttachmentProps) {
  const attachments = usePromptInputAttachments();

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View
      className={cn("group relative h-14 w-14 rounded-md border", className)}
      key={data.id}
      {...props}
    >
      {data.mediaType?.startsWith("image/") && data.url ? (
        <Image
          accessibilityLabel={data.filename || "attachment"}
          className="size-full rounded-md object-cover"
          source={{ uri: data.url }}
        />
      ) : (
        <View className="flex size-full items-center justify-center text-muted-foreground">
          <PaperclipIcon className="size-4" />
        </View>
      )}
      <Button
        aria-label="Remove attachment"
        className="-right-1.5 -top-1.5 absolute h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
        onPress={() => attachments.remove(data.id)}
        size="icon"
        type="button"
        variant="outline"
      >
        <XIcon className="h-3 w-3" />
      </Button>
    </View>
  );
}

export type PromptInputAttachmentsProps = Omit<
  ComponentProps<typeof View>,
  "children"
> & {
  children: (attachment: FileUIPart & { id: string }) => React.ReactNode;
};

export function PromptInputAttachments({
  className,
  children,
  ...props
}: PromptInputAttachmentsProps) {
  const attachments = usePromptInputAttachments();
  const [height, setHeight] = useState(0);
  const contentRef = useRef<View>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }
    if (Platform.OS === "web") {
      const ro = new ResizeObserver(() => {
        // @ts-ignore
        setHeight(el.getBoundingClientRect().height);
      });
      // @ts-ignore
      ro.observe(el);
      // @ts-ignore
      setHeight(el.getBoundingClientRect().height);
      return () => ro.disconnect();
    }
  }, []);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View
      aria-live="polite"
      className={cn(
        "overflow-hidden transition-[height] duration-200 ease-out",
        className
      )}
      style={{ height: attachments.files.length ? height : 0 }}
      {...props}
    >
      <View className="flex flex-wrap gap-2 p-3 pt-3" ref={contentRef}>
        {attachments.files.map((file) => (
          <Fragment key={file.id}>{children(file)}</Fragment>
        ))}
      </View>
    </View>
  );
}

export type PromptInputActionAddAttachmentsProps = ComponentProps<
  typeof DropdownMenuItem
> & {
  label?: string;
};

export const PromptInputActionAddAttachments = ({
  label = "Add photos or files",
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <DropdownMenuItem
      {...props}
      onPress={(e) => {
        e.preventDefault();
        attachments.openFileDialog();
      }}
    >
      <ImageIcon className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};

export type PromptInputMessage = {
  text?: string;
  files?: FileUIPart[];
};

export type PromptInputProps = Omit<ComponentProps<typeof View>, "onSubmit"> & {
  accept?: string; // e.g., 'image/*' or leave undefined for any
  multiple?: boolean;
  // When true, accepts drops anywhere on document. Default false (opt-in).
  globalDrop?: boolean;
  // Render a hidden input with given name and keep it in sync for native form posts. Default false.
  syncHiddenInput?: boolean;
  // Minimal constraints
  maxFiles?: number;
  maxFileSize?: number; // bytes
  onError?: (err: {
    code: "max_files" | "max_file_size" | "accept";
    message: string;
  }) => void;
  onSubmit: (message: PromptInputMessage) => void;
};

export const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
  const [text, setText] = useState(""); // Added text state
  const inputRef = useRef<HTMLInputElement | null>(null);
  const anchorRef = useRef<View>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Find nearest form to scope drag & drop
  useEffect(() => {
    if (Platform.OS === "web") {
      const domNode = anchorRef.current as unknown as HTMLElement;
      const root = domNode?.closest("form");
      if (root) {
        formRef.current = root;
      }
    }
  }, []);

  const openFileDialog = useCallback(() => {
    if (Platform.OS === "web") {
      inputRef.current?.click();
    }
  }, []);

  const matchesAccept = useCallback(
    (f: File) => {
      if (!accept || accept.trim() === "") {
        return true;
      }
      // Simple check: if accept includes 'image/*', filter to images; otherwise allow.
      if (accept.includes("image/*")) {
        return f.type.startsWith("image/");
      }
      return true;
    },
    [accept]
  );

  const add = useCallback(
    (files: File[] | FileList) => {
      if (Platform.OS !== "web") return;
      const incoming = Array.from(files);
      const accepted = incoming.filter((f) => matchesAccept(f));
      if (accepted.length === 0) {
        onError?.({
          code: "accept",
          message: "No files match the accepted types.",
        });
        return;
      }
      const withinSize = (f: File) =>
        maxFileSize ? f.size <= maxFileSize : true;
      const sized = accepted.filter(withinSize);
      if (sized.length === 0 && accepted.length > 0) {
        onError?.({
          code: "max_file_size",
          message: "All files exceed the maximum size.",
        });
        return;
      }
      setItems((prev) => {
        const capacity =
          typeof maxFiles === "number"
            ? Math.max(0, maxFiles - prev.length)
            : undefined;
        const capped =
          typeof capacity === "number" ? sized.slice(0, capacity) : sized;
        if (typeof capacity === "number" && sized.length > capacity) {
          onError?.({
            code: "max_files",
            message: "Too many files. Some were not added.",
          });
        }
        const next: (FileUIPart & { id: string })[] = [];
        for (const file of capped) {
          next.push({
            id: nanoid(),
            type: "file",
            url: URL.createObjectURL(file),
            mediaType: file.type,
            filename: file.name,
          });
        }
        return prev.concat(next);
      });
    },
    [matchesAccept, maxFiles, maxFileSize, onError]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((file) => file.id === id);
      if (found?.url && Platform.OS === "web") {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((file) => file.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      for (const file of prev) {
        if (file.url && Platform.OS === "web") {
          URL.revokeObjectURL(file.url);
        }
      }
      return [];
    });
  }, []);

  // Note: File input cannot be programmatically set for security reasons
  // The syncHiddenInput prop is no longer functional
  useEffect(() => {
    if (syncHiddenInput && inputRef.current && Platform.OS === "web") {
      // Clear the input when items are cleared
      if (items.length === 0) {
        inputRef.current.value = "";
      }
    }
  }, [items, syncHiddenInput]);

  // Attach drop handlers on nearest form and document (opt-in)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const form = formRef.current;
    if (!form) {
      return;
    }
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    // @ts-ignore
    form.addEventListener("dragover", onDragOver);
    // @ts-ignore
    form.addEventListener("drop", onDrop);
    return () => {
      // @ts-ignore
      form.removeEventListener("dragover", onDragOver);
      // @ts-ignore
      form.removeEventListener("drop", onDrop);
    };
  }, [add]);

  useEffect(() => {
    if (Platform.OS !== "web" || !globalDrop) {
      return;
    }
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.files) {
      add(event.currentTarget.files);
    }
  };

  const convertBlobUrlToDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submit = () => {
    if (Platform.OS === "web") {
      Promise.all(
        items.map(async ({ id, ...item }) => {
          if (item.url && item.url.startsWith("blob:")) {
            return {
              ...item,
              url: await convertBlobUrlToDataUrl(item.url),
            };
          }
          return item;
        })
      ).then((files: FileUIPart[]) => {
        onSubmit({ text, files });
        clear();
        setText("");
      });
    } else {
      onSubmit({ text, files: items });
      clear();
      setText("");
    }
  };

  const ctx = useMemo<AttachmentsContext>(
    () => ({
      files: items.map((item) => ({ ...item, id: item.id })),
      add,
      remove,
      clear,
      openFileDialog,
      fileInputRef: inputRef,
      text,
      setText,
      submit,
    }),
    [items, add, remove, clear, openFileDialog, text]
  );

  return (
    <AttachmentsContext.Provider value={ctx}>
      <View aria-hidden={true} className="hidden" ref={anchorRef} />
      {Platform.OS === "web" && (
        <input
          accept={accept}
          className="hidden"
          multiple={multiple}
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
      )}
      <View
        className={cn(
          "w-full divide-y overflow-hidden rounded-xl border bg-background shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </View>
    </AttachmentsContext.Provider>
  );
};

export type PromptInputBodyProps = ComponentProps<typeof View>;

export const PromptInputBody = ({
  className,
  ...props
}: PromptInputBodyProps) => (
  <View className={cn(className, "flex flex-col")} {...props} />
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea>;

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) => {
  const attachments = usePromptInputAttachments();

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      attachments.submit();
    }
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (Platform.OS !== "web") return;
    const items = event.clipboardData?.items;

    if (!items) {
      return;
    }

    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      attachments.add(files);
    }
  };

  const handleChange = (e: any) => {
    if (Platform.OS === "web") {
      attachments.setText(e.target.value);
      onChange?.(e);
    } else {
      attachments.setText(e.nativeEvent.text);
      onChange?.(e);
    }
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0",
        "field-sizing-content bg-transparent dark:bg-transparent",
        "max-h-48 min-h-16",
        "focus-visible:ring-0",
        className
      )}
      name="message"
      value={attachments.text}
      onChange={handleChange}
      onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
      onPaste={Platform.OS === "web" ? handlePaste : undefined}
      onSubmitEditing={Platform.OS !== "web" ? attachments.submit : undefined}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = ComponentProps<typeof View>;

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <View
    className={cn("flex items-center justify-between p-1", className)}
    {...props}
  />
);

export type PromptInputToolsProps = ComponentProps<typeof View>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <View
    className={cn(
      "flex items-center gap-1",
      "[&_button:first-child]:rounded-bl-xl",
      className
    )}
    {...props}
  />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({
  variant = "ghost",
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    size ?? Children.count(props.children) > 1 ? "default" : "icon";

  return (
    <Button
      className={cn(
        "shrink-0 gap-1.5 rounded-lg",
        variant === "ghost" && "text-muted-foreground",
        newSize === "default" && "px-3",
        className
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu>;
export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => (
  <DropdownMenu {...props} />
);

export type PromptInputActionMenuTriggerProps = ComponentProps<
  typeof Button
> & {};
export const PromptInputActionMenuTrigger = ({
  className,
  children,
  ...props
}: PromptInputActionMenuTriggerProps) => (
  <DropdownMenuTrigger asChild>
    <PromptInputButton className={className} {...props}>
      {children ?? <PlusIcon className="size-4" />}
    </PromptInputButton>
  </DropdownMenuTrigger>
);

export type PromptInputActionMenuContentProps = ComponentProps<
  typeof DropdownMenuContent
>;
export const PromptInputActionMenuContent = ({
  className,
  ...props
}: PromptInputActionMenuContentProps) => (
  <DropdownMenuContent align="start" className={cn(className)} {...props} />
);

export type PromptInputActionMenuItemProps = ComponentProps<
  typeof DropdownMenuItem
>;
export const PromptInputActionMenuItem = ({
  className,
  ...props
}: PromptInputActionMenuItemProps) => (
  <DropdownMenuItem className={cn(className)} {...props} />
);

// Note: Actions that perform side-effects (like opening a file dialog)
// are provided in opt-in modules (e.g., prompt-input-attachments).

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  const { submit } = usePromptInputAttachments();
  let Icon = <SendIcon className="size-4" />;

  if (status === "submitted") {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === "streaming") {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === "error") {
    Icon = <XIcon className="size-4" />;
  }

  return (
    <Button
      aria-label="Submit"
      className={cn("gap-1.5 rounded-lg text-white dark:text-black", className)}
      size={size}
      onPress={submit}
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
  <Select {...props} />
);

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
      "hover:bg-accent hover:text-foreground",
      className
    )}
    {...props}
  />
);

export type PromptInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>;

export const PromptInputModelSelectContent = ({
  className,
  ...props
}: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({
  className,
  ...props
}: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<
  typeof SelectValue
>;

export const PromptInputModelSelectValue = ({
  className,
  ...props
}: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);

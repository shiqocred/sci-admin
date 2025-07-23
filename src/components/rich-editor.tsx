"use client";

import { Underline } from "@tiptap/extension-underline";
import { Bold } from "@tiptap/extension-bold";
import { Heading } from "@tiptap/extension-heading";
import {
  Editor,
  EditorContent,
  EditorContentProps,
  useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { forwardRef, useEffect } from "react";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  BoldIcon,
  Heading1,
  Heading2,
  Heading3,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Strikethrough,
  UnderlineIcon,
  Undo2,
} from "lucide-react";

const Toolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div
      className={cn(
        "flex-wrap flex items-center gap-1 border rounded-t-md border-gray-300"
      )}
    >
      <div className="flex items-center gap-1 p-1 border-r border-gray-300">
        <TooltipText value="Bold">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("bold") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().toggleBold().run()}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Italic">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("italic") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Strikethrough">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("strike") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Underline">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("underline") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-3.5" />
          </Button>
        </TooltipText>
      </div>

      <div className="flex items-center gap-1 p-1 border-r border-gray-300">
        <TooltipText value="Paragraph">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("paragraph") && "bg-gray-300 hover:bg-gray-200"
            )}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Heading 1">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              editor.isActive("heading", { level: 1 }) &&
                "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Heading 2">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              editor.isActive("heading", { level: 2 }) &&
                "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Heading 3">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              editor.isActive("heading", { level: 3 }) &&
                "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-3.5" />
          </Button>
        </TooltipText>
      </div>

      <div className="flex items-center gap-1 p-1 border-r border-gray-300">
        <TooltipText value="Bullet List">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("bulletList") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Numbered List">
          <Button
            size="icon"
            variant={"ghost"}
            className={cn(
              "hover:bg-gray-200 size-7",
              editor.isActive("orderedList") && "bg-gray-300 hover:bg-gray-200"
            )}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-3.5" />
          </Button>
        </TooltipText>
      </div>

      <div className="flex items-center gap-1 p-1 border-r border-gray-300">
        <TooltipText value="Outdent">
          <Button
            size="icon"
            variant="ghost"
            className="px-2 hover:bg-gray-200 size-7"
            disabled={
              !editor.can().chain().focus().liftListItem("listItem").run()
            }
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
          >
            <IndentDecrease className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Indent">
          <Button
            size="icon"
            variant="ghost"
            className="px-2 hover:bg-gray-200 size-7"
            disabled={
              !editor.can().chain().focus().sinkListItem("listItem").run()
            }
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
          >
            <IndentIncrease className="size-3.5" />
          </Button>
        </TooltipText>
      </div>

      <div className="flex items-center gap-1 p-1">
        <TooltipText value="Undo">
          <Button
            size="icon"
            variant="ghost"
            className="px-2 hover:bg-gray-200 size-7"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-3.5" />
          </Button>
        </TooltipText>

        <TooltipText value="Redo">
          <Button
            size="icon"
            variant="ghost"
            className="px-2 hover:bg-gray-200 size-7"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-3.5" />
          </Button>
        </TooltipText>
      </div>
    </div>
  );
};

type RichInputProps = {
  content?: string;
  onChange?: (value: string) => void;
  className?: string;
  editorClassName?: string;
} & Omit<
  EditorContentProps,
  "ref" | "editor" | "content" | "value" | "onChange" | "className"
>;

export const RichInput = forwardRef<Editor, RichInputProps>(
  (
    { content, onChange, className, editorClassName, ...props },
    _ref // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    const editor = useEditor({
      extensions: [StarterKit, Underline, Bold, Heading],
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm prose-zinc max-h-[225px] max-w-none overflow-y-scroll dark:prose-invert focus:outline-none [&_*]:my-2",
            editorClassName
          ),
        },
      },
      content,
      parseOptions: { preserveWhitespace: "full" },
      onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
      immediatelyRender: false,
    });

    useEffect(() => {
      if (editor && content !== undefined && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    if (!editor) {
      return (
        <div className="space-y-2">
          <Skeleton className={cn("h-[42px] w-full")} />
          <Skeleton className="h-[90px] w-full" />
        </div>
      );
    }

    return (
      <div>
        <Toolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={cn(
            "grid min-h-[250px] w-full  border bg-transparent px-3 py-2 text-sm placeholder:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 antialiased border-gray-300 border-t-0 rounded-b-md prose-headings:font-normal ",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

RichInput.displayName = "RichInput";

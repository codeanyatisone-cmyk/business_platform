import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Type,
  Highlighter,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Начните писать...',
  editable = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Введите URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Введите URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const MenuButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: React.ReactNode;
    title: string;
  }> = ({ onClick, isActive, disabled, icon, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Text formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={<Bold className="h-4 w-4" />}
              title="Жирный (Ctrl+B)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={<Italic className="h-4 w-4" />}
              title="Курсив (Ctrl+I)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              icon={<UnderlineIcon className="h-4 w-4" />}
              title="Подчеркнутый (Ctrl+U)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              icon={<Strikethrough className="h-4 w-4" />}
              title="Зачеркнутый"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              icon={<Code className="h-4 w-4" />}
              title="Код"
            />
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              icon={<Heading1 className="h-4 w-4" />}
              title="Заголовок 1"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              icon={<Heading2 className="h-4 w-4" />}
              title="Заголовок 2"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              icon={<Heading3 className="h-4 w-4" />}
              title="Заголовок 3"
            />
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={<List className="h-4 w-4" />}
              title="Маркированный список"
            />
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={<ListOrdered className="h-4 w-4" />}
              title="Нумерованный список"
            />
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              icon={<AlignLeft className="h-4 w-4" />}
              title="По левому краю"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              icon={<AlignCenter className="h-4 w-4" />}
              title="По центру"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              icon={<AlignRight className="h-4 w-4" />}
              title="По правому краю"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              icon={<AlignJustify className="h-4 w-4" />}
              title="По ширине"
            />
          </div>

          {/* Other */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={<Quote className="h-4 w-4" />}
              title="Цитата"
            />
            <MenuButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              icon={<Minus className="h-4 w-4" />}
              title="Горизонтальная линия"
            />
            <MenuButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              icon={<LinkIcon className="h-4 w-4" />}
              title="Вставить ссылку"
            />
            <MenuButton
              onClick={addImage}
              icon={<ImageIcon className="h-4 w-4" />}
              title="Вставить изображение"
            />
            <MenuButton
              onClick={addTable}
              icon={<TableIcon className="h-4 w-4" />}
              title="Вставить таблицу"
            />
          </div>

          {/* Color & Highlight */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              title="Цвет текста"
              className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            >
              <Type className="h-4 w-4" />
            </button>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              icon={<Highlighter className="h-4 w-4" />}
              title="Выделить текст"
            />
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              icon={<Undo className="h-4 w-4" />}
              title="Отменить (Ctrl+Z)"
            />
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              icon={<Redo className="h-4 w-4" />}
              title="Повторить (Ctrl+Shift+Z)"
            />
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none p-4">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};


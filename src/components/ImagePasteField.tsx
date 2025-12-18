import React, { useState, useRef } from "react";

interface ImagePasteFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  image?: string;
  onImageChange: (imageData: string | undefined) => void;
}

export function ImagePasteField({
  value,
  onChange,
  placeholder = "Enter question here...",
  image,
  onImageChange,
}: ImagePasteFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            onImageChange(result);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onImageChange(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    onImageChange(undefined);
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative ${isDragging ? "bg-blue-50 border-blue-300" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
          rows={3}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-75 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
            <p className="text-blue-600 font-medium">Drop image here</p>
          </div>
        )}
      </div>

      {image && (
        <div className="relative inline-block">
          <img
            src={image}
            alt="Question image"
            className="max-w-full max-h-64 rounded-lg border border-gray-200"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <p className="text-xs text-gray-600">
        💡 Tip: Paste or drag & drop images directly into the text field
      </p>
    </div>
  );
}

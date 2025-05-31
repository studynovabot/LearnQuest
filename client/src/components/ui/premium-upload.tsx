import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { UploadIcon, FileIcon, ImageIcon, XIcon, CheckIcon } from "./icons";
import { PremiumCard } from "./premium-card";
import { GradientButton } from "./premium-button";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";

interface PremiumUploadProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
  variant?: "default" | "image" | "document";
  disabled?: boolean;
}

const PremiumUpload: React.FC<PremiumUploadProps> = ({
  onFileSelect,
  accept = "*/*",
  multiple = false,
  maxSize = 10,
  className,
  variant = "default",
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { selectedTheme, themeConfig } = useAdvancedTheme();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Validate file sizes
    const validFiles = Array.from(files).filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length !== files.length) {
      // Show error for oversized files
      console.warn(`Some files exceed the ${maxSize}MB limit`);
    }

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onFileSelect(fileList.files);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "image":
        return <ImageIcon size={48} className="text-primary" />;
      case "document":
        return <FileIcon size={48} className="text-primary" />;
      default:
        return <UploadIcon size={48} className="text-primary" />;
    }
  };

  const getTitle = () => {
    switch (variant) {
      case "image":
        return "Upload Images";
      case "document":
        return "Upload Documents";
      default:
        return "Upload Files";
    }
  };

  const getDescription = () => {
    switch (variant) {
      case "image":
        return "Drag and drop images here, or click to browse";
      case "document":
        return "Drag and drop documents here, or click to browse";
      default:
        return "Drag and drop files here, or click to browse";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        <PremiumCard
          variant="glass"
          className={cn(
            "cursor-pointer transition-all duration-300 border-2 border-dashed theme-transition",
            isDragOver && !disabled && getThemeAwareDragOverClasses(selectedTheme),
            !isDragOver && getThemeAwareUploadBorderClasses(selectedTheme),
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "animate-pulse"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 text-center">
            <motion.div
              animate={{
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
              className="mb-4 flex justify-center"
            >
              {getIcon()}
            </motion.div>

            <h3 className="text-lg font-semibold mb-2">{getTitle()}</h3>
            <p className="text-muted-foreground mb-4">{getDescription()}</p>

            <div className="text-sm text-muted-foreground">
              <p>Maximum file size: {maxSize}MB</p>
              {multiple && <p>Multiple files supported</p>}
            </div>

            <div className="mt-6">
              <GradientButton
                gradient={getThemeAwareButtonGradient(selectedTheme)}
                size="lg"
                disabled={disabled}
                className={getThemeAwareButtonShadow(selectedTheme)}
              >
                <UploadIcon size={18} className="mr-2" />
                Choose Files
              </GradientButton>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};

interface PremiumFilePreviewProps {
  files: File[];
  onRemove?: (index: number) => void;
  className?: string;
}

const PremiumFilePreview: React.FC<PremiumFilePreviewProps> = ({
  files,
  onRemove,
  className
}) => {
  const { selectedTheme } = useAdvancedTheme();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={20} className={getThemeAwareIconColor(selectedTheme)} />;
    }
    return <FileIcon size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-foreground">Selected Files</h4>
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`glass-card p-3 rounded-xl flex items-center justify-between theme-transition ${getThemeAwareFileCardClasses(selectedTheme)}`}
          >
            <div className="flex items-center gap-3">
              {getFileIcon(file)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {onRemove && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(index)}
                className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
              >
                <XIcon size={16} />
              </motion.button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface PremiumProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

const PremiumProgressBar: React.FC<PremiumProgressBarProps> = ({
  progress,
  className,
  showPercentage = true
}) => {
  const { selectedTheme } = useAdvancedTheme();

  return (
    <div className={cn("w-full", className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Uploading...</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      )}

      <div className="w-full glass-card rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getThemeAwareProgressGradient(selectedTheme)}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
};

// Theme-aware styling functions for upload components
const getThemeAwareDragOverClasses = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'border-blue-500 bg-blue-500/5 shadow-glow-blue';
    case 'forest-green':
      return 'border-green-500 bg-green-500/5 shadow-glow-green';
    case 'sunset-orange':
      return 'border-orange-500 bg-orange-500/5 shadow-glow-orange';
    case 'purple-galaxy':
      return 'border-purple-500 bg-purple-500/5 shadow-glow';
    case 'minimalist-gray':
      return 'border-gray-500 bg-gray-500/5 shadow-md';
    default:
      return 'border-primary bg-primary/5 shadow-glow';
  }
};

const getThemeAwareUploadBorderClasses = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'border-glass-border hover:border-blue-500/50';
    case 'forest-green':
      return 'border-glass-border hover:border-green-500/50';
    case 'sunset-orange':
      return 'border-glass-border hover:border-orange-500/50';
    case 'purple-galaxy':
      return 'border-glass-border hover:border-purple-500/50';
    case 'minimalist-gray':
      return 'border-glass-border hover:border-gray-500/50';
    default:
      return 'border-glass-border hover:border-primary/50';
  }
};

const getThemeAwareButtonGradient = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'blue';
    case 'forest-green':
      return 'green';
    case 'sunset-orange':
      return 'orange';
    case 'purple-galaxy':
      return 'purple';
    case 'minimalist-gray':
      return 'gray';
    default:
      return 'primary';
  }
};

const getThemeAwareButtonShadow = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'shadow-glow-blue';
    case 'forest-green':
      return 'shadow-glow-green';
    case 'sunset-orange':
      return 'shadow-glow-orange';
    case 'purple-galaxy':
      return 'shadow-glow';
    case 'minimalist-gray':
      return 'shadow-md';
    default:
      return 'shadow-glow';
  }
};

const getThemeAwareIconColor = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'text-blue-500';
    case 'forest-green':
      return 'text-green-500';
    case 'sunset-orange':
      return 'text-orange-500';
    case 'purple-galaxy':
      return 'text-purple-500';
    case 'minimalist-gray':
      return 'text-gray-500';
    default:
      return 'text-blue-500';
  }
};

const getThemeAwareFileCardClasses = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'hover:border-blue-400/30 hover:bg-blue-500/5';
    case 'forest-green':
      return 'hover:border-green-400/30 hover:bg-green-500/5';
    case 'sunset-orange':
      return 'hover:border-orange-400/30 hover:bg-orange-500/5';
    case 'purple-galaxy':
      return 'hover:border-purple-400/30 hover:bg-purple-500/5';
    case 'minimalist-gray':
      return 'hover:border-gray-400/30 hover:bg-gray-500/5';
    default:
      return 'hover:border-primary/30 hover:bg-primary/5';
  }
};

const getThemeAwareProgressGradient = (theme: string): string => {
  switch (theme) {
    case 'ocean-blue':
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    case 'forest-green':
      return 'bg-gradient-to-r from-green-400 to-green-600';
    case 'sunset-orange':
      return 'bg-gradient-to-r from-orange-400 to-orange-600';
    case 'purple-galaxy':
      return 'bg-gradient-to-r from-purple-400 to-purple-600';
    case 'minimalist-gray':
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
    default:
      return 'gradient-primary';
  }
};

export {
  PremiumUpload,
  PremiumFilePreview,
  PremiumProgressBar,
};

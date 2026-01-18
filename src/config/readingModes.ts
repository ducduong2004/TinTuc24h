// src/config/readingModes.ts

export type ReadingMode = "normal" | "focus" | "dark";

export type ReadingModeConfig = {
  container: string;
  grid: string;
  article: string;
  prose: string;
};

export const MODE_CONFIG: Record<ReadingMode, ReadingModeConfig> = {
   normal: {
      container: "bg-gray-50",
      grid: "grid-cols-1 lg:grid-cols-3",
      article: "lg:col-span-2",
      prose: "prose-lg",
    },

    focus: {
      container: "bg-[#fdfcf8]",
      grid: "grid-cols-1",
      article: "mx-auto max-w-3xl",
      prose: "prose-xl leading-relaxed",
    },

    dark: {
      container: "bg-gray-900 text-gray-50",
      grid: "grid-cols-1 lg:grid-cols-3",
      article: "lg:col-span-2",
      prose: "prose-xl prose-invert",
    },
};

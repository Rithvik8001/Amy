export default function SectionDivider() {
  return (
    <div className="relative w-full h-16 border-y border-gray-200 dark:border-gray-900">
      {/* Outer left border */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-900 -ml-px" />
      
      {/* Outer right border */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-900 -mr-px" />
      
      {/* Diagonal lines pattern */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20 text-gray-400 dark:text-gray-600"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`,
        }}
      />
    </div>
  );
}


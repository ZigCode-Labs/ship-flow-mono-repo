'use client';

interface MaterialSymbolProps {
  icon: string;
  className?: string;
  weight?: number;
  fill?: boolean;
  size?: number;
}

export function MaterialSymbol({
  icon,
  className = '',
  weight = 400,
  fill = false,
  size = 24,
}: MaterialSymbolProps) {
  const style = {
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
  };

  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {icon}
    </span>
  );
}

import React from 'react';
import {
  Wrench,
  MessageCircle,
  MessageSquare,
  Layers,
  Film,
  Database,
  Calendar,
  Sparkles,
  Boxes,
  Brain,
  Code,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

/**
 * Approved icon allow-list. Registry `icon` fields must reference one of these
 * names — unknown names fall back to `Boxes` instead of arbitrary rendering.
 * Importing icons explicitly (rather than `import * as LucideIcons`) keeps the
 * bundle tree-shaken and small.
 */
const iconRegistry: Record<string, LucideIcon> = {
  Wrench,
  MessageCircle,
  MessageSquare,
  Layers,
  Film,
  Database,
  Calendar,
  Sparkles,
  Boxes,
  Brain,
  Code,
  GraduationCap,
  Briefcase,
};

export const APPROVED_ICONS = Object.keys(iconRegistry);

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size,
}) => {
  const IconComponent = iconRegistry[name] ?? Boxes;
  return <IconComponent className={className} size={size} />;
};

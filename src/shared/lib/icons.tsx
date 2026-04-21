import { HugeiconsIcon as BaseHugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof BaseHugeiconsIcon>;

/**
 * App-wide icon wrapper. Defaults to strokeWidth=2 (bolder than HugeIcons'
 * default 1.5) and size=18. Per-call `size` overrides still work.
 *
 * Density-aware: the final rendered size is `size * var(--icon-scale, 1)`,
 * which the density hook sets to 0.88 (compact) / 1 (default) / 1.14
 * (comfortable). We keep passing `size` to the base component so any internal
 * sizing math stays consistent, then override width/height via inline style.
 */
export function HugeiconsIcon({
  strokeWidth = 2,
  size = 18,
  style,
  ...props
}: Props) {
  const scaled = `calc(${size}px * var(--icon-scale, 1))`;
  return (
    <BaseHugeiconsIcon
      strokeWidth={strokeWidth}
      size={size}
      style={{ width: scaled, height: scaled, ...style }}
      {...props}
    />
  );
}

export {
  AiBrain02Icon,
  ArchiveIcon,
  Archive02Icon,
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  CheckmarkSquare01Icon,
  CircleIcon,
  Delete01Icon,
  Flag03Icon,
  Edit02Icon,
  InboxIcon,
  Loading03Icon,
  Logout01Icon,
  Menu01Icon,
  MoreHorizontalIcon,
  Note01Icon,
  PinIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  StarIcon,
  Tag01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  Link01Icon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  MinusSignIcon,
  CodeIcon,
  Image01Icon,
  TableIcon,
  AlignLeftIcon,
  AlignHorizontalCenterIcon,
  AlignRightIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  QuoteUpIcon,
  SourceCodeCircleIcon,
} from '@hugeicons/core-free-icons';

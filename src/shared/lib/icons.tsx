import { HugeiconsIcon as BaseHugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof BaseHugeiconsIcon>;

/**
 * App-wide icon wrapper. Defaults to strokeWidth=2 (bolder than HugeIcons'
 * default 1.5) and size=18 so icons read with more confidence at our
 * information density. Per-call overrides still work.
 */
export function HugeiconsIcon({ strokeWidth = 2, size = 18, ...props }: Props) {
  return <BaseHugeiconsIcon strokeWidth={strokeWidth} size={size} {...props} />;
}

export {
  ArchiveIcon,
  ArrowRight01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  Calendar03Icon,
  CheckmarkSquare01Icon,
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

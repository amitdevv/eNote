import React from 'react';
import { HugeiconsIcon, type HugeiconsProps } from '@hugeicons/react';
import {
  StarIcon,
  File01Icon,
  Calendar01Icon,
  Settings02Icon,
  Sun02Icon,
  Moon02Icon,
  RocketIcon,
  CodeIcon,
  GraduationScrollIcon,
  UserIcon,
  IdeaIcon,
  CheckmarkCircle01Icon,
  ClipboardIcon,
  EyeIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Camera02Icon,
  TextIcon,
  Delete02Icon,
  Download01Icon,
  RefreshIcon,
  Clock01Icon,
  PaintBoardIcon,
  Shield01Icon,
  Alert01Icon,
  Loading03Icon,
  PlusSignIcon,
  Search01Icon,
  ArrowLeft02Icon,
  HashtagIcon,
  Cancel01Icon,
  Menu01Icon,
  GridViewIcon,
  ListViewIcon,
  FilterIcon,
  SortByDown01Icon,
  MoreHorizontalIcon,
  Edit02Icon,
  Tag01Icon,
  Upload04Icon,
  FileImageIcon,
  Copy01Icon,
  Tick02Icon,
  Image01Icon,
  ArrowUpDownIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CircleIcon,
} from '@hugeicons/core-free-icons';

type IconProps = Omit<HugeiconsProps, 'icon' | 'ref'>;

const make = (icon: any) => {
  const Cmp = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={icon} {...props} />
  ));
  Cmp.displayName = 'HugeIcon';
  return Cmp;
};

export const Star = make(StarIcon);
export const FileText = make(File01Icon);
export const Calendar = make(Calendar01Icon);
export const Settings = make(Settings02Icon);
export const Sun = make(Sun02Icon);
export const Moon = make(Moon02Icon);
export const Rocket = make(RocketIcon);
export const Code = make(CodeIcon);
export const GraduationCap = make(GraduationScrollIcon);
export const User = make(UserIcon);
export const Lightbulb = make(IdeaIcon);
export const CheckCircle = make(CheckmarkCircle01Icon);
export const ClipboardList = make(ClipboardIcon);
export const Eye = make(EyeIcon);
export const ChevronLeft = make(ArrowLeft01Icon);
export const ChevronRight = make(ArrowRight01Icon);
export const Camera = make(Camera02Icon);
export const Type = make(TextIcon);
export const Trash2 = make(Delete02Icon);
export const Download = make(Download01Icon);
export const RotateCcw = make(RefreshIcon);
export const Clock = make(Clock01Icon);
export const Palette = make(PaintBoardIcon);
export const Shield = make(Shield01Icon);
export const AlertTriangle = make(Alert01Icon);
export const Loader2 = make(Loading03Icon);
export const Plus = make(PlusSignIcon);
export const Search = make(Search01Icon);
export const ArrowLeft = make(ArrowLeft02Icon);
export const Hash = make(HashtagIcon);
export const X = make(Cancel01Icon);
export const Menu = make(Menu01Icon);
export const Grid3X3 = make(GridViewIcon);
export const List = make(ListViewIcon);
export const Filter = make(FilterIcon);
export const SortDesc = make(SortByDown01Icon);
export const MoreHorizontal = make(MoreHorizontalIcon);
export const Edit3 = make(Edit02Icon);
export const Tag = make(Tag01Icon);
export const Upload = make(Upload04Icon);
export const FileImage = make(FileImageIcon);
export const Copy = make(Copy01Icon);
export const Check = make(Tick02Icon);
export const Image = make(Image01Icon);

// Radix-replacement aliases (used by shadcn/ui wrappers)
export const Cross2 = make(Cancel01Icon);
export const CheckMark = make(Tick02Icon);
export const CaretSort = make(ArrowUpDownIcon);
export const ChevronDown = make(ArrowDown01Icon);
export const ChevronUp = make(ArrowUp01Icon);
export const DotFilled = make(CircleIcon);

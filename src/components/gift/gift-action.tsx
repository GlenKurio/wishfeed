export interface GiftButtonProps {
  post: PostType;
  /** Button size variant */
  size?: GiftButtonSize;
  /** If true, stops click propagation (useful inside clickable cards) */
  stopPropagation?: boolean;
  /** Additional class names */
  className?: string;
}

export default function GiftActionButton() {
  return <div>GiftActionButton</div>;
}

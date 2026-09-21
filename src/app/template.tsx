/** Re-mounts on navigation, so the main content fades and rises. Chrome stays put. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="screen-in">{children}</div>;
}

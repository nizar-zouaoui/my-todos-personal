export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 pt-8 text-sm text-text-secondary">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>© 2026 My Todos Personal. Made for everyday plans.</div>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
}

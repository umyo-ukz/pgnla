export default function MobileMenu({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  if (!open) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="container-wide px-4 py-4 space-y-2">
        <a href="/" onClick={close} className="block p-3 bg-red-50 rounded">
          <i className="fas fa-home mr-2 text-primary-red"></i>Home
        </a>
        <a href="/about" onClick={close} className="block p-3">
          <i className="fas fa-info-circle mr-2"></i>About Us
        </a>
        <a href="/admissions" onClick={close} className="block p-3">
          <i className="fas fa-user-plus mr-2"></i>Admissions
        </a>
        <a href="/student-life" onClick={close} className="block p-3">
          <i className="fas fa-graduation-cap mr-2"></i>Student Life
        </a>
        <a href="/contact" onClick={close} className="block p-3">
          <i className="fas fa-phone mr-2"></i>Contact
        </a>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

export default function MobileMenu({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { t } = useTranslation();
  
  if (!open) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="container-wide px-4 py-4 space-y-2">
        <Link to="/home" onClick={close} className="block p-3 bg-red-50 rounded">
          <i className="fas fa-home mr-2 text-primary-red"></i>Home
        </Link>
        <Link to="/about" onClick={close} className="block p-3">
          <i className="fas fa-info-circle mr-2"></i>{t("navbar.aboutUs")}
        </Link>
        <Link to="/admissions" onClick={close} className="block p-3">
          <i className="fas fa-user-plus mr-2"></i>{t("navbar.admissions")}
        </Link>
        <a href="/student-life" onClick={close} className="block p-3">
          <i className="fas fa-graduation-cap mr-2"></i>{t("navbar.studentLife")}
        </a>
        <Link to="/contact" onClick={close} className="block p-3">
          <i className="fas fa-phone mr-2"></i>{t("navbar.contact")}
        </Link>
      </div>
    </div>
  );
}

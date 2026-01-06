import { useState } from "react";
import MobileMenu from "./MobileMenu";

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, isLoading, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  const dashboardPath =
    role === "parent"
      ? "/parent-dashboard"
      : role === "staff"
      ? "/staff"
      : role === "admin"
      ? "/admin"
      : "/login";

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="container-wide px-4">
          <div className="flex justify-between items-center py-3">
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl font-childish">
                  PG
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-primary-black font-serif leading-tight">
                  Pequeños Gigantes
                </div>
                <div className="text-sm text-primary-black font-serif">
                  {t("navbar.nurseryAndLearningAcademy")}
                </div>
              </div>
              <div className="sm:hidden text-lg text-primary-black font-bold font-serif">
                PGNLA
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                title={language === "en" ? "Cambiar a Español" : "Switch to English"}
              >
                <i className={`fas ${language === "en" ? "fa-language" : "fa-globe"}`}></i>
                <span>{language === "en" ? "ES" : "EN"}</span>
              </button>

              <div className="text-sm text-gray-600">
                <i className="fas fa-phone text-primary-red mr-1"></i>
                <span>1(868) 681-6554</span>
              </div>
              <div className="text-sm text-gray-600">
                <i className="fas fa-envelope text-primary-red mr-1"></i>
                <span>info@pequenosgigantes.edu</span>
              </div>

              {!isLoading && user ? (
                <div className="relative group">
                  <Link
                    to={dashboardPath}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    <i
                      className={`fas ${
                        role === "parent"
                          ? "fa-user"
                          : role === "staff"
                          ? "fa-chalkboard-teacher"
                          : "fa-user-shield"
                      } mr-2`}
                    ></i>
                    {t("common.hello")}, {user.fullName.split(" ")[0]}
                  </Link>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link
                      to={dashboardPath}
                      className="block px-4 py-3 hover:bg-red-50"
                    >
                      {t("common.dashboard")}
                    </Link>
                    <Link
                      to="/account"
                      className="block px-4 py-3 hover:bg-red-50"
                    >
                      {t("common.accountSettings")}
                    </Link>
                    <Link to="/login">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                    >
                      {t("common.logout")}
                    </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm px-4 py-2">
                  {t("common.login")}
                </Link>
              )}
            </div>

            {/* Mobile icons */}
            <div className="flex items-center md:hidden gap-4">
              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 rounded text-sm font-medium text-gray-700"
                title={language === "en" ? "Cambiar a Español" : "Switch to English"}
              >
                {language === "en" ? "ES" : "EN"}
              </button>

              {!isLoading && user ? (
                <>
                  <Link to={dashboardPath} className="text-primary-red font-semibold">
                    {user.fullName.split(" ")[0]}
                  </Link>
                </>
              ) : (
                <Link to="/login">
                  <i className="fas fa-sign-in-alt text-xl"></i>
                </Link>
              )}

              <button onClick={() => setOpen(!open)}>
                <i className={`fas ${open ? "fa-times" : "fa-bars"} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="hidden md:block bg-primary-red border-t-4 border-red-700">
        <div className="container-wide px-4">
          <div className="flex justify-center items-center space-x-8 py-3">
            <Link
              to="/about"
              className="nav-link text-white hover:text-white hover:bg-red-700 px-3 py-2 rounded"
            >
              <i className="fas fa-info-circle mr-1"></i>{t("navbar.aboutUs")}
            </Link>

            <div className="relative group">
              <Link
                to="/admissions"
                className="nav-link text-white hover:text-white hover:bg-red-700 px-3 py-2 rounded flex items-center"
              >
                <i className="fas fa-user-plus mr-1"></i>{t("navbar.admissions")}
                <i className="fas fa-chevron-down ml-1 text-sm"></i>
              </Link>

              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to="/admissions"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red rounded-xl"
                >
                  <i className="fas fa-user-plus mr-2"></i>{t("navbar.admissions")}
                </Link>
                <Link
                  to="/financing"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red rounded-xl"
                >
                  <i className="fas fa-hand-holding-usd mr-2"></i>{t("navbar.financing")}
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="nav-link text-white hover:text-white hover:bg-red-700 px-3 py-2 rounded flex items-center">
                <i className="fas fa-graduation-cap mr-1"></i>{t("navbar.studentLife")}
                <i className="fas fa-chevron-down ml-1 text-sm"></i>
              </button>

              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <a
                  href="./student-life.html"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red"
                >
                  <i className="fas fa-graduation-cap mr-2"></i>{t("navbar.studentLifeOverview")}
                </a>
                <a
                  href="./gallery.html"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red"
                >
                  <i className="fas fa-images mr-2"></i>{t("navbar.photoGallery")}
                </a>
                <a
                  href="./yearbook.html"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red"
                >
                  <i className="fas fa-book-open mr-2"></i>{t("navbar.yearbook")}
                </a>
                <Link
                  to="/calendar"
                  className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-primary-red"
                >
                  <i className="fas fa-calendar-alt mr-2"></i>{t("navbar.schoolCalendar")}
                </Link>
              </div>
            </div>

            <Link
              to="/contact"
              className="nav-link text-white hover:text-white hover:bg-red-700 px-3 py-2 rounded"
            >
              <i className="fas fa-phone mr-1"></i>{t("navbar.contact")}
            </Link>
          </div>
        </div>
      </div>

      <MobileMenu open={open} close={() => setOpen(false)} />
    </nav>
  );
}

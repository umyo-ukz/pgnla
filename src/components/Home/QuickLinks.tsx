import { Link } from "react-router-dom";
export default function QuickLinks() {
  return (
    <section className="py-16 bg-white">
      <div className="container-wide px-4">
        <h2 className="section-title">Quick Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="login" className="group">
            <div
              className="bg-primary-red text-white rounded-xl p-8 h-full transform group-hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Parent Portal</h3>
              <p className="opacity-90 mb-4">
                Access grades, attendance, and communication with teachers
              </p>
              <span className="font-semibold group-hover:underline">
                Login Now <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>


          <Link to="coming-soon" className="group">
            <div
              className="bg-gray-800 text-white rounded-xl p-8 h-full transform group-hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-4">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">School Calendar</h3>
              <p className="opacity-90 mb-4">
                View upcoming events, holidays, and important dates
              </p>
              <span className="font-semibold group-hover:underline">
                View Calendar <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>


          <Link to="admissions" className="group">
            <div
              className="bg-gray-100 rounded-xl p-8 h-full transform group-hover:-translate-y-2 transition-transform duration-300 border-2 border-transparent group-hover:border-primary-red">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Admissions</h3>
              <p className="text-gray-600 mb-4">
                Learn about our enrollment process
              </p>
              <span className="font-semibold text-primary-red group-hover:underline">
                Apply Now <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>


          <Link to="coming-soon" className="group">
            <div
              className="bg-gray-100 rounded-xl p-8 h-full transform group-hover:-translate-y-2 transition-transform duration-300 border-2 border-transparent group-hover:border-primary-red">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-images"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Photo Gallery</h3>
              <p className="text-gray-600 mb-4">
                See our students in action
              </p>
              <span className="font-semibold text-primary-red group-hover:underline">
                View Gallery <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

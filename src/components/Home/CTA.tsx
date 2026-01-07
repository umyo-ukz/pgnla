
import { Link } from "react-router-dom";
export default function CTA() {
  return (
    <section className="py-20 bg-primary-red text-white text-center">
      <h2 className="text-4xl font-bold mb-6 p-4">
        Ready to Begin Your Child's Journey?
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/admissions"
          className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
          <i className="fas fa-calendar-check mr-2"></i>Apply Now
        </Link>
        <Link to ="/contact"
          className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
          <i className="fas fa-phone mr-2"></i>Contact Us
        </Link>
      </div>
    </section>
  );
}

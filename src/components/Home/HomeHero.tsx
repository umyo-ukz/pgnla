import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-400"></div>

      <div className="relative z-10 container-wide px-4 py-24 md:py-32 text-center text-white">
        <h1 className="text-4xl md:text-4xl font-serif mb-4">Welcome to</h1>
        <div className="p-10">
        <h2 className="text-5xl md:text-7xl font-bold font-serif mb-6">
          Pequeños Gigantes
        </h2>
        <span className="text-2xl text-white font-serif">
          Nursery and Learning Academy
        </span>
        </div>
        <p className="p-10 text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-serif">
          Where today's young minds grow into tomorrow's giants.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registration"
            className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
          >
            <i className="fas fa-calendar-check mr-2"></i>Apply Now
          </Link>
          <Link
            to="/about"
            className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4"
          >
            <i className="fas fa-play-circle mr-2"></i>Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

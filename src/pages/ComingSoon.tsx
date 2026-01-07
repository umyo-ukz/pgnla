import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <main className="flex-grow">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-red via-red-500 to-red-600 text-white min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Coming Soon
            </h1>
            
            <div className="w-24 h-1 bg-white mx-auto mb-12"></div>
            
            <p className="text-xl md:text-2xl opacity-90 mb-16">
              This page is currently under construction
            </p>
            
            <Link 
              to="/"
              className="inline-flex items-center gap-3 bg-white text-primary-red hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 shadow-lg"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
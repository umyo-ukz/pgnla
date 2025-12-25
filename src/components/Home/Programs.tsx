export default function Programs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-wide px-4">
        <h2 className="section-title text-center mb-12">Our Educational Programs</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="feature-card border-2 border-primary-red">
            <i className="fas fa-baby text-4xl text-primary-red mb-4"></i>
            <h3 className="subsection-title">Pre-school</h3>
            <p className="text-gray-600 mb-4">
              Early childhood education focusing on social skills,
              language development, and creative exploration.
            </p>
            <a href="./preschool.html" className="text-primary-red font-semibold hover:underline">
              Learn More <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </div>

          <div className="feature-card border-2 border-primary-red">
            <i className="fas fa-school text-4xl text-primary-red mb-4"></i>
            <h3 className="subsection-title">Primary School</h3>
            <p className="text-gray-600 mb-4">First Year to Standard 5 with academic excellence.</p>
            <a href="./preschool.html" className="text-primary-red font-semibold hover:underline">
              Learn More <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DirectorMessage() {
  return (
    <section className="py-16 bg-white">
      <div className="container-wide px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Message from Our Director
            </h2>
            <p className="mb-4 text-lg text-gray-700">
              At Pequeños Gigantes, we believe that every child is born with immense potential.
              Our mission is to provide a safe, stimulating, and nurturing environment where
              your little ones can discover their strengths, develop their talents, and grow
              into confident, compassionate individuals.
            </p>
            <p className="text-lg text-gray-700">
              With a curriculum designed to foster curiosity and a teaching approach that
              celebrates individuality, we prepare children not just for kindergarten, but
              for a lifetime of learning and success.
            </p>
          </div>
          <div className="relative">
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
              <div
                className="aspect-video bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <i className="fas fa-school text-primary-red text-8xl opacity-80"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

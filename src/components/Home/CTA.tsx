export default function CTA() {
  return (
    <section className="py-20 bg-primary-red text-white text-center">
      <h2 className="text-4xl font-bold mb-6">
        Ready to Begin Your Child's Journey?
      </h2>
      <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
                    Join the Pequeños Gigantes family and give your child the foundation they need to succeed.
                </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="./registration.html"
                        className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
                        <i className="fas fa-calendar-check mr-2"></i>Apply Now
                    </a>
        <a href="./contact.html"
                        className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
                        <i className="fas fa-phone mr-2"></i>Contact Us
                    </a>
      </div>
    </section>
  );
}

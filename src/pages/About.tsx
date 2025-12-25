
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-red text-white py-20 md:py-24">
        <div className="container-wide px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Pequeños Gigantes
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Nurturing tomorrow's giants through quality education since 2012
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container-wide px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-black mb-6">
                Our Story & Philosophy
              </h2>
              <div className="text-lg text-gray-700 mb-6 leading-relaxed">
                <p className="mb-4">
                  Founded in 2012, Pequeños Gigantes began with a simple yet powerful vision: 
                  to create a learning environment where every child is recognized as a giant 
                  in the making. What started as a small preschool has grown into a comprehensive 
                  educational institution serving children from ages 2 through 10.
                </p>
                <p className="mb-4">
                  Our name, "Pequeños Gigantes" (Little Giants), reflects our core belief that 
                  within every child lies immense potential waiting to be discovered and nurtured.
                </p>
                <p>
                  We believe that education should inspire curiosity, foster creativity, and 
                  build character. Our holistic approach ensures that children develop not just 
                  academically, but socially, emotionally, and physically as well.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                  <i className="fas fa-history text-primary-red text-8xl opacity-80"></i>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-red">2012</div>
                  <div className="text-sm text-gray-600">Year Founded</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-red">
              <div className="text-primary-red text-4xl mb-6">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3 className="text-2xl font-bold text-primary-black mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide a safe, nurturing, and stimulating educational environment where 
                every child can discover their unique potential, develop a love for learning, 
                and build the foundation for lifelong success as confident, compassionate, 
                and responsible individuals.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-red">
              <div className="text-primary-red text-4xl mb-6">
                <i className="fas fa-eye"></i>
              </div>
              <h3 className="text-2xl font-bold text-primary-black mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be recognized as a leading educational institution that transforms 
                young learners into tomorrow's giants – individuals who are academically 
                excellent, socially responsible, and equipped to make positive contributions 
                to their communities and the world.
              </p>
            </div>
          </div>
          
          {/* Core Values */}
          <div className="mt-16">
            <h2 className="section-title">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-heart text-primary-red text-2xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Nurturing Care</h4>
                <p className="text-gray-600">Creating a warm, safe environment where every child feels loved and supported.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lightbulb text-primary-red text-2xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Curiosity & Creativity</h4>
                <p className="text-gray-600">Encouraging exploration, imagination, and innovative thinking.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-hands-helping text-primary-red text-2xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Respect & Integrity</h4>
                <p className="text-gray-600">Teaching respect for self, others, and the environment with honesty.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-primary-red text-2xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Community</h4>
                <p className="text-gray-600">Building strong partnerships between school, families, and community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide px-4">
          <h2 className="section-title">Our Facilities</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Modern, safe, and stimulating environments designed for optimal learning
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-chalkboard"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Classrooms</h3>
              <p className="text-gray-600">Age-appropriate learning spaces with modern educational technology</p>
            </div>
            
            <div className="card text-center">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-seedling"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Outdoor Play Areas</h3>
              <p className="text-gray-600">Safe, well-equipped playgrounds for physical development and play</p>
            </div>
            
            <div className="card text-center">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Learning Library</h3>
              <p className="text-gray-600">Extensive collection of age-appropriate books and learning resources</p>
            </div>
            
            <div className="card text-center">
              <div className="text-primary-red text-4xl mb-4">
                <i className="fas fa-paint-brush"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">Creative Arts Studio</h3>
              <p className="text-gray-600">Dedicated space for art, music, and creative expression</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-red text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        
        <div className="relative z-10 container-wide px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Experience the Pequeños Gigantes Difference
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Schedule a tour to see our facilities, meet our team, and learn how we can 
            support your child's educational journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registration" className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
              <i className="fas fa-calendar-alt mr-2"></i>Schedule a Tour
            </Link>
            <Link to="/contact" className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
              <i className="fas fa-phone mr-2"></i>Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

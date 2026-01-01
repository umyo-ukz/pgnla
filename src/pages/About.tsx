
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
                Summary
              </h2>
              <div className="text-lg text-gray-700 mb-6 leading-relaxed">
                <p className="mb-4">
                  PGNLA is a preschool and primary school that caters to all of the educational 
                  needs of both local and foreign children. The curriculum incorporates a Bilingual Program where 
                  students would be exposed, on a daily basis, to the Spanish language with the goal of achieving a high level of understanding. 
                  The curriculum is also holistic in nature and would cover a number of topics that are important for our changing society 
                  and a more globalized world.
                </p>
                <p className="mb-4">
                  
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
            <div className="bg-primary-red rounded-2xl p-8 shadow-lg">
              <div className="text-primary-red text-4xl mb-6">
                <i className="fas fa-bullseye text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Objectives</h3>
              <ul className="list-disc list-inside text-white mb-4">
                <li>To create and maintain a safe, comfortable, professional environment for our students.</li>
                <li>To achieve synergy at PGNLA by creating a caring family oriented, harmonious partnership among students, parents, 
                  and PGNLA staff, where we can all work together to achieve our goals.</li>
                <li>To develop students who would add value to our society and to the wider world by promoting our Nation’s Watchwords of Discipline, Production and Tolerance.</li>
                <li>To build strong partnerships with families and the community to support each child's growth.</li>
                <li>To achieve a high level of proficiency in both English and Spanish.</li>
              </ul>
            </div>
            
            {/* Vision */}
            <div className="bg-primary-red rounded-2xl p-8 shadow-lg border-l-4 border-primary-red">
              <div className="text-primary-red text-4xl mb-6">
                <i className="fas fa-eye text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Mission Statement</h3>
              <p className="text-white leading-relaxed">
                To provide top-level educational and leadership development strategies 
                so that our students would be able to add exceptional value to both 
                the local and global society by becoming well rounded, disciplined, 
                productive, and tolerant citizens.
              </p>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
            <Link to="/registration" className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
              <i className="fas fa-calendar-alt mr-2"></i>Apply Now
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

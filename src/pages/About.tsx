import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="flex-grow">
      <style>{`
        .process-step { display: flex; margin-bottom: 3rem; position: relative; }
        .process-step:not(:last-child):after { content: ''; position: absolute; left: 3.25rem; top: 4rem; bottom: -3rem; width: 2px; background: #e5e7eb; }
        .process-number { background: #ef4444; color: white; width: 4rem; height: 4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin-right: 1.25rem; flex-shrink: 0; z-index: 1; }
        .process-content { flex: 1; padding-top: 0.5rem; }
        @media (max-width: 768px) {
          .process-step { flex-direction: column; }
          .process-step:not(:last-child):after { left: 2rem; top: 4.25rem; bottom: -3rem; }
          .process-number { margin-right: 0; margin-bottom: 1rem; }
        }
      `}</style>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-red via-red-500 to-red-600 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
        <div className="relative z-10 container-wide px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          </div>
        </div>
      </section>

      {/* Our Story - Refined */}
      <section className="py-16 bg-white">
        <div className="container-wide px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <div className="w-12 h-1 bg-primary-red mb-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-black">
                  Summary
                </h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-red">
                  <p className="leading-relaxed">
                    <strong className="text-primary-black">PGNLA</strong> is a preschool and primary school that caters to all of the educational 
                    needs of both local and foreign children. The curriculum incorporates a <strong>Bilingual Program</strong> where 
                    students would be exposed, on a daily basis, to the Spanish language with the goal of achieving a high level of understanding.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="leading-relaxed">
                    The curriculum is also <strong>holistic in nature</strong> and would cover a number of topics that are important for our changing society 
                    and a more globalized world, ensuring well-rounded development for every student.
                  </p>
                </div>
              </div>
            </div>
            
            
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-8">
    
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Refined */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Objectives */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-red/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bullseye text-primary-red text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-black">Objectives</h3>
                  <div className="w-8 h-1 bg-primary-red mt-2"></div>
                </div>
              </div>
              
              <ul className="space-y-3">
                {[
                  "To create and maintain a safe, comfortable, professional environment for our students.",
                  "To achieve synergy at PGNLA by creating a caring family oriented, harmonious partnership among students, parents, and PGNLA staff.",
                  "To develop students who would add value to our society and to the wider world by promoting our Nation's Watchwords of Discipline, Production and Tolerance.",
                  "To build strong partnerships with families and the community to support each child's growth.",
                  "To achieve a high level of proficiency in both English and Spanish."
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-red/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <i className="fas fa-check text-primary-red text-xs"></i>
                    </div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Mission Statement */}
            <div className="bg-primary-red rounded-2xl p-8 shadow-lg text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-eye text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Mission Statement</h3>
                  <div className="w-8 h-1 bg-white/40 mt-2"></div>
                </div>
              </div>
              
              <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
                <p className="leading-relaxed text-lg italic">
                  "To provide top-level educational and leadership development strategies 
                  so that our students would be able to add exceptional value to both 
                  the local and global society by becoming well rounded, disciplined, 
                  productive, and tolerant citizens."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Keeping original */}
      <section className="py-20 bg-primary-red text-white relative overflow-hidden">
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
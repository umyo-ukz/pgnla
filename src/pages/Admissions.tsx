import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Admissions() {
  useEffect(() => {
    // client-side behaviors (accordion, mobile menu) are handled in components or global scripts
    return () => { };
  }, []);

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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
        ></div>        <div className="relative z-10 container-wide px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Admissions</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Nurturing tomorrow's leaders through exceptional early childhood and primary education</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#apply-now" className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
                <i className="fas fa-edit mr-2"></i>Start Your Application
              </a>
              <Link to="/financing" className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
                <i className="fas fa-dollar-sign mr-2"></i>View Financing and Tuition
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-12">Our Admission Process</h2>

          <div className="max-w-4xl mx-auto">
            {[
              {
                number: 1,
                title: "Inquiry & School Tour",
                desc: "Contact us to schedule a personalized school tour. Meet our staff, observe classrooms, and learn about our programs.",
                href: "/contact",
              },
              {
                number: 2,
                title: "Submit Application",
                desc: "Complete our online application form and submit required documents. Applications are accepted year-round based on availability.",
                href: "/registration",
              },
              {
                number: 3,
                title: "Assessment & Interview",
                desc: "Age-appropriate assessment for primary school applicants and family interview to ensure the best fit.",
              },
              {
                number: 4,
                title: "Admission Decision",
                desc: "Receive admission decision within 10 business days. Accepted students will receive enrollment packet.",
              },
              {
                number: 5,
                title: "Enrollment & Orientation",
                desc: "Complete enrollment paperwork, submit tuition deposit, and attend new family orientation.",
              },
            ].map((step) => (
              <div key={step.number} className="process-step">
                <div className="process-number">{step.number}</div>
                <div className="process-content">
                  <h3 className="text-xl font-bold text-primary-black mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.desc}</p>
                  {step.href && (
                    <Link to={step.href} className="inline-flex items-center text-primary-red font-semibold hover:underline">
                      <i className="fas fa-calendar mr-2"></i> {step.title === "Inquiry & School Tour" ? "Schedule a Tour" : "Access Application Form"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-12">Age Requirements & Programs</h2>

          <div className="overflow-x-auto">
            <table className="admissions-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Age Range</th>
                  <th>Schedule Options</th>
                  <th>Class Size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Preschool</strong><br />Early learning foundation</td>
                  <td>3-4 years</td>
                  <td>Half Day (8am-12pm)<br />Full Day (8am-3pm)</td>
                  <td>Max 15 students</td>
                </tr>
                <tr>
                  <td><strong>Pre-Kindergarten</strong><br />Kindergarten readiness</td>
                  <td>4-5 years</td>
                  <td>Full Day (8am-3pm)</td>
                  <td>Max 18 students</td>
                </tr>
                <tr>
                  <td><strong>Primary School</strong><br />First Year - Standard 5</td>
                  <td>5-11 years</td>
                  <td>Full Day (8am-3pm)<br />After-care available</td>
                  <td>Max 20 students</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="apply-now" className="py-20 bg-primary-red text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative z-10 container-wide px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your Application?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">Join the Pequeños Gigantes family and give your child the foundation they need to succeed.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registration" className="btn-primary bg-white text-primary-red hover:bg-gray-100 text-lg px-8 py-4 font-semibold">
              <i className="fas fa-edit mr-2"></i>Start Online Application
            </Link>
            <Link to="/contact" className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4">
              <i className="fas fa-question-circle mr-2"></i>Have Questions?
            </Link>
          </div>
          <p className="mt-8 text-white/80"><i className="fas fa-clock mr-2"></i>Applications processed within 10 business days</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title text-center mb-12">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                id: 1,
                question: "What documents are required for application?",
                answer:
                  "Required documents include: birth certificate, immunization records, two passport-sized photos, previous school records (if applicable), and parent/guardian identification.",
              },
              {
                id: 2,
                question: "Do you offer before/after school care?",
                answer:
                  "Yes, we offer extended care from 7:00 AM to 8:00 AM and from 3:00 PM to 6:00 PM for an additional fee. This service includes supervised activities, homework help, and snacks.",
              },
              {
                id: 3,
                question: "What is your student-teacher ratio?",
                answer:
                  "We maintain a low student-teacher ratio of 15:1 in preschool, 18:1 in pre-kindergarten, and 20:1 in primary school to ensure personalized attention for every child.",
              },
              {
                id: 4,
                question: "Are meals provided?",
                answer:
                  "We provide nutritious morning and afternoon snacks. For full-day students, parents may choose to provide lunch or opt for our hot lunch program (additional fee applies).",
              },
            ].map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === item.id ? null : item.id)}
                  className="faq-toggle w-full text-left p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
                >
                  <span className="font-semibold text-lg text-primary-black">{item.question}</span>
                  <i
                    className="fas fa-chevron-down text-primary-red transition-transform duration-300"
                    style={{ transform: openFAQ === item.id ? "rotate(180deg)" : "rotate(0deg)" }}
                  ></i>
                </button>
                {openFAQ === item.id && (
                  <div className="faq-content p-6 border-t border-gray-200">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center mt-12">
              <Link to="/contact" className="text-primary-red font-semibold hover:underline">
                <i className="fas fa-envelope mr-2"></i>Have more questions? Contact our admissions team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


import { useState } from "react";
import { Link } from "react-router-dom";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function Financing() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "When are tuition payments due?",
      answer:
        "Full tuition is due no later than the first day of each term. However, a payment plan can be arranged. Contact us for more information",
    },
    {
      id: 2,
      question: "Are there payment plans for multiple children?",
      answer:
        "Yes, payment plans can be arranged for two or more siblings. Contact us for more information.",
    },
    {
      id: 3,
      question: "Does tuition cover meals and extra-curricular activities?",
      answer:
        "No, meals, events and extra-curricular activities are paid for separately.",
    },
    
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-red via-red-500 to-red-600 text-white py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>
        <div className="relative z-10 container-wide px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <i className=" mr-3"></i>Financing & Tuition
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
              <Link
                to="/contact"
                className="btn-secondary border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-4"
              >
                <i className="fas fa-file-alt mr-2"></i>Request Flexible Payment Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <div className="flex flex-col lg:flex-row gap-8 justify-center">
      {/* Tuition Overview */}
      <section id="tuition" className="py-16 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title">
            <i className="fas fa-money-check-alt text-primary-red mr-3"></i>Tuition Overview 2025-2026
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Preschool Program */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-baby text-primary-red text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-primary-black mb-2">Pre-school</h3>
                <p className="text-gray-600"></p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-primary-black">TT$ 3,000/term</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Registration Fee</span>
                  <span className="font-bold text-primary-red">TT$ 200</span>
                </div>
              </div>
            </div>

            {/* Primary School */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-school text-primary-red text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-primary-black mb-2">Primary School</h3>
                <p className="text-gray-600">First Year - Standard 5</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-primary-black">TT$ 3,200/term</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Registration Fee</span>
                  <span className="font-bold text-primary-red">TT$ 200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fees */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-primary-black mb-6 text-center">
                <i className="fas fa-file-invoice-dollar text-primary-red mr-2"></i>Additional Services
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <li> <span className="text-gray-700"> After-School Care (4pm-5pm)</span> </li>
                  </div>
                  <div className="flex justify-between items-center">
                    <li> <span className="text-gray-700"> School</span> </li>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <li> <span className="text-gray-700"> Friday Lunches</span> </li>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-wide px-4">
          <h2 className="section-title">
            <i className="fas fa-question-circle text-primary-red mr-3"></i>Financing FAQs
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="faq-toggle w-full text-left p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
                >
                  <span className="font-semibold text-lg text-primary-black">{item.question}</span>
                  <i
                    className="fas fa-chevron-down text-primary-red transition-transform duration-300"
                    style={{
                      transform: openFAQ === item.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  ></i>
                </button>
                {openFAQ === item.id && (
                  <div className="faq-content p-6 border-t border-gray-200">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="text-primary-red font-semibold hover:underline inline-flex items-center"
            >
              <i className="fas fa-envelope mr-2"></i>Have more questions? Contact us
            </Link>
          </div>
        </div>
        
      </section>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export default function Contact() {
  const submitMessage = useMutation(api.messages.submitMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await submitMessage({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contactNo: formData.phone,
        message: formData.message,
      });

      setSubmitted(true);

      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
        setSubmitted(false);
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-red text-white py-20 md:py-24">
        <div className="container-wide px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>
      </section>

      {/* Contact Container */}
      <div className="container-wide px-4 py-16">
        <h2 className="text-3xl font-bold text-primary-black mb-6 text-center">Get in Touch</h2>
        <p className="text-gray-700 mb-12 text-center max-w-2xl mx-auto">
          We'd like to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:w-1/2 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-primary-black mb-6">Contact Information</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-primary-black mb-4">Our Location</h3>
                <p className="text-gray-700 mb-4">8 Boothman Drive, St. Augustine</p>
                <p className="text-gray-700 mb-4">Open Hours:</p>
                <p className="text-gray-700">Monday - Friday: 7:00 AM - 4:00 PM</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-black mb-4">Contact Details</h3>
                <p className="text-gray-700 mb-4">
                  <i className="fas fa-phone mr-2"></i>1(868) 681-6554
                </p>
                <p className="text-gray-700 mb-4">
                  <i className="fas fa-envelope mr-2"></i> info@pequenosgigantes.edu
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-1/2 bg-white p-8 rounded-2xl shadow-lg">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <i className="fas fa-check-circle text-6xl text-green-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Message Sent Successfully!</h2>
                <p className="text-gray-600">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="123-456-7890"
                  />
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="input-field h-32 resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

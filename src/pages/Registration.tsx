import { useState } from "react";
import { Link } from "react-router-dom";

interface FormData {
  // Student Info
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  programType: string;
  startDate: string;
  medicalInfo: string;
  
  // Parent Info
  primaryParentName: string;
  relationship: string;
  email: string;
  phone: string;
  secondaryParentName: string;
  secondaryRelationship: string;
  secondaryEmail: string;
  secondaryPhone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  
  // Terms
  agreeToTerms: boolean;
}

export default function Registration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    programType: "",
    startDate: "",
    medicalInfo: "",
    primaryParentName: "",
    relationship: "",
    email: "",
    phone: "",
    secondaryParentName: "",
    secondaryRelationship: "",
    secondaryEmail: "",
    secondaryPhone: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    agreeToTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms and Conditions");
      return;
    }
    
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  return (
    <main className="container-wide px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`step-indicator w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= 1 ? "bg-primary-red" : "bg-gray-300"
                }`}
              >
                1
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 1 ? "" : "text-gray-500"}`}>
                Student Info
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-primary-red" : "bg-gray-300"}`}></div>

            <div className="flex items-center">
              <div
                className={`step-indicator w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= 2 ? "bg-primary-red" : "bg-gray-300"
                }`}
              >
                2
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 2 ? "" : "text-gray-500"}`}>
                Parent Info
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? "bg-primary-red" : "bg-gray-300"}`}></div>

            <div className="flex items-center">
              <div
                className={`step-indicator w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= 3 ? "bg-primary-red" : "bg-gray-300"
                }`}
              >
                3
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 3 ? "" : "text-gray-500"}`}>
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-red text-primary-white p-8">
            <h1 className="text-3xl font-bold mb-2">Student Registration</h1>
            <p className="opacity-90">Begin your child's journey with Pequeños Gigantes</p>
          </div>

          {/* Step 1: Student Information */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="subsection-title mb-8 flex items-center">
                <i className="fas fa-child text-primary-red mr-3"></i>
                Student Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
                  <label className="form-label">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Middle Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-primary-black mb-6">Program Selection</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Program Type *</label>
                  <select
                    name="programType"
                    value={formData.programType}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Program</option>
                    <option value="preschool">Preschool</option>
                    <option value="prek">Pre-Kindergarten</option>
                    <option value="primary">Primary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Desired Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allergies or Medical Conditions</label>
                <textarea
                  name="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Please list any important medical information, allergies, or special needs..."
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">
                  This information helps us ensure your child's safety and well-being.
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Link to="/" className="btn-secondary">
                  <i className="fas fa-arrow-left mr-2"></i>Cancel
                </Link>
                <button type="button" onClick={handleNext} className="btn-primary">
                  Next Step <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Parent Information */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="subsection-title mb-8 flex items-center">
                <i className="fas fa-users text-primary-red mr-3"></i>
                Parent/Guardian Information
              </h2>

              <h3 className="text-lg font-semibold text-gray-700 mb-4">Primary Parent/Guardian</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="primaryParentName"
                    value={formData.primaryParentName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="First and Last Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship to Child *</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Relationship</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Legal Guardian</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="parent@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Secondary Parent/Guardian (Optional)
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="secondaryParentName"
                    value={formData.secondaryParentName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="First and Last Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship to Child</label>
                  <select
                    name="secondaryRelationship"
                    value={formData.secondaryRelationship}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Relationship</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Legal Guardian</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={formData.secondaryEmail}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="parent2@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Emergency Contact (Other than parents)
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="First and Last Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship *</label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Aunt, Uncle, Family Friend, etc."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <button type="button" onClick={handleBack} className="btn-secondary">
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </button>
                <button type="button" onClick={handleNext} className="btn-primary">
                  Next Step <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-6xl text-green-500"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-4">
                    Registration Submitted Successfully!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We will contact you within 24 hours. Redirecting to home...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="subsection-title mb-8 flex items-center">
                    <i className="fas fa-clipboard-check text-primary-red mr-3"></i>
                    Review and Submit
                  </h2>

                  <div className="alert-info mb-8">
                    <i className="fas fa-info-circle mr-2"></i>
                    Please review all information carefully before submitting. You will receive a
                    confirmation email within 24 hours.
                  </div>

                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="card">
                      <h3 className="font-bold text-lg mb-4 text-primary-red">Child Information</h3>
                      <div className="space-y-2">
                        <p>
                          <strong>Name:</strong> {formData.firstName} {formData.lastName}
                        </p>
                        <p>
                          <strong>Program:</strong> {formData.programType || "Not selected"}
                        </p>
                        <p>
                          <strong>Start Date:</strong> {formData.startDate || "Not selected"}
                        </p>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="font-bold text-lg mb-4 text-primary-red">Parent Information</h3>
                      <div className="space-y-2">
                        <p>
                          <strong>Primary Parent:</strong> {formData.primaryParentName || "Not provided"}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email || "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {formData.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">Terms and Conditions</h3>
                    <div className="max-h-60 overflow-y-auto p-4 bg-white rounded-lg mb-4">
                      <p className="mb-3">By submitting this registration form, you agree to the following:</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>All information provided is accurate and complete</li>
                        <li>You agree to the tuition and fee schedule</li>
                        <li>You consent to emergency medical treatment if needed</li>
                        <li>You agree to the school's policies and procedures</li>
                        <li>
                          You authorize the school to use photographs for educational purposes
                        </li>
                      </ol>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="mt-1 rounded text-primary-red focus:ring-primary-red"
                      />
                      <label htmlFor="terms" className="ml-3 text-gray-700">
                        I have read and agree to the Terms and Conditions *
                      </label>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t">
                    <button type="button" onClick={handleBack} className="btn-secondary">
                      <i className="fas fa-arrow-left mr-2"></i>Back
                    </button>
                    <button type="button" onClick={handleSubmit} className="btn-primary">
                      <i className="fas fa-paper-plane mr-2"></i>Submit Registration
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-primary-red rounded-xl p-6 text-white">
            <div className="flex items-start">
              <i className="fas fa-question-circle text-2xl mt-1 mr-4"></i>
              <div>
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="mb-4 opacity-90">Contact us directly.</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="fas fa-phone mr-3"></i>
                    <span>1(868) 681-6554</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-envelope mr-3"></i>
                    <span>admissions@pequenosgigantes.edu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-start">
              <i className="fas fa-clock text-2xl text-primary-red mt-1 mr-4"></i>
              <div>
                <h3 className="text-xl font-bold mb-2">Next Steps</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>1. Submit your registration</li>
                  <li>2. Complete enrollment paperwork</li>
                  <li>3. Meet your child's teacher</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

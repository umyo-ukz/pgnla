import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

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
  const submitRegistration = useMutation(api.studentApplications.submitRegistration);
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
  const [stepErrors, setStepErrors] = useState<{[key: number]: boolean}>({
    1: false,
    2: false,
    3: false
  });

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone format (basic validation)
  const isValidPhone = (phone: string) => {
    // Remove non-digits and check length
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  // Validate each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const step1Valid = 
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          formData.dateOfBirth.trim() !== "" &&
          formData.programType.trim() !== "" &&
          formData.startDate.trim() !== "";
        
        // Check if start date is in the future
        if (formData.startDate) {
          const today = new Date().toISOString().split('T')[0];
          if (formData.startDate < today) {
            return false;
          }
        }
        
        // Check if date of birth is valid (not in future)
        if (formData.dateOfBirth) {
          const today = new Date().toISOString().split('T')[0];
          if (formData.dateOfBirth > today) {
            return false;
          }
        }
        
        return step1Valid;
        
      case 2:
        const step2Valid = 
          formData.primaryParentName.trim() !== "" &&
          formData.relationship.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.emergencyName.trim() !== "" &&
          formData.emergencyRelationship.trim() !== "" &&
          formData.emergencyPhone.trim() !== "";
        
        // Additional validations for step 2
        const emailValid = isValidEmail(formData.email);
        const phoneValid = isValidPhone(formData.phone);
        const emergencyPhoneValid = isValidPhone(formData.emergencyPhone);
        
        // Validate secondary email if provided
        let secondaryEmailValid = true;
        if (formData.secondaryEmail.trim() !== "") {
          secondaryEmailValid = isValidEmail(formData.secondaryEmail);
        }
        
        // Validate secondary phone if provided
        let secondaryPhoneValid = true;
        if (formData.secondaryPhone.trim() !== "") {
          secondaryPhoneValid = isValidPhone(formData.secondaryPhone);
        }
        
        return step2Valid && emailValid && phoneValid && emergencyPhoneValid && secondaryEmailValid && secondaryPhoneValid;
        
      case 3:
        return formData.agreeToTerms === true;
        
      default:
        return false;
    }
  };

  // Update step errors whenever formData changes
  useEffect(() => {
    setStepErrors(prev => ({
      ...prev,
      [currentStep]: !validateStep(currentStep)
    }));
  }, [formData, currentStep]);

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
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
        setStepErrors(prev => ({...prev, [currentStep]: false}));
      } else {
        // Show specific error messages for current step
        let message = "Please fix the following issues:";
        
        if (currentStep === 1) {
          const errors = [];
          if (!formData.firstName.trim()) errors.push("First Name");
          if (!formData.lastName.trim()) errors.push("Last Name");
          if (!formData.dateOfBirth.trim()) errors.push("Date of Birth");
          if (!formData.programType.trim()) errors.push("Program Type");
          if (!formData.startDate.trim()) errors.push("Start Date");
          
          // Check date validations
          if (formData.startDate) {
            const today = new Date().toISOString().split('T')[0];
            if (formData.startDate < today) {
              errors.push("Start Date must be today or in the future");
            }
          }
          
          if (formData.dateOfBirth) {
            const today = new Date().toISOString().split('T')[0];
            if (formData.dateOfBirth > today) {
              errors.push("Date of Birth cannot be in the future");
            }
          }
          
          message = `Please complete all required fields: ${errors.join(", ")}`;
          
        } else if (currentStep === 2) {
          const errors = [];
          if (!formData.primaryParentName.trim()) errors.push("Primary Parent Name");
          if (!formData.relationship.trim()) errors.push("Relationship to Child");
          if (!formData.email.trim()) errors.push("Email Address");
          if (!formData.phone.trim()) errors.push("Phone Number");
          if (!formData.emergencyName.trim()) errors.push("Emergency Contact Name");
          if (!formData.emergencyRelationship.trim()) errors.push("Emergency Relationship");
          if (!formData.emergencyPhone.trim()) errors.push("Emergency Phone");
          
          // Validate formats
          if (formData.email.trim() && !isValidEmail(formData.email)) {
            errors.push("Valid Email Address");
          }
          if (formData.phone.trim() && !isValidPhone(formData.phone)) {
            errors.push("Valid Phone Number");
          }
          if (formData.emergencyPhone.trim() && !isValidPhone(formData.emergencyPhone)) {
            errors.push("Valid Emergency Phone Number");
          }
          if (formData.secondaryEmail.trim() && !isValidEmail(formData.secondaryEmail)) {
            errors.push("Valid Secondary Email (if provided)");
          }
          if (formData.secondaryPhone.trim() && !isValidPhone(formData.secondaryPhone)) {
            errors.push("Valid Secondary Phone (if provided)");
          }
          
          message = `Please fix the following: ${errors.join(", ")}`;
        }
        
        alert(message);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      alert("Please agree to the Terms and Conditions");
      return;
    }

    if (!validateStep(1) || !validateStep(2)) {
      alert("Please go back and complete all required fields");
      return;
    }

    try {
      await submitRegistration({
        studentFirstName: formData.firstName,
        studentLastName: formData.lastName,
        middleName: formData.middleName || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        programType: formData.programType,
        startDate: formData.startDate,
        medicalInfo: formData.medicalInfo || undefined,

        primaryParentName: formData.primaryParentName,
        relationship: formData.relationship,
        email: formData.email,
        phone: formData.phone,

        secondaryParentName: formData.secondaryParentName || undefined,
        secondaryRelationship: formData.secondaryRelationship || undefined,
        secondaryEmail: formData.secondaryEmail || undefined,
        secondaryPhone: formData.secondaryPhone || undefined,

        emergencyName: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
      });

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      alert("There was an error submitting your registration. Please try again.");
      console.error("Registration error:", error);
    }
  };

  // Check if each step is complete for the progress indicator
  const isStepComplete = (step: number) => {
    return validateStep(step);
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
                } ${stepErrors[1] ? "ring-2 ring-red-500 ring-offset-2" : ""} ${
                  currentStep > 1 && isStepComplete(1) ? "bg-green-500" : ""
                }`}
              >
                {currentStep > 1 && isStepComplete(1) ? "✓" : "1"}
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 1 ? "" : "text-gray-500"} ${
                stepErrors[1] ? "text-red-500" : ""
              }`}>
                Student Info {stepErrors[1] && currentStep === 1 && "• Required"}
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-primary-red" : "bg-gray-300"}`}></div>

            <div className="flex items-center">
              <div
                className={`step-indicator w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= 2 ? "bg-primary-red" : "bg-gray-300"
                } ${stepErrors[2] ? "ring-2 ring-red-500 ring-offset-2" : ""} ${
                  currentStep > 2 && isStepComplete(2) ? "bg-green-500" : ""
                }`}
              >
                {currentStep > 2 && isStepComplete(2) ? "✓" : "2"}
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 2 ? "" : "text-gray-500"} ${
                stepErrors[2] ? "text-red-500" : ""
              }`}>
                Parent Info {stepErrors[2] && currentStep === 2 && "• Required"}
              </span>
            </div>

            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? "bg-primary-red" : "bg-gray-300"}`}></div>

            <div className="flex items-center">
              <div
                className={`step-indicator w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentStep >= 3 ? "bg-primary-red" : "bg-gray-300"
                } ${stepErrors[3] ? "ring-2 ring-red-500 ring-offset-2" : ""}`}
              >
                3
              </div>
              <span className={`ml-3 font-semibold ${currentStep >= 3 ? "" : "text-gray-500"} ${
                stepErrors[3] ? "text-red-500" : ""
              }`}>
                Review {stepErrors[3] && currentStep === 3 && "• Required"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-5 m-5">
          <p className=" text-sm text-red-500 mb-4 ">Please note the following documents required for finalizing your child's registration.</p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>Birth Certificate</li>
            <li>Parent/Guardian Identification</li>
            <li>Immunization Card</li>
            <li>Recent head-shot or passport sized photo of child</li>
            <li>Previous school records (if applicable)</li>
          </ul>
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
                {stepErrors[1] && (
                  <span className="ml-4 text-sm text-red-500 font-normal">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    Please fill all required fields
                  </span>
                )}
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.firstName.trim() && stepErrors[1] ? "border-red-500" : ""}`}
                    placeholder="First Name"
                  />
                  {!formData.firstName.trim() && stepErrors[1] && (
                    <p className="text-red-500 text-sm mt-1">First name is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.lastName.trim() && stepErrors[1] ? "border-red-500" : ""}`}
                    placeholder="Last Name"
                  />
                  {!formData.lastName.trim() && stepErrors[1] && (
                    <p className="text-red-500 text-sm mt-1">Last name is required</p>
                  )}
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
                  <label className="form-label">Date of Birth <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.dateOfBirth.trim() && stepErrors[1] ? "border-red-500" : ""} ${
                      formData.dateOfBirth > new Date().toISOString().split('T')[0] ? "border-red-500" : ""
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {!formData.dateOfBirth.trim() && stepErrors[1] && (
                    <p className="text-red-500 text-sm mt-1">Date of birth is required</p>
                  )}
                  {formData.dateOfBirth > new Date().toISOString().split('T')[0] && (
                    <p className="text-red-500 text-sm mt-1">Date of birth cannot be in the future</p>
                  )}
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
                  <label className="form-label">Program Type <span className="text-red-500">*</span></label>
                  <select
                    name="programType"
                    value={formData.programType}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.programType.trim() && stepErrors[1] ? "border-red-500" : ""}`}
                  >
                    <option value="">Select Program</option>
                    <option value="preschool">Preschool</option>
                    <option value="primary">Primary School</option>
                  </select>
                  {!formData.programType.trim() && stepErrors[1] && (
                    <p className="text-red-500 text-sm mt-1">Program type is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Desired Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.startDate.trim() && stepErrors[1] ? "border-red-500" : ""} ${
                      formData.startDate && formData.startDate < new Date().toISOString().split('T')[0] ? "border-red-500" : ""
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {!formData.startDate.trim() && stepErrors[1] && (
                    <p className="text-red-500 text-sm mt-1">Start date is required</p>
                  )}
                  {formData.startDate && formData.startDate < new Date().toISOString().split('T')[0] && (
                    <p className="text-red-500 text-sm mt-1">Start date must be today or in the future</p>
                  )}
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
                <button 
                  type="button" 
                  onClick={handleNext}
                  className={`btn-primary ${!validateStep(1) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!validateStep(1)}
                >
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
                {stepErrors[2] && (
                  <span className="ml-4 text-sm text-red-500 font-normal">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    Please fill all required fields
                  </span>
                )}
              </h2>

              <h3 className="text-lg font-semibold text-gray-700 mb-4">Primary Parent/Guardian</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="primaryParentName"
                    value={formData.primaryParentName}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.primaryParentName.trim() && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="First and Last Name"
                  />
                  {!formData.primaryParentName.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Primary parent name is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship to Child <span className="text-red-500">*</span></label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.relationship.trim() && stepErrors[2] ? "border-red-500" : ""}`}
                  >
                    <option value="">Select Relationship</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Legal Guardian</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other</option>
                  </select>
                  {!formData.relationship.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Relationship is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${(!formData.email.trim() || !isValidEmail(formData.email)) && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="parent@example.com"
                  />
                  {!formData.email.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Email is required</p>
                  )}
                  {formData.email.trim() && !isValidEmail(formData.email) && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${(!formData.phone.trim() || !isValidPhone(formData.phone)) && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="(868) 456-7890"
                  />
                  {!formData.phone.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Phone number is required</p>
                  )}
                  {formData.phone.trim() && !isValidPhone(formData.phone) && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid phone number</p>
                  )}
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
                    className={`input-field ${formData.secondaryEmail.trim() && !isValidEmail(formData.secondaryEmail) && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="parent2@example.com"
                  />
                  {formData.secondaryEmail.trim() && !isValidEmail(formData.secondaryEmail) && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={handleInputChange}
                    className={`input-field ${formData.secondaryPhone.trim() && !isValidPhone(formData.secondaryPhone) && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="(868) 456-7890"
                  />
                  {formData.secondaryPhone.trim() && !isValidPhone(formData.secondaryPhone) && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid phone number</p>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Emergency Contact (Other than parents)
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.emergencyName.trim() && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="First and Last Name"
                  />
                  {!formData.emergencyName.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Emergency contact name is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${!formData.emergencyRelationship.trim() && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="Aunt, Uncle, Family Friend, etc."
                  />
                  {!formData.emergencyRelationship.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Emergency relationship is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                    className={`input-field ${(!formData.emergencyPhone.trim() || !isValidPhone(formData.emergencyPhone)) && stepErrors[2] ? "border-red-500" : ""}`}
                    placeholder="(123) 456-7890"
                  />
                  {!formData.emergencyPhone.trim() && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Emergency phone is required</p>
                  )}
                  {formData.emergencyPhone.trim() && !isValidPhone(formData.emergencyPhone) && stepErrors[2] && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid phone number</p>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <button type="button" onClick={handleBack} className="btn-secondary">
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </button>
                <button 
                  type="button" 
                  onClick={handleNext}
                  className={`btn-primary ${!validateStep(2) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!validateStep(2)}
                >
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
                    We will contact you soon.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="subsection-title mb-8 flex items-center">
                    <i className="fas fa-clipboard-check text-primary-red mr-3"></i>
                    Review and Submit
                    {stepErrors[3] && (
                      <span className="ml-4 text-sm text-red-500 font-normal">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        Please agree to the Terms and Conditions
                      </span>
                    )}
                  </h2>

                  <div className="alert-info mb-8">
                    <i className="fas fa-info-circle mr-2"></i>
                    Please review all information carefully before submitting.
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
                          <strong>Date of Birth:</strong> {formData.dateOfBirth}
                        </p>
                        <p>
                          <strong>Program:</strong> {formData.programType || "Not selected"}
                        </p>
                        <p>
                          <strong>Start Date:</strong> {formData.startDate || "Not selected"}
                        </p>
                        <p>
                          <strong>Medical Info:</strong> {formData.medicalInfo || "None provided"}
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
                          <strong>Relationship:</strong> {formData.relationship || "Not provided"}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email || "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {formData.phone || "Not provided"}
                        </p>
                        <p>
                          <strong>Emergency Contact:</strong> {formData.emergencyName || "Not provided"}
                        </p>
                        <p>
                          <strong>Emergency Phone:</strong> {formData.emergencyPhone || "Not provided"}
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
                        <li>You understand the school's policies and procedures</li>
                        <li>You authorize the school to provide emergency medical treatment if necessary</li>
                        <li>You agree to maintain current contact information with the school</li>
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
                        className={`mt-1 rounded text-primary-red focus:ring-primary-red ${stepErrors[3] ? "border-red-500" : ""}`}
                      />
                      <label htmlFor="terms" className="ml-3 text-gray-700">
                        I have read and agree to the Terms and Conditions <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {stepErrors[3] && !formData.agreeToTerms && (
                      <p className="text-red-500 text-sm mt-2 ml-7">
                        You must agree to the Terms and Conditions to submit
                      </p>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t">
                    <button type="button" onClick={handleBack} className="btn-secondary">
                      <i className="fas fa-arrow-left mr-2"></i>Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSubmit}
                      className={`btn-primary ${!validateStep(3) ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!validateStep(3)}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>Submit Registration
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ModalForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    status: 'Active',
    role: 'Recruiter'
  });

  const [errors, setErrors] = useState({});

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email' : '';
      }
      case 'phoneNumber': {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[0-9+\-\s()]+$/;
        return !phoneRegex.test(value) ? 'Please enter a valid phone number' : '';
      }
      case 'dateOfBirth': {
        if (!value) return 'Date of birth is required';
        const age = calculateAge(value);
        return age < 22 ? 'Age must be 22 or older' : '';
      }
      default:
        return '';
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields before submit
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach(key => {
      if (key !== 'status' && key !== 'role') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      status: 'Active',
      role: 'Recruiter'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create new {formData.role.toLowerCase()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                 
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                 
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                 
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-cyan-600 text-white px-8 py-2 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../common/Navbar';
import { useToast } from '../../common/Toast';
import { API_BASE_URL } from '../../../config/apiConfig';

const EditLearningPlan = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resources: [],
    weeks: [],
  });
  const [errors, setErrors] = useState({});
  const resourceTypes = ['Video', 'Documentation', 'Article', 'Tutorial', 'Book'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/auth');
            return;
          }
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        addToast('Failed to load user data.', 'error');
      }
    };

    const fetchLearningPlan = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/learning-plan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch learning plan');
        }

        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
          resources: data.resources || [],
          weeks: data.weeks || [],
        });
      } catch (error) {
        console.error('Error fetching learning plan:', error);
        addToast('Failed to load learning plan.', 'error');
        navigate('/learning-plans/my-plans');
      }
    };

    fetchCurrentUser().then(fetchLearningPlan).finally(() => setIsLoading(false));
  }, [navigate, addToast, id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 255) newErrors.title = 'Title cannot exceed 255 characters';
    if (formData.description.length > 1000)
      newErrors.description = 'Description cannot exceed 1000 characters';
    if (formData.resources.length === 0) newErrors.resources = 'At least one resource is required';
    if (formData.weeks.length === 0) newErrors.weeks = 'At least one week is required';

    formData.resources.forEach((resource, index) => {
      if (!resource.title.trim()) newErrors[`resourceTitle${index}`] = 'Resource title is required';
      if (!resource.url.trim()) newErrors[`resourceUrl${index}`] = 'Resource URL is required';
      else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(resource.url)) {
        newErrors[`resourceUrl${index}`] = 'Invalid URL format';
      }
      if (!resource.type) newErrors[`resourceType${index}`] = 'Resource type is required';
    });

    formData.weeks.forEach((week, index) => {
      if (!week.title.trim()) newErrors[`weekTitle${index}`] = 'Week title is required';
      if (!week.status) newErrors[`weekStatus${index}`] = 'Week status is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, section, index, field) => {
    const { value } = e.target;
    if (section) {
      const updatedSection = [...formData[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      setFormData({ ...formData, [section]: updatedSection });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
    setErrors((prev) => ({ ...prev, [section ? `${section}${field}${index}` : e.target.name]: '' }));
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { title: '', url: '', type: 'Video' }],
    });
  };

  const removeResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index),
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`resourceTitle${index}`];
      delete newErrors[`resourceUrl${index}`];
      delete newErrors[`resourceType${index}`];
      return newErrors;
    });
  };

  const addWeek = () => {
    setFormData({
      ...formData,
      weeks: [...formData.weeks, { title: '', description: '', status: 'Not Started' }],
    });
  };

  const removeWeek = (index) => {
    setFormData({
      ...formData,
      weeks: formData.weeks.filter((_, i) => i !== index),
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`weekTitle${index}`];
      delete newErrors[`weekStatus${index}`];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to update this learning plan?')) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/learning-plan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update learning plan');
      }

      addToast('Learning plan updated successfully!', 'success');
      navigate('/learning-plans/my-plans');
    } catch (error) {
      console.error('Error updating learning plan:', error);
      addToast(error.message || 'Failed to update learning plan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to discard changes?')) {
      navigate('/learning-plans/my-plans');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} />
      <div className="max-w-4xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Learning Plan</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Plan Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => handleInputChange(e)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
              placeholder="Enter plan title"
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange(e)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
              placeholder="Enter plan description"
              rows="4"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Resources</h2>
            {errors.resources && <p className="mb-2 text-sm text-red-600">{errors.resources}</p>}
            {formData.resources.map((resource, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Resource {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={formData.resources.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={resource.title}
                    onChange={(e) => handleInputChange(e, 'resources', index, 'title')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    placeholder="Resource title"
                    required
                  />
                  {errors[`resourceTitle${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`resourceTitle${index}`]}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    value={resource.url}
                    onChange={(e) => handleInputChange(e, 'resources', index, 'url')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    placeholder="https://example.com"
                    required
                  />
                  {errors[`resourceUrl${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`resourceUrl${index}`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={resource.type}
                    onChange={(e) => handleInputChange(e, 'resources', index, 'type')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    required
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {resourceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors[`resourceType${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`resourceType${index}`]}</p>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addResource}
              className="mt-2 px-3 py-1 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor flex items-center"
            >
              <i className="bx bx-plus mr-1"></i> Add Resource
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Timeline</h2>
            {errors.weeks && <p className="mb-2 text-sm text-red-600">{errors.weeks}</p>}
            {formData.weeks.map((week, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Week {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeWeek(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={formData.weeks.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={week.title}
                    onChange={(e) => handleInputChange(e, 'weeks', index, 'title')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    placeholder="Week title"
                    required
                  />
                  {errors[`weekTitle${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`weekTitle${index}`]}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={week.description}
                    onChange={(e) => handleInputChange(e, 'weeks', index, 'description')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    placeholder="Week description"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={week.status}
                    onChange={(e) => handleInputChange(e, 'weeks', index, 'status')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-DarkColor focus:border-DarkColor sm:text-sm"
                    required
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors[`weekStatus${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`weekStatus${index}`]}</p>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addWeek}
              className="mt-2 px-3 py-1 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor flex items-center"
            >
              <i className="bx bx-plus mr-1"></i> Add Week
            </button>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-DarkColor hover:bg-ExtraDarkColor'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Learning Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLearningPlan;
import React, { useState, useEffect } from 'react';
import { X, Plus, Building2, Tag, Bed, AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'property' | 'category' | 'room-type';
  onSubmit: (data: any) => Promise<void>;
}

interface FormData {
  name?: string;
  description?: string;
  mainImageUrl?: string;
  location?: string;
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  price?: string;
  currency?: string;
  propertyType?: string;
  categoryId?: string;
  isFeatured?: boolean;
  displayOrder?: string;
  amenities?: string[];
  imageUrl?: string;
  type?: string;
  capacity?: string;
  genderType?: string;
  propertyId?: string; // Added for room types
  additionalImageUrls?: string[]; // Added for room types
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, type, onSubmit }) => {
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  
  // State for dynamic lists
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [imageUrlsList, setImageUrlsList] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const modalConfig = {
    property: {
      title: 'Add New Property',
      icon: Building2,
      description: 'Create a new property listing with all necessary details',
    },
    category: {
      title: 'Add New Category',
      icon: Tag,
      description: 'Create a new property category',
    },
    'room-type': {
      title: 'Add New Room Type',
      icon: Bed,
      description: 'Create a new room type with pricing and capacity',
    },
  };

  const config = modalConfig[type];
  const IconComponent = config.icon;

  // Fetch categories when modal opens for property creation
  useEffect(() => {
    if (isOpen && type === 'property' && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, type]);

  // Fetch properties when modal opens for room type creation
  useEffect(() => {
    if (isOpen && type === 'room-type') {
      fetchProperties();
    }
  }, [isOpen, type]);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      const response = await apiService.getAllCategories();
      if (response.success && response.data && Array.isArray(response.data)) {
        setCategories(response.data.filter((cat: Category) => cat.isActive));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchProperties = async () => {
    setFetchingProperties(true);
    try {
      const response = await apiService.getAllProperties();
      console.log('Properties response:', response); // Debug log
      if (response.success && response.data) {
        // Handle both nested and direct array responses
        const propertiesData = (response.data as any).properties || response.data;
        if (Array.isArray(propertiesData)) {
          setProperties(propertiesData);
        } else {
          console.error('Properties data is not an array:', propertiesData);
          setProperties([]);
        }
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setFetchingProperties(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (type === 'property') {
      if (!formData.name?.trim()) newErrors.name = 'Property name is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (formData.description && formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters long';
      }
      if (!formData.mainImageUrl?.trim()) newErrors.mainImageUrl = 'Main image URL is required';
      if (!formData.location?.trim()) newErrors.location = 'Location is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.region?.trim()) newErrors.region = 'Region is required';
      if (!formData.price?.trim()) newErrors.price = 'Price is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.categoryId) newErrors.categoryId = 'Category is required';
      
      // Validate price is a positive number
      if (formData.price && parseFloat(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
      
      // Validate coordinates if provided
      if (formData.latitude && (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
      if (formData.longitude && (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    } else if (type === 'category') {
      if (!formData.name?.trim()) newErrors.name = 'Name is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (formData.description && formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters long';
      }
      if (!formData.imageUrl?.trim()) newErrors.imageUrl = 'Image URL is required';
      // Type is optional, no validation needed
    } else if (type === 'room-type') {
      if (!formData.name?.trim()) newErrors.name = 'Name is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (formData.description && formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters long';
      }
      if (!formData.capacity?.trim()) newErrors.capacity = 'Capacity is required';
      if (!formData.price?.trim()) newErrors.price = 'Price is required';
      if (!formData.genderType) newErrors.genderType = 'Gender type is required';
      if (!formData.propertyId) newErrors.propertyId = 'Property is required'; // Added validation for propertyId
      
      // Validate capacity is a positive integer
      if (formData.capacity && parseInt(formData.capacity) <= 0) {
        newErrors.capacity = 'Capacity must be greater than 0';
      }
      
      // Validate price is a positive number
      if (formData.price && parseFloat(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
      setErrors({});
      setAmenitiesList([]);
      setImageUrlsList([]);
      setNewAmenity('');
      setNewImageUrl('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle validation errors from backend
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        const validationErrors: Record<string, string> = {};
        error.validationErrors.forEach((err: any) => {
          if (err.field && err.message) {
            validationErrors[err.field] = err.message;
          }
        });
        setErrors(validationErrors);
      } else if (error.message) {
        // Show generic error at the top
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Functions to manage dynamic lists
  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenitiesList(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenitiesList(prev => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrlsList(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrlsList(prev => prev.filter((_, i) => i !== index));
  };

  // Update formData when lists change
  useEffect(() => {
    setFormData(prev => ({ ...prev, amenities: amenitiesList }));
  }, [amenitiesList]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, additionalImageUrls: imageUrlsList }));
  }, [imageUrlsList]);

  const renderPropertyForm = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Property Name *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.name 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter property name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price *
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.price 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter price"
            min="0"
            step="0.01"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-destructive">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
            errors.description 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="Enter property description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Provide a detailed description of the property (at least 10 characters)
        </p>
      </div>

      {/* Main Image URL */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Main Image URL *
        </label>
        <input
          type="url"
          value={formData.mainImageUrl || ''}
          onChange={(e) => handleInputChange('mainImageUrl', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.mainImageUrl 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.mainImageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.mainImageUrl}</p>
        )}
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.location 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter property location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-destructive">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.city 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter city"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Region *
          </label>
          <input
            type="text"
            value={formData.region || ''}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.region 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter region"
          />
          {errors.region && (
            <p className="mt-1 text-sm text-destructive">{errors.region}</p>
          )}
        </div>
      </div>

      {/* Property Type and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Property Type *
          </label>
          <select
            value={formData.propertyType || ''}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.propertyType 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
          >
            <option value="">Select property type</option>
            <option value="hostel">Hostel</option>
            <option value="hotel">Hotel</option>
            <option value="homestay">Homestay</option>
            <option value="apartment">Apartment</option>
            <option value="guesthouse">Guest House</option>
          </select>
          {errors.propertyType && (
            <p className="mt-1 text-sm text-destructive">{errors.propertyType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category *
          </label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.categoryId 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            disabled={fetchingCategories}
          >
            <option value="">
              {fetchingCategories ? 'Loading categories...' : 'Select a category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-destructive">{errors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Currency and Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Currency
          </label>
          <select
            value={formData.currency || '₵'}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
          >
            <option value="₵">₵ (Ghana Cedi)</option>
            <option value="$">$ (US Dollar)</option>
            <option value="€">€ (Euro)</option>
            <option value="£">£ (British Pound)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Latitude
          </label>
          <input
            type="number"
            value={formData.latitude || ''}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.latitude 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="e.g., 5.5600"
            step="0.0001"
            min="-90"
            max="90"
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-destructive">{errors.latitude}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Longitude
          </label>
          <input
            type="number"
            value={formData.longitude || ''}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.longitude 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="e.g., -0.2057"
            step="0.0001"
            min="-180"
            max="180"
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-destructive">{errors.longitude}</p>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={formData.displayOrder || '0'}
            onChange={(e) => handleInputChange('displayOrder', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
            placeholder="0"
            min="0"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured || false}
            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
            Featured Property
          </label>
        </div>
      </div>
    </div>
  );

  const renderCategoryForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Category Name *
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.name 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="Enter category name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Image URL *
        </label>
        <input
          type="url"
          value={formData.imageUrl || ''}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.imageUrl 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.imageUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
            errors.description 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="Enter category description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Provide a clear description of this category (at least 10 characters)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Type
        </label>
        <select
          value={formData.type || ''}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
        >
          <option value="">Select category type (optional)</option>
          <option value="hostel">Hostel</option>
          <option value="hotel">Hotel</option>
          <option value="homestay">Homestay</option>
          <option value="apartment">Apartment</option>
          <option value="guesthouse">Guest House</option>
        </select>
      </div>
    </div>
  );

  const renderRoomTypeForm = () => (
    <div className="space-y-6">
      {/* Property Selection - Required for Room Types */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Property *
        </label>
        <select
          value={formData.propertyId || ''}
          onChange={(e) => handleInputChange('propertyId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.propertyId 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          disabled={fetchingProperties}
        >
          <option value="">
            {fetchingProperties ? 'Loading properties...' : 'Select a property'}
          </option>
          {properties.length === 0 && !fetchingProperties ? (
            <option value="" disabled>No properties available</option>
          ) : (
            properties.map((property: any) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.city}, {property.region}
              </option>
            ))
          )}
        </select>
        {properties.length === 0 && !fetchingProperties && (
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            No properties found. Please create a property first.
          </p>
        )}
        {errors.propertyId && (
          <p className="mt-1 text-sm text-destructive">{errors.propertyId}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Room types must be associated with a specific property
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Room Type Name *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.name 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter room type name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Capacity *
          </label>
          <input
            type="number"
            value={formData.capacity || ''}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
              errors.capacity 
                ? 'border-destructive bg-destructive/10' 
                : 'border-border bg-background text-foreground'
            }`}
            placeholder="Enter capacity"
            min="1"
          />
          {errors.capacity && (
            <p className="mt-1 text-sm text-destructive">{errors.capacity}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Base Price *
        </label>
        <input
          type="number"
          value={formData.price || ''}
          onChange={(e) => handleInputChange('price', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.price 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="Enter base price"
          min="0"
          step="0.01"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-destructive">{errors.price}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
            errors.description 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="Enter room type description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Provide a detailed description of the room type (at least 10 characters)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Gender Type *
        </label>
        <select
          value={formData.genderType || ''}
          onChange={(e) => handleInputChange('genderType', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.genderType 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
        >
          <option value="">Select gender type</option>
          <option value="male">Male Only</option>
          <option value="female">Female Only</option>
          <option value="mixed">Mixed</option>
          <option value="any">Any Gender</option>
        </select>
        {errors.genderType && (
          <p className="mt-1 text-sm text-destructive">{errors.genderType}</p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Amenities
        </label>
        
        {/* Display existing amenities */}
        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {amenitiesList.map((amenity, index) => (
              <span
                key={index}
                className="flex items-center bg-primary/10 text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full max-w-full sm:max-w-xs"
              >
                <span className="truncate">{amenity}</span>
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="ml-1 sm:ml-2 text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Add new amenity */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity();
              }
            }}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
            placeholder="Enter amenity (e.g., WiFi, AC, Private Bathroom)"
          />
          <button
            type="button"
            onClick={addAmenity}
            disabled={!newAmenity.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        
        {errors.amenities && (
          <p className="mt-1 text-sm text-destructive">{errors.amenities}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Add amenities available in this room type
        </p>
      </div>

      {/* Main Image URL */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Main Image URL
        </label>
        <input
          type="url"
          value={formData.imageUrl || ''}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            errors.imageUrl 
              ? 'border-destructive bg-destructive/10' 
              : 'border-border bg-background text-foreground'
          }`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.imageUrl}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          URL for the main room type image
        </p>
      </div>

      {/* Additional Image URLs */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Additional Image URLs
        </label>
        
        {/* Display existing image URLs */}
        {imageUrlsList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {imageUrlsList.map((url, index) => (
              <span
                key={index}
                className="flex items-center bg-primary/10 text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full max-w-full sm:max-w-xs"
                title={url}
              >
                <span className="truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="ml-1 sm:ml-2 text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Add new image URL */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl();
              }
            }}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-foreground"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={addImageUrl}
            disabled={!newImageUrl.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        
        {errors.additionalImageUrls && (
          <p className="mt-1 text-sm text-destructive">{errors.additionalImageUrls}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Add additional image URLs for the swipable gallery
        </p>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (type) {
      case 'property':
        return renderPropertyForm();
      case 'category':
        return renderCategoryForm();
      case 'room-type':
        return renderRoomTypeForm();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{config.title}</h2>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {errors.general}
                </p>
              </div>
            </div>
          )}
            {renderForm()}
            
            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create {type === 'property' ? 'Property' : type === 'category' ? 'Category' : 'Room Type'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal; 
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Building2, Tag, Bed, LogIn, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileMenuButton from '../components/MobileMenuButton';
import AddItemModal from '../components/AddItemModal';
import ViewItemModal from '../components/ViewItemModal';
import apiService from '../services/api';

interface Property {
  id: string;
  name: string;
  description: string;
  price: string;
  location: string;
  city: string;
  region: string;
  propertyType: string;
  status: string;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  category: { name: string };
  createdAt: string;
  currency: string; // Added for price display
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: string;
  propertyCount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  createdAt: string;
}

interface RegionalSection {
  id: string;
  name: string;
  propertyCount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'categories' | 'room-types' | 'regional-sections'>('properties');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'property' | 'category' | 'room-type' | 'regional-section'>('property');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalType, setViewModalType] = useState<'property' | 'category' | 'room-type' | 'regional-section'>('property');
  const [viewItemId, setViewItemId] = useState<string>('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalType, setEditModalType] = useState<'property' | 'category' | 'room-type' | 'regional-section'>('property');
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemData, setEditItemData] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemType, setDeleteItemType] = useState<'property' | 'category' | 'room-type' | 'regional-section'>('property');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    properties: Property[];
    categories: Category[];
    roomTypes: RoomType[];
    regionalSections: RegionalSection[];
  }>({
    properties: [],
    categories: [],
    roomTypes: [],
    regionalSections: [],
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch properties, categories, room types, and regional sections
      const [propertiesRes, categoriesRes, roomTypesRes, regionalSectionsRes] = await Promise.all([
        apiService.getAllProperties(),
        apiService.getAllCategories(),
        apiService.getAllRoomTypes(),
        apiService.getAllRegionalSections(),
      ]);

      console.log('API Responses:', { propertiesRes, categoriesRes, roomTypesRes, regionalSectionsRes });

      // Handle the API response structure properly
      const properties = (propertiesRes.data as any)?.properties || propertiesRes.data || [];
      const categories = categoriesRes.data || [];
      const roomTypes = roomTypesRes.data || [];
      const regionalSections = (regionalSectionsRes.data as RegionalSection[]) || [];

      setData({
        properties: Array.isArray(properties) ? properties : [],
        categories: Array.isArray(categories) ? categories : [],
        roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
        regionalSections: regionalSections,
      });

      console.log('Processed Data:', {
        properties: Array.isArray(properties) ? properties : [],
        categories: Array.isArray(categories) ? categories : [],
        roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
      // Initialize with empty arrays to prevent map errors
      setData({
        properties: [],
        categories: [],
        roomTypes: [],
        regionalSections: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNew = (type: 'property' | 'category' | 'room-type' | 'regional-section') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      switch (modalType) {
        case 'property':
          await apiService.createProperty(formData);
          break;
        case 'category':
          await apiService.createCategory(formData);
          break;
        case 'room-type':
          await apiService.createRoomType(formData);
          break;
        case 'regional-section':
          await apiService.createRegionalSection(formData);
          break;
      }
      
      // Refresh data after successful creation
      await fetchData();
    } catch (error) {
      console.error('Error creating item:', error); 
      throw error; // Re-throw to show error in modal
    }
  };

  const handleView = (id: string, type: 'property' | 'category' | 'room-type' | 'regional-section') => {
    setViewItemId(id);
    setViewModalType(type);
    setViewModalOpen(true);
  };

  const handleEdit = (id: string, type: 'property' | 'category' | 'room-type' | 'regional-section') => {
    // Find the item data based on type and id
    let itemData = null;
    switch (type) {
      case 'property':
        itemData = data.properties.find(p => p.id === id);
        break;
      case 'category':
        itemData = data.categories.find(c => c.id === id);
        break;
      case 'room-type':
        itemData = data.roomTypes.find(r => r.id === id);
        break;
      case 'regional-section':
        itemData = data.regionalSections.find(s => s.id === id);
        break;
    }

    if (itemData) {
      setEditItemId(id);
      setEditModalType(type);
      setEditItemData(itemData);
      setEditModalOpen(true);
    }
  };

  const handleDelete = (id: string, type: 'property' | 'category' | 'room-type' | 'regional-section') => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      switch (deleteItemType) {
        case 'property':
          await apiService.deleteProperty(deleteItemId);
          break;
        case 'category':
          await apiService.deleteCategory(deleteItemId);
          break;
        case 'room-type':
          await apiService.deleteRoomType(deleteItemId);
          break;
        case 'regional-section':
          await apiService.deleteRegionalSection(deleteItemId);
          break;
      }
      
      // Refresh data after successful deletion
      await fetchData();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleEditSubmit = async (data: any) => {
    try {
      switch (editModalType) {
        case 'property':
          await apiService.updateProperty(editItemId, data);
          break;
        case 'category':
          await apiService.updateCategory(editItemId, data);
          break;
        case 'room-type':
          await apiService.updateRoomType(editItemId, data);
          break;
        case 'regional-section':
          await apiService.updateRegionalSection(editItemId, data);
          break;
      }
      
      // Refresh data after successful update
      await fetchData();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  const renderPropertiesTable = () => {
    // Add null check to prevent map error
    if (!data.properties || !Array.isArray(data.properties)) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">Loading properties...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-foreground font-medium">Property</th>
              <th className="px-6 py-3 text-foreground font-medium">Price</th>
              <th className="px-6 py-3 text-foreground font-medium">Location</th>
              <th className="px-6 py-3 text-foreground font-medium">Category</th>
              <th className="px-6 py-3 text-foreground font-medium">Type</th>
              <th className="px-6 py-3 text-foreground font-medium">Status</th>
              <th className="px-6 py-3 text-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                    <p className="font-medium">No properties found</p>
                    <p className="text-sm">Properties will appear here once they are added</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.properties.map((property) => (
                <tr key={property.id} className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{property.name}</div>
                      <div className="text-muted-foreground text-xs">{property.description.substring(0, 50)}...</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{property.city}, {property.region}</span>
                        {property.isFeatured && (
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    <div className="font-medium">{property.currency}{property.price}</div>
                    <div className="text-xs text-muted-foreground">
                      ⭐ {property.rating} ({property.reviewCount} reviews)
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">{property.location}</td>
                  <td className="px-6 py-4 text-foreground">{property.category.name}</td>
                  <td className="px-6 py-4 text-foreground capitalize">{property.propertyType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      property.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(property.id, 'property')}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(property.id, 'property')}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Edit property"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id, 'property')}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCategoriesTable = () => {
    // Add null check to prevent map error
    if (!data.categories || !Array.isArray(data.categories)) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <Tag className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">Loading categories...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-foreground font-medium">Category</th>
              <th className="px-6 py-3 text-foreground font-medium">Description</th>
              <th className="px-6 py-3 text-foreground font-medium">Created</th>
              <th className="px-6 py-3 text-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <Tag className="w-8 h-8 text-muted-foreground" />
                    <p className="font-medium">No categories found</p>
                    <p className="text-sm">Categories will appear here once they are added</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.categories.map((category) => (
                <tr key={category.id} className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {category.imageUrl && (
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{category.name}</span>
                        <div className="text-xs text-muted-foreground capitalize">{category.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{category.description}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(category.id, 'category')}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(category.id, 'category')}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, 'category')}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRoomTypesTable = () => {
    // Add null check to prevent map error
    if (!data.roomTypes || !Array.isArray(data.roomTypes)) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <Bed className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">Loading room types...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-foreground font-medium">Room Type</th>
              <th className="px-6 py-3 text-foreground font-medium">Description</th>
              <th className="px-6 py-3 text-foreground font-medium">Capacity</th>
              <th className="px-6 py-3 text-foreground font-medium">Price</th>
              <th className="px-6 py-3 text-foreground font-medium">Created</th>
              <th className="px-6 py-3 text-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.roomTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <Bed className="w-8 h-8 text-muted-foreground" />
                    <p className="font-medium">No room types found</p>
                    <p className="text-sm">Room types will appear here once they are added</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.roomTypes.map((roomType) => (
                <tr key={roomType.id} className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{roomType.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{roomType.description}</td>
                  <td className="px-6 py-4 text-foreground">{roomType.capacity} person(s)</td>
                  <td className="px-6 py-4 text-foreground">${roomType.price}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(roomType.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleView(roomType.id, 'room-type')}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(roomType.id, 'room-type')}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        title="Edit room type"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(roomType.id, 'room-type')}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRegionalSectionsTable = () => {
    if (!data.regionalSections || !Array.isArray(data.regionalSections)) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">Loading regional sections...</p>
          </div>
        </div>
      );
    }

    if (data.regionalSections.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">No regional sections found</p>
            <p className="text-sm">Regional sections will appear here once they are added</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-foreground font-medium">Name</th>
              <th className="px-6 py-3 text-foreground font-medium">Property Count</th>
              <th className="px-6 py-3 text-foreground font-medium">Status</th>
              <th className="px-6 py-3 text-foreground font-medium">Display Order</th>
              <th className="px-6 py-3 text-foreground font-medium">Created</th>
              <th className="px-6 py-3 text-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.regionalSections.map((section) => (
              <tr key={section.id} className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{section.name}</td>
                <td className="px-6 py-4 text-foreground">{section.propertyCount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    section.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {section.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground">{section.displayOrder}</td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(section.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(section.id, 'regional-section')}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(section.id, 'regional-section')}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Edit regional section"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(section.id, 'regional-section')}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Building2, count: data.properties?.length || 0 },
    { id: 'categories', label: 'Categories', icon: Tag, count: data.categories?.length || 0 },
    { id: 'room-types', label: 'Room Types', icon: Bed, count: data.roomTypes?.length || 0 },
    { id: 'regional-sections', label: 'Regional Sections', icon: Building2, count: data.regionalSections?.length || 0 },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Properties Management</h1>
                  <p className="text-muted-foreground text-sm">Manage properties, categories, and room types</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-2">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <div className="text-destructive mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Data</h3>
              <p className="text-destructive/80 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Properties Management</h1>
                <p className="text-muted-foreground text-sm">Manage properties, categories, and room types</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-2">
          {/* Tabs and Add Button Row */}
          <div className="flex items-center justify-between mb-2">
            {/* Tabs */}
            <div className="border-b border-border flex-1">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Add New Button - Far Right */}
            <div className="ml-6">
              <button
                onClick={() => handleAddNew(activeTab === 'properties' ? 'property' : activeTab === 'categories' ? 'category' : activeTab === 'room-types' ? 'room-type' : 'regional-section')}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New {activeTab === 'properties' ? 'Property' : activeTab === 'categories' ? 'Category' : activeTab === 'room-types' ? 'Room Type' : 'Regional Section'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading data...
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Fetching properties, categories, room types, and regional sections...</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {activeTab === 'properties' && renderPropertiesTable()}
                {activeTab === 'categories' && renderCategoriesTable()}
                {activeTab === 'room-types' && renderRoomTypesTable()}
                {activeTab === 'regional-sections' && renderRegionalSectionsTable()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <AddItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onSubmit={handleModalSubmit}
      />
      
      {/* Edit Modal */}
      <AddItemModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        type={editModalType}
        onSubmit={handleEditSubmit}
        editData={editItemData}
        isEdit={true}
      />
      
      {/* View Modal */}
      <ViewItemModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        type={viewModalType}
        itemId={viewItemId}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete {deleteItemType.replace('-', ' ')}</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to delete this {deleteItemType.replace('-', ' ')}? This action will permanently remove it from the system.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage; 
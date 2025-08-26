import React, { useState, useEffect } from 'react';
import { X, Building2, Tag, Bed, MapPin, Star, Calendar, Users, Home, Mail, Phone, Shield } from 'lucide-react';
import apiService from '../services/api';

interface ViewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'property' | 'category' | 'room-type' | 'user';
  itemId: string;
}

const ViewItemModal: React.FC<ViewItemModalProps> = ({ isOpen, onClose, type, itemId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails();
    }
  }, [isOpen, itemId, type]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (type) {
        case 'property':
          response = await apiService.getPropertyDetails(itemId);
          break;
        case 'category':
          response = await apiService.getCategoryDetails(itemId);
          break;
        case 'room-type':
          response = await apiService.getRoomTypeDetails(itemId);
          break;
        case 'user':
          response = await apiService.getUserDetails(itemId);
          break;
        default:
          throw new Error('Invalid item type');
      }

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch item details');
      }
    } catch (error: any) {
      console.error('Error fetching item details:', error);
      setError(error.message || 'Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              View {type === 'property' ? 'Property' : type === 'category' ? 'Category' : 'Room Type'} Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && data && (
              <div className="space-y-4">
                {type === 'property' && (
                  <>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{data.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {data.location}, {data.city}, {data.region}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {data.currency}{data.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {data.propertyType}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {data.rating} ({data.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    {data.roomTypes && data.roomTypes.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Room Types ({data.roomTypes.length})</h3>
                        <div className="space-y-2">
                          {data.roomTypes.map((roomType: any) => (
                            <div key={roomType.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{roomType.name}</span>
                                <span className="text-blue-600 dark:text-blue-400">
                                  {roomType.currency}{roomType.price}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{roomType.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {type === 'category' && (
                  <>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{data.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          Type: {data.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Properties: {data.properties?.length || 0}
                        </span>
                      </div>
                    </div>

                    {data.properties && data.properties.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Properties in this Category</h3>
                        <div className="space-y-2">
                          {data.properties.map((property: any) => (
                            <div key={property.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{property.name}</span>
                                <span className="text-blue-600 dark:text-blue-400">
                                  {property.currency}{property.price}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{property.location}, {property.city}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {type === 'room-type' && (
                  <>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{data.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Price: {data.currency}{data.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Capacity: {data.capacity}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Bed className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Available: {data.availableRooms}/{data.totalRooms}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          Gender: {data.genderType}
                        </span>
                      </div>
                    </div>

                    {data.property && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Associated Property</h3>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{data.property.name}</span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {data.property.currency}{data.property.price}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {data.property.location}, {data.property.city}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {type === 'user' && (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {data.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.fullName}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">User ID: {data.id}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">{data.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{data.phoneNumber}</span>
                      </div>
                      
                      {data.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700 dark:text-gray-300">{data.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Status: {data.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium">Email Verification</span>
                        <span className={`text-sm ${data.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {data.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium">Phone Verification</span>
                        <span className={`text-sm ${data.isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {data.isPhoneVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      
                      {data.lastLoginAt && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm font-medium">Last Login</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(data.lastLoginAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(data.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewItemModal; 
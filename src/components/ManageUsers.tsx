import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import axios from 'axios';

interface UserData {
  id: string;
  userName: string;
  email: string;
  personName: string;
  phoneNumber: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/Account/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data || []);
    } catch (error) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWatchlist = (userData: UserData) => {
    const encodedUserName = encodeURIComponent(userData.personName || userData.userName);
    navigate(`/user-watchlist/${userData.id}/${encodedUserName}`);
  };

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="manage-users-header">
        <h1>Manage Users</h1>
        <p>Admin panel to manage all users</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-container">
          {users.length === 0 ? (
            <div className="no-users">
              <h3>No users found</h3>
              <p>There are no users to display.</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div className="header-cell">Name</div>
                <div className="header-cell">Email</div>
                <div className="header-cell">Phone Number</div>
                <div className="header-cell">Actions</div>
              </div>
              
              {users.map((userData) => (
                <div key={userData.id} className="table-row">
                  <div className="table-cell">{userData.personName || userData.userName}</div>
                  <div className="table-cell">{userData.email}</div>
                  <div className="table-cell">{userData.phoneNumber || 'N/A'}</div>
                  <div className="table-cell">
                    <button 
                      className="action-button watchlist-button"
                      onClick={() => handleViewWatchlist(userData)}
                    >
                      Watchlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="users-summary">
            <p>Total users: {users.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
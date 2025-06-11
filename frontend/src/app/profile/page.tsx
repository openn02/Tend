"use client";

import { useState, useEffect } from 'react';
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { useRole } from "../../contexts/RoleContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

// Define a type for user data based on backend schema (assuming id, email, full_name, role)
interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: string; // Or a more specific enum if available
}

export default function ProfilePage() {
  const { role } = useRole();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserData, setEditableUserData] = useState<UserData | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://tend.onrender.com/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setEditableUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableUserData(userData);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://tend.onrender.com/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editableUserData?.full_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      setError(err instanceof Error ? err : new Error('An error occurred'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableUserData) {
      setEditableUserData({
        ...editableUserData,
        [e.target.name]: e.target.value,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-200/80 via-purple-100/50 to-white/50" />

      {/* Content */}
      <div className="relative z-10">
        <DashboardHeader
          pendingNudgeRequestsCount={0}
          incomingRequest={{ detected: false, message: '', state: 'none' }}
          setIncomingRequestState={() => {}}
        />
        
        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-8 pb-8 pt-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={userData?.email || ''}
                    disabled
                    className="bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-gray-700">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={editableUserData?.full_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="disabled:opacity-100 disabled:cursor-default text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={userData?.role || ''}
                    disabled
                    className="bg-gray-100 disabled:opacity-100 disabled:cursor-default text-gray-800"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel} className="text-gray-800 border-gray-300 hover:bg-gray-100">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-purple-600 text-white hover:bg-purple-700">
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit} className="bg-purple-600 text-white hover:bg-purple-700">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
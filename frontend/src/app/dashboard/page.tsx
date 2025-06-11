"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        toast.error('Failed to load user data');
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userData.full_name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Role: {userData.role}</p>
            <p className="text-gray-600">Email: {userData.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
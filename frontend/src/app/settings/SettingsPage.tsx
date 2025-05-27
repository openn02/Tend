"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, MessageSquare, Video, Settings, Bell, User, Shield, Zap } from 'lucide-react';
import { initiateOAuth, getIntegrationStatus } from '@/lib/api/integrations';

interface IntegrationStatus {
  connected: boolean;
  lastSync?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  provider: string;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const integrationList: Integration[] = [
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Connect your Google Calendar to sync your schedule and availability.',
      icon: <Calendar className="h-6 w-6" />,
      provider: 'google'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect Slack to receive notifications and updates.',
      icon: <MessageSquare className="h-6 w-6" />,
      provider: 'slack'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Connect Zoom to schedule and join meetings directly.',
      icon: <Video className="h-6 w-6" />,
      provider: 'zoom'
    }
  ];

  useEffect(() => {
    // Process OAuth callback
    const code = searchParams.get('code');
    const provider = searchParams.get('provider');
    
    if (code && provider) {
      // Handle OAuth callback
      console.log('OAuth callback received:', { code, provider });
      // You would typically make an API call here to exchange the code for tokens
    }
  }, [searchParams]);

  useEffect(() => {
    // Check initial connection status
    const checkStatuses = async () => {
      const statuses: Record<string, IntegrationStatus> = {};
      for (const integration of integrationList) {
        try {
          const status = await getIntegrationStatus(integration.provider);
          statuses[integration.id] = status;
        } catch (error) {
          console.error(`Error checking status for ${integration.id}:`, error);
          statuses[integration.id] = { connected: false };
        }
      }
      setIntegrationStatuses(statuses);
    };

    checkStatuses();
  }, [integrationList]);

  const handleConnect = async (integration: Integration) => {
    setIsLoading(prev => ({ ...prev, [integration.id]: true }));
    try {
      const authUrl = await initiateOAuth(integration.provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Error initiating OAuth for ${integration.id}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [integration.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`${
                  activeTab === 'integrations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Integrations
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </div>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`${
                  activeTab === 'account'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'integrations' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Services</h2>
                <div className="space-y-4">
                  {integrationList.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(integration)}
                        disabled={isLoading[integration.id]}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          integrationStatuses[integration.id]?.connected
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {isLoading[integration.id] ? (
                          'Connecting...'
                        ) : integrationStatuses[integration.id]?.connected ? (
                          'Connected'
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                {/* Add notification settings here */}
              </div>
            )}

            {activeTab === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                {/* Add account settings here */}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                {/* Add security settings here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
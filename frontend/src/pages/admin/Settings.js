import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [actionLoading, setActionLoading] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    supportEmail: '',
    phone: '',
    address: '',
    timezone: '',
    currency: 'USD',
    language: 'en',
    maintenanceMode: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalClientSecret: '',
    paypalMode: 'sandbox',
    commissionRate: 10,
    minimumPayout: 50
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      const settings = response.data.settings;
      
      setGeneralSettings(settings.general || generalSettings);
      setPaymentSettings(settings.payment || paymentSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType, settingsData) => {
    try {
      setActionLoading(true);
      await axios.put('/api/admin/settings', {
        type: settingsType,
        settings: settingsData
      });
      toast.success(`${settingsType} settings saved successfully`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <>
      <Helmet>
        <title>Settings - MarketPlace</title>
        <meta name="description" content="Manage platform settings and configuration" />
      </Helmet>

      <div className="container">
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Platform Settings</h1>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === 'general' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog mr-2"></i>
              General
            </button>
            <button 
              className={`tab ${activeTab === 'payment' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <i className="fas fa-credit-card mr-2"></i>
              Payment
            </button>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title mb-4">General Settings</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveSettings('general', generalSettings); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Site Name *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Site URL *</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered"
                        value={generalSettings.siteUrl}
                        onChange={(e) => setGeneralSettings({...generalSettings, siteUrl: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text">Site Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered"
                        rows="3"
                        value={generalSettings.siteDescription}
                        onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Admin Email *</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={generalSettings.adminEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, adminEmail: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Support Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Currency</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Language</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={generalSettings.language}
                        onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                      </select>
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label cursor-pointer">
                        <span className="label-text">Maintenance Mode</span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={generalSettings.maintenanceMode}
                          onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
                        />
                      </label>
                      <div className="label">
                        <span className="label-text-alt">Enable to put the site in maintenance mode</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-6">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title mb-4">Payment Settings</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveSettings('payment', paymentSettings); }}>
                  <div className="space-y-6">
                    {/* Stripe Settings */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Stripe Configuration</h3>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={paymentSettings.stripeEnabled}
                          onChange={(e) => setPaymentSettings({...paymentSettings, stripeEnabled: e.target.checked})}
                        />
                      </div>
                      
                      {paymentSettings.stripeEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Publishable Key</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered"
                              value={paymentSettings.stripePublishableKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, stripePublishableKey: e.target.value})}
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Secret Key</span>
                            </label>
                            <input
                              type="password"
                              className="input input-bordered"
                              value={paymentSettings.stripeSecretKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PayPal Settings */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">PayPal Configuration</h3>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={paymentSettings.paypalEnabled}
                          onChange={(e) => setPaymentSettings({...paymentSettings, paypalEnabled: e.target.checked})}
                        />
                      </div>
                      
                      {paymentSettings.paypalEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Client ID</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered"
                              value={paymentSettings.paypalClientId}
                              onChange={(e) => setPaymentSettings({...paymentSettings, paypalClientId: e.target.value})}
                            />
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Client Secret</span>
                            </label>
                            <input
                              type="password"
                              className="input input-bordered"
                              value={paymentSettings.paypalClientSecret}
                              onChange={(e) => setPaymentSettings({...paymentSettings, paypalClientSecret: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Commission Settings */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Commission Rate (%)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="input input-bordered"
                            value={paymentSettings.commissionRate}
                            onChange={(e) => setPaymentSettings({...paymentSettings, commissionRate: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Minimum Payout ($)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input input-bordered"
                            value={paymentSettings.minimumPayout}
                            onChange={(e) => setPaymentSettings({...paymentSettings, minimumPayout: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-6">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Save Payment Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSettings;

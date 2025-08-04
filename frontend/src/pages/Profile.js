import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Profile - MarketPlace</title>
        <meta name="description" content="Manage your profile" />
      </Helmet>

      <div className="container">
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Profile Information</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name</label>
                      <p className="text-lg">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <p className="text-lg">{user?.lastName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Email</label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Role</label>
                      <p className="text-lg capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Account Actions</h3>
                </div>
                <div className="card-body">
                  <p className="text-secondary">
                    Profile management features will be implemented soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

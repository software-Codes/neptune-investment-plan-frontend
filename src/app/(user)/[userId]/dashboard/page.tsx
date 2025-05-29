/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { getCurrentUser, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setProfile(user);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [getCurrentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const goHome = () => {
  const url = new URL('/', window.location.origin);
  url.searchParams.set('from', 'dashboard');
  router.push(url.toString());
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">Dashboard</h1>
        <div className="space-x-3">
          <Button variant="outline" onClick={goHome}>
            Home
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>User ID</TableCell><TableCell>{profile.user_id}</TableCell></TableRow>
              <TableRow><TableCell>Full Name</TableCell><TableCell>{profile.full_name}</TableCell></TableRow>
              <TableRow><TableCell>Email</TableCell><TableCell>{profile.email}</TableCell></TableRow>
              <TableRow><TableCell>Phone</TableCell><TableCell>{profile.phone_number}</TableCell></TableRow>
              <TableRow><TableCell>Preferred Contact</TableCell><TableCell>{profile.preferred_contact_method}</TableCell></TableRow>
              <TableRow><TableCell>Status</TableCell><TableCell>{profile.account_status}</TableCell></TableRow>
              <TableRow><TableCell>Email Verified</TableCell><TableCell>{profile.email_verified ? 'Yes' : 'No'}</TableCell></TableRow>
              <TableRow><TableCell>Phone Verified</TableCell><TableCell>{profile.phone_verified ? 'Yes' : 'No'}</TableCell></TableRow>
              <TableRow><TableCell>Created At</TableCell><TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wallets Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Locked</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.wallets.map((w: any) => (
                <TableRow key={w.wallet_id}>
                  <TableCell>{w.wallet_type}</TableCell>
                  <TableCell>{w.balance}</TableCell>
                  <TableCell>{w.locked_balance || '0'}</TableCell>
                  <TableCell>{new Date(w.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

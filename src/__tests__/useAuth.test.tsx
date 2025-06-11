import React from 'react';
import { render } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

function TestComponent() {
  useAuth();
  return null;
}

describe('useAuth', () => {
  it('throws when called outside an AuthProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
  });
});

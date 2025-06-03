export interface KYCDocument {
  id: string
  type: 'passport' | 'nationalId' | 'drivingLicense' | 'utility'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  verifiedAt?: string
  url?: string
}
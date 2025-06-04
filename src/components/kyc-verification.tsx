/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/kyc/KycVerification.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle } from "lucide-react";
import { DocumentVerificationStatus } from "@/types/types";

/**
 * KycVerification component allows users to upload KYC documents,
 * view current document statuses, and skip if desired.
 */
const KycVerification = () => {
    const { uploadDocument, getUserDocuments, getDocumentStatus, user } =
        useAuth();
    const [documentType, setDocumentType] = useState<string>("");
    const [documentCountry, setDocumentCountry] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [skipped, setSkipped] = useState(false);

    // Fetch existing documents on mount
    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = useCallback(async () => {
        try {
            const docs = await getUserDocuments()
            setDocuments(docs)
        } catch (err: any) {
            console.error('Error fetching docs:', err)
        }
    }, [getUserDocuments])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            setFile(e.target.files[0])
        }
    }
    const handleUpload = async () => {
        if (!file || !documentType || !documentCountry) {
            setError('Please select document type, country, and a file.')
            return
        }
        setError(null)
        setUploading(true)
        setProgress(0)
        try {
            // Simulate progress (since axios progress requires config)
            const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200)
            const uploaded = await uploadDocument(file, documentType, documentCountry)
            clearInterval(interval)
            setProgress(100)
            // Refresh list
            await fetchDocuments()
        } catch (err: any) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
            setTimeout(() => setProgress(0), 500)
        }
    }
      const handleSkip = () => {
    setSkipped(true)
    // Optionally redirect or just mark as skipped
  }

  if (skipped) {
    return (
      <Alert className="w-full">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="font-medium">KYC Skipped</AlertTitle>
        <AlertDescription>
          You can complete KYC later from your profile.
        </AlertDescription>
      </Alert>
    )
  }


return (
    <Card className="w-full max-w-lg bg-white dark:bg-slate-800 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          KYC Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Document Type Selector */}
        <div>
          <Label htmlFor="docType" className="text-gray-700 dark:text-gray-300">
            Document Type
          </Label>
          <Select
            onValueChange={setDocumentType}
            value={documentType}
            disabled={uploading}
          >
            <SelectTrigger id="docType" className="w-full mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driver_license">Driver&apos;s License</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Document Country Selector */}
        <div>
          <Label htmlFor="docCountry" className="text-gray-700 dark:text-gray-300">
            Document Country
          </Label>
          <Select
            onValueChange={setDocumentCountry}
            value={documentCountry}
            disabled={uploading}
          >
            <SelectTrigger id="docCountry" className="w-full mt-1">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KEN">Kenya</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="GBR">United Kingdom</SelectItem>
              {/* Add more as needed */}
            </SelectContent>
          </Select>
        </div>

        {/* File Input */}
        <div>
          <Label htmlFor="fileInput" className="text-gray-700 dark:text-gray-300">
            Upload Document
          </Label>
          <input
            id="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1 w-full text-sm text-gray-600 dark:text-gray-400"
          />
        </div>

        {/* Upload Button and Progress */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button variant="ghost" onClick={handleSkip} disabled={uploading}>
            Skip for now
          </Button>
        </div>

        {uploading && <Progress value={progress} className="h-2 mt-2" />}

        {/* Existing Documents List */}
        <div className="mt-4 space-y-2">
          <Label className="text-gray-700 dark:text-gray-300">
            Your Documents
          </Label>
          {documents.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No documents uploaded.
            </p>
          )}
          {documents.map((doc) => (
            <div key={doc.document_id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {doc.document_type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant={
                  doc.verification_status === DocumentVerificationStatus.APPROVED
                    ? 'default'
                    : doc.verification_status === DocumentVerificationStatus.PENDING
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {doc.verification_status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

    export default KycVerification;

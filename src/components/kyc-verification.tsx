/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/kyc/KycVerification.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Upload,
  CheckCircle,
  FileText,
  Shield,
  Camera,
  Clock,
  X,
  AlertCircle,
  FileCheck,
  Globe,
  IdCard,
  CreditCard,
  BookOpen,
  FileImage,
  Plus
} from "lucide-react";
import { DocumentVerificationStatus } from "@/types/types";
import { countries } from "@/components/kyc/countries-data";
import Image from "next/image";

/**
 * KycVerification component allows users to upload KYC documents,
 * view current document statuses, and skip if desired.
 */
const KycVerification = () => {
  const { uploadDocument, getUserDocuments, getDocumentStatus, user } = useAuth();
  const [documentType, setDocumentType] = useState<string>("");
  const [documentCountry, setDocumentCountry] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [skipped, setSkipped] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document type options with icons
  const documentTypeOptions = [
    { value: "passport", label: "Passport", icon: BookOpen },
    { value: "driver_license", label: "Driver's License", icon: CreditCard },
    { value: "national_id", label: "National ID", icon: IdCard },
  ];

  // Fetch existing documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await getUserDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error fetching docs:', err);
    }
  }, [getUserDocuments]);

  const handleFileChange = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a valid file (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !documentType || !documentCountry) {
      setError('Please select document type, country, and upload a file.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200);
      const uploaded = await uploadDocument(file, documentType, documentCountry);
      clearInterval(interval);
      setProgress(100);

      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setDocumentType("");
      setDocumentCountry("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh list
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case DocumentVerificationStatus.APPROVED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case DocumentVerificationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case DocumentVerificationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case DocumentVerificationStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case DocumentVerificationStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case DocumentVerificationStatus.REJECTED:
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (skipped) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full 
                                    flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              KYC Verification Skipped
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You can complete your KYC verification later from your profile settings.
            </p>
          </div>
          <Button
            onClick={() => setSkipped(false)}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white"
          >
            Continue with KYC
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="shadow-2xl border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 
                                     border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl 
                                        flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                KYC Verification
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Upload your identity documents for verification
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-800 
                                                             bg-red-50 dark:bg-red-950/50 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Upload Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">
              Document Type *
            </Label>
            <Select
              onValueChange={setDocumentType}
              value={documentType}
              disabled={uploading}
            >
              <SelectTrigger className="w-full h-12 border-slate-300 dark:border-slate-600 
                                                     bg-white dark:bg-slate-800 rounded-xl">
                <SelectValue placeholder="Choose document type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                {documentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Country Selector */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">
              Issuing Country *
            </Label>
            <Select
              onValueChange={setDocumentCountry}
              value={documentCountry}
              disabled={uploading}
            >
              <SelectTrigger className="w-full h-12 border-slate-300 dark:border-slate-600 
                                                     bg-white dark:bg-slate-800 rounded-xl">
                <SelectValue placeholder="Select issuing country" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 max-h-60">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code} className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      {country.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">
              Upload Document *
            </Label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
                                       ${dragActive
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                }
                                       ${uploading ? 'opacity-50 pointer-events-none' : ''}
                                       bg-slate-50 dark:bg-slate-800/50`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleInputChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="space-y-4">
                  {previewUrl && (
                    <div className="flex justify-center">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-32 rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <FileCheck className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 
                                                    rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold mb-1">
                      Drag and drop your document here
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      or click to browse files
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Supported: JPG, PNG, PDF (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Uploading...</span>
                <span className="text-slate-600 dark:text-slate-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={uploading || !file || !documentType || !documentCountry}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 
                                     text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                                     transition-all duration-200 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={uploading}
              className="flex-1 sm:flex-none h-12 rounded-xl font-semibold border-slate-300 dark:border-slate-600
                                     hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="shadow-2xl border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your Documents
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No documents uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.document_id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 
                                              rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg 
                                                        flex items-center justify-center">
                      {documentTypeOptions.find(opt => opt.value === doc.document_type)?.icon ?
                        React.createElement(documentTypeOptions.find(opt => opt.value === doc.document_type)!.icon,
                          { className: "h-5 w-5 text-green-600 dark:text-green-400" }) :
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                                                       ${getStatusColor(doc.verification_status)}`}>
                      {getStatusIcon(doc.verification_status)}
                      {doc.verification_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KycVerification;
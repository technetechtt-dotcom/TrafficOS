import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { DocumentCategory, VaultDocument } from '../types';
import { formatDate } from '../utils/formatters';
import { downloadTextFile } from '../utils/payments';
import {
  FileTextIcon,
  UploadIcon,
  DownloadIcon,
  EyeIcon,
  Trash2Icon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  FolderLockIcon,
  IdCardIcon,
  CarIcon,
  UmbrellaIcon,
  WrenchIcon,
  ContactIcon } from
'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: {
  id: DocumentCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
{
  id: 'identity',
  label: 'Identity',
  icon: <IdCardIcon className="w-4 h-4" />
},
{
  id: 'licence',
  label: 'Licence',
  icon: <ContactIcon className="w-4 h-4" />
},
{
  id: 'vehicle',
  label: 'Vehicle',
  icon: <CarIcon className="w-4 h-4" />
},
{
  id: 'roadworthy',
  label: 'Roadworthy',
  icon: <WrenchIcon className="w-4 h-4" />
},
{
  id: 'insurance',
  label: 'Insurance',
  icon: <UmbrellaIcon className="w-4 h-4" />
},
{
  id: 'other',
  label: 'Other',
  icon: <FileTextIcon className="w-4 h-4" />
}];


export function DocumentVaultPage() {
  const { state, dispatch } = useAppStore();
  const [filter, setFilter] = useState<'all' | DocumentCategory>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [preview, setPreview] = useState<VaultDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] =
  useState<DocumentCategory>('vehicle');
  const [uploadVehicleId, setUploadVehicleId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
    filter === 'all' ?
    state.documents :
    state.documents.filter((d) => d.category === filter),
    [state.documents, filter]
  );

  const expiringSoon = state.documents.filter(
    (d) =>
    d.expiresAt &&
    new Date(d.expiresAt).getTime() - Date.now() < 30 * 86400000 &&
    new Date(d.expiresAt).getTime() > Date.now()
  );

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;
    setIsUploading(true);

    setTimeout(() => {
      const doc: VaultDocument = {
        id: `doc_${Date.now()}`,
        name: uploadName.trim(),
        category: uploadCategory,
        fileType: 'PDF',
        sizeKb: Math.floor(Math.random() * 3000 + 400),
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'pending',
        vehicleId: uploadVehicleId || undefined
      };
      dispatch({
        type: 'ADD_DOCUMENT',
        payload: doc
      });
      setIsUploading(false);
      setIsUploadOpen(false);
      setUploadName('');
      setUploadVehicleId('');
      toast.success('Document uploaded and encrypted');
    }, 1400);
  };

  const handleDownload = (doc: VaultDocument) => {
    const contents = [
    '================================================',
    '        TRAFFICOS SA — SECURE DOCUMENT VAULT',
    '================================================',
    '',
    `Document  : ${doc.name}`,
    `Category  : ${doc.category}`,
    `File type : ${doc.fileType}`,
    `Uploaded  : ${formatDate(doc.uploadedAt)}`,
    doc.expiresAt ? `Expires   : ${formatDate(doc.expiresAt)}` : '',
    `Status    : ${doc.verificationStatus}`,
    '',
    'This export is a metadata record of a document held in',
    'your encrypted vault. The original file is released only',
    'to you or to an authorised official on your instruction,',
    'in line with POPIA.',
    '================================================'].

    filter(Boolean).
    join('\n');
    downloadTextFile(`${doc.name.replace(/[^\w\s-]/g, '')}.txt`, contents);
    toast.success('Document exported');
  };

  const handleDelete = (doc: VaultDocument) => {
    if (!window.confirm(`Permanently delete "${doc.name}" from your vault?`))
    return;
    dispatch({
      type: 'REMOVE_DOCUMENT',
      payload: doc.id
    });
    setPreview(null);
    toast.success('Document deleted');
  };

  const categoryMeta = (category: DocumentCategory) =>
  CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[5];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.25,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="space-y-6">
      
      <PageHeader
        title="Document Vault"
        description="Your identity, licence and vehicle paperwork in one encrypted place — ready for a roadblock or a dispute."
        actions={
        <Button
          variant="primary"
          leftIcon={<UploadIcon className="w-4 h-4" />}
          onClick={() => setIsUploadOpen(true)}>
          
            Upload
          </Button>
        } />
      

      {expiringSoon.length > 0 &&
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {expiringSoon.length}{' '}
              {expiringSoon.length === 1 ? 'document expires' : 'documents expire'}{' '}
              within 30 days
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              {expiringSoon.
            map((d) => `${d.name} (${formatDate(d.expiresAt as string)})`).
            join(' · ')}
            </p>
          </div>
        </div>
      }

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
          filter === 'all' ?
          'bg-blue-600 text-white shadow-sm' :
          'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`
          }>
          
          All ({state.documents.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = state.documents.filter(
            (d) => d.category === c.id
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              filter === c.id ?
              'bg-blue-600 text-white shadow-sm' :
              'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`
              }>
              
              {c.icon}
              {c.label} ({count})
            </button>);

        })}
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<FolderLockIcon className="w-8 h-8" />}
        title="Nothing stored here yet"
        description="Upload your ID, driving licence and vehicle registration so you always have proof on hand."
        actionLabel="Upload a document"
        onAction={() => setIsUploadOpen(true)} /> :


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
          const meta = categoryMeta(doc.category);
          const vehicle = state.vehicles.find((v) => v.id === doc.vehicleId);
          const isExpiring =
          doc.expiresAt &&
          new Date(doc.expiresAt).getTime() - Date.now() < 30 * 86400000;
          return (
            <motion.article
              key={doc.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
              
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {meta.icon}
                  </div>
                  {isExpiring ?
                <Badge variant="warning" size="sm">
                      Expiring
                    </Badge> :

                <Badge
                  variant={
                  doc.verificationStatus === 'verified' ?
                  'success' :
                  doc.verificationStatus === 'rejected' ?
                  'danger' :
                  'neutral'
                  }
                  size="sm">
                  
                      {doc.verificationStatus}
                    </Badge>
                }
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">
                  {doc.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex-1">
                  {doc.fileType} · {(doc.sizeKb / 1024).toFixed(1)} MB · added{' '}
                  {formatDate(doc.uploadedAt)}
                  {vehicle && ` · ${vehicle.licensePlate}`}
                  {doc.expiresAt &&
                <span className="block mt-1">
                      Expires {formatDate(doc.expiresAt)}
                    </span>
                }
                </p>

                <div className="flex gap-2 mt-4">
                  <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<EyeIcon className="w-4 h-4" />}
                  onClick={() => setPreview(doc)}>
                  
                    View
                  </Button>
                  <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<DownloadIcon className="w-4 h-4" />}
                  onClick={() => handleDownload(doc)}>
                  
                    Save
                  </Button>
                  <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${doc.name}`}
                  onClick={() => handleDelete(doc)}
                  className="px-2.5 text-gray-400 hover:text-red-600">
                  
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </motion.article>);

        })}
        </div>
      }

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Documents are encrypted at rest with AES-256 and processed in South
          Africa in line with POPIA. Nothing is shared with an authority without
          your explicit instruction.{' '}
          <button
            onClick={() =>
            dispatch({
              type: 'SET_TAB',
              payload: 'privacy'
            })
            }
            className="font-medium underline">
            
            Read the privacy policy
          </button>
        </p>
      </div>

      {/* Upload */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload a document"
        maxWidth="md">
        
        <form onSubmit={handleUpload} className="space-y-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
            
            <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Choose a file or drop it here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PDF, JPG or PNG · up to 10 MB
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setUploadName(file.name.replace(/\.[^.]+$/, ''));
            }} />
          

          <div>
            <label
              htmlFor="doc-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              
              Document name
            </label>
            <input
              id="doc-name"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g. Roadworthy Certificate — CA 123-456"
              required
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4" />
            
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="doc-category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                
                Category
              </label>
              <select
                id="doc-category"
                value={uploadCategory}
                onChange={(e) =>
                setUploadCategory(e.target.value as DocumentCategory)
                }
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4">
                
                {CATEGORIES.map((c) =>
                <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="doc-vehicle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                
                Link to vehicle (optional)
              </label>
              <select
                id="doc-vehicle"
                value={uploadVehicleId}
                onChange={(e) => setUploadVehicleId(e.target.value)}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4">
                
                <option value="">Not vehicle specific</option>
                {state.vehicles.map((v) =>
                <option key={v.id} value={v.id}>
                    {v.licensePlate}
                  </option>
                )}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            By uploading you confirm the document is yours and consent to it
            being stored and processed as set out in our privacy policy (POPIA
            s.11).
          </p>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isUploading}>
            
            Upload securely
          </Button>
        </form>
      </Modal>

      {/* Preview */}
      <Modal
        isOpen={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.name ?? 'Document'}
        maxWidth="lg">
        
        {preview &&
        <div className="space-y-5">
            <div className="aspect-[4/3] rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3">
              <FileTextIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {preview.fileType} preview ·{' '}
                {(preview.sizeKb / 1024).toFixed(1)} MB
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Category
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {preview.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Verification
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {preview.verificationStatus}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Uploaded
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {formatDate(preview.uploadedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Expires
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {preview.expiresAt ? formatDate(preview.expiresAt) : 'No expiry'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
              variant="secondary"
              fullWidth
              leftIcon={<DownloadIcon className="w-4 h-4" />}
              onClick={() => handleDownload(preview)}>
              
                Download
              </Button>
              <Button
              variant="danger"
              fullWidth
              leftIcon={<Trash2Icon className="w-4 h-4" />}
              onClick={() => handleDelete(preview)}>
              
                Delete
              </Button>
            </div>
          </div>
        }
      </Modal>
    </motion.div>);

}
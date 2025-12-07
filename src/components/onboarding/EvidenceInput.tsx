// /components/onboarding/EvidenceInput.tsx - UPDATED
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Globe, FileText, MessageSquare, Link, X, 
  CheckCircle, Zap, Brain, Loader2 
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface EvidenceItem {
  _id: string;
  type: 'website' | 'document' | 'social' | 'manual';
  value: string;
  status: 'pending' | 'processing' | 'complete';
}

interface EvidenceInputProps {
  onAnalyze: () => void;
}

export default function EvidenceInput({ onAnalyze }: EvidenceInputProps) {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [manualText, setManualText] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  // Load existing evidence
  useEffect(() => {
    fetchEvidence();
  }, [brandSlug]);

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/brands/${brandSlug}/evidence`);
      const data = await response.json();
      
      if (data.success) {
        setEvidence(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvidence = async (type: EvidenceItem['type'], value: string) => {
    if (!value.trim()) return;

    try {
      setIsAdding(true);
      setError('');

      const response = await fetch(`/api/brands/${brandSlug}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      });

      const data = await response.json();

      if (data.success) {
        setEvidence(prev => [data.data, ...prev]);
        
        // Clear input
        if (type === 'website') setWebsiteUrl('');
        if (type === 'social') setSocialLink('');
        if (type === 'manual') setManualText('');
      } else {
        setError(data.error || 'Failed to add evidence');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveEvidence = async (id: string) => {
    try {
      const response = await fetch(`/api/brands/${brandSlug}/evidence?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setEvidence(prev => prev.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error('Failed to remove evidence:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      // For now, treat files as manual evidence with filename
      await handleAddEvidence('document', file.name);
    }
  };

  const getStatusIcon = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getTypeIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'social':
        return <MessageSquare className="w-4 h-4" />;
      case 'manual':
        return <Link className="w-4 h-4" />;
    }
  };

  const handleAnalyze = async () => {
    // Update onboarding step
    try {
      await fetch(`/api/brands/${brandSlug}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 3 }),
      });
    } catch (error) {
      console.error('Failed to update onboarding step:', error);
    }
    
    onAnalyze();
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Evidence Summary */}
      <div className="p-6 card-base border border-[rgb(var(--border))]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Brand Evidence Collection
            </h3>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Add materials for Brainiark AI to analyze
            </p>
          </div>
          <div className="text-sm text-[rgb(var(--muted-foreground))]">
            {isLoading ? 'Loading...' : `${evidence.length} items added`}
          </div>
        </div>

        {/* Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Website Input */}
          <div className="p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-[rgb(var(--foreground))]">
                  Website URL
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Your main website
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="flex-1 px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAdding}
              />
              <button
                onClick={() => handleAddEvidence('website', websiteUrl)}
                disabled={isAdding || !websiteUrl.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium text-[rgb(var(--foreground))]">
                  Social Profiles
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  LinkedIn, Twitter, Instagram
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="@username or profile URL"
                className="flex-1 px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isAdding}
              />
              <button
                onClick={() => handleAddEvidence('social', socialLink)}
                disabled={isAdding || !socialLink.trim()}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium text-[rgb(var(--foreground))]">
                  Documents
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  PDFs, Word docs, images
                </p>
              </div>
            </div>
            <label className="block">
              <div className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-[rgb(var(--border))] rounded-lg cursor-pointer hover:border-[rgb(var(--os-accent))] transition-colors ${isAdding ? 'opacity-50' : ''}`}>
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted-foreground))]" />
                  <p className="text-sm text-[rgb(var(--foreground))]">
                    Drop files or click to upload
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    PDF, DOC, PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  disabled={isAdding}
                />
              </div>
            </label>
          </div>

          {/* Manual Description */}
          <div className="p-4 rounded-lg border border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Link className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium text-[rgb(var(--foreground))]">
                  Manual Description
                </h4>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Describe your brand
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Describe your brand's mission, values, tone of voice..."
                className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] resize-none"
                disabled={isAdding}
              />
              <button
                onClick={() => handleAddEvidence('manual', manualText)}
                disabled={isAdding || !manualText.trim()}
                className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add Description'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Evidence */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[rgb(var(--muted-foreground))] animate-spin" />
            <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">Loading evidence...</span>
          </div>
        ) : evidence.length > 0 ? (
          <div>
            <h4 className="font-medium text-[rgb(var(--foreground))] mb-3">
              Added Evidence ({evidence.length})
            </h4>
            <div className="space-y-2">
              {evidence.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--secondary))]"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div className="max-w-md">
                      <p className="text-sm text-[rgb(var(--foreground))] truncate">
                        {item.value}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] capitalize">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <button
                      onClick={() => handleRemoveEvidence(item._id)}
                      disabled={isAdding}
                      className="p-1 hover:bg-[rgb(var(--os-surface)/0.6)] rounded disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[rgb(var(--muted-foreground))]" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No evidence added yet. Start by adding your website or brand materials above.
            </p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={evidence.length === 0 || isLoading}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-[rgb(var(--os-accent))] to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 mx-auto"
        >
          <Brain className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {evidence.length === 0 
              ? 'Add evidence to continue' 
              : `Analyze with Brainiark AI (${evidence.length} items)`}
          </span>
          <Zap className="w-5 h-5" />
        </motion.button>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
          Brainiark AI will analyze your brand and generate insights
        </p>
      </div>
    </div>
  );
}
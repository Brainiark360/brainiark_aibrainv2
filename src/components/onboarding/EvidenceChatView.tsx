// /components/onboarding/EvidenceChatView.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { 
  Globe, FileText, MessageSquare, Link, 
  Upload, CheckCircle, X, Loader2, Sparkles 
} from 'lucide-react';

interface EvidenceItem {
  _id: string;
  type: 'website' | 'document' | 'social' | 'manual';
  value: string;
  status: 'pending' | 'processing' | 'complete';
}

export default function EvidenceChatView() {
  const params = useParams();
  const brandSlug = params.slug as string;
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [manualText, setManualText] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'website' | 'social' | 'documents' | 'manual'>('website');
  
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
        
        // Show success feedback
        setTimeout(() => {
          // You could trigger a chat message here
        }, 500);
      }
    } catch (error) {
      console.error('Failed to add evidence:', error);
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
  
  const tabs = [
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'social', label: 'Social', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'manual', label: 'Describe', icon: Link },
  ];
  
  return (
    <div className="card-base border border-[rgb(var(--border))] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[rgb(var(--border))]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="h3-os text-[rgb(var(--foreground))]">
              Add Brand Materials
            </h2>
            <p className="body-os text-[rgb(var(--muted-foreground))]">
              Help me understand your brand better
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 p-1 rounded-lg bg-[rgb(var(--secondary))]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-[rgb(var(--os-surface))] text-[rgb(var(--foreground))] shadow-sm'
                    : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'website' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Website URL
              </label>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                Add your main website for analysis
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAdding}
                />
                <button
                  onClick={() => handleAddEvidence('website', websiteUrl)}
                  disabled={isAdding || !websiteUrl.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'social' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Social Profiles
              </label>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                LinkedIn, Twitter, Instagram, etc.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="@username or profile URL"
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isAdding}
                />
                <button
                  onClick={() => handleAddEvidence('social', socialLink)}
                  disabled={isAdding || !socialLink.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Documents
              </label>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                PDFs, brand guidelines, images, etc.
              </p>
              <label className="block">
                <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-[rgb(var(--border))] rounded-2xl cursor-pointer hover:border-blue-500 transition-colors bg-[rgb(var(--secondary))]">
                  <Upload className="w-12 h-12 mb-4 text-[rgb(var(--muted-foreground))]" />
                  <p className="text-lg font-medium text-[rgb(var(--foreground))] mb-2">
                    Drop files or click to upload
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] text-center">
                    PDF, DOC, PNG, JPG up to 10MB each
                  </p>
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
          </motion.div>
        )}
        
        {activeTab === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Describe Your Brand
              </label>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                Mission, values, tone, target audience, etc.
              </p>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Describe your brand's mission, values, tone of voice, target audience, or anything else you'd like me to know..."
                className="w-full px-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[150px] resize-none"
                disabled={isAdding}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleAddEvidence('manual', manualText)}
                  disabled={isAdding || !manualText.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Add Description
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Evidence List */}
        {evidence.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 pt-6 border-t border-[rgb(var(--border))]"
          >
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">
              Added Materials ({evidence.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {evidence.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary)/0.8)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div className="max-w-md">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                        {item.value}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] capitalize">
                        {item.type} • {item.status}
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
          </motion.div>
        )}
        
        {isLoading && evidence.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[rgb(var(--muted-foreground))] animate-spin" />
            <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">
              Loading materials...
            </span>
          </div>
        )}
        
        {!isLoading && evidence.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center">
              <FileText className="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No materials added yet. Start by adding your website or describing your brand.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--os-surface))]">
        <div className="flex items-center justify-between text-sm text-[rgb(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Added materials are analyzed by AI</span>
          </div>
          <div className="text-xs">
            {evidence.length} item{evidence.length !== 1 ? 's' : ''} ready
          </div>
        </div>
      </div>
    </div>
  );
}
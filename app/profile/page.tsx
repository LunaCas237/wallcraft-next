'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  FaCamera, 
  FaArrowRightFromBracket, 
  FaDownload, 
  FaUser, 
  FaChevronRight, 
  FaPencil, 
  FaTrash, 
  FaXmark,
  FaEye,
  FaBookmark
} from 'react-icons/fa6';

// Initialize Supabase client
const supabase = createClient(
  'https://mpsnwijabfingujzirri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc253aWphYmZpbmd1anppcnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDUzNzIsImV4cCI6MjA4MzQyMTM3Mn0.RTNnZHJRnYjoeX9faOi324CbooNxNaW6Fm2xJrV609M'
);

export default function ProfilePage() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'saved' | 'downloads'>('saved');
  
  // Track which field is currently being edited
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Profile Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');

  // User History Data
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      setEmail(session.user.email || '');

      // 1. Fetch Profile Details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setBio(profileData.bio || '');
        setGender(profileData.gender || '');
        setBirthday(profileData.birthday || '');
        setPhoneNumber(profileData.phone_number || '');
        setAvatarUrl(profileData.avatar_url || '');
      }

      // 2. Fetch Download History strictly from `user_downloads`
      const { data: downloadsData, error: downloadsError } = await supabase
        .from('user_downloads')
        .select(`
          id,
          downloaded_at,
          products (
            id,
            title,
            image_url,
            item_code,
            collection_type,
            dimensions,
            subtitle,
            description
          )
        `)
        .eq('user_id', session.user.id)
        .order('downloaded_at', { ascending: false });

      if (downloadsData) {
        const validDownloads = downloadsData.filter(item => item.products !== null);
        console.log(`Found ${validDownloads.length} Downloaded items.`);
        setDownloadHistory(validDownloads);
      } else if (downloadsError) {
        console.error("Error fetching downloads:", downloadsError);
      }

      // 3. Fetch Saved Items strictly from `user_favorites`
      const { data: savedData, error: savedError } = await supabase
        .from('user_favorites')
        .select(`
          id,
          saved_at,
          products (
            id,
            title,
            image_url,
            item_code,
            collection_type,
            dimensions,
            subtitle,
            description
          )
        `)
        .eq('user_id', session.user.id)
        .order('saved_at', { ascending: false });

      if (savedData) {
        const validSaves = savedData.filter(item => item.products !== null);
        console.log(`Found ${validSaves.length} Favorited items.`);
        setSavedItems(validSaves);
      } else if (savedError) {
         console.error("Error fetching favorites. Check if table exists:", savedError);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          bio: bio,
          gender: gender,
          birthday: birthday,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
      setEditingField(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setAvatarUrl(newAvatarUrl);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveItem = async (id: string | number, type: 'download' | 'saved') => {
    if (!confirm(`Are you sure you want to remove this texture from your ${type === 'download' ? 'history' : 'saved items'}?`)) return;

    try {
      const table = type === 'download' ? 'user_downloads' : 'user_favorites';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'download') {
        setDownloadHistory(prev => prev.filter(item => item.id !== id));
      } else {
        setSavedItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item.');
    }
  };

  const handleReDownload = async (product: any) => {
    if (!product?.image_url) return;
    
    try {
      setDownloading(true);
      const response = await fetch(product.image_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${product.item_code || product.title || 'texture'}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const renderEditableRow = (
    label: string, 
    fieldKey: string, 
    value: string, 
    setter: (val: string) => void, 
    inputType: 'text' | 'date' | 'select' = 'text',
    options: string[] = []
  ) => {
    const isEditing = editingField === fieldKey;

    return (
      <div className="flex justify-between items-center p-4 border-b border-white/5 last:border-0 min-h-[56px]">
        <span className="text-sm text-zinc-300 w-1/3">{label}</span>
        <div className="flex items-center w-2/3 justify-end">
          {isEditing ? (
            inputType === 'select' ? (
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="bg-transparent text-right text-sm text-white outline-none w-full appearance-none"
                style={{ direction: 'rtl' }}
              >
                <option value="" disabled className="bg-[#1a1a1a]">Select</option>
                {options.map(opt => (
                  <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={inputType}
                value={value}
                onChange={(e) => setter(e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="bg-transparent border-b border-[#B08038] text-right text-sm text-white outline-none w-full pb-1"
                style={inputType === 'date' ? { colorScheme: 'dark' } : {}}
              />
            )
          ) : (
            <div 
              className="flex items-center cursor-pointer group justify-end w-full"
              onClick={() => setEditingField(fieldKey)}
            >
              <span className={`text-sm text-right truncate ${value ? 'text-white' : 'text-[#B08038]'}`}>
                {value || 'Set Now'}
              </span>
              <FaChevronRight className="ml-3 text-zinc-600 text-xs group-hover:text-[#B08038] transition-colors" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Switch the data being rendered based on which tab is clicked
  const currentData = activeTab === 'saved' ? savedItems : downloadHistory;
  const emptyMessage = activeTab === 'saved' 
    ? "No saved items found. Click the save icon on products to keep them here for later."
    : "No download history found. Downloaded materials will appear here.";
  const EmptyIcon = activeTab === 'saved' ? FaBookmark : FaDownload;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-[#B08038] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20 px-6 lg:px-16 font-['Prompt'] relative">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Column - Profile Info & Edit */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Avatar Centered */}
            <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-white/5">
              <div className="relative group mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 shadow-xl flex items-center justify-center border border-white/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-4xl text-zinc-500" />
                  )}
                </div>
                {/* Upload Button Overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity duration-300">
                  <FaCamera className="text-white text-xl" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    disabled={uploading}
                    className="hidden" 
                  />
                </label>
              </div>
              <label className="text-zinc-400 text-sm flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <FaPencil className="text-xs" /> Edit Profile Picture
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={uploading}
                  className="hidden" 
                />
              </label>
            </div>

            {/* List Group 1: Name & Bio */}
            <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
              {renderEditableRow('First Name', 'firstName', firstName, setFirstName)}
              {renderEditableRow('Last Name', 'lastName', lastName, setLastName)}
              {renderEditableRow('Bio', 'bio', bio, setBio)}
            </div>

            {/* List Group 2: Gender & Birthday */}
            <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
              {renderEditableRow('Gender', 'gender', gender, setGender, 'select', ['Male', 'Female', 'Other'])}
              {renderEditableRow('Birthday', 'birthday', birthday, setBirthday, 'date')}
            </div>

            {/* List Group 3: Contact */}
            <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
              {renderEditableRow('Phone', 'phone', phoneNumber, setPhoneNumber)}
              <div className="flex justify-between items-center p-4 border-b border-white/5 last:border-0 min-h-[56px]">
                <span className="text-sm text-zinc-300 w-1/3">Email</span>
                <div className="flex items-center w-2/3 justify-end">
                  <span className="text-sm text-zinc-500 truncate">{email}</span>
                  <FaChevronRight className="ml-3 text-zinc-600 text-xs opacity-0" />
                </div>
              </div>
            </div>

            {/* Save & Sign Out Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button 
                type="button"
                onClick={handleSignOut}
                className="text-zinc-500 text-xs flex items-center gap-2 hover:text-white transition-colors"
              >
                <FaArrowRightFromBracket /> Sign Out
              </button>
              
              <button 
                type="submit" 
                disabled={saving}
                className="bg-[#B08038] text-white px-6 py-2 rounded-sm text-xs font-medium tracking-wide hover:bg-[#8f662a] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column - Tabs & History */}
        <div className="w-full lg:w-2/3 lg:pl-12 lg:border-l border-white/10 mt-10 lg:mt-0">
          
          {/* Tabs Navigation */}
          <div className="flex gap-8 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-sm md:text-base font-medium tracking-wide uppercase transition-colors relative ${
                activeTab === 'saved' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Saved Items
              {activeTab === 'saved' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B08038]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`pb-3 text-sm md:text-base font-medium tracking-wide uppercase transition-colors relative ${
                activeTab === 'downloads' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Download History
              {activeTab === 'downloads' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#B08038]" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium tracking-wide text-white uppercase">
              {activeTab === 'saved' ? 'Your Saved Textures' : 'Recent Downloads'}
            </h2>
            <span className="text-zinc-500 text-xs">{currentData.length} Items</span>
          </div>

          {currentData.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-sm p-12 text-center flex flex-col items-center mt-4">
              <EmptyIcon className="text-4xl text-zinc-600 mb-4" />
              <h3 className="text-white font-medium mb-2">{emptyMessage}</h3>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">
                Explore our collections to find the perfect materials for your next project.
              </p>
              <Link href="/introduction" className="bg-[#B08038] text-white px-8 py-3 text-[10px] uppercase tracking-widest rounded-sm hover:bg-[#8f662a] transition-colors">
                Explore Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {currentData.map((dataItem) => {
                const product = dataItem.products;
                if (!product) return null;

                const dateString = dataItem.downloaded_at || dataItem.saved_at;
                const displayDate = new Date(dateString).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div key={dataItem.id} className="group relative bg-[#050505] border border-white/10 rounded-sm overflow-hidden hover:border-[#B08038]/50 transition-colors flex flex-col">
                    
                    <div 
                      className="aspect-square p-4 bg-zinc-900/50 flex items-center justify-center overflow-hidden cursor-pointer relative"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="flex items-center gap-2 text-white text-xs uppercase tracking-widest font-bold border border-white/30 px-4 py-2 bg-black/40">
                          <FaEye /> View
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-white/5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-[#B08038] text-xs font-bold uppercase tracking-wider mb-1 truncate">
                          {product.title}
                        </h4>
                        <p className="text-zinc-500 text-[10px] tracking-widest uppercase mb-1">
                          {product.item_code}
                        </p>
                        <p className="text-zinc-600 text-[9px] mb-4">
                          {activeTab === 'saved' ? 'Saved' : 'Downloaded'}: {displayDate}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => handleRemoveItem(dataItem.id, activeTab === 'downloads' ? 'download' : 'saved')}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                          title={`Remove from ${activeTab === 'saved' ? 'saved items' : 'history'}`}
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"
            >
              <FaXmark />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 bg-[#050505] flex items-center justify-center p-8 relative min-h-[300px]">
              <div className="w-full aspect-square relative border border-white/5">
                <img
                  src={selectedProduct.image_url || ''}
                  alt={selectedProduct.title || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right side: Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto no-scrollbar text-left relative bg-[#0a0a0a]">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl text-[#B08038] font-medium mb-2 leading-tight uppercase tracking-wide">
                  {selectedProduct.title}
                </h2>
                <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-4 font-bold">
                  {selectedProduct.subtitle || selectedProduct.collection_type?.replace('_', ' ') || 'Collection'}
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                  {selectedProduct.description || 'Premium architectural material from your Wallcraft history.'}
                </p>
              </div>

              <hr className="border-white/10 mb-6" />

              <div className="mb-8 p-5 bg-white/5 rounded-sm border border-white/5 space-y-4">
                <div className="flex justify-between items-start gap-6">
                  <div>
                    <span className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1">
                      Dimensions
                    </span>
                    <span className="text-[#c2bfb6] text-xs font-light whitespace-pre-line leading-relaxed block">
                      {selectedProduct.dimensions || 'Standard Form'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-zinc-500 text-[9px] uppercase tracking-wider mb-1">
                      Ref Code
                    </span>
                    <span className="text-[#B08038] text-xs tracking-wider">
                      {selectedProduct.item_code || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={() => handleReDownload(selectedProduct)}
                  disabled={downloading}
                  className="w-full py-4 bg-white hover:bg-[#B08038] text-black hover:text-white uppercase text-[11px] font-bold tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FaDownload /> Download Image
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Hide Scrollbar for Modal content */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}
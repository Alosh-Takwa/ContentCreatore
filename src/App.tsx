/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { BrandProfile, Campaign, DayPlan } from './types';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [showOnboardingNew, setShowOnboardingNew] = useState(false);
  const [customViralPosts, setCustomViralPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved campaigns and custom training viral posts on app mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('social_campaigns');
    const savedActiveId = localStorage.getItem('social_active_campaign_id');
    const savedCustomViral = localStorage.getItem('social_custom_viral_posts');

    let currentCampaigns: Campaign[] = [];
    let currentActiveId: string | null = null;

    if (savedCampaigns) {
      try {
        currentCampaigns = JSON.parse(savedCampaigns);
      } catch (e) {
        console.error('Error loading saved campaigns:', e);
      }
    }

    if (savedActiveId) {
      currentActiveId = savedActiveId;
    }

    // Dynamic Migration of older single-brand profile data (backward compatibility)
    const oldProfileStr = localStorage.getItem('social_brand_profile');
    if (oldProfileStr && currentCampaigns.length === 0) {
      try {
        const oldProfile = JSON.parse(oldProfileStr);
        const oldPlanStr = localStorage.getItem(`plan_${oldProfile.brandName}`);
        const oldPlan = oldPlanStr ? JSON.parse(oldPlanStr) : [];

        const migratedCampaign: Campaign = {
          id: `campaign-migrated`,
          name: oldProfile.brandName,
          profile: oldProfile,
          daysPlan: oldPlan,
          createdAt: new Date().toISOString()
        };

        currentCampaigns = [migratedCampaign];
        currentActiveId = migratedCampaign.id;

        // Persist newly migrated structure
        localStorage.setItem('social_campaigns', JSON.stringify(currentCampaigns));
        localStorage.setItem('social_active_campaign_id', migratedCampaign.id);
        
        // Clean up legacy keys
        localStorage.removeItem('social_brand_profile');
      } catch (e) {
        console.error('Failed to migrate legacy single brand profile:', e);
      }
    }

    setCampaigns(currentCampaigns);
    if (currentActiveId && currentCampaigns.some(c => c.id === currentActiveId)) {
      setActiveCampaignId(currentActiveId);
    } else if (currentCampaigns.length > 0) {
      setActiveCampaignId(currentCampaigns[0].id);
    }

    if (savedCustomViral) {
      try {
        setCustomViralPosts(JSON.parse(savedCustomViral));
      } catch (e) {
        console.error('Error loading custom viral posts:', e);
      }
    }

    setLoading(false);
  }, []);

  const handleOnboardingComplete = (newProfile: BrandProfile) => {
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: newProfile.brandName,
      profile: newProfile,
      daysPlan: [],
      createdAt: new Date().toISOString()
    };

    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    setActiveCampaignId(newCampaign.id);
    setShowOnboardingNew(false);

    localStorage.setItem('social_campaigns', JSON.stringify(updatedCampaigns));
    localStorage.setItem('social_active_campaign_id', newCampaign.id);
  };

  const handleSwitchCampaign = (id: string) => {
    setActiveCampaignId(id);
    localStorage.setItem('social_active_campaign_id', id);
  };

  const handleCreateNewCampaignClick = () => {
    setShowOnboardingNew(true);
  };

  const handleDeleteCampaign = (id: string) => {
    const targetCampaign = campaigns.find(c => c.id === id);
    const campaignName = targetCampaign ? targetCampaign.name : 'هذا البراند';
    if (confirm(`هل أنت متأكد من رغبتك في حذف براند "${campaignName}" بكافة خططه ومحتوياته بالكامل؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      const updatedCampaigns = campaigns.filter(c => c.id !== id);
      setCampaigns(updatedCampaigns);
      
      let nextActiveId: string | null = null;
      if (updatedCampaigns.length > 0) {
        nextActiveId = updatedCampaigns[0].id;
      }

      setActiveCampaignId(nextActiveId);
      if (nextActiveId) {
        localStorage.setItem('social_active_campaign_id', nextActiveId);
      } else {
        localStorage.removeItem('social_active_campaign_id');
      }
      localStorage.setItem('social_campaigns', JSON.stringify(updatedCampaigns));
    }
  };

  const handleUpdateCampaignPlan = (campaignId: string, updatedPlan: DayPlan[]) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, daysPlan: updatedPlan };
      }
      return c;
    });

    setCampaigns(updatedCampaigns);
    localStorage.setItem('social_campaigns', JSON.stringify(updatedCampaigns));
  };

  const handleAddCustomViralPost = (post: string) => {
    const updated = [post, ...customViralPosts];
    setCustomViralPosts(updated);
    localStorage.setItem('social_custom_viral_posts', JSON.stringify(updated));
  };

  const handleDeleteCustomViralPost = (index: number) => {
    const updated = customViralPosts.filter((_, i) => i !== index);
    setCustomViralPosts(updated);
    localStorage.setItem('social_custom_viral_posts', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center rtl-grid" dir="rtl">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-bold text-slate-500 animate-pulse">جاري تحميل الاستوديو الإعلاني والبراندات...</p>
      </div>
    );
  }

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);

  // Show onboarding if there are no campaigns at all OR if the user clicked "Add Brand"
  const isShowOnboarding = campaigns.length === 0 || showOnboardingNew;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 antialiased font-sans">
      {isShowOnboarding ? (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onCancel={campaigns.length > 0 ? () => setShowOnboardingNew(false) : undefined}
        />
      ) : activeCampaign ? (
        <div key={activeCampaign.id} className="w-full h-full">
          <Dashboard
            activeCampaign={activeCampaign}
            campaigns={campaigns}
            onSwitchCampaign={handleSwitchCampaign}
            onAddCampaign={handleCreateNewCampaignClick}
            onDeleteCampaign={handleDeleteCampaign}
            onUpdateCampaignPlan={handleUpdateCampaignPlan}
            customViralPosts={customViralPosts}
            onAddCustomViralPost={handleAddCustomViralPost}
            onDeleteCustomViralPost={handleDeleteCustomViralPost}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm font-bold text-slate-500">حدث خطأ في تحديد البراند النشط.</p>
          <button 
            onClick={() => setShowOnboardingNew(true)} 
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold"
          >
            البدء بإنشاء براند جديد
          </button>
        </div>
      )}
    </div>
  );
}

// /lib/backend/api-client.ts

import { BrandBrainSection, OnboardingStep } from "@/types/onboarding";

export class OnboardingApiClient {
  private baseUrl: string;
  
  constructor(private slug: string) {
    this.baseUrl = `/api/brands/${slug}/onboarding`;
  }
  
  // Chat API
  async sendChat(message: string, step: OnboardingStep, context?: any): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, step, context }),
    });
    
    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }
    
    return response.body!;
  }
  
  // State API
  async getState() {
    const response = await fetch(`${this.baseUrl}/state`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async updateState(step: OnboardingStep) {
    const response = await fetch(`${this.baseUrl}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step }),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  // Evidence API
  async getEvidence() {
    const response = await fetch(`${this.baseUrl}/evidence`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async addEvidence(type: string, value: string) {
    const response = await fetch(`${this.baseUrl}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value }),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async deleteEvidence(id: string) {
    const response = await fetch(`${this.baseUrl}/evidence?id=${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  // Analysis API
  async startAnalysis() {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async getAnalysisStatus() {
    const response = await fetch(`${this.baseUrl}/analyze`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  // Brain API
  async getBrain() {
    const response = await fetch(`${this.baseUrl}/brain`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async updateBrain(updates: any) {
    const response = await fetch(`${this.baseUrl}/brain`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async refineSection(section: BrandBrainSection, content: string) {
    const response = await fetch(`${this.baseUrl}/brain`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, content }),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
  
  async completeOnboarding() {
    const response = await fetch(`${this.baseUrl}/brain`, {
      method: 'POST',
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
}
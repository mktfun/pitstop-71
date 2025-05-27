
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarBase64: string;
}

class ProfileService {
  private readonly STORAGE_KEY = 'pitstop_user_profile';

  async getProfile(): Promise<UserProfile | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = await this.getProfile();
    const updatedProfile = { 
      name: '',
      email: '',
      phone: '',
      role: '',
      avatarBase64: '',
      ...currentProfile,
      ...updates 
    };
    
    await this.saveProfile(updatedProfile);
    return updatedProfile;
  }

  async clearProfile(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar perfil:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export type { UserProfile };

import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut, deleteUser, User } from 'firebase/auth';
import { User as UserIcon, LogOut, Loader2, X, Trash2 } from 'lucide-react';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose(); // Close modal after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // Safety check using native confirm to avoid UI complexity
    const confirmed = window.confirm(
      "⚠ PERMANENT ACTION ⚠\n\nAre you sure you want to delete your account?\nThis action cannot be undone and all your data will be removed."
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteUser(user);
      onClose();
    } catch (err: any) {
      console.error("Delete account failed:", err);
      // Firebase security rule: Sensitive actions require recent login
      if (err.code === 'auth/requires-recent-login') {
        alert("Security Alert: Please Log Out and Log In again to verify your identity before deleting your account.");
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
        <Loader2 className="text-green-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
      onClose();
      return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-[#0a0a0a] border border-green-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-green-500/10 blur-lg rounded-full animate-pulse"></div>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-2 border-green-500 relative z-10 object-cover" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-green-500 bg-black flex items-center justify-center relative z-10">
                <UserIcon size={40} className="text-green-400" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{user.displayName || 'Agent'}</h3>
          <p className="text-green-400 text-xs font-mono tracking-wider mb-8 opacity-70">{user.email}</p>

          {/* Links Section - Aligned to Right */}
          <div className="w-full flex flex-col items-end gap-4 my-4 py-6 border-y border-white/10 pr-2">
              <a href="/privacy-policy" className="text-sm text-gray-300 hover:text-green-400 transition-colors text-right">Privacy Policy</a>
              <a href="/terms" className="text-sm text-gray-300 hover:text-green-400 transition-colors text-right">Terms & Services</a>
              <a href="/contact" className="text-sm text-gray-300 hover:text-green-400 transition-colors text-right">Contact Us</a>
              <a href="/about" className="text-sm text-gray-300 hover:text-green-400 transition-colors text-right">About Us</a>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full max-w-[200px] flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm tracking-wider">LOG OUT</span>
          </button>

          <button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full max-w-[200px] flex items-center justify-center gap-2 mt-3 px-6 py-2 bg-transparent border border-red-900/30 rounded-xl text-red-900/60 hover:bg-red-950/30 hover:text-red-500 hover:border-red-500/50 transition-all duration-300 group"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span className="font-bold text-xs tracking-wider">DELETE ACCOUNT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
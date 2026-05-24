import * as LucideIcons from 'lucide-react';

const used = [
  'ChevronRight', 'Bell', 'Shield', 'LogOut', 'Plus', 'Folder', 'PieChart', 'Wrench', 
  'RefreshCw', 'ArrowLeft', 'CheckSquare', 'Square', 'Check', 'Archive', 'Trash2', 
  'History', 'RotateCcw', 'Calendar', 'Wallet', 'Loader2', 'Mail', 'EyeOff', 'Eye', 
  'User', 'UserCheck', 'UserMinus', 'Users', 'UserRound', 'Group', 'ChevronLeft', 
  'X', 'IdCard', 'BookUser', 'School', 'HousePlus', 'HeartPulse', 'TentTree', 'Image', 
  'Phone', 'Briefcase', 'Building2', 'AlertTriangle', 'Save', 'Volume2', 'VolumeX', 
  'Music', 'BellRing', 'MessageSquare', 'Moon', 'Smartphone', 'Monitor', 'MapPin', 
  'Upload', 'Info', 'Search'
];

used.forEach(icon => {
  if (!(icon in LucideIcons)) {
    console.log('MISSING:', icon);
  }
});

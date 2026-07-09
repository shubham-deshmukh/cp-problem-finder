import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const UserDropdown: React.FC = () => {
  const [imageError, setImageError] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer h-9 w-9 p-0 flex items-center justify-center bg-transparent border-0 hover:bg-muted/50 transition-colors">
          <Avatar className="h-8 w-8">
            {user?.picture && !imageError ? (
              <AvatarImage
                src={user.picture}
                alt="Profile"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : null}
            <AvatarFallback className="bg-linear-to-br from-[#ffa116] via-[#ff9345] to-[#ff3d00] text-white text-xs font-semibold select-none">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-1 font-geist text-foreground mr-4 sm:mr-6" align="end">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user?.picture && !imageError ? (
                <AvatarImage
                  src={user.picture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-[#ffa116] via-[#ff9345] to-[#ff3d00] text-white text-sm font-semibold select-none">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-foreground">{user?.name || 'User'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || 'No email provided'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer gap-3 p-2.5">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-3 p-2.5">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer gap-3 p-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserDropdown;

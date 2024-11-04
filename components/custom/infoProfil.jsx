import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { LogOut, User } from 'lucide-react';
import { GlobalContext } from "@/lib/GlobalState"
import { useContext } from "react"
import { useRouter } from "next/navigation";
  
export const InfoProfil = ({ ...props }) => {
    const { me } = useContext(GlobalContext)
    const router = useRouter();

    if (!me) {
        return <div>Chargement...</div>;
      }
      
      const { username, color } = me;

    const formatUsername = (username) => {
        return username.slice(0, 2).toUpperCase();
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };
    const handleProfil = () => {
        router.push('/profil')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="btnProfil" style={{background: color}}>
                {formatUsername(username)}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="myProfil" onClick={handleProfil}><User /> Mon Profil</DropdownMenuItem>
                <DropdownMenuItem className="logOut"  onClick={handleLogout}><LogOut /> Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
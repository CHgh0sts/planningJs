import { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GlobalContext } from "@/lib/GlobalState";

export const ListUser = () => {
    const { idUserList, setIdUserList, ListUsers, setListUsers, me } = useContext(GlobalContext);
    const [searchUser, setSearchUser] = useState('');
    const [activeUsers, setActiveUsers] = useState({});

    const toggleActive = (indexUser, userId) => {
        setActiveUsers(prev => ({
            ...prev,
            [indexUser]: !prev[indexUser]
        }));

        if (!activeUsers[indexUser]) {
            setIdUserList(prev => [...prev, userId]);
        } else {
            setIdUserList(prev => prev.filter(id => id !== userId));
        }
    };

    const recupListUser = async () => {
        try {
            console.log("me:", me);  // Vérifier que `me` est défini
            const res = await fetch(`/api/users?username=${searchUser}`);
            if (!res.ok) {
                setListUsers([]);
                return;
            }
            const data = await res.json();
            let users = [];

            for (let userRecup of data.users) {
                if (me.role !== "user" || me.id === userRecup.id) {
                    // Vérifier si l'utilisateur n'est pas déjà dans le tableau `users`
                    if (!users.some(u => u.id === userRecup.id)) {
                        users.push(userRecup);
                    }
                }
            }

            console.log("users:", users);  // Vérifier le contenu de `users`
            setListUsers(users);

            const initialActiveUsers = {};
            users.forEach((_, index) => {
                initialActiveUsers[index] = true;
            });
            setActiveUsers(initialActiveUsers);
            setIdUserList(users.map(user => user.id));
        } catch (error) {
            setListUsers([]);
        }
    };

    useEffect(() => {
        if (me) {  // Attendre que `me` soit chargé
            recupListUser();
        }
    }, [searchUser, me]);

    return (
        <div className="listUsers">
            <h2 className="relative text-center">Liste des utilisateurs</h2>
            <Input
                type="search"
                className="w-[90%] m-auto"
                placeholder="Rechercher un utilisateur"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
            />
            <div className="list">
                {ListUsers.map((user, indexUser) => (
                    <div
                        key={`user_${indexUser}`}
                        className={`user ${activeUsers[indexUser] ? 'active' : ''}`}
                        style={{ '--c': user.color }}
                    >
                        <p>{user.username}</p>
                        <Label htmlFor={`checkbox_${indexUser}`}>
                            <Input
                                className="w-[fit-content]"
                                type="checkbox"
                                id={`checkbox_${indexUser}`}
                                checked={activeUsers[indexUser]}
                                onChange={() => toggleActive(indexUser, user.id)}
                            />
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

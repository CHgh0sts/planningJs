"use client";
import { useContext, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalContext } from '@/lib/GlobalState';

export const PopupBoxEdit = ({ event }) => {    
    const { actualEditDate, setActualDate, me, ListUsers, isDialogOpen, setIsDialogOpen } = useContext(GlobalContext);
    
    const [selectedUser, setSelectedUser] = useState(event?.userId || me || { id: 0, username: "Utilisateur inconnu", color: "#000" });
    const [selectedUsers, setSelectedUsers] = useState(event?.userIds?.split('/')?.map(id => usersList.find(user => user.id === Number(id))) || [me]);
    const [multipleUsers, setMultipleUsers] = useState(selectedUsers.length > 1);
    const [availableUsers, setAvailableUsers] = useState([]);
    const usersList = ListUsers || [];

    const add30Minutes = (time) => {
        if (!time) return '00:30';
        const [hours, minutes] = time.split(':').map(Number);
        const newMinutes = (minutes + 30) % 60;
        const newHours = (hours + Math.floor((minutes + 30) / 60)) % 24;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    };

    const [isFullDay, setIsFullDay] = useState(event?.isFullDay || false);
    const [startDate, setStartDate] = useState(event ? new Date(event.debutAt).toISOString().split('T')[0] : '');
    const [startTime, setStartTime] = useState(event ? new Date(event.debutAt).toTimeString().split(':').slice(0, 2).join(':') : '00:00');
    const [endDate, setEndDate] = useState(event ? new Date(event.finAt).toISOString().split('T')[0] : '');
    const [endTime, setEndTime] = useState(event ? new Date(event.finAt).toTimeString().split(':').slice(0, 2).join(':') : '00:30');

    useEffect(() => {
        setAvailableUsers(usersList.filter(user => !selectedUsers.some(selected => selected.id === user.id)));
    }, [usersList, selectedUsers]);

    const handleStartDateTimeChange = (time) => {
        setStartTime(time);
        adjustEndTime(time, endTime);
    };

    const adjustEndTime = (newStartTime, currentEndTime) => {
        const [startHours, startMinutes] = newStartTime.split(':').map(Number);
        const [endHours, endMinutes] = currentEndTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes - startTotalMinutes < 30) {
            const newEndTotalMinutes = startTotalMinutes + 30;
            const newEndHours = Math.floor(newEndTotalMinutes / 60);
            const newEndMinutes = newEndTotalMinutes % 60;
            setEndTime(`${newEndHours.toString().padStart(2, '0')}:${newEndMinutes.toString().padStart(2, '0')}`);
        }
    };

    const handleEndDateTimeChange = (time) => {
        setEndTime(time);
    };

    const handleUserSelection = (userId) => {
        const userSelected = usersList.find((u) => u.id === userId);
        if (userSelected && !selectedUsers.some((user) => user.id === userSelected.id)) {
            setSelectedUsers([...selectedUsers, userSelected]);
            setAvailableUsers(availableUsers.filter(user => user.id !== userSelected.id));
        }
    };

    const handleRemoveUser = (userId) => {
        const userRemoved = selectedUsers.find(user => user.id === userId);
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
        setAvailableUsers([...availableUsers, userRemoved]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const debutAt = startDate || actualEditDate;
        const finAt = endDate || actualEditDate;

        let userIds;
        if (multipleUsers) {
            userIds = selectedUsers.map((user) => user.id).join('/');
        } else {
            userIds = selectedUser.id.toString();
        }

        const eventData = {
            title: event.target.title.value,
            description: event.target.description.value,
            startDate: `${debutAt}T${startTime}:00`,
            endDate: `${finAt}T${endTime}:00`,
            isFullDay,
            userId: userIds,
        };

        console.log(eventData);

        const res = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!res.ok) {
            console.error('Erreur lors de la mise à jour de l\'événement');
        } else {
            setActualDate(new Date(debutAt));
            setIsDialogOpen(false);
        }
    };

    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l'événement</DialogTitle>
                        <DialogDescription>Modifiez les détails de votre événement.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="">
                                <Label htmlFor="title">Titre</Label>
                                <Input id="title" name="title" placeholder="Titre de l'événement" required defaultValue={event?.title || ''} />
                            </div>
                            <div className="">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Description de l'événement (facultatif)" defaultValue={event?.subtitle || ''} />
                            </div>
                            <Separator />                            
                            <div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="multipleUsers" checked={multipleUsers} onCheckedChange={setMultipleUsers} />
                                    <Label htmlFor="multipleUsers">Mode groupe</Label>
                                </div>
                                {multipleUsers ? (
                                    <div>
                                        <Label>Utilisateurs</Label>
                                        <Select onValueChange={handleUserSelection}>
                                            <SelectTrigger>
                                                <SelectValue>Ajouter des utilisateurs</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Utilisateurs</SelectLabel>
                                                    {availableUsers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: user.color }}></div>
                                                                {user.username}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <div className="userSelectedBox mt-2 flex w-full">
                                            {selectedUsers.map((user) => (
                                                <div style={{ borderColor: user.color, '--c': user.color }} key={user.id} className={`selectedUser flex items-center space-x-2`}>
                                                    <span>{user.username}</span>
                                                    <Button className='deleteUserSelected' onClick={() => handleRemoveUser(user.id)}>X</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="userSelect">Utilisateur</Label>
                                        <Select value={selectedUser?.id} onValueChange={(value) => {
                                            const userSelected = usersList.find(u => u.id === value);
                                            if (userSelected) {
                                                setSelectedUser(userSelected);
                                            }
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: selectedUser?.color || "#000" }}></div>
                                                        {selectedUser?.username || "Sélectionner un utilisateur"}
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Utilisateurs</SelectLabel>
                                                    {usersList.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: user.color }}></div>
                                                                {user.username}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="fullDay" checked={isFullDay} onCheckedChange={(checked) => setIsFullDay(checked === true)} />
                                <Label htmlFor="fullDay">Journée entière</Label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-between w-full">
                                    <Label htmlFor="startDate">Date de début</Label>
                                    <Input id="startDate" className="col-span-3 w-[70%] justify-around mr-2"  name="startDate" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                {!isFullDay && (
                                    <div>
                                        <Input id="startTime" name="startTime" type="time" required value={startTime} onChange={(e) => handleStartDateTimeChange(e.target.value)} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-between w-full">
                                    <Label htmlFor="endDate">Date de fin</Label>
                                    <Input id="endDate" className="col-span-3 w-[70%] justify-around mr-2"  name="endDate" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                </div>
                                {!isFullDay && (
                                    <div>
                                        <Input id="endTime" name="endTime" type="time" required value={endTime} onChange={(e) => handleEndDateTimeChange(e.target.value)} min={startDate === endDate ? startTime : undefined} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button type="submit">Modifier l'événement</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

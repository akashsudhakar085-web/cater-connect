'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Send, User, Phone, MessageCircle } from 'lucide-react';

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    senderName?: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]); // Simplified: just list all users for demo
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        // Get current user
        const loadUser = async () => {
            const response = await supabase.auth.getUser();
            if (response.data?.user) {
                // Fetch full user profile from database to get role
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', response.data.user.id)
                    .single();

                if (profile) {
                    setUser(profile);
                }
            }
        };

        loadUser();
    }, [supabase]);

    useEffect(() => {
        if (!user) return;

        // Fetch potential chat partners
        const fetchUsers = async () => {
            // Select phone and whatsapp_contact for the buttons
            const { data } = await supabase.from('users').select('id, full_name, role, phone, whatsapp_contact');

            if (data && user) {
                let filtered = [];
                // Restrict based on role
                if (user.role === 'WORKER') {
                    // Workers can only see Owners
                    filtered = data.filter((u: any) => u.role === 'OWNER');
                } else if (user.role === 'OWNER') {
                    // Owners can only see Workers
                    filtered = data.filter((u: any) => u.role === 'WORKER');
                } else {
                    // Fallback (e.g. admin or undefined) - show everyone else
                    filtered = data.filter((u: any) => u.id !== user.id);
                }
                setUsersList(filtered);
            }
        };

        fetchUsers();

    }, [user, supabase]);

    useEffect(() => {
        if (!user || !selectedUser) return;

        // Fetch existing messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (data) {
                const formattedMessages = data.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    createdAt: msg.created_at
                }));
                setMessages(formattedMessages);
            }
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel('chat_room')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id}))`
                },
                (payload: any) => {
                    const newMsg = payload.new;
                    setMessages(prev => [...prev, {
                        id: newMsg.id,
                        senderId: newMsg.sender_id,
                        content: newMsg.content,
                        createdAt: newMsg.created_at
                    }]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedUser, supabase]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !selectedUser) return;

        try {
            const { error } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: selectedUser,
                content: newMessage,
            });

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Helper to get selected user details
    const activeUser = usersList.find(u => u.id === selectedUser);

    return (
        <div className="h-[calc(100vh-120px)] flex gap-4 p-4">
            {/* Users List */}
            <div className="w-1/3 glass rounded-2xl p-4 overflow-y-auto space-y-2">
                <h2 className="text-sm font-bold uppercase text-white/40 mb-4 tracking-wider">Messages</h2>
                {usersList.length === 0 && (
                    <div className="text-white/20 text-xs text-center py-4">
                        No contacts found.
                    </div>
                )}
                {usersList.map((u) => (
                    <div
                        key={u.id}
                        onClick={() => setSelectedUser(u.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${selectedUser === u.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold">{u.full_name || 'User'}</p>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">{u.role}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="font-bold">{activeUser?.full_name || 'Chat'}</h3>

                            {/* Contact Actions */}
                            <div className="flex gap-2">
                                {activeUser?.phone && (
                                    <a href={`tel:${activeUser.phone}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                        <Phone size={18} />
                                    </a>
                                )}
                                {activeUser?.whatsapp_contact && (
                                    <a
                                        href={`https://wa.me/${activeUser.whatsapp_contact.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                                    >
                                        <MessageCircle size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl ${isMe
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white/10 text-white rounded-tl-none'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <span className="text-[10px] opacity-50 block text-right mt-1">
                                                {new Date(msg.createdAt.endsWith('Z') ? msg.createdAt : msg.createdAt + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="input-field flex-1"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="btn-primary p-4 rounded-xl disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                            <User size={40} />
                        </div>
                        <p className="font-bold">Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

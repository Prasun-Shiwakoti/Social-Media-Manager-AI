import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DMAssistant() {
    const token = useSelector((state) => state.auth.token);
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [businessProfile, setBusinessProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const res = await axios.get('/api/dashboard/instagram/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinessProfile(res.data.profile);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    const fetchThreads = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get('/api/dashboard/instagram/conversations/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreads(res.data.conversations || []);
        } catch (err) {
            console.error("Error fetching threads:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (threadId) => {
        if (!token || !threadId) return;
        try {
            setLoadingMessages(true);
            const res = await axios.get(`/api/dashboard/instagram/conversations/${threadId}/messages/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchThreads();
    }, [token]);

    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        fetchMessages(thread.id);
    };

    const handleSend = async () => {
        if (!inputText.trim() || !selectedThread || isSending) return;
        
        const messageText = inputText.trim();
        setInputText("");
        setIsSending(true);

        // Optimistic update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            text: messageText,
            direction: 'outgoing',
            created_time: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await axios.post(`/api/dashboard/instagram/conversations/${selectedThread.id}/reply/`, 
                { message: messageText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Re-fetch to get real ID and sync
            fetchMessages(selectedThread.id);
        } catch (err) {
            console.error("Error sending message:", err);
            // Optionally remove the optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setInputText(messageText); // restore text
        } finally {
            setIsSending(false);
        }
    };

    const getRecipientName = (thread) => {
        const participants = thread.participants?.data || [];
        if (!businessProfile) return participants[0]?.username || "Audience Member";
        
        const other = participants.find(p => p.username !== businessProfile.username);
        return other?.username || participants[0]?.username || "Audience Member";
    };

    const filteredThreads = threads.filter(thread => 
        getRecipientName(thread).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">DM Assistant</h2>
                    <p className="text-muted-foreground">Real-time audience conversations across platforms.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchThreads} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 h-full min-h-0">
                {/* Thread List */}
                <Card className="col-span-4 h-full flex flex-col overflow-hidden border-border/50 shadow-sm">
                    <CardHeader className="border-b p-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search conversations..." 
                                className="pl-9" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground">Loading threads...</p>
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground space-y-2">
                                <MessageSquare className="h-8 w-8 mx-auto opacity-20" />
                                <p className="text-sm">No conversations found.</p>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => (
                                <div 
                                    key={thread.id} 
                                    onClick={() => handleSelectThread(thread)}
                                    className={`flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/40 last:border-0 ${selectedThread?.id === thread.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                >
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary uppercase">
                                            {getRecipientName(thread)[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-semibold text-sm truncate">{getRecipientName(thread)}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">
                                                {new Date(thread.updated_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            Conversation started {new Date(thread.updated_time).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Chat View */}
                <Card className="col-span-8 h-full flex flex-col overflow-hidden border-border/50 shadow-sm">
                    {selectedThread ? (
                        <>
                            <CardHeader className="border-b p-4 flex flex-row items-center justify-between bg-card/10">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getRecipientName(selectedThread)[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-bold">{getRecipientName(selectedThread)}</CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Connected</p>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-mono opacity-60">ID: {selectedThread.id}</Badge>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-card/40">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-40">
                                        <MessageSquare className="h-12 w-12" />
                                        <p className="text-sm">No messages yet.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            <div className={`max-w-[75%] p-3 px-4 rounded-2xl text-sm shadow-sm ${
                                                msg.direction === 'outgoing' 
                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                : 'bg-muted rounded-tl-none border-border'
                                            }`}>
                                                <p className="leading-relaxed">{msg.text || msg.message}</p>
                                                <p className={`text-[9px] mt-1 opacity-50 font-medium ${msg.direction === 'outgoing' ? 'text-right' : 'text-left'}`}>
                                                    {new Date(msg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>
                            <div className="p-4 border-t bg-card/20 backdrop-blur-sm">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Type your response..." 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        disabled={isSending}
                                        className="rounded-full px-5 py-6 bg-background/50 border-border/50 focus-visible:ring-primary shadow-inner"
                                    />
                                    <Button 
                                        size="icon" 
                                        className="h-12 w-12 rounded-full shadow-lg transition-transform active:scale-90"
                                        onClick={handleSend}
                                        disabled={isSending || !inputText.trim()}
                                    >
                                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8 text-center bg-card/20">
                            <div className="p-6 rounded-full bg-muted/30 border border-dashed border-muted-foreground/30">
                                <MessageSquare className="h-12 w-12" />
                            </div>
                            <div className="max-w-xs">
                                <h3 className="text-lg font-semibold text-foreground/80">Your Conversations</h3>
                                <p className="text-sm">Select a thread from the list to start managing your customer DMs and audience engagement.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

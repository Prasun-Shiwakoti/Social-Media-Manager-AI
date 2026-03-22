import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { User, Shield, Briefcase, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
    const token = useSelector((state) => state.auth.token);

    // Profile State
    const [profile, setProfile] = useState({ f_name: "", l_name: "", email: "", username: "" });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

    // Password State
    const [passwordData, setPasswordData] = useState({ old_password: "", new_password: "", confirm_password: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

    // Business State
    const [business, setBusiness] = useState(null);
    const [businessFormData, setBusinessFormData] = useState({ name: "", description: "", auto_reply_enabled: false, access_token: "" });
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const logoInputRef = useRef(null);
    const [businessLoading, setBusinessLoading] = useState(false);
    const [businessMessage, setBusinessMessage] = useState({ type: "", text: "" });

    // Initial Fetch
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                // Fetch profile
                const profileRes = await axios.get('/api/account/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile({
                    f_name: profileRes.data.f_name || "",
                    l_name: profileRes.data.l_name || "",
                    email: profileRes.data.email || "",
                    username: profileRes.data.username || "",
                });

                // Fetch business
                const businessRes = await axios.get('/api/account/business-accounts/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (businessRes.data && businessRes.data.length > 0) {
                    const b = businessRes.data[0];
                    setBusiness(b);
                    setBusinessFormData({
                        name: b.name || "",
                        description: b.description || "",
                        auto_reply_enabled: b.auto_reply_enabled || false,
                        access_token: ""
                    });
                    if (b.logo) {
                        setLogoPreview(b.logo);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings data", error);
            }
        };

        fetchData();
    }, [token]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: "", text: "" });
        try {
            await axios.put('/api/account/profile/', {
                f_name: profile.f_name,
                l_name: profile.l_name
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileMessage({ type: "success", text: "Profile updated successfully." });
        } catch (error) {
            setProfileMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setProfileLoading(false);
            setTimeout(() => setProfileMessage({ type: "", text: "" }), 4000);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage({ type: "error", text: "New passwords do not match." });
            return;
        }
        setPasswordLoading(true);
        setPasswordMessage({ type: "", text: "" });
        try {
            await axios.put('/api/account/password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordMessage({ type: "success", text: "Password changed successfully." });
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        } catch (error) {
            setPasswordMessage({ type: "error", text: error.response?.data?.old_password?.[0] || "Failed to change password." });
        } finally {
            setPasswordLoading(false);
            setTimeout(() => setPasswordMessage({ type: "", text: "" }), 4000);
        }
    };

    const handleLogoSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        if (!business) return;
        setBusinessLoading(true);
        setBusinessMessage({ type: "", text: "" });

        try {
            const formData = new FormData();
            formData.append('name', businessFormData.name);
            formData.append('description', businessFormData.description);
            formData.append('auto_reply_enabled', businessFormData.auto_reply_enabled);

            if (businessFormData.access_token.trim() !== "") {
                formData.append('access_token', businessFormData.access_token);
            }
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const res = await axios.patch(`/api/account/business-accounts/${business.id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setBusinessMessage({ type: "success", text: "Business details updated successfully." });
            setBusinessFormData(prev => ({ ...prev, access_token: "" }));

            if (res.data.logo) {
                setLogoPreview(res.data.logo);
            }
            setLogoFile(null);

        } catch (error) {
            console.error(error);
            setBusinessMessage({ type: "error", text: "Failed to update business details." });
        } finally {
            setBusinessLoading(false);
            setTimeout(() => setBusinessMessage({ type: "", text: "" }), 4000);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your profile, security, and business configuration here.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md h-auto p-1 bg-muted/50">
                    <TabsTrigger value="profile" className="py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm border-transparent transition-all">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm border-transparent transition-all">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="business" className="py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm border-transparent transition-all">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Business
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8 transition-all duration-300">
                    {/* PROFILE TAB */}
                    <TabsContent value="profile" className="m-0">
                        <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                            <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                <CardDescription>Update your personal details to keep your account up-to-date.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col">
                                <CardContent className="space-y-6 pt-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/90 font-medium">First Name</Label>
                                            <Input
                                                className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                                                value={profile.f_name}
                                                onChange={(e) => setProfile({ ...profile, f_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/90 font-medium">Last Name</Label>
                                            <Input
                                                className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                                                value={profile.l_name}
                                                onChange={(e) => setProfile({ ...profile, l_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-border/30">
                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/70 font-medium">Username (Read-only)</Label>
                                            <Input value={profile.username} disabled className="bg-muted/40 cursor-not-allowed border-transparent" />
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/70 font-medium">Email (Read-only)</Label>
                                            <Input value={profile.email} disabled className="bg-muted/40 cursor-not-allowed border-transparent" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-border/50 bg-muted/10 pt-6 mt-auto flex items-center justify-between">
                                    <div className="flex-1">
                                        {profileMessage.text && (
                                            <span className={`text-sm flex items-center gap-1.5 ${profileMessage.type === 'error' ? 'text-destructive' : 'text-emerald-500'}`}>
                                                {profileMessage.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                                {profileMessage.text}
                                            </span>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={profileLoading} className="min-w-[120px]">
                                        {profileLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</> : "Save Profile"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="m-0">
                        <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                            <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                                <CardTitle className="text-xl">Change Password</CardTitle>
                                <CardDescription>Ensure your account is using a secure, unique password.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col">
                                <CardContent className="space-y-5 pt-6 flex-1 max-w-xl">
                                    <div className="space-y-2.5">
                                        <Label className="text-foreground/90 font-medium">Current Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                                            value={passwordData.old_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5 pt-2">
                                        <Label className="text-foreground/90 font-medium">New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-foreground/90 font-medium">Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-border/50 bg-muted/10 pt-6 mt-auto flex items-center justify-between">
                                    <div className="flex-1">
                                        {passwordMessage.text && (
                                            <span className={`text-sm flex items-center gap-1.5 ${passwordMessage.type === 'error' ? 'text-destructive' : 'text-emerald-500'}`}>
                                                {passwordMessage.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                                {passwordMessage.text}
                                            </span>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={passwordLoading} className="min-w-[150px]">
                                        {passwordLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating</> : "Update Password"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* BUSINESS TAB */}
                    <TabsContent value="business" className="m-0">
                        {business ? (
                            <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                                <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                                    <CardTitle className="text-xl">Business Configuration</CardTitle>
                                    <CardDescription>Manage your Instagram integration, AI preferences, and public details.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleBusinessSubmit} className="flex-1 flex flex-col">
                                    <CardContent className="space-y-7 pt-6 flex-1">

                                        {/* Logo Upload Section */}
                                        <div className="flex items-center gap-6 pb-2">
                                            <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                                                <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center bg-center bg-cover transition-all" style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : {}}>
                                                    {!logoPreview && <Briefcase className="h-8 w-8 text-muted-foreground/50" />}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                        <Camera className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={logoInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoSelect}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium">Business Logo</Label>
                                                <p className="text-sm text-muted-foreground">Click the image to upload a new square logo (JPG or PNG).</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/90 font-medium">Business Name</Label>
                                            <Input
                                                className="max-w-xl bg-background/50 border-border/60"
                                                value={businessFormData.name}
                                                onChange={(e) => setBusinessFormData({ ...businessFormData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label className="text-foreground/90 font-medium flex items-baseline justify-between max-w-2xl">
                                                Business Description
                                                <span className="text-xs font-normal text-muted-foreground">Used by AI to understand your brand</span>
                                            </Label>
                                            <Textarea
                                                rows={5}
                                                className="max-w-2xl bg-background/50 border-border/60 resize-none"
                                                placeholder="We are a local coffee shop specializing in artisanal roasts..."
                                                value={businessFormData.description}
                                                onChange={(e) => setBusinessFormData({ ...businessFormData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="max-w-2xl border border-primary/20 bg-primary/5 rounded-lg p-5 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                                            <div className="space-y-1">
                                                <Label className="text-base font-semibold text-primary">AI Auto-Reply System</Label>
                                                <p className="text-sm text-muted-foreground/80 leading-snug">
                                                    When enabled, our AI will automatically respond to incoming Instagram direct messages using knowledge from your Business Description.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={businessFormData.auto_reply_enabled}
                                                onCheckedChange={(checked) => setBusinessFormData({ ...businessFormData, auto_reply_enabled: checked })}
                                            />
                                        </div>

                                        <div className="max-w-2xl space-y-2.5 pt-2">
                                            <Label className="text-foreground/90 font-medium">Update Instagram Token</Label>
                                            <Input
                                                type="text"
                                                className="bg-background/50 border-border/60"
                                                placeholder="Paste a new Meta Long-Lived Access Token here..."
                                                value={businessFormData.access_token}
                                                onChange={(e) => setBusinessFormData({ ...businessFormData, access_token: e.target.value })}
                                            />
                                            <p className="text-xs text-muted-foreground">Only fill this if your current token expired and you generated a new one via the Meta Developer Portal.</p>
                                        </div>

                                    </CardContent>
                                    <CardFooter className="border-t border-border/50 bg-muted/10 pt-6 mt-auto flex items-center justify-between">
                                        <div className="flex-1">
                                            {businessMessage.text && (
                                                <span className={`text-sm flex items-center gap-1.5 ${businessMessage.type === 'error' ? 'text-destructive' : 'text-emerald-500'}`}>
                                                    {businessMessage.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                                    {businessMessage.text}
                                                </span>
                                            )}
                                        </div>
                                        <Button type="submit" disabled={businessLoading} className="min-w-[180px]">
                                            {businessLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</> : "Save Business Details"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        ) : (
                            <Card className="border-dashed shadow-none bg-transparent">
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-foreground">No Business Connected</h3>
                                    <p className="max-w-sm mx-auto mt-2">You need to connect an Instagram Business account before you can configure these settings.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

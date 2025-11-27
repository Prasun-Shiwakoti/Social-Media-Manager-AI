import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function DMAssistant() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">DM Assistant</h2>
                <p className="text-muted-foreground">Manage your direct messages efficiently.</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Thread List */}
                <Card className="col-span-4 h-full flex flex-col">
                    <CardHeader className="border-b p-4">
                        <Input placeholder="Search messages..." />
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b last:border-0">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                                    <AvatarFallback>U{i}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">User {i}</span>
                                        <span className="text-xs text-muted-foreground">12:30 PM</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">Hey, I had a question about...</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Chat View */}
                <Card className="col-span-8 h-full flex flex-col">
                    <CardHeader className="border-b p-4 flex flex-row items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?u=11" />
                            <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">User 1</CardTitle>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex justify-start">
                            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                                <p className="text-sm">Hi there! I love your products.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                                <p className="text-sm">Hello! Thank you so much for your support. How can I help you today?</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-4 border-t flex gap-2">
                        <Input placeholder="Type a message..." />
                        <Button size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

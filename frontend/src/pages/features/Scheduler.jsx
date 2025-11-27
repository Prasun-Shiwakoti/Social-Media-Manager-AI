import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

const scheduledPosts = [
    {
        id: 1,
        title: "Product Launch Teaser",
        date: new Date(2024, 3, 15, 10, 0),
        platform: "Instagram",
        status: "Scheduled",
    },
    {
        id: 2,
        title: "Weekly Tips Thread",
        date: new Date(2024, 3, 16, 14, 30),
        platform: "Twitter",
        status: "Draft",
    },
    {
        id: 3,
        title: "Customer Spotlight",
        date: new Date(2024, 3, 18, 9, 0),
        platform: "LinkedIn",
        status: "Scheduled",
    },
];

export default function Scheduler() {
    const [date, setDate] = useState(new Date());

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Scheduler</h2>
                    <p className="text-muted-foreground">Manage and schedule your upcoming content.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                            <CardDescription>Select a date to view posts.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-7">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Scheduled for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
                            <CardDescription>You have {scheduledPosts.length} posts scheduled.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {scheduledPosts.map((post) => (
                                    <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{post.title}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{format(post.date, "h:mm a")}</span>
                                                    <span>•</span>
                                                    <span>{post.platform}</span>
                                                    <span>•</span>
                                                    <span className={post.status === "Scheduled" ? "text-green-500" : "text-yellow-500"}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

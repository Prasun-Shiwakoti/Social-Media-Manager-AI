import { useState } from "react";
import { useSelector } from "react-redux";
import { Wand2, Image as ImageIcon, Copy, RefreshCw, Download, Send, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";


export default function AICreator() {


    const token = useSelector((state) => state.auth.token);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [caption, setCaption] = useState("");
    const [date, setDate] = useState();
    const [error, setError] = useState();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await axios.post('/api/dashboard/generate_post/', { prompt }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // API returns image_url, wrap in array for existing UI logic
            setGeneratedImages([res.data.image_url]);
            setCaption(res.data.caption);
            console.log(res.data.image_url)
        } catch (err) {
            console.error(err);
            setError("Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCaption = async (language) => {
        if (!prompt) return;
        try {
            const res = await axios.post('/api/dashboard/generate_caption/', {
                short_prompt: prompt,
                expanded_prompt: `Generate a caption in ${language} for: ${prompt}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCaption(res.data.caption);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePostNow = () => {
        alert("Posted successfully!");
    };

    const handleSchedule = () => {
        if (!date) return;
        alert(`Scheduled for ${format(date, "PPP")}`);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">AI Content Creator</h2>
                <p className="text-muted-foreground">Generate stunning visuals and engaging captions in seconds.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: Controls */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Image Generation</CardTitle>
                            <CardDescription>Describe what you want to see.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="prompt">Prompt</Label>
                                <Textarea
                                    id="prompt"
                                    placeholder="A futuristic city with neon lights in Kathmandu style..."
                                    className="h-32 resize-none"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleGenerate}
                                disabled={!prompt || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Generate Content
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Caption Assistant</CardTitle>
                            <CardDescription>AI-generated captions with hashtags.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Generated Caption</Label>
                                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(caption)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Textarea
                                    value={caption}
                                    readOnly
                                    className="h-32 bg-muted/50"
                                    placeholder="Your caption will appear here..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleGenerateCaption("English")}>English</Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleGenerateCaption("Nepali")}>Nepali</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {generatedImages ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {
                                            <div className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                                <img
                                                    src={`http://localhost:8000${generatedImages}`}
                                                    alt={`Generated`}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="secondary">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4 border-t">
                                        <Button className="w-full" size="lg" onClick={handlePostNow}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Post Now
                                        </Button>

                                        <div className="flex gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={setDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Button variant="secondary" onClick={handleSchedule} disabled={!date}>
                                                Schedule
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No images generated yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

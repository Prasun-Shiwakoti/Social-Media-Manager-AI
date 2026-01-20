import { useState } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Zap } from "lucide-react";
import axios from "axios";

const SENTIMENT_COLORS = {
  Positive: "#10b981",
  Negative: "#ef4444",
  Neutral: "#6b7280",
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case "Positive":
      return "😊";
    case "Negative":
      return "😞";
    case "Neutral":
      return "😐";
    default:
      return "❓";
  }
};

const getSentimentVariant = (sentiment) => {
  switch (sentiment) {
    case "Positive":
      return "success";
    case "Negative":
      return "destructive";
    case "Neutral":
      return "secondary";
    default:
      return "outline";
  }
};

export default function SentimentAnalysis() {
  const token = useSelector((state) => state.auth.token);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await axios.post(
        "/api/dashboard/sentiment_analysis/",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.sentiment_score);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to analyze sentiment");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  // Format data for sentiment scores chart
  const chartData = result
    ? [
        { name: "Positive", value: parseFloat((result.sentiment_scores.Positive * 100).toFixed(1)) },
        { name: "Neutral", value: parseFloat((result.sentiment_scores.Neutral * 100).toFixed(1)) },
        { name: "Negative", value: parseFloat((result.sentiment_scores.Negative * 100).toFixed(1)) },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h2>
        <p className="text-muted-foreground">Analyze the sentiment of any text in real-time.</p>
      </div>

      {/* Main Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Text Sentiment</CardTitle>
          <CardDescription>Enter text or a comment to detect its sentiment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Text to Analyze</Label>
            <Textarea
              id="text-input"
              placeholder="Paste your text, comment, or feedback here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAnalyzing}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="gap-2 flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Analyze Sentiment
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isAnalyzing || (!text && !result)}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/50">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Sentiment Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Sentiment Display */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Detected Sentiment</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <span>{getSentimentIcon(result.sentiment)}</span>
                    {result.sentiment}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-3xl font-bold text-primary">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Original vs Cleaned Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Original Text</p>
                  <p className="text-sm p-3 bg-muted rounded-md break-words max-h-24 overflow-y-auto">
                    {result.text}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Cleaned Text</p>
                  <p className="text-sm p-3 bg-muted rounded-md break-words max-h-24 overflow-y-auto">
                    {result.cleaned_text || "(No content after cleaning)"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Scores Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Probability breakdown across all sentiment classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={SENTIMENT_COLORS[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Score Details */}
              <div className="grid grid-cols-3 gap-3">
                {["Positive", "Neutral", "Negative"].map((sentiment) => (
                  <div
                    key={sentiment}
                    className="p-3 border rounded-lg text-center space-y-1"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">
                      {sentiment}
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: SENTIMENT_COLORS[sentiment] }}
                    >
                      {(result.sentiment_scores[sentiment] * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-3">
            <div className="text-4xl">📊</div>
            <p className="text-muted-foreground">Enter text above and click "Analyze Sentiment" to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

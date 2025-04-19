import { CheckCircle, Clock, Download, Eye, X } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface Video {
  id: string
  youtube_url: string
  status: string
  transcription: string | null
  created_at: string
  error_message: string | null
  progress: number
}

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos }: VideoListProps) {
  const router = useRouter()

  if (videos.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No videos found. Try submitting a YouTube URL above.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 break-all">{video.youtube_url}</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(video.created_at).toLocaleDateString()}
              </span>
              <span className={`flex items-center gap-1 ${
                video.status === "completed" ? "text-green-500" : 
                video.status === "error" ? "text-red-500" : 
                "text-orange-500"
              }`}>
                {video.status === "completed" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : video.status === "error" ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {video.status}
              </span>
            </div>
            {video.status !== "completed" && video.status !== "error" && (
              <div className="space-y-2">
                <Progress value={video.progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {video.progress}%
                </p>
              </div>
            )}
            {video.error_message && (
              <p className="mt-2 text-sm text-red-500">{video.error_message}</p>
            )}
          </CardContent>
          {video.status === "completed" && (
            <CardFooter className="p-4 pt-0 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/editor/${video.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
} 
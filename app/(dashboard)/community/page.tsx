"use client"

import { useState, useEffect } from "react"
import { Users, MessageSquare, ThumbsUp, Share2, Search, Plus, Send, MoreHorizontal, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Post {
  id: number
  author: {
    name: string
    avatar?: string
    role: string
  }
  content: string
  timestamp: string
  likes: number
  comments: Comment[]
  tags: string[]
}

interface Comment {
  id: number
  author: {
    name: string
    avatar?: string
  }
  content: string
  timestamp: string
}

import { getPosts, createPost, createComment } from "../../actions"
import { toast } from "sonner"

const trendingTopics = [
  { tag: "Rabi Season", count: 234 },
  { tag: "MSP 2024", count: 189 },
  { tag: "Organic Farming", count: 156 },
  { tag: "Pest Control", count: 143 },
  { tag: "Weather Alert", count: 98 }
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newPost, setNewPost] = useState("")
  const [newTags, setNewTags] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [])

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createPost(newPost, newTags);
      if (res.error) throw new Error(res.error);
      toast.success("Post created!");
      setNewPost("");
      setNewTags("");
      setIsModalOpen(false);
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCreateComment = async (postId: string) => {
    if (!replyContent.trim()) return;
    try {
      const res = await createComment(postId, replyContent);
      if (res.error) throw new Error(res.error);
      toast.success("Reply added!");
      setReplyContent("");
      setReplyingTo(null);
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to reply");
    }
  }

  const filteredPosts = posts.filter((post: any) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Community Forum
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow farmers, share experiences, and learn together
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Share your question, experience, or tip with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share your farming experience or ask a question..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={5}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (comma separated)"
                  className="flex-1"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePost} disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Posts */}
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-card-foreground">{post.author.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {post.author.role}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <p className="mt-4 text-card-foreground leading-relaxed">{post.content}</p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments.length}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    {post.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-lg bg-muted/50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-card-foreground">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === post.id && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={() => handleCreateComment(post.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-1">12,450</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-2">3,280</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-3">890</p>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-4">45</p>
                  <p className="text-xs text-muted-foreground">Experts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <span className="text-sm font-medium text-card-foreground">#{topic.tag}</span>
                    <span className="text-xs text-muted-foreground">{topic.count} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ask Expert */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-card-foreground">Need Expert Help?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get personalized advice from our agricultural experts for free.
              </p>
              <Button className="mt-4 w-full">Ask an Expert</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

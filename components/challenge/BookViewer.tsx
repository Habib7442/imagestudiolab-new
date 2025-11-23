"use client";

import { useState } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Share2, Download, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toggleChallengeUpvote, deleteChallengeEntry } from "@/actions/challenge-actions";
import { jsPDF } from "jspdf";
import { useRouter } from "next/navigation";

interface BookViewerProps {
    entry: any;
    initialIsUpvoted: boolean;
    currentUserId?: string;
}

export function BookViewer({ entry, initialIsUpvoted, currentUserId }: BookViewerProps) {
    const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
    const [upvotesCount, setUpvotesCount] = useState(entry.upvotes_count || 0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleUpvote = async () => {
        const newState = !isUpvoted;
        setIsUpvoted(newState);
        setUpvotesCount((prev: number) => newState ? prev + 1 : prev - 1);
        
        try {
            await toggleChallengeUpvote(entry.id);
        } catch (e) {
            // Revert on error
            setIsUpvoted(!newState);
            setUpvotesCount((prev: number) => !newState ? prev + 1 : prev - 1);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [600, 800]
            });

            const images = [
                entry.hero_image_url || entry.cover_image_url || entry.comic_pages?.[0],
                ...(entry.comic_pages || [])
            ].filter(Boolean);

            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = url;
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                });
            };

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();
                const img = await loadImage(images[i]);
                
                // Calculate aspect ratio to fit
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();
                
                doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            doc.save(`${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_mini_book.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await deleteChallengeEntry(entry.id);
            alert("Book deleted successfully.");
            router.push("/challenges");
        } catch (e) {
            console.error(e);
            alert("Failed to delete book.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-12">
            <div className="w-full max-w-6xl px-4 mb-8 flex items-center justify-between">
                <Link href="/challenges">
                    <Button variant="ghost" className="text-neutral-400 hover:text-white">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Gallery
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className={cn("rounded-full border-white/10 hover:bg-white/10 transition-colors", isUpvoted && "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20")}
                        onClick={handleUpvote}
                    >
                        <Heart className={cn("w-4 h-4", isUpvoted && "fill-current")} />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full border-white/10 hover:bg-white/10"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full border-white/10 hover:bg-white/10"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </Button>
                    {currentUserId === entry.user_id && (
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full border-white/10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full">
                <div className="relative">
                    {/* @ts-ignore */}
                    <HTMLFlipBook
                        width={400}
                        height={550}
                        size="stretch"
                        minWidth={300}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1533}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        className="demo-book shadow-2xl shadow-purple-900/20"
                    >
                        {/* Cover Page */}
                        <div className="page bg-black">
                            <img 
                                src={entry.hero_image_url || entry.cover_image_url || entry.comic_pages?.[0]} 
                                className="w-full h-full object-cover" 
                                alt="Cover"
                            />
                        </div>

                        {/* Content Pages */}
                        {entry.comic_pages?.map((page: string, i: number) => (
                            <div key={i} className="page bg-white">
                                <img src={page} className="w-full h-full object-contain" alt={`Page ${i+1}`} />
                                <div className="absolute bottom-2 right-2 text-black text-xs font-bold bg-white/80 px-2 rounded">{i+1}</div>
                            </div>
                        ))}

                        {/* Back Cover */}
                        <div className="page bg-[#1a1a1a] text-white p-10 flex flex-col items-center justify-center border-l border-white/10 text-center">
                            <img src="/logo.png" className="w-24 h-24 mb-6 object-contain mx-auto" alt="Logo" />
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                ImageStudio Lab
                            </h3>
                            <p className="text-neutral-500 mt-2 text-sm">Generated with AI Magic</p>
                            <div className="mt-12 text-xs text-neutral-600">
                                Share your talent.<br/>Create your own mini-book.
                            </div>
                        </div>
                    </HTMLFlipBook>
                </div>
            </div>

            <div className="mt-12 text-center">
                <h1 className="text-2xl font-bold mb-2">{entry.title}</h1>
                <p className="text-neutral-400">by {entry.username}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <Heart className={cn("w-4 h-4", isUpvoted && "fill-red-500 text-red-500")} />
                    <span>{upvotesCount} likes</span>
                </div>
            </div>
        </div>
    );
}

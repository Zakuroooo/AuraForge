"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { isAxiosError } from "axios";
import {
  Bookmark,
  Copy,
  Download,
  ImageOff,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import Cookies from "js-cookie";

import AuroraBackground from "@/components/AuroraBackground";
import BackgroundBeams from "@/components/BackgroundBeams";
import api from "@/lib/api";

interface ImageEntry {
  id: string;
  user_id: string;
  prompt_text: string;
  image_url: string;
  created_at: string;
  is_saved?: boolean;
  isSaved?: boolean;
}

type GalleryImageCardProps = {
  image: ImageEntry;
  onSelect: (image: ImageEntry) => void;
  onDownload: (image: ImageEntry) => void | Promise<void>;
  onSave: (imageId: string, isSaved: boolean) => void | Promise<void>;
  onDelete: (imageId: string) => void;
  setNotification: (message: string | null) => void;
};

function GalleryImageCard({
  image,
  onSelect,
  onDownload,
  onSave,
  onDelete,
  setNotification,
}: GalleryImageCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(
    Boolean(image.isSaved ?? image.is_saved),
  );
  const shouldShowImage = Boolean(image.image_url) && !imgError;

  useEffect(() => {
    setIsSaved(Boolean(image.isSaved ?? image.is_saved));
  }, [image.isSaved, image.is_saved]);
  const handleShare = async (imageUrl: string, promptText: string) => {
    const shareUrl =
      window.location.origin +
      (imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`);
    const shareText = `${promptText || "AI Art"} // Forged on AuraForge Studio\n\nView Art: ${shareUrl}`;

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ url: window.location.href })
    ) {
      try {
        await navigator.share({
          title: "AuraForge Studio",
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share API failed:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotification("ACCESS_GRANTED // LINK_COPIED_TO_CLPBRD");
    } catch (clipErr) {
      console.error("Clipboard failed:", clipErr);
    }
  };

  const handleSaveImage = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    await onSave(image.id, nextSaved);
  };

  return (
    <motion.article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#05050A]/50 backdrop-blur-md shadow-xl transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(34,211,238,0.15)]">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(image.id);
        }}
        className="absolute top-2 right-2 z-20 p-3 opacity-0 hover:opacity-100 hover:bg-red-500/20 hover:backdrop-blur-md border border-transparent hover:border-red-500/50 text-transparent hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer transition-all duration-200 rounded-md"
        aria-label="Delete image"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="relative w-full"
        onClick={() => {
          if (shouldShowImage) {
            onSelect(image);
          }
        }}
        aria-disabled={!shouldShowImage}
      >
        {shouldShowImage ? (
          <div className="relative h-56 w-full bg-black/50">
            <Image
              src={image.image_url}
              alt={image.prompt_text || "AuraForge creation"}
              width={800}
              height={560}
              className="h-56 w-full object-cover"
              unoptimized={true}
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center gap-3 bg-black/50 text-center text-white/70">
            <ImageOff className="h-8 w-8 text-red-300" />
            <span className="text-xs uppercase tracking-[0.3em]">
              Image Unavailable
            </span>
          </div>
        )}
      </button>
      <div className="p-5 flex flex-col gap-3">
        <p className="font-mono text-[10px] text-cyan-500/70 lowercase line-clamp-2 leading-tight">
          {image.prompt_text}
        </p>
        <p className="font-sans text-[10px] text-gray-500">
          {new Date(image.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex flex-wrap gap-3 transition-all duration-300 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
          <button
            type="button"
            onClick={() => onDownload(image)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            type="button"
            onClick={handleSaveImage}
            className={
              isSaved
                ? "font-mono text-[10px] bg-cyan-500 text-black border-none shadow-[0_0_15px_rgba(34,211,238,0.4)] px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5"
                : "font-mono text-[10px] text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-sm bg-cyan-500/5 hover:bg-cyan-500/15 transition-all flex items-center gap-1.5"
            }
          >
            <Bookmark
              className="h-3.5 w-3.5"
              fill={isSaved ? "currentColor" : "none"}
            />
            ADD TO VAULT
          </button>
          <button
            type="button"
            onClick={() => handleShare(image.image_url, image.prompt_text)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/40 hover:text-white"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [promptText, setPromptText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("None");
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [selectedImage, setSelectedImage] = useState<ImageEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [imageToPurge, setImageToPurge] = useState<string | null>(null);
  const fallbackImage =
    "https://images.unsplash.com/photo-1620641788415-199f1c6c6694?w=800";

  const fetchGallery = useCallback(async () => {
    setGalleryError(null);
    setIsLoadingGallery(true);
    try {
      const { data } = await api.get<ImageEntry[]>("/gallery");
      setImages(data ?? []);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.push("/auth/login");
        return;
      }
      setGalleryError(
        "We couldn't load your art history. Please retry in a moment.",
      );
    } finally {
      setIsLoadingGallery(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleEnhancePrompt = () => {
    if (!promptText.trim()) return;
    const enhancement =
      ", masterpiece, trending on artstation, 8k resolution, highly detailed, cinematic lighting, dramatic composition";
    setPromptText((prev) => `${prev.trim()}${enhancement}`);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!promptText.trim()) {
      setGeneratorError("Please describe the vision you want to forge.");
      return;
    }

    setGeneratorError(null);
    setIsGenerating(true);
    setCountdown(3);

    const styleDirective =
      selectedStyle !== "None" ? `, in the style of ${selectedStyle}` : "";
    const finalPrompt = `${promptText.trim()}${styleDirective}`;

    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    try {
      const { data } = await api.post<ImageEntry>(
        "/gallery/generate",
        { prompt_text: finalPrompt },
        { headers: { "Content-Type": "application/json" } },
      );
      setPromptText("");
      setImages((prev) => [data, ...prev]);
      fetchGallery().catch(() => undefined);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.push("/auth/login");
        return;
      }
      setGeneratorError(
        "Generation failed. Please tweak your idea and try again.",
      );
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setCountdown(3);
    }
  };

  const sortedImages = useMemo(() => {
    return [...images].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [images]);

  const openLightbox = (image: ImageEntry) => {
    setSelectedImage(image);
    setModalOpen(true);
    setDownloadError(null);
  };

  const closeLightbox = () => {
    setModalOpen(false);
    setSelectedImage(null);
    setCopySuccess(false);
  };

  const reusePrompt = () => {
    if (!selectedImage) return;
    setPromptText(selectedImage.prompt_text);
    closeLightbox();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyPrompt = async () => {
    if (!selectedImage?.prompt_text) return;
    try {
      await navigator.clipboard.writeText(selectedImage.prompt_text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy prompt", error);
    }
  };

  const downloadImage = async (image: ImageEntry) => {
    try {
      setDownloadError(null);
      const response = await fetch(image.image_url, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `auraforge-${Math.floor(Date.now() / 1000)}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed", error);
      setDownloadError(
        "We couldn't fetch the image for download. Try again in a moment.",
      );
    }
  };

  const handleSaveImage = async (imageId: string, isSaved: boolean) => {
    try {
      setImages((prev) =>
        prev.map((image) =>
          image.id === imageId ? { ...image, is_saved: isSaved } : image,
        ),
      );
      await api.post(`/gallery/${imageId}/save`, { is_saved: isSaved });
      setNotification(
        isSaved
          ? "VAULT_SYNCHRONIZED // IMAGE_SECURED"
          : "VAULT_RELEASED // IMAGE_UNSAVED",
      );
    } catch (error) {
      console.error("Failed to save image:", error);
      setImages((prev) =>
        prev.map((image) =>
          image.id === imageId ? { ...image, is_saved: !isSaved } : image,
        ),
      );
    }
  };

  const handleDeleteImage = async (imageId: string | null) => {
    if (!imageId) return;

    try {
      const token = Cookies.get("token");
      const baseUrl = api.defaults.baseURL ?? "";
      const response = await fetch(`${baseUrl}/gallery/${imageId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.ok) {
        setImages((prev) => prev.filter((image) => image.id !== imageId));
        setNotification("PROTOCOL_EXECUTED // VISION_PURGED");
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setImageToPurge(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a16] px-6 py-12 text-white font-sans">
      <AuroraBackground />
      <BackgroundBeams />
      <div className="pointer-events-none absolute left-6 top-6 text-[10px] font-mono uppercase tracking-widest text-cyan-400/50">
        // SYS.ASSET_FORGE :: ACTIVE_CHANNEL_01
      </div>
      <div className="pointer-events-none absolute right-6 top-8 text-[10px] font-mono uppercase tracking-widest text-cyan-400/40">
        // GRID.SYNC :: HOLO_LAYER_ENABLED
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-full origin-bottom bg-[linear-gradient(to_right,#22d3ee15_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black)] [transform:perspective(1000px)_rotateX(60deg)_translateZ(0)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col gap-10 lg:flex-row lg:px-10">
        <section className="w-full lg:sticky lg:top-10 lg:max-h-[calc(100vh-5rem)] lg:w-[380px] lg:pr-8">
          <div className="rounded-3xl border-r border-white/[0.05] bg-white/[0.02] p-8 backdrop-blur-xl">
            <p className="flex items-center gap-3 text-sm font-sans text-white tracking-tight">
              <Sparkles className="h-5 w-5 text-cyan-400/80" /> Generator Panel
            </p>
            <h2 className="text-2xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 w-fit">
              Forge New Visions
            </h2>
            <p className="font-sans text-sm text-gray-400 normal-case leading-relaxed">
              Describe the mood, palette, or universe you want to explore.
              AuraForge will conjure it in moments.
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="font-mono text-cyan-400/80 text-xs tracking-wider uppercase">
                  Command Console Active
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Use the holographic console below to forge cinematic prompts.
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                  "None",
                  "Cyberpunk",
                  "Anime / Studio Ghibli",
                  "Photorealistic",
                  "Watercolor",
                  "Dark Fantasy",
                ].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`whitespace-nowrap text-xs px-4 py-1.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all ${
                      selectedStyle === style
                        ? "border-cyan-400/60 bg-cyan-400/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                        : "bg-black/40"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {generatorError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs uppercase tracking-wider text-red-400 backdrop-blur-md">
                  {generatorError}
                </div>
              ) : null}

              {isGenerating ? (
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <div className="flex items-center justify-between font-mono text-cyan-400/80 text-xs tracking-wider uppercase">
                    <span>Rendering masterpiece</span>
                    <span>{countdown}s</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      key="progress"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#7f5cff] to-[#73ffdf]"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="w-full lg:flex-1">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 w-fit">
              Art History
            </h3>
            <p className="font-sans text-sm text-gray-400 normal-case leading-relaxed">
              Every forged piece syncs here — curated, timestamped, and ready to
              share.
            </p>
          </div>

          {galleryError ? (
            <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 px-6 py-4 text-sm text-red-100">
              {galleryError}
            </div>
          ) : null}

          {isLoadingGallery ? (
            <div className="mt-10 w-full grid grid-cols-1 gap-6 px-4 pb-[200px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-56 w-full rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : sortedImages.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/20 bg-black/20 px-8 py-16 text-center">
              <Sparkles className="h-10 w-10 text-[#73ffdf]" />
              <h4 className="text-xl font-semibold">No visions forged yet.</h4>
              <p className="text-sm text-white/70">Start creating above! ✨</p>
            </div>
          ) : (
            <div className="mt-10 w-full grid grid-cols-1 gap-6 px-4 pb-[200px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedImages.map((image) => (
                <GalleryImageCard
                  key={image.id}
                  image={image}
                  onSelect={openLightbox}
                  onDownload={downloadImage}
                  onSave={handleSaveImage}
                  onDelete={(imageId) => setImageToPurge(imageId)}
                  setNotification={setNotification}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-12 left-1/2 z-[100] w-full max-w-2xl -translate-x-1/2 px-4">
        <div className="relative flex items-center gap-2 rounded-sm border-t-2 border-cyan-500/40 bg-[#05050A]/90 p-3 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 border-l border-t border-cyan-400/60" />
          <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 border-r border-t border-cyan-400/60" />
          <span className="pointer-events-none absolute left-3 bottom-3 h-2 w-2 border-l border-b border-cyan-400/30" />
          <span className="pointer-events-none absolute right-3 bottom-3 h-2 w-2 border-r border-b border-cyan-400/30" />
          <input
            value={promptText}
            onChange={(event) => setPromptText(event.target.value)}
            placeholder="Enter cinematic prompt..."
            className="flex-grow bg-transparent p-3 text-white/80 text-sm font-medium tracking-tight focus:outline-none placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="rounded-sm border border-cyan-400/30 px-4 py-2 text-xs uppercase tracking-wider text-cyan-200/80 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            Enhance
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-sm bg-gradient-to-r from-cyan-400 to-purple-600 px-6 py-2.5 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
              aria-hidden="true"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            {isGenerating ? "FORGING..." : "FORGE IMAGE"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6 py-10"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeLightbox();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-[0_35px_120px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/40 p-2 text-white/80 transition hover:border-white/50 hover:text-white"
                onClick={closeLightbox}
                aria-label="Close viewer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={selectedImage.image_url || fallbackImage}
                  alt={selectedImage.prompt_text || "AuraForge creation"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-contain"
                  priority
                  unoptimized={true}
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement & {
                      src: string;
                    };
                    if (target.src !== fallbackImage) {
                      target.src = fallbackImage;
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h4 className="font-mono text-cyan-400/80 text-xs tracking-wider">
                      {selectedImage.prompt_text}
                    </h4>
                    <button
                      type="button"
                      onClick={copyPrompt}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                      {copySuccess ? "Copied!" : "Copy Prompt"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono text-cyan-400/60 text-[10px] tracking-wider">
                      {new Date(selectedImage.created_at).toLocaleString(
                        undefined,
                        {
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => downloadImage(selectedImage)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/60"
                      >
                        <Download className="h-4 w-4" /> Download
                      </button>
                      <button
                        type="button"
                        onClick={reusePrompt}
                        className="inline-flex items-center gap-2 rounded-full border border-[#73ffdf]/40 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#73ffdf] shadow-[0_0_25px_rgba(115,255,223,0.35)] transition hover:border-[#73ffdf] hover:text-white"
                      >
                        RE-USE PROMPT ⚡
                      </button>
                    </div>
                  </div>
                </div>
                {downloadError ? (
                  <p className="text-sm text-red-300">{downloadError}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {imageToPurge && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#05050A] border border-red-500/40 rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col items-center text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="font-mono text-lg text-red-500 tracking-widest uppercase mb-2">
              System Warning
            </h3>
            <p className="font-sans text-gray-400 text-sm mb-8 leading-relaxed">
              CONFIRM_PURGE: Are you sure you want to permanently delete this
              vision? This action cannot be reversed and will erase the asset
              from the AuraForge network.
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setImageToPurge(null)}
                className="flex-1 font-mono text-xs text-gray-400 border border-gray-600/50 hover:bg-gray-800/50 hover:text-white px-4 py-3 rounded-sm tracking-widest uppercase transition-all"
              >
                Abort
              </button>
              <button
                onClick={() => handleDeleteImage(imageToPurge)}
                className="flex-1 font-mono text-xs text-white bg-red-600/80 hover:bg-red-500 border border-red-500 px-4 py-3 rounded-sm tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
              >
                Execute Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-8 z-[100] backdrop-blur-2xl bg-[#05050A]/90 border-l-4 border-cyan-500/60 rounded-sm p-4 flex items-center shadow-[0_0_60px_rgba(0,0,0,0.6)] gap-3"
        >
          <div className="w-8 h-8 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <div>
            <p className="font-mono text-[10px] text-cyan-400/80 uppercase tracking-widest leading-none">
              System Notification
            </p>
            <p className="font-sans text-sm text-white tracking-tight mt-1">
              {notification}
            </p>
          </div>
        </motion.div>
      )}
    </main>
  );
}

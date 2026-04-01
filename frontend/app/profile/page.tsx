"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import AuroraBackground from "@/components/AuroraBackground";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  totalGenerated?: number;
  createdAt?: string;
  planType?: string;
}

interface ImageEntry {
  id: string;
  user_id: string;
  prompt_text: string;
  image_url: string;
  created_at: string;
  is_saved?: boolean;
  isSaved?: boolean;
}

const hudLabelClass =
  "font-mono text-cyan-400/80 text-xs tracking-wider uppercase";

const inputClassName =
  "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";

const modalCardClass =
  "relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl";

const actionButtonClass =
  "rounded-full border border-white/10 bg-white/5 px-6 py-2 min-h-[44px] lg:min-h-0 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-cyan-500/40 hover:text-white";

// ─── helpers ──────────────────────────────────────────────────────────────────

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
  });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return canvas.toDataURL("image/png");
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  // ── profile & page state ──────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ── avatar crop state ─────────────────────────────────────────────────────
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropStep, setCropStep] = useState<"crop" | "preview">("crop");
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // ── notification auto-dismiss ─────────────────────────────────────────────
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileError(null);
      try {
        const { data } = await api.get<UserProfile>("/users/me");
        const storedAvatar =
          typeof window !== "undefined"
            ? localStorage.getItem("avatarUrl")
            : null;
        const normalizedProfile = {
          ...data,
          avatar_url: data.avatar_url ?? storedAvatar ?? null,
        };
        setProfile(normalizedProfile);
        setEditUsername(normalizedProfile.username ?? "");
        if (normalizedProfile.avatar_url && typeof window !== "undefined") {
          localStorage.setItem("avatarUrl", normalizedProfile.avatar_url);
        }
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          router.push("/auth/login");
          return;
        }
        setProfileError("Unable to load creator dossier.");
      }
    };
    fetchProfile();
  }, [router]);

  // ── fetch images ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchImages = async () => {
      setImagesError(null);
      setIsLoadingImages(true);
      try {
        const { data } = await api.get<ImageEntry[]>("/gallery");
        const normalizedImages = (data ?? []).map((image) => ({
          ...image,
          isSaved: Boolean(image.isSaved ?? image.is_saved),
        }));
        setImages(normalizedImages);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          router.push("/auth/login");
          return;
        }
        setImagesError("Unable to load the vault.");
      } finally {
        setIsLoadingImages(false);
      }
    };
    fetchImages();
  }, [router]);

  const vaultImages = useMemo(() => {
    return images.filter((image) => image.isSaved);
  }, [images]);

  const stats = useMemo(() => {
    const totalGenerated = profile?.totalGenerated ?? 0;
    const createdAt = profile?.createdAt
      ? new Date(profile.createdAt).toISOString().split("T")[0]
      : "";
    const planType = profile?.planType || "Free";
    return [
      { label: "TOTAL_GENERATED", value: totalGenerated },
      { label: "CREATED_AT", value: mounted ? createdAt : "" },
      { label: "PLAN_TYPE", value: planType },
    ];
  }, [profile, mounted]);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/");
  };

  /** When user picks a file — open the crop modal */
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    event.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCroppedImageBase64(null);
      setCropStep("crop");
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropAndPreview = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      const base64 = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      setCroppedImageBase64(base64);
      setCropStep("preview");
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  const handleConfirmUpload = async () => {
    if (!croppedImageBase64) return;
    setIsUploading(true);
    try {
      const { data } = await api.post<{ avatar_url: string }>(
        "/users/me/avatar",
        { image_base64: croppedImageBase64 },
      );
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.avatar_url } : prev,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("avatarUrl", data.avatar_url);
      }
      setNotification("AVATAR_UPDATED // SYNC_COMPLETE");
      setCropModalOpen(false);
    } catch (error) {
      console.error("Avatar upload failed", error);
      setNotification("AVATAR UPDATE FAILED // TRY AGAIN");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setShowRemoveAvatarModal(true);
  };

  const executeRemoveAvatar = async () => {
    setShowRemoveAvatarModal(false);
    try {
      await api.delete("/users/me/avatar");
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
      if (typeof window !== "undefined") {
        localStorage.removeItem("avatarUrl");
      }
      setNotification("AVATAR_REMOVED // RESET_TO_DEFAULT");
    } catch (error) {
      console.error("Avatar removal failed", error);
      setNotification("REMOVAL FAILED // TRY AGAIN");
    }
  };

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus(null);
    setIsSubmitting(true);
    try {
      const payload: { username?: string; new_password?: string } = {};
      if (editUsername.trim()) payload.username = editUsername.trim();
      if (editPassword.trim()) payload.new_password = editPassword.trim();
      const { data } = await api.patch<UserProfile>("/users/me", payload);
      const storedAvatar =
        typeof window !== "undefined"
          ? localStorage.getItem("avatarUrl")
          : null;
      const normalizedProfile = {
        ...data,
        avatar_url: data.avatar_url ?? storedAvatar ?? null,
      };
      setProfile(normalizedProfile);
      if (normalizedProfile.avatar_url && typeof window !== "undefined") {
        localStorage.setItem("avatarUrl", normalizedProfile.avatar_url);
      }
      setEditPassword("");
      setIsModalOpen(false);
      if (payload.new_password) {
        alert("SECURITY_UPDATE: SESSION_EXPIRED. PLEASE_RE-AUTHENTICATE.");
        handleLogout();
        return;
      }
      setFormStatus("PROFILE UPDATED");
    } catch (error) {
      console.error("Profile update failed", error);
      setFormStatus("PROFILE UPDATE FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────────

  const userInitial = profile?.username?.charAt(0).toUpperCase() ?? "?";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a16] px-6 py-20 text-white">
      <AuroraBackground />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-full origin-bottom bg-[linear-gradient(to_right,#22d3ee15_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black)] [transform:perspective(1000px)_rotateX(60deg)_translateZ(0)]"
        aria-hidden
      />

      {/* ── Notification Toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 rounded-sm border-l-4 border-cyan-500/60 bg-[#05050A]/90 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-cyan-300 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center py-20 gap-12">
        <div className="flex flex-col items-center gap-6">

          {/* ── Avatar Circle ──────────────────────────────────────────────── */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-cyan-500/30 blur-2xl"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 p-1 cursor-pointer"
              aria-label="Update avatar"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "Creator avatar"}
                  className="h-full w-full rounded-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#05050a]">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    {userInitial}
                  </span>
                </div>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>
          </div>

          {/* ── Avatar action buttons ───────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className={actionButtonClass}
            >
              UPDATE AVATAR
            </button>
            {profile?.avatar_url && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="font-mono text-[10px] uppercase tracking-widest text-red-400/60 hover:text-red-400 transition"
              >
                [ REMOVE ]
              </button>
            )}
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <h1 className="text-3xl font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 w-fit">
            {profile?.username ?? "Unknown Creator"}
          </h1>
          <p className="font-mono text-xs text-gray-400">
            {profile?.email ?? "no-signal"}
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={actionButtonClass}
          >
            [ EDIT_DOSSIER ]
          </button>

          {profileError ? (
            <p className="text-xs text-red-300 uppercase tracking-wider">
              {profileError}
            </p>
          ) : null}
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="mt-2 grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 w-full max-w-sm lg:max-w-none mx-auto">
          {stats.map((stat, i) => (
            <span
              key={stat.label}
              className={`font-mono text-[10px] text-cyan-400 border border-cyan-500/20 px-3 py-1.5 bg-cyan-500/5 rounded-sm tracking-widest text-center flex items-center justify-center ${
                i === 2 ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              [ {stat.label}: {stat.value} ]
            </span>
          ))}
        </div>

        {/* ── Vault ──────────────────────────────────────────────────────── */}
        <section className="flex w-full flex-col gap-6">
          <p className={hudLabelClass}>// THE_VAULT</p>
          {imagesError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs uppercase tracking-wider text-red-300">
              {imagesError}
            </div>
          ) : null}

          {isLoadingImages ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 pb-24">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`vault-skeleton-${index}`}
                  className="h-56 w-full rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : vaultImages.length === 0 ? (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 px-6 py-10 text-center">
              <p className={hudLabelClass}>SYSTEM_MESSAGE: VAULT_EMPTY</p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 pb-24">
              {vaultImages.map((image) => (
                <article
                  key={image.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(34,211,238,0.25)]"
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt_text || "AuraForge creation"}
                    className="w-full h-48 sm:h-64 object-cover rounded-t-xl brightness-75 transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-125 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                    loading="lazy"
                  />
                  <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
                    <p className="font-mono text-cyan-400/80 text-[10px] tracking-wider uppercase line-clamp-2">
                      {image.prompt_text}
                    </p>
                    <p className="font-mono text-cyan-400/60 text-[10px] tracking-wider uppercase">
                      {new Date(image.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Crop Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div
            key="crop-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur px-6 py-10"
            onClick={(e) => { if (e.target === e.currentTarget) setCropModalOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className={modalCardClass}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-2 text-white/70 transition hover:text-white"
                aria-label="Close crop modal"
              >
                <X className="h-4 w-4" />
              </button>

              {cropStep === "crop" && rawImageSrc && (
                <>
                  <h2 className="text-lg font-semibold uppercase tracking-widest text-white mb-1">
                    Crop Avatar
                  </h2>
                  <p className="font-mono text-xs text-cyan-400/80 uppercase tracking-wider mb-4">
                    Drag to position · Scroll to zoom
                  </p>

                  {/* Cropper area */}
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-[#05050a] border border-white/10">
                    <Cropper
                      image={rawImageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: { background: "#05050a" },
                        mediaStyle: {},
                        cropAreaStyle: { borderColor: "rgba(34,211,238,0.6)" },
                      }}
                    />
                  </div>

                  {/* Zoom slider */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="font-mono text-[10px] text-cyan-400/60 uppercase tracking-wider">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCropAndPreview}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full text-white font-semibold py-2.5 px-6 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02]"
                    >
                      CROP &amp; PREVIEW
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropModalOpen(false)}
                      className="rounded-full border border-white/10 px-6 py-2.5 text-xs uppercase tracking-widest text-white/70 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {cropStep === "preview" && croppedImageBase64 && (
                <>
                  <h2 className="text-lg font-semibold uppercase tracking-widest text-white mb-1">
                    Preview
                  </h2>
                  <p className="font-mono text-xs text-cyan-400/80 uppercase tracking-wider mb-6">
                    Confirm or go back to re-crop
                  </p>

                  <div className="flex justify-center mb-6">
                    <div className="h-[120px] w-[120px] rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                      <img
                        src={croppedImageBase64}
                        alt="Cropped avatar preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {isUploading && (
                    <p className="font-mono text-xs text-cyan-400/80 uppercase tracking-widest text-center mb-4 animate-pulse">
                      UPLOADING...
                    </p>
                  )}

                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={handleConfirmUpload}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full text-white font-semibold py-2.5 px-6 text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      CONFIRM &amp; UPLOAD
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropStep("crop")}
                      disabled={isUploading}
                      className="rounded-full border border-white/10 px-6 py-2.5 text-xs uppercase tracking-widest text-white/70 transition hover:text-white disabled:opacity-50"
                    >
                      RE-CROP
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Profile Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-6 py-10"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className={modalCardClass}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-2 text-white/70 transition hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-lg font-semibold uppercase tracking-widest text-white">
                Edit Profile
              </h2>
              <p className="mt-2 font-mono text-xs text-cyan-400/80 uppercase tracking-wider">
                Update creator identity and security.
              </p>

              <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
                <label className="flex flex-col gap-2 text-left">
                  <span className={hudLabelClass}>Username</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(event) => setEditUsername(event.target.value)}
                    placeholder="auraforge.architect"
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-2 text-left">
                  <span className={hudLabelClass}>New Password</span>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(event) => setEditPassword(event.target.value)}
                    placeholder="********"
                    className={inputClassName}
                  />
                </label>

                {formStatus ? (
                  <p className="font-mono text-xs text-cyan-400/80 uppercase tracking-wider">
                    {formStatus}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full text-white font-semibold py-3 px-8 text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full border border-white/10 px-6 py-3 text-xs uppercase tracking-widest text-white/70 transition hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Remove Avatar Confirmation Modal ─────────────────────────────── */}
      {showRemoveAvatarModal && (
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
              CONFIRM_PURGE: Are you sure you want to remove your profile picture? This action cannot be reversed.
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowRemoveAvatarModal(false)}
                className="flex-1 font-mono text-xs text-gray-400 border border-gray-600/50 hover:bg-gray-800/50 hover:text-white px-4 py-3 rounded-sm tracking-widest uppercase transition-all"
              >
                Abort
              </button>
              <button
                onClick={executeRemoveAvatar}
                className="flex-1 font-mono text-xs text-white bg-red-600/80 hover:bg-red-500 border border-red-500 px-4 py-3 rounded-sm tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
              >
                Execute Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

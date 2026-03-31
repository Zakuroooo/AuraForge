"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import Cookies from "js-cookie";

import AuroraBackground from "@/components/AuroraBackground";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  avatarUrl?: string;
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
  "rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-cyan-500/40 hover:text-white";

export default function ProfilePage() {
  const router = useRouter();
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          avatarUrl: data.avatarUrl ?? data.avatar_url ?? storedAvatar ?? undefined,
        };
        setProfile(normalizedProfile);
        setEditUsername(normalizedProfile.username ?? "");
        if (normalizedProfile.avatarUrl && typeof window !== "undefined") {
          localStorage.setItem("avatarUrl", normalizedProfile.avatarUrl);
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

  const handleLogout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/");
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    setFormStatus(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post<{ avatar_url: string }>(
        "/users/me/avatar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setProfile((prev) =>
        prev
          ? { ...prev, avatar_url: data.avatar_url, avatarUrl: data.avatar_url }
          : prev,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("avatarUrl", data.avatar_url);
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
      setFormStatus("AVATAR UPDATE FAILED");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleImageUpload(file);
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
        avatarUrl: data.avatarUrl ?? data.avatar_url ?? storedAvatar ?? undefined,
      };
      setProfile(normalizedProfile);
      if (normalizedProfile.avatarUrl && typeof window !== "undefined") {
        localStorage.setItem("avatarUrl", normalizedProfile.avatarUrl);
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a16] px-6 py-20 text-white">
      <AuroraBackground />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[50vh] w-full origin-bottom bg-[linear-gradient(to_right,#22d3ee15_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black)] [transform:perspective(1000px)_rotateX(60deg)_translateZ(0)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center py-20 gap-12">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-cyan-500/30 blur-2xl"
              aria-hidden
            />
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 p-1">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username || "Creator avatar"}
                  className="h-full w-full rounded-full object-cover object-center cursor-move"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#05050a]">
                  <User className="h-10 w-10 text-cyan-100/70" />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className={`${actionButtonClass} ${isUploadingAvatar ? "opacity-70" : ""}`}
            disabled={isUploadingAvatar}
          >
            UPDATE AVATAR
          </button>
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

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {stats.map((stat) => (
            <span
              key={stat.label}
              className="font-mono text-[10px] text-cyan-400 border border-cyan-500/20 px-3 py-1 bg-cyan-500/5 rounded-sm tracking-widest"
            >
              [ {stat.label}: {stat.value} ]
            </span>
          ))}
        </div>

        <section className="flex w-full flex-col gap-6">
          <p className={hudLabelClass}>// THE_VAULT</p>
          {imagesError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs uppercase tracking-wider text-red-300">
              {imagesError}
            </div>
          ) : null}

          {isLoadingImages ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-24">
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
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-24">
              {vaultImages.map((image) => (
                <article
                  key={image.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(34,211,238,0.25)]"
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt_text || "AuraForge creation"}
                    className="w-full h-64 object-cover rounded-t-xl brightness-75 transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-125 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                    loading="lazy"
                  />
                  <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
                    <p className="font-mono text-cyan-400/80 text-[10px] tracking-wider uppercase line-clamp-2">
                      {image.prompt_text}
                    </p>
                    <p className="font-mono text-cyan-400/60 text-[10px] tracking-wider uppercase">
                      {new Date(image.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

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
    </main>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { FiUpload, FiImage, FiCheck, FiClock } from "react-icons/fi";
import BASE_URL from "../../../BaseURL";
import { invalidateLibrary } from "../../Redux/Features/Library/librarySlice";
import { uploadToCloudinary, autoFrame } from "../../function/cloudinaryUpload";
import { usePageMeta } from "../../function/pageMeta";

const stepWrap = "rounded-3xl border border-line bg-panel p-6 sm:p-7";

const Upload = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  usePageMeta("New premiere", "Upload a video to PlayTube and premiere it to the network.");

  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [remoteDuration, setRemoteDuration] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [thumbMode, setThumbMode] = useState("auto"); // auto | file
  const [frameSec, setFrameSec] = useState(1);
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbUploading, setThumbUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const pickVideo = async (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setUploading(true);
    setUploadPct(0);
    try {
      const done = await uploadToCloudinary(f, "video", setUploadPct);
      setVideoUrl(done.secure_url);
      setPublicId(done.public_id);
      setRemoteDuration(Math.floor(Number(done.duration) || 0));
      setThumbUrl(autoFrame(done.public_id, 1));
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err.message ||
          "Video upload failed. Check the unsigned preset allows video."
      );
      setVideoUrl("");
    } finally {
      setUploading(false);
    }
  };

  const pickThumbFile = async (f) => {
    if (!f) return;
    setError(null);
    setThumbUploading(true);
    try {
      const done = await uploadToCloudinary(f, "image", () => {});
      setThumbUrl(done.secure_url);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || "Thumbnail upload failed.");
    } finally {
      setThumbUploading(false);
    }
  };

  const finalThumb =
    thumbMode === "auto" && publicId ? autoFrame(publicId, frameSec) : thumbUrl;

  const ready = title.trim() && videoUrl && finalThumb && !uploading && !publishing;

  const publish = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setPublishing(true);
    setError(null);
    try {
      const token = Cookies.get("accessToken");
      const res = await axios.post(
        `${BASE_URL}/videos`,
        {
          title: title.trim(),
          description: description.trim(),
          videoFile: videoUrl,
          thumbnail: finalThumb,
          duration: remoteDuration,
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );
      const id = res.data?.data?._id;
      // New premiere must appear in feed + dashboard immediately.
      dispatch(invalidateLibrary(["feed", "dash"]));
      navigate(id ? `/video/${id}` : "/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Publishing failed. Try again.");
      setPublishing(false);
    }
  };

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="-rotate-1 inline-block rounded-xl bg-gold px-3 py-1 text-[12px] font-black uppercase tracking-[0.14em] text-void">
          Backstage
        </p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-zinc-100">New premiere</h1>
        <p className="mt-1 text-sm text-zinc-500">Upload once — your film streams straight from the CDN.</p>

        <form onSubmit={publish} className="mt-6 space-y-5">
          <section className={stepWrap} aria-label="Video file">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-zinc-100">
              <FiUpload className="text-ember" /> 1 · The film
            </h2>
            {!videoUrl ? (
              <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-line bg-void p-8 text-center transition hover:border-ember/60">
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => pickVideo(e.target.files[0])}
                />
                <FiUpload size={26} className="mx-auto text-zinc-500" />
                <p className="mt-2 text-sm font-bold text-zinc-200">
                  {file ? file.name : "Drop a video file, or click to browse"}
                </p>
                <p className="mt-1 text-[13px] text-zinc-500">MP4 / WebM / MOV — uploads straight to the CDN</p>
              </label>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ember/40 bg-ember/5 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ember/15 text-ember">
                  <FiCheck size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-100">{file?.name || "Video ready"}</p>
                  <p className="text-[13px] text-zinc-500">
                    {remoteDuration > 0 ? `~${remoteDuration}s on the CDN` : "On the CDN"} ·{" "}
                    <button type="button" onClick={() => { setVideoUrl(""); setFile(null); setThumbUrl(""); }} className="font-bold text-ember hover:text-ember-bright">
                      swap file
                    </button>
                  </p>
                </div>
              </div>
            )}
            {uploading && (
              <div className="mt-4" role="status" aria-label={`Uploading ${uploadPct} percent`}>
                <div className="h-2.5 overflow-hidden rounded-full bg-void">
                  <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
                <p className="mt-1.5 text-[13px] tabular-nums text-zinc-500">Beaming up… {uploadPct}%</p>
              </div>
            )}
          </section>

          <section className={stepWrap} aria-label="Thumbnail">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-zinc-100">
              <FiImage className="text-ember" /> 2 · The poster
            </h2>
            <div className="mt-4 flex gap-2">
              {[
                ["auto", "Auto frame"],
                ["file", "Upload image"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setThumbMode(id)}
                  aria-pressed={thumbMode === id}
                  className={`h-10 rounded-full px-5 text-sm font-bold transition ${
                    thumbMode === id ? "bg-ember text-white" : "border border-line text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {thumbMode === "auto" ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <FiClock /> Frame at
                  <input
                    type="number"
                    min={0}
                    max={Math.max(remoteDuration - 1, 0)}
                    value={frameSec}
                    onChange={(e) => setFrameSec(e.target.value)}
                    className="h-10 w-20 rounded-xl border border-line bg-void px-3 text-sm text-zinc-100 outline-none focus:border-ember/60"
                  />
                  s
                </label>
                {finalThumb && (
                  <img src={finalThumb} alt="Auto poster frame preview" className="h-20 w-36 rounded-xl border border-line object-cover" />
                )}
              </div>
            ) : (
              <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-line bg-void p-6 text-center transition hover:border-ember/60">
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickThumbFile(e.target.files[0])} />
                <p className="text-sm font-bold text-zinc-200">{thumbUploading ? "Uploading…" : "Click to upload a poster image"}</p>
                {thumbMode === "file" && thumbUrl && (
                  <img src={thumbUrl} alt="Poster preview" className="mx-auto mt-3 h-24 w-44 rounded-xl border border-line object-cover" />
                )}
              </label>
            )}
          </section>

          <section className={stepWrap} aria-label="Details">
            <h2 className="font-display text-base font-bold text-zinc-100">3 · The billing</h2>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-bold text-zinc-300">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The premiere your week needed"
                maxLength={120}
                className="h-12 w-full rounded-xl border border-line bg-void px-4 text-[15px] text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-bold text-zinc-300">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What plays, who it's for, chapters…"
                rows={4}
                className="w-full rounded-xl border border-line bg-void px-4 py-3 text-[15px] text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
              />
            </label>
          </section>

          {error && <p role="alert" className="rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-bright">{error}</p>}

          <button
            type="submit"
            disabled={!ready}
            className="grid w-full place-items-center rounded-2xl bg-ember py-4 font-display text-[15px] font-bold text-white shadow-glow transition hover:bg-ember-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? "Raising the curtain…" : "Premiere it"}
          </button>
          <p className="text-center text-[13px] text-zinc-500">
            Changed your mind? <Link to="/dashboard" className="font-bold text-ember">Back to dashboard</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Upload;

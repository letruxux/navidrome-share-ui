import { useEffect, useMemo, useState } from "react";
import useQueryParams from "react-use-query-params";
import type { ShareInfo as ShareInfoType } from "../../index";
import { Centered, Error as ErrorView, Loading } from "./components/umm";
import { formatSeconds } from "./utils";
import { Playing } from "./components/playing";
import { useEverythingStore } from "./everything-store";

function ShareInfoView({
  shareInfo,
  selectedTrack,
}: {
  selectedTrack: string | null;
  shareInfo: ShareInfoType | null;
}) {
  const { audioElement, selectedTrackId, setSelectedTrackId } = useEverythingStore();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!selectedTrackId) return;
    audioElement?.play();
  }, [selectedTrackId, audioElement]);

  useEffect(() => {
    if (!audioElement) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audioElement.addEventListener("play", onPlay);
    audioElement.addEventListener("pause", onPause);
    audioElement.addEventListener("ended", onEnded);

    // sync initial state
    setPlaying(!audioElement.paused);

    return () => {
      audioElement.removeEventListener("play", onPlay);
      audioElement.removeEventListener("pause", onPause);
      audioElement.removeEventListener("ended", onEnded);
    };
  }, [audioElement]);

  if (!shareInfo) return null;
  const firstTrack = shareInfo.tracks[0];
  if (!firstTrack) return null;

  const origin = new URL(shareInfo.shareUrl).origin;

  return (
    <Centered className="pt-16 pb-32">
      <img
        className="rounded-lg border border-neutral-800 bg-black size-64"
        src={`${origin}/share/img/${firstTrack.id}?size=300&square=true`}
        alt={firstTrack.album}
      />
      <h1 className="text-xl font-bold mt-4">{firstTrack.album}</h1>
      <h1 className="text-mauve-400 mt-2">
        {firstTrack.artist} ⸱ {shareInfo.tracks.length} shared track
        {shareInfo.tracks.length > 1 && "s"}
      </h1>
      <hr className="border-mauve-400 max-w-lg w-full my-4" />
      <div className="flex flex-col gap-4 max-w-lg w-full">
        {shareInfo.tracks.map((track) => (
          <div
            key={track.id}
            className="flex gap-4 max-w-lg w-full hover:bg-[rgba(0,0,0,0.8)] transition-colors p-2 rounded-xl cursor-pointer"
            onClick={() => setSelectedTrackId(track.id)}
          >
            <div className="w-full">
              <h2 className="text-lg font-bold truncate">{track.title}</h2>
              <h3 className="text-mauve-400">{track.artist}</h3>
            </div>
            <div className="w-full flex items-center justify-end">
              {selectedTrack === track.id && playing && <Playing className="mr-4" />}
              <div className="text-mauve-400">{formatSeconds(track.duration)}</div>
            </div>
          </div>
        ))}
      </div>
    </Centered>
  );
}

export default function App() {
  const [params] = useQueryParams();
  const url = useMemo(() => params.url.at(0) || null, [params]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const {
    shareInfo,
    setShareInfo,
    selectedTrackId,
    setAudioElement,
    setSelectedTrackId,
  } = useEverythingStore();

  const selectedTrackObj = useMemo(() => {
    if (!selectedTrackId) return null;
    return shareInfo?.tracks.find((e) => e.id === selectedTrackId) ?? null;
  }, [selectedTrackId, shareInfo]);

  const audioCallbackRef = (el: HTMLAudioElement | null) => {
    setAudioElement(el);
  };

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/extract?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((r) => {
        setShareInfo(r.shareInfo);
        const firstTrack = r.shareInfo?.tracks?.[0];
        if (firstTrack) setSelectedTrackId(firstTrack.id);
        setLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });

    return () => controller.abort();
  }, [url, setShareInfo, setSelectedTrackId]);

  return (
    <div
      className="
      min-h-dvh
      w-full
      text-white
      bg-black
      bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_40%)]
    "
    >
      {loading && <Loading />}
      {error && <ErrorView error={error} />}
      {!loading && !error && (
        <ShareInfoView shareInfo={shareInfo} selectedTrack={selectedTrackId} />
      )}
      {selectedTrackObj && shareInfo && (
        <div className="fixed bottom-4 left-4 w-[calc(100%-32px)]">
          <audio
            key={selectedTrackObj.id}
            controls
            className="mx-auto max-w-2xl w-full"
            ref={audioCallbackRef}
          >
            <source
              src={`${new URL(shareInfo.shareUrl).origin}/share/s/${selectedTrackObj.id}`}
              type="audio/mpeg"
            />
          </audio>
        </div>
      )}
    </div>
  );
}
